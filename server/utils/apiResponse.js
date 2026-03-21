/**
 * Standardized API response helpers.
 * sendSuccess returns data FLAT at root level for backward compatibility
 * with the existing frontend (e.g., { _id, username, email } not { data: { ... } }).
 */

const sendSuccess = (res, data = {}, statusCode = 200) => {
    // If data is a Mongoose document, convert to plain object
    const payload = data.toObject ? data.toObject() : data;

    // If it's an array, return it directly (e.g., task lists, feedback lists)
    if (Array.isArray(payload)) {
        return res.status(statusCode).json(payload);
    }

    // Spread flat at root level for backward compatibility
    return res.status(statusCode).json({ success: true, ...payload });
};

const sendError = (res, message = 'An error occurred', statusCode = 500) => {
    return res.status(statusCode).json({ success: false, error: message });
};

module.exports = { sendSuccess, sendError };
