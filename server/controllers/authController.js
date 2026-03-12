const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Todo = require('../models/Todo');
const Feedback = require('../models/Feedback');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');

// ─── Helper ────────────────────────────────────────────────────────────────

const issueTokenCookie = (res, user) => {
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};

// ─── Register ──────────────────────────────────────────────────────────────

const register = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return sendError(res, 'Username, email and password are required', 400);
    }
    if (password.length < 6) {
        return sendError(res, 'Password must be at least 6 characters', 400);
    }

    const normalizedUsername = username.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

    const userExists = await User.findOne({
        $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
    });

    if (userExists) {
        if (userExists.email === normalizedEmail) {
            return sendError(res, 'Email already registered', 400);
        }
        return sendError(res, 'Username already taken', 400);
    }

    const user = new User({ username: normalizedUsername, email: normalizedEmail, password });
    await user.save();

    issueTokenCookie(res, user);
    return sendSuccess(
        res,
        { _id: user._id, username: user.username, email: user.email, message: 'Account created' },
        201
    );
});

// ─── Login ────────────────────────────────────────────────────────────────

const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return sendError(res, 'Email/Username and password are required', 400);
    }

    const identifier = email.trim().toLowerCase();
    const user = await User.findOne({ $or: [{ email: identifier }, { username: identifier }] });

    if (!user || !(await user.matchPassword(password))) {
        return sendError(res, 'Invalid credentials', 401);
    }

    issueTokenCookie(res, user);
    return sendSuccess(res, { _id: user._id, username: user.username, email: user.email });
});

// ─── Logout ───────────────────────────────────────────────────────────────

const logout = (req, res) => {
    res.clearCookie('auth_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    });
    return sendSuccess(res, { message: 'Logged out successfully' });
};

// ─── Get Current User ─────────────────────────────────────────────────────

const getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return sendError(res, 'User not found', 404);
    return sendSuccess(res, user);
});

// ─── Change Username ──────────────────────────────────────────────────────

const changeUsername = asyncHandler(async (req, res) => {
    const { newUsername } = req.body;

    if (!newUsername || !newUsername.trim()) {
        return sendError(res, 'New username is required', 400);
    }

    const normalizedNew = newUsername.trim().toLowerCase();

    const existing = await User.findOne({ username: normalizedNew });
    if (existing) return sendError(res, 'Username already taken', 400);

    const user = await User.findById(req.user.id);
    if (!user) return sendError(res, 'User not found', 404);

    const oldUsername = user.username;
    user.username = normalizedNew;
    await user.save();

    await Promise.all([
        Todo.updateMany({ username: oldUsername }, { username: normalizedNew }),
        Feedback.updateMany({ username: oldUsername }, { username: normalizedNew }),
    ]);

    return sendSuccess(res, { username: normalizedNew, message: 'Username updated successfully' });
});

module.exports = { register, login, logout, getMe, changeUsername };
