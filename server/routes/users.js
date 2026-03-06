const router = require('express').Router();
const User = require('../models/User');

// POST /api/user — create user if not exists, return user
router.post('/', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !username.trim()) {
            return res.status(400).json({ error: 'Username is required' });
        }
        if (!password) {
            return res.status(400).json({ error: 'Password is required' });
        }

        const normalizedUsername = username.trim().toLowerCase();

        let user = await User.findOne({ username: normalizedUsername });
        if (!user) {
            // Create user
            user = new User({ username: normalizedUsername, password });
            await user.save();
        } else {
            // Validate password for existing user
            if (!user.password) {
                // Support legacy accounts that don't have a password yet
                user.password = password;
                await user.save();
            } else if (user.password !== password) {
                return res.status(401).json({ error: 'Incorrect password' });
            }
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
