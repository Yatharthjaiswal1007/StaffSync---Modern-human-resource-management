const express = require('express');
const router = express.Router();
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  reviewLeave,
  cancelLeave,
} = require('../controllers/leaveController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/apply', applyLeave);
router.get('/my', getMyLeaves);
router.get('/all', authorize('admin', 'manager'), getAllLeaves);
router.put('/:id/review', authorize('admin', 'manager'), reviewLeave);
router.put('/:id/cancel', cancelLeave);

module.exports = router;
