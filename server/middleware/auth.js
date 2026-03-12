const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/env');
const { sendError } = require('../utils/apiResponse');

/**
 * Auth middleware — reads JWT from httpOnly cookie, verifies it,
 * and attaches the decoded payload as req.user for downstream handlers.
 */
const protect = (req, res, next) => {
    const token = req.cookies?.auth_token;

    if (!token) {
        return sendError(res, 'No token, authorization denied', 401);
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // { id: userId, iat, exp }
        next();
    } catch {
        return sendError(res, 'Token is not valid or has expired', 401);
    }
};

module.exports = { protect };
