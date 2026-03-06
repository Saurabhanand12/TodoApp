const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
    // Check if the stored password looks like a bcrypt hash
    const isBcryptHash = this.password.startsWith('$2a$') || this.password.startsWith('$2b$');

    if (isBcryptHash) {
        return await bcrypt.compare(enteredPassword, this.password);
    }

    // Legacy plain-text fallback
    return enteredPassword === this.password;
};

module.exports = mongoose.model('User', userSchema);
