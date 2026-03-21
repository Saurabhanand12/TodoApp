const { isProduction } = require('../config/env');
const logger = require('../utils/logger');

/**
 * Global error-handling middleware.
 * Must be registered LAST in the Express middleware stack.
 * Catches all errors forwarded via next(err).
 */
const errorHandler = (err, req, res, next) => { // eslint-disable-line no-unused-vars
    logger.error(err.message, err.stack);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map((e) => e.message);
        return res.status(400).json({ success: false, error: messages.join(', ') });
    }

    // Mongoose duplicate key error (e.g., unique email/username)
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern || {})[0] || 'field';
        return res.status(400).json({ success: false, error: `${field} already exists` });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, error: 'Token is not valid or has expired' });
    }

    const statusCode = err.statusCode || err.status || 500;
    const message = isProduction && statusCode === 500
        ? 'Internal server error'
        : err.message || 'Internal server error';

    res.status(statusCode).json({ success: false, error: message });
};

module.exports = errorHandler;
