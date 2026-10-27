const Leave = require('../models/Leave');
const User = require('../models/User');

const calculateDays = (start, end, isHalfDay) => {
  if (isHalfDay) return 0.5;
  const s = new Date(start);
  const e = new Date(end);
  const diffTime = Math.abs(e - s);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

// @desc    Apply for leave
// @route   POST /api/leaves/apply
// @access  Private
const applyLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, isHalfDay = false, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const daysCount = calculateDays(startDate, endDate, isHalfDay);

    const user = await User.findById(req.user._id);
    const balanceKey =
      leaveType === 'Casual'
        ? 'casual'
        : leaveType === 'Sick'
        ? 'sick'
        : leaveType === 'Annual'
        ? 'annual'
        : leaveType === 'Maternity/Paternity'
        ? 'maternityPaternity'
        : 'unpaid';

    if (balanceKey !== 'unpaid' && user.leaveBalances[balanceKey] < daysCount) {
      return res.status(400).json({
        success: false,
        message: `Insufficient ${leaveType} leave balance. Available: ${user.leaveBalances[balanceKey]} days, requested: ${daysCount} days.`,
      });
    }

    const newLeave = new Leave({
      user: req.user._id,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      daysCount,
      isHalfDay,
      reason,
      status: 'Pending',
    });

    await newLeave.save();

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      data: newLeave,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user's leaves
// @route   GET /api/leaves/my
// @access  Private
const getMyLeaves = async (req, res, next) => {
  try {
    const leaves = await Leave.find({ user: req.user._id })
      .populate('reviewedBy', 'name designation')
      .sort({ createdAt: -1 });

    const user = await User.findById(req.user._id).select('leaveBalances');

    res.json({
      success: true,
      balances: user ? user.leaveBalances : {},
      data: leaves,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all leave applications (Admin & Manager)
// @route   GET /api/leaves/all
// @access  Private (Admin, Manager)
const getAllLeaves = async (req, res, next) => {
  try {
    const { status, leaveType, department, page = 1, limit = 50 } = req.query;

    const query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (leaveType && leaveType !== 'All') {
      query.leaveType = leaveType;
    }

    let userQuery = {};
    if (department && department !== 'All') {
      userQuery.department = department;
    }

    if (Object.keys(userQuery).length > 0) {
      const users = await User.find(userQuery).select('_id');
      query.user = { $in: users.map((u) => u._id) };
    }

    const total = await Leave.countDocuments(query);
    const leaves = await Leave.find(query)
      .populate('user', 'name email employeeId department designation avatar leaveBalances')
      .populate('reviewedBy', 'name designation')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: leaves,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Review leave (Approve/Reject)
// @route   PUT /api/leaves/:id/review
// @access  Private (Admin, Manager)
const reviewLeave = async (req, res, next) => {
  try {
    const { status, reviewNotes = '' } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Approved or Rejected' });
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave application not found' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `This leave has already been ${leave.status.toLowerCase()}`,
      });
    }

    leave.status = status;
    leave.reviewedBy = req.user._id;
    leave.reviewNotes = reviewNotes;
    leave.reviewedAt = new Date();

    // If approved, deduct from employee's leave balance
    if (status === 'Approved') {
      const user = await User.findById(leave.user);
      if (user) {
        const balanceKey =
          leave.leaveType === 'Casual'
            ? 'casual'
            : leave.leaveType === 'Sick'
            ? 'sick'
            : leave.leaveType === 'Annual'
            ? 'annual'
            : leave.leaveType === 'Maternity/Paternity'
            ? 'maternityPaternity'
            : 'unpaid';

        if (balanceKey !== 'unpaid') {
          user.leaveBalances[balanceKey] = Math.max(0, user.leaveBalances[balanceKey] - leave.daysCount);
          await user.save();
        }
      }
    }

    await leave.save();

    res.json({
      success: true,
      message: `Leave application ${status.toLowerCase()} successfully`,
      data: leave,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel pending leave application
// @route   PUT /api/leaves/:id/cancel
// @access  Private
const cancelLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findOne({ _id: req.params.id, user: req.user._id });

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave application not found' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending leave requests can be cancelled',
      });
    }

    leave.status = 'Cancelled';
    await leave.save();

    res.json({
      success: true,
      message: 'Leave application cancelled',
      data: leave,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  reviewLeave,
  cancelLeave,
};
