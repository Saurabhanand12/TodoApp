const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_keep_it_safe';

// Helper to generate token & set cookie
const generateTokenAndSetCookie = (res, user) => {
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
};

/* 
// POST /api/user/register - DISABLED
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

        const normalizedUsername = username.trim().toLowerCase();
        let userExists = await User.findOne({ username: normalizedUsername });
        if (userExists) return res.status(400).json({ error: 'User already exists' });

        const user = new User({ username: normalizedUsername, password });
        await user.save();

        generateTokenAndSetCookie(res, user);
        res.status(201).json({ _id: user._id, username: user.username });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
*/

// POST /api/user/login - Unified Login/Register
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });

        const normalizedUsername = username.trim().toLowerCase();
        let user = await User.findOne({ username: normalizedUsername });

        if (!user) {
            // Create user if unique
            user = new User({ username: normalizedUsername, password });
            await user.save();
            generateTokenAndSetCookie(res, user);
            return res.status(201).json({ _id: user._id, username: user.username, message: 'Account created' });
        }

        // Handle existing user
        if (!(await user.matchPassword(password))) {
            return res.status(401).json({ error: 'Incorrect password for this username' });
        }

        generateTokenAndSetCookie(res, user);
        res.json({ _id: user._id, username: user.username });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/user/logout
router.post('/logout', (req, res) => {
    res.clearCookie('auth_token');
    res.json({ message: 'Logged out successfully' });
});

// GET /api/user/me — Get profile from cookie
router.get('/me', async (req, res) => {
    try {
        const token = req.cookies.auth_token;
        if (!token) return res.status(401).json({ error: 'No token, authorization denied' });

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) return res.status(401).json({ error: 'Token is not valid' });
        res.json(user);
    } catch (err) {
        res.status(401).json({ error: 'Token is not valid' });
    }
});

// PUT /api/user/change-username
router.put('/change-username', async (req, res) => {
    try {
        const token = req.cookies.auth_token;
        if (!token) return res.status(401).json({ error: 'Unauthorized' });

        const decoded = jwt.verify(token, JWT_SECRET);
        const { newUsername } = req.body;

        if (!newUsername) return res.status(400).json({ error: 'New username is required' });

        const normalizedNew = newUsername.trim().toLowerCase();

        // Check if taken
        const existing = await User.findOne({ username: normalizedNew });
        if (existing) return res.status(400).json({ error: 'Username already taken' });

        const user = await User.findById(decoded.id);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const oldUsername = user.username;
        user.username = normalizedNew;
        await user.save();

        // Update all related data
        const Todo = require('../models/Todo');
        const Feedback = require('../models/Feedback');

        await Todo.updateMany({ username: oldUsername }, { username: normalizedNew });
        await Feedback.updateMany({ username: oldUsername }, { username: normalizedNew });

        res.json({ username: normalizedNew, message: 'Username updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
