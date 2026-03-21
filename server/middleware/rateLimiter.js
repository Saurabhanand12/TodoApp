const rateLimit = require('express-rate-limit');

/**
 * Login-specific rate limiter.
 * Allows 10 login attempts per IP per 15 minutes.
 * Prevents brute-force password attacks.
 */
const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: {
        success: false,
        error: 'Too many login attempts from this IP, please try again after 15 minutes',
    },
    standardHeaders: true,  // Return rate limit info in RateLimit-* headers
    legacyHeaders: false,   // Disable X-RateLimit-* headers
    skipSuccessfulRequests: true, // Only count failed attempts
});

/**
 * General API rate limiter.
 * Allows 200 requests per IP per 15 minutes.
 * Protects against general API abuse.
 */
const generalRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: {
        success: false,
        error: 'Too many requests from this IP, please try again later',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = { loginRateLimiter, generalRateLimiter };
