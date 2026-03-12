const router = require('express').Router();
const { getTasks, createTask, updateTask, deleteTask, reorderTasks, clearCompleted } = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

// All task routes require authentication
router.use(protect);

// Static sub-paths must come before dynamic /:id or /:username params
router.put('/reorder/bulk', reorderTasks);
router.delete('/completed/:username', clearCompleted);

// Dynamic/standard CRUD
router.get('/:username', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
