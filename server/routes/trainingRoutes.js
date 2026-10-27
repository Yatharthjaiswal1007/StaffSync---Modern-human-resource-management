const express = require('express');
const router = express.Router();
const {
  getAllTrainings,
  getTrainingById,
  createTraining,
  enrollCourse,
  updateProgress,
  deleteTraining,
} = require('../controllers/trainingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAllTrainings);
router.get('/:id', getTrainingById);
router.post('/', authorize('admin', 'manager'), createTraining);
router.post('/:id/enroll', enrollCourse);
router.put('/:id/progress', updateProgress);
router.delete('/:id', authorize('admin'), deleteTraining);

module.exports = router;
