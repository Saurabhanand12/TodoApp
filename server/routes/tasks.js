const router = require('express').Router();
const Todo = require('../models/Todo');

// GET /api/tasks/:username — get all tasks for a specific user
router.get('/:username', async (req, res) => {
    try {
        const todos = await Todo.find({
            username: req.params.username.toLowerCase()
        }).sort({ createdAt: -1 });
        res.json(todos);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/tasks — add a new task with username
router.post('/', async (req, res) => {
    try {
        const { text, username, due_date } = req.body;
        if (!text || !username) {
            return res.status(400).json({ error: 'text and username are required' });
        }
        const newTodo = new Todo({
            text,
            username: username.trim().toLowerCase(),
            due_date: due_date ? new Date(due_date) : new Date()
        });
        const savedTodo = await newTodo.save();
        res.json(savedTodo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/tasks/:id — update a task
router.put('/:id', async (req, res) => {
    try {
        const updatedTodo = await Todo.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!updatedTodo) return res.status(404).json({ error: 'Task not found' });
        res.json(updatedTodo);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/tasks/:id — delete a task
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await Todo.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: 'Task not found' });
        res.json({ message: 'Task deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
