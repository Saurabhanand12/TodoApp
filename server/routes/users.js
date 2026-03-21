const router = require('express').Router();
const { register, login, logout, getMe, changeUsername } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { loginRateLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/register', register);
router.post('/login', loginRateLimiter, login);
router.post('/logout', logout);

// Protected routes (valid JWT cookie required)
router.get('/me', protect, getMe);
router.put('/change-username', protect, changeUsername);

module.exports = router;
