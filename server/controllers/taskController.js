const Todo = require('../models/Todo');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// ─── Get all tasks for a user ─────────────────────────────────────────────

const getTasks = asyncHandler(async (req, res) => {
    const username = req.params.username.toLowerCase();
    const todos = await Todo.find({ username })
        .select('-__v')
        .sort({ createdAt: -1 })
        .lean();
    return sendSuccess(res, todos);
});

// ─── Create a task ────────────────────────────────────────────────────────

const createTask = asyncHandler(async (req, res) => {
    const { text, username, due_date, category } = req.body;

    if (!text || !text.trim()) {
        return sendError(res, 'Task text is required', 400);
    }
    if (!username) {
        return sendError(res, 'Username is required', 400);
    }

    const newTodo = new Todo({
        text: text.trim(),
        username: username.trim().toLowerCase(),
        due_date: due_date ? new Date(due_date) : new Date(),
        category: category || 'personal',
    });

    const savedTodo = await newTodo.save();
    return sendSuccess(res, savedTodo, 201);
});

// ─── Update a task ────────────────────────────────────────────────────────

const updateTask = asyncHandler(async (req, res) => {
    // Whitelist updatable fields to prevent mass assignment
    const { text, completed, isImportant, due_date, category, position } = req.body;
    const updates = {};
    if (text !== undefined) updates.text = text;
    if (completed !== undefined) updates.completed = completed;
    if (isImportant !== undefined) updates.isImportant = isImportant;
    if (due_date !== undefined) updates.due_date = new Date(due_date);
    if (category !== undefined) updates.category = category;
    if (position !== undefined) updates.position = position;

    const updatedTodo = await Todo.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true }
    );

    if (!updatedTodo) return sendError(res, 'Task not found', 404);
    return sendSuccess(res, updatedTodo);
});

// ─── Delete a task ────────────────────────────────────────────────────────

const deleteTask = asyncHandler(async (req, res) => {
    const deleted = await Todo.findByIdAndDelete(req.params.id);
    if (!deleted) return sendError(res, 'Task not found', 404);
    return sendSuccess(res, { message: 'Task deleted' });
});

// ─── Bulk reorder tasks ───────────────────────────────────────────────────

const reorderTasks = asyncHandler(async (req, res) => {
    const { tasks } = req.body;

    if (!Array.isArray(tasks) || tasks.length === 0) {
        return sendError(res, 'Expected a non-empty array of tasks', 400);
    }

    const updates = tasks.map((task) => ({
        updateOne: {
            filter: { _id: task._id },
            update: { $set: { position: task.position } },
        },
    }));

    await Todo.bulkWrite(updates);
    return sendSuccess(res, { message: 'Tasks reordered successfully' });
});

// ─── Clear completed tasks for a user ────────────────────────────────────

const clearCompleted = asyncHandler(async (req, res) => {
    const result = await Todo.deleteMany({
        username: req.params.username.toLowerCase(),
        completed: true,
    });
    return sendSuccess(res, {
        message: `Deleted ${result.deletedCount} completed tasks`,
        deletedCount: result.deletedCount,
    });
});

module.exports = { getTasks, createTask, updateTask, deleteTask, reorderTasks, clearCompleted };
