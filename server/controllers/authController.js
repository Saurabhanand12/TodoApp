const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// ─── Generate Token Helper ───────────────────────────────────────────────────
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
};

// ─── Set Token Cookie Helper ──────────────────────────────────────────────────
const setTokenCookie = (res, token) => {
    const cookieOptions = {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days matching standard JWT_EXPIRES_IN
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    };
    res.cookie('auth_token', token, cookieOptions);
};

// @desc    Register user
// @route   POST /api/user/register
// @access  Public
exports.register = asyncHandler(async (req, res) => {
    const { username, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ 
        $or: [{ email: email.toLowerCase() }, { username: username.toLowerCase() }] 
    });

    if (userExists) {
        return sendError(res, 'User with this email or username already exists', 400);
    }

    // Create user
    const user = await User.create({
        username,
        email,
        password,
    });

    if (user) {
        const token = generateToken(user._id);
        setTokenCookie(res, token);

        sendSuccess(res, {
            _id: user._id,
            username: user.username,
            email: user.email,
        }, 201);
    } else {
        sendError(res, 'Invalid user data', 400);
    }
});

// @desc    Login user
// @route   POST /api/user/login
// @access  Public
exports.login = asyncHandler(async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return sendError(res, 'Please provide username and password', 400);
    }

    // Check for user (select password because it's excluded by default if someone changed the schema or for safety)
    const user = await User.findOne({ username: username.toLowerCase() }).select('+password');

    if (user && (await user.matchPassword(password))) {
        const token = generateToken(user._id);
        setTokenCookie(res, token);

        sendSuccess(res, {
            _id: user._id,
            username: user.username,
            email: user.email,
        });
    } else {
        sendError(res, 'Invalid credentials', 401);
    }
});

// @desc    Logout user / clear cookie
// @route   POST /api/user/logout
// @access  Public
exports.logout = (req, res) => {
    res.cookie('auth_token', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    sendSuccess(res, { message: 'Logged out successfully' });
};

// @desc    Get current user profile
// @route   GET /api/user/me
// @access  Private
exports.getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id);
    if (user) {
        sendSuccess(res, user);
    } else {
        sendError(res, 'User not found', 404);
    }
});

// @desc    Change username
// @route   PUT /api/user/change-username
// @access  Private
exports.changeUsername = asyncHandler(async (req, res) => {
    const { newUsername } = req.body;

    if (!newUsername) {
        return sendError(res, 'Please provide a new username', 400);
    }

    const user = await User.findById(req.user.id);

    if (!user) {
        return sendError(res, 'User not found', 404);
    }

    // Check if new username is taken
    const usernameExists = await User.findOne({ username: newUsername.toLowerCase() });
    if (usernameExists) {
        return sendError(res, 'Username is already taken', 400);
    }

    user.username = newUsername;
    await user.save();

    sendSuccess(res, user);
});
