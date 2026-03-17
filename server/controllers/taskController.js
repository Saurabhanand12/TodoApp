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
    // We check either the user ID in token or fetch the user to compare names
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
    
    const tasks = await Todo.find({ username: username.toLowerCase() }).sort({ position: 1 });
    sendSuccess(res, tasks);
});

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = asyncHandler(async (req, res) => {
    const { text, username, category, isImportant, due_date } = req.body;

    if (!text || !username) {
        return sendError(res, 'Text and username are required', 400);
    }

    // SECURITY FIX: Verify identity
    const user = await User.findById(req.user.id);
    if (!user || user.username.toLowerCase() !== username.toLowerCase()) {
        return sendError(res, 'Not authorized to create tasks for this user', 403);
    }

    // Find the highest position to append the new task
    const lastTask = await Todo.findOne({ username: username.toLowerCase() }).sort({ position: -1 });
    const position = lastTask ? lastTask.position + 1 : 0;

    const task = await Todo.create({
        text,
        username: username.toLowerCase(),
        category,
        isImportant,
        due_date,
        position
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

    Object.assign(task, req.body);
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
    const { tasks } = req.body; // Expecting array of { _id, position }

    if (!Array.isArray(tasks)) {
        return sendError(res, 'Tasks array is required', 400);
    }

    const bulkOps = tasks.map((task) => ({
        updateOne: {
            filter: { _id: task._id },
            update: { $set: { position: task.position } },
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
