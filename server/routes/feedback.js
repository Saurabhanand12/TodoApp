const router = require('express').Router();
const Feedback = require('../models/Feedback');

// POST /api/feedback — submit feedback
router.post('/', async (req, res) => {
    try {
        const { username, message, rating } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Feedback message is required' });
        }

        const newFeedback = new Feedback({
            username: username ? username.trim().toLowerCase() : 'anonymous',
            message: message.trim(),
            rating: typeof rating === 'number' ? rating : undefined
        });

        await newFeedback.save();
        res.status(201).json({ success: true, message: 'Feedback submitted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/feedback — fetch all feedback
router.get('/', async (req, res) => {
    try {
        const feedbacks = await Feedback.find().sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
