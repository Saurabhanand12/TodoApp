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
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
};

// POST /api/user/register
router.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        if (!username || !email || !password) return res.status(400).json({ error: 'Username, email and password are required' });

        if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

        const normalizedUsername = username.trim().toLowerCase();
        const normalizedEmail = email.trim().toLowerCase();

        // Check if username or email already exists
        const userExists = await User.findOne({
            $or: [{ username: normalizedUsername }, { email: normalizedEmail }]
        });

        if (userExists) {
            if (userExists.email === normalizedEmail) {
                return res.status(400).json({ error: 'Email already registered' });
            }
            return res.status(400).json({ error: 'Username already taken' });
        }

        const user = new User({ username: normalizedUsername, email: normalizedEmail, password });
        await user.save();

        generateTokenAndSetCookie(res, user);
        res.status(201).json({ _id: user._id, username: user.username, email: user.email, message: 'Account created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/user/login
router.post('/login', async (req, res) => {
    try {
        // Now login takes email (which can act as a username) and password
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email/Username and password are required' });

        const identifier = email.trim().toLowerCase();
        let user = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }]
        });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credential' });
        }

        // Handle existing user
        if (!(await user.matchPassword(password))) {
            return res.status(401).json({ error: 'Invalid credential' });
        }

        generateTokenAndSetCookie(res, user);
        res.json({ _id: user._id, username: user.username, email: user.email });
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
        if (!token) {
            return res.status(401).json({ error: 'No token, authorization denied' });
        }

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
