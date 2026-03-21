const router = require('express').Router();
const { submitFeedback, getFeedback, checkFeedback } = require('../controllers/feedbackController');
const { protect } = require('../middleware/auth');

// Public — any logged or anonymous user can submit
router.post('/', submitFeedback);

// Protected — check and list require auth
router.get('/check/:username', protect, checkFeedback);
router.get('/', protect, getFeedback);

module.exports = router;
