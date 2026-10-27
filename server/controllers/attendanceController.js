const Attendance = require('../models/Attendance');
const User = require('../models/User');

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Clock in for today
// @route   POST /api/attendance/clock-in
// @access  Private
const clockIn = async (req, res, next) => {
  try {
    const today = getTodayDateString();
    const { workMode = 'Office', location = 'Main Office', notes = '' } = req.body;

    let record = await Attendance.findOne({ user: req.user._id, date: today });

    if (record && record.clockIn) {
      return res.status(400).json({
        success: false,
        message: 'You have already clocked in for today',
        data: record,
      });
    }

    const now = new Date();
    // Default start time benchmark: 9:30 AM
    const isLate = now.getHours() > 9 || (now.getHours() === 9 && now.getMinutes() > 30);
    const initialStatus = isLate ? 'Late' : 'Present';

    if (!record) {
      record = new Attendance({
        user: req.user._id,
        date: today,
        clockIn: now,
        status: initialStatus,
        workMode,
        location,
        notes,
      });
    } else {
      record.clockIn = now;
      record.status = initialStatus;
      record.workMode = workMode;
      record.location = location;
      record.notes = notes;
    }

    await record.save();

    res.status(200).json({
      success: true,
      message: `Clocked in successfully at ${now.toLocaleTimeString()}`,
      data: record,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Clock out for today
// @route   POST /api/attendance/clock-out
// @access  Private
const clockOut = async (req, res, next) => {
  try {
    const today = getTodayDateString();
    const record = await Attendance.findOne({ user: req.user._id, date: today });

    if (!record || !record.clockIn) {
      return res.status(400).json({
        success: false,
        message: 'You have not clocked in today yet',
      });
    }

    if (record.clockOut) {
      return res.status(400).json({
        success: false,
        message: 'You have already clocked out for today',
        data: record,
      });
    }

    const now = new Date();
    record.clockOut = now;

    // Calculate work hours
    const diffMs = now.getTime() - new Date(record.clockIn).getTime();
    const hours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
    record.workHours = hours;

    if (hours < 4.0 && record.status !== 'Absent') {
      record.status = 'Half-day';
    }

    await record.save();

    res.status(200).json({
      success: true,
      message: `Clocked out successfully at ${now.toLocaleTimeString()} (${hours} hours worked)`,
      data: record,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get logged in user today attendance status
// @route   GET /api/attendance/today
// @access  Private
const getTodayStatus = async (req, res, next) => {
  try {
    const today = getTodayDateString();
    const record = await Attendance.findOne({ user: req.user._id, date: today });

    res.json({
      success: true,
      data: record || null,
      isClockedIn: Boolean(record && record.clockIn && !record.clockOut),
      isClockedOut: Boolean(record && record.clockOut),
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current user's attendance history
// @route   GET /api/attendance/my
// @access  Private
const getMyAttendance = async (req, res, next) => {
  try {
    const { startDate, endDate, month, year } = req.query;
    const query = { user: req.user._id };

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    } else if (month && year) {
      const formattedMonth = String(month).padStart(2, '0');
      query.date = { $regex: `^${year}-${formattedMonth}` };
    }

    const records = await Attendance.find(query).sort({ date: -1 });

    // Aggregate stats
    const totalDays = records.length;
    const presentCount = records.filter((r) => r.status === 'Present').length;
    const lateCount = records.filter((r) => r.status === 'Late').length;
    const halfDayCount = records.filter((r) => r.status === 'Half-day').length;
    const totalHours = records.reduce((acc, curr) => acc + (curr.workHours || 0), 0);

    res.json({
      success: true,
      stats: {
        totalDays,
        presentCount,
        lateCount,
        halfDayCount,
        totalHours: Math.round(totalHours * 10) / 10,
        averageHours: totalDays > 0 ? Math.round((totalHours / totalDays) * 10) / 10 : 0,
      },
      data: records,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all attendance records (Admin & Manager)
// @route   GET /api/attendance/all
// @access  Private (Admin, Manager)
const getAllAttendance = async (req, res, next) => {
  try {
    const { date, department, status, search, page = 1, limit = 50 } = req.query;

    const query = {};

    if (date) {
      query.date = date;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    let userQuery = {};
    if (department && department !== 'All') {
      userQuery.department = department;
    }
    if (search) {
      userQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
      ];
    }

    if (Object.keys(userQuery).length > 0) {
      const users = await User.find(userQuery).select('_id');
      query.user = { $in: users.map((u) => u._id) };
    }

    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .populate('user', 'name email employeeId department designation avatar')
      .sort({ date: -1, clockIn: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: records,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Manual attendance regularization / mark
// @route   POST /api/attendance/regularize
// @access  Private (Admin)
const regularizeAttendance = async (req, res, next) => {
  try {
    const { userId, date, clockIn, clockOut, status, workMode, notes } = req.body;

    if (!userId || !date) {
      return res.status(400).json({ success: false, message: 'User ID and date are required' });
    }

    let record = await Attendance.findOne({ user: userId, date });

    const cIn = clockIn ? new Date(clockIn) : record ? record.clockIn : new Date(`${date}T09:00:00`);
    const cOut = clockOut ? new Date(clockOut) : record ? record.clockOut : new Date(`${date}T17:30:00`);

    let hours = 0;
    if (cIn && cOut) {
      const diffMs = cOut.getTime() - cIn.getTime();
      hours = Math.max(0, Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100);
    }

    if (!record) {
      record = new Attendance({
        user: userId,
        date,
        clockIn: cIn,
        clockOut: cOut,
        workHours: hours,
        status: status || 'Present',
        workMode: workMode || 'Office',
        notes: notes || 'Regularized by HR Administrator',
      });
    } else {
      record.clockIn = cIn;
      record.clockOut = cOut;
      record.workHours = hours;
      if (status) record.status = status;
      if (workMode) record.workMode = workMode;
      record.notes = notes || record.notes;
    }

    await record.save();

    res.json({
      success: true,
      message: 'Attendance regularized successfully',
      data: record,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  clockIn,
  clockOut,
  getTodayStatus,
  getMyAttendance,
  getAllAttendance,
  regularizeAttendance,
};
