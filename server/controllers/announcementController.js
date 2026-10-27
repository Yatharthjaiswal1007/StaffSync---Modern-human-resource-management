const Announcement = require('../models/Announcement');

// @desc    Get all announcements
// @route   GET /api/announcements
// @access  Private
const getAllAnnouncements = async (req, res, next) => {
  try {
    const { category, priority, department } = req.query;

    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    // Employees see announcements for "All" or their specific department
    if (req.user.role === 'employee') {
      query.$or = [{ targetDepartment: 'All' }, { targetDepartment: req.user.department }];
    } else if (department && department !== 'All') {
      query.targetDepartment = { $in: ['All', department] };
    }

    // Sort pinned announcements first, then newest
    const announcements = await Announcement.find(query)
      .populate('author', 'name email designation avatar')
      .sort({ isPinned: -1, createdAt: -1 });

    res.json({
      success: true,
      data: announcements,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create announcement
// @route   POST /api/announcements
// @access  Private (Admin, Manager)
const createAnnouncement = async (req, res, next) => {
  try {
    const { title, content, category, priority, targetDepartment, isPinned, expiryDate } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Title and content are required' });
    }

    const announcement = new Announcement({
      title,
      content,
      category: category || 'Company News',
      priority: priority || 'Medium',
      targetDepartment: targetDepartment || 'All',
      author: req.user._id,
      isPinned: Boolean(isPinned),
      expiryDate: expiryDate ? new Date(expiryDate) : null,
    });

    await announcement.save();

    res.status(201).json({
      success: true,
      message: 'Announcement published successfully',
      data: announcement,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update announcement
// @route   PUT /api/announcements/:id
// @access  Private (Admin, Manager)
const updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    const { title, content, category, priority, targetDepartment, isPinned, expiryDate } = req.body;

    if (title) announcement.title = title;
    if (content) announcement.content = content;
    if (category) announcement.category = category;
    if (priority) announcement.priority = priority;
    if (targetDepartment) announcement.targetDepartment = targetDepartment;
    if (isPinned !== undefined) announcement.isPinned = isPinned;
    if (expiryDate !== undefined) announcement.expiryDate = expiryDate ? new Date(expiryDate) : null;

    await announcement.save();

    res.json({
      success: true,
      message: 'Announcement updated successfully',
      data: announcement,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete announcement
// @route   DELETE /api/announcements/:id
// @access  Private (Admin, Manager)
const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      return res.status(404).json({ success: false, message: 'Announcement not found' });
    }

    await Announcement.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Announcement deleted successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllAnnouncements,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
};
