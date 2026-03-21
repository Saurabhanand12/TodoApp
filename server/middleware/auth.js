const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const { sendError } = require('../utils/apiResponse');

/**
 * Auth middleware — reads JWT from httpOnly cookie, verifies it,
 * and attaches the decoded payload as req.user for downstream handlers.
 */
const protect = (req, res, next) => {
    let token = req.cookies?.auth_token;

    // Fallback to Authorization header if cookie is missing
    if (!token && req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Defensive check: handle cases where token might be stringified "null" or "undefined"
    if (token === 'null' || token === 'undefined') {
        token = null;
    }

    if (!token) {
        return sendError(res, 'No token, authorization denied', 401);
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id: userId, iat, exp }
        next();
    } catch (err) {
        console.error(`[AUTH] Token verification failed for ${req.method} ${req.path}:`, err.message);
        return sendError(res, 'Token is not valid or has expired', 401);
    }
};

module.exports = { protect };
