const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, 'Username is required'],
            trim: true,
            lowercase: true,
            index: true,
        },
        message: {
            type: String,
            required: [true, 'Feedback message is required'],
            trim: true,
            maxlength: [1000, 'Feedback message cannot exceed 1000 characters'],
        },
        rating: {
            type: Number,
            min: [1, 'Rating must be at least 1'],
            max: [5, 'Rating cannot exceed 5'],
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('Feedback', feedbackSchema);
