const express = require('express');
const router = express.Router();
const {
  clockIn,
  clockOut,
  getTodayStatus,
  getMyAttendance,
  getAllAttendance,
  regularizeAttendance,
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.get('/today', getTodayStatus);
router.get('/my', getMyAttendance);
router.get('/all', authorize('admin', 'manager'), getAllAttendance);
router.post('/regularize', authorize('admin'), regularizeAttendance);

module.exports = router;
