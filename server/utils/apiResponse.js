/**
 * Standardized API response helpers.
 * All responses follow the shape: { success, data } or { success, error }
 */

const sendSuccess = (res, data = {}, statusCode = 200) => {
    return res.status(statusCode).json({ success: true, data });
};

const sendError = (res, message = 'An error occurred', statusCode = 500) => {
    return res.status(statusCode).json({ success: false, error: message });
};

module.exports = { sendSuccess, sendError };
