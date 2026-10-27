const express = require('express');
const router = express.Router();
const {
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} = require('../controllers/announcementController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getAllAnnouncements);
router.post('/', authorize('admin', 'manager'), createAnnouncement);
router.put('/:id', authorize('admin', 'manager'), updateAnnouncement);
router.delete('/:id', authorize('admin', 'manager'), deleteAnnouncement);

module.exports = router;
