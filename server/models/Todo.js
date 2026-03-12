const mongoose = require('mongoose');

const todoSchema = new mongoose.Schema(
    {
        text: {
            type: String,
            required: [true, 'Task text is required'],
            trim: true,
            maxlength: [500, 'Task text cannot exceed 500 characters'],
        },
        completed: {
            type: Boolean,
            default: false,
        },
        position: {
            type: Number,
            default: 0,
        },
        isImportant: {
            type: Boolean,
            default: false,
        },
        due_date: {
            type: Date,
            default: Date.now,
        },
        username: {
            type: String,
            required: [true, 'Username is required'],
            trim: true,
            lowercase: true,
            index: true,
        },
        category: {
            type: String,
            enum: {
                values: ['personal', 'work', 'grocery'],
                message: '{VALUE} is not a supported category',
            },
            default: 'personal',
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for efficient per-user sorted queries
todoSchema.index({ username: 1, position: 1 });

module.exports = mongoose.model('Todo', todoSchema);
