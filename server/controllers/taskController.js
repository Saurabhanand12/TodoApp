const Todo = require('../models/Todo');
const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get all tasks for a user
// @route   GET /api/tasks/:username
// @access  Private
exports.getTasks = asyncHandler(async (req, res) => {
    const { username } = req.params;
    
    // SECURITY FIX: Verify that the authenticated user matches the requested username
    const user = await User.findById(req.user.id);
    if (!user || user.username.toLowerCase() !== username.toLowerCase()) {
        return sendError(res, 'Not authorized to access these tasks', 403);
    }

    // Carry forward incomplete tasks with past due dates to today
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    await Todo.updateMany(
        {
            username: username.toLowerCase(),
            completed: false,
            due_date: { $lt: startOfToday }
        },
        {
            $set: { due_date: new Date() }
        }
    );
    
    // ONE-TIME MIGRATION: Copy `position` -> `order` for documents that predate the `order` field.
    // Uses raw collection driver to bypass Mongoose schema (position is no longer in schema).
    try {
        const legacyDocs = await Todo.collection
            .find({ username: username.toLowerCase(), position: { $exists: true } })
            .project({ position: 1 })
            .toArray();

        if (legacyDocs.length > 0) {
            const bulkMigrationOps = legacyDocs.map(t => ({
                updateOne: {
                    filter: { _id: t._id },
                    update: {
                        $set: { order: t.position },
                        $unset: { position: '' },
                    },
                },
            }));
            await Todo.collection.bulkWrite(bulkMigrationOps);
        }
    } catch (migrationErr) {
        // Non-fatal: log and continue — tasks will still load with default order 0
        console.error('Migration warning (position->order):', migrationErr.message);
    }

    const tasks = await Todo.find({ username: username.toLowerCase() }).sort({ order: 1 });
    sendSuccess(res, tasks);
});

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = asyncHandler(async (req, res) => {
    const { text, username, category, isImportant, due_date, plan } = req.body;

    if (!text || !username) {
        return sendError(res, 'Text and username are required', 400);
    }

    // SECURITY FIX: Verify identity
    const user = await User.findById(req.user.id);
    if (!user || user.username.toLowerCase() !== username.toLowerCase()) {
        return sendError(res, 'Not authorized to create tasks for this user', 403);
    }

    // Find the highest order to append the new task at the end
    const lastTask = await Todo.findOne({ username: username.toLowerCase() }).sort({ order: -1 });
    const order = lastTask ? lastTask.order + 1 : 0;

    const task = await Todo.create({
        text,
        username: username.toLowerCase(),
        category: category || 'personal',
        isImportant: isImportant || false,
        due_date,
        plan: plan || 'tasks',
        order,
    });

    sendSuccess(res, task, 201);
});

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = asyncHandler(async (req, res) => {
    const task = await Todo.findById(req.params.id);

    if (!task) {
        return sendError(res, 'Task not found', 404);
    }

    // SECURITY FIX: Verify ownership
    const user = await User.findById(req.user.id);
    if (task.username.toLowerCase() !== user.username.toLowerCase()) {
        return sendError(res, 'Not authorized to update this task', 403);
    }

    // Whitelist allowed update fields to prevent mass-assignment attacks
    const ALLOWED_FIELDS = ['text', 'completed', 'isImportant', 'due_date', 'category', 'plan', 'order'];
    ALLOWED_FIELDS.forEach((field) => {
        if (req.body[field] !== undefined) {
            task[field] = req.body[field];
        }
    });
    await task.save();

    sendSuccess(res, task);
});

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = asyncHandler(async (req, res) => {
    const task = await Todo.findById(req.params.id);

    if (!task) {
        return sendError(res, 'Task not found', 404);
    }

    // SECURITY FIX: Verify ownership
    const user = await User.findById(req.user.id);
    if (task.username.toLowerCase() !== user.username.toLowerCase()) {
        return sendError(res, 'Not authorized to delete this task', 403);
    }

    await task.deleteOne();

    sendSuccess(res, { message: 'Task deleted successfully' });
});

// @desc    Bulk reorder tasks
// @route   PUT /api/tasks/reorder/bulk
// @access  Private
exports.reorderTasks = asyncHandler(async (req, res) => {
    const { tasks } = req.body; // Expecting array of { _id, order }

    if (!Array.isArray(tasks) || tasks.length === 0) {
        return sendError(res, 'Tasks array is required', 400);
    }

    // SECURITY FIX: Verify the user owns all tasks being reordered
    const user = await User.findById(req.user.id);
    if (!user) {
        return sendError(res, 'Not authorized', 403);
    }

    const taskIds = tasks.map((t) => t._id);
    const dbTasks = await Todo.find({ _id: { $in: taskIds } }).select('username');
    const allOwned = dbTasks.every(
        (t) => t.username.toLowerCase() === user.username.toLowerCase()
    );
    if (!allOwned) {
        return sendError(res, 'Not authorized to reorder one or more tasks', 403);
    }

    const bulkOps = tasks.map((task) => ({
        updateOne: {
            filter: { _id: task._id },
            update: { $set: { order: task.order } },
        },
    }));

    await Todo.bulkWrite(bulkOps);

    sendSuccess(res, { message: 'Tasks reordered successfully' });
});

// @desc    Clear all completed tasks for a user
// @route   DELETE /api/tasks/completed/:username
// @access  Private
exports.clearCompleted = asyncHandler(async (req, res) => {
    const { username } = req.params;

    // SECURITY FIX: Verify identity
    const user = await User.findById(req.user.id);
    if (!user || user.username.toLowerCase() !== username.toLowerCase()) {
        return sendError(res, 'Not authorized to clear these tasks', 403);
    }

    await Todo.deleteMany({
        username: username.toLowerCase(),
        completed: true
    });

    sendSuccess(res, { message: 'Completed tasks cleared' });
});
