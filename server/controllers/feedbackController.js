const Feedback = require('../models/Feedback');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// ─── Submit feedback ─────────────────────────────────────────────────────

const submitFeedback = asyncHandler(async (req, res) => {
    const { username, message, rating } = req.body;

    if (!message || !message.trim()) {
        return sendError(res, 'Feedback message is required', 400);
    }

    const newFeedback = new Feedback({
        username: username ? username.trim().toLowerCase() : 'anonymous',
        message: message.trim(),
        rating: typeof rating === 'number' ? rating : undefined,
    });

    await newFeedback.save();
    return sendSuccess(res, { message: 'Feedback submitted successfully' }, 201);
});

// ─── Get all feedback ─────────────────────────────────────────────────────

const getFeedback = asyncHandler(async (req, res) => {
    const feedbacks = await Feedback.find().sort({ createdAt: -1 }).lean();
    return sendSuccess(res, feedbacks);
});

// ─── Check if user submitted feedback ────────────────────────────────────

const checkFeedback = asyncHandler(async (req, res) => {
    const feedback = await Feedback.findOne({
        username: req.params.username.toLowerCase(),
    }).lean();
    return sendSuccess(res, { hasSubmitted: !!feedback });
});

module.exports = { submitFeedback, getFeedback, checkFeedback };
