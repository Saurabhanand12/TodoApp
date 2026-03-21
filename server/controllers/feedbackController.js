const Feedback = require('../models/Feedback');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Public/Private (depending on frontend use)
exports.submitFeedback = asyncHandler(async (req, res) => {
    const { username, message, rating } = req.body;

    if (!username || !message) {
        return sendError(res, 'Username and message are required', 400);
    }

    const feedback = await Feedback.create({
        username: username.toLowerCase(),
        message,
        rating
    });

    sendSuccess(res, feedback, 201);
});

// @desc    Get all feedback (Admin view)
// @route   GET /api/feedback
// @access  Private
exports.getFeedback = asyncHandler(async (req, res) => {
    // In a real app, we'd check req.user.role === 'admin'
    const feedbackList = await Feedback.find().sort({ createdAt: -1 });
    sendSuccess(res, feedbackList);
});

// @desc    Check if user has submitted feedback (optional utility)
// @route   GET /api/feedback/check/:username
// @access  Private
exports.checkFeedback = asyncHandler(async (req, res) => {
    const hasFeedback = await Feedback.exists({ username: req.params.username.toLowerCase() });
    sendSuccess(res, { hasSubmitted: !!hasFeedback });
});
