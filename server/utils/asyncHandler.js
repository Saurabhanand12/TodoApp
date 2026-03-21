/**
 * Wraps async route handlers to automatically forward errors to Express error middleware.
 * Eliminates repetitive try/catch blocks in controllers.
 *
 * Usage: router.get('/path', asyncHandler(myController))
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
