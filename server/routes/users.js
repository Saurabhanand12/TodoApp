const router = require('express').Router();
const User = require('../models/User');

// POST /api/user — create user if not exists, return user
router.post('/', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username || !username.trim()) {
            return res.status(400).json({ error: 'Username is required' });
        }

        const normalizedUsername = username.trim().toLowerCase();

        let user = await User.findOne({ username: normalizedUsername });
        if (!user) {
            user = new User({ username: normalizedUsername });
            await user.save();
        }

        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/user/:username — check if user exists
router.get('/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username.toLowerCase() });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
