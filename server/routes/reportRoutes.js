const express = require('express');
const router = express.Router();
const {
  getDashboardMetrics,
  getAttendanceExport,
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/dashboard', getDashboardMetrics);
router.get('/attendance-export', authorize('admin', 'manager'), getAttendanceExport);

module.exports = router;
