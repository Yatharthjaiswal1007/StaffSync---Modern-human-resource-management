const User = require('../models/User');
const Attendance = require('../models/Attendance');
const Leave = require('../models/Leave');
const Announcement = require('../models/Announcement');
const Training = require('../models/Training');

const getTodayDateString = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Get dashboard metrics tailored to role
// @route   GET /api/reports/dashboard
// @access  Private
const getDashboardMetrics = async (req, res, next) => {
  try {
    const today = getTodayDateString();
    const role = req.user.role;

    if (role === 'admin') {
      // 1. Employee metrics
      const totalEmployees = await User.countDocuments();
      const activeEmployees = await User.countDocuments({ status: 'active' });
      const onLeaveEmployees = await User.countDocuments({ status: 'on-leave' });

      // 2. Today's attendance
      const todayAttendance = await Attendance.find({ date: today });
      const presentToday = todayAttendance.filter((a) => a.status === 'Present' || a.status === 'Late').length;
      const lateToday = todayAttendance.filter((a) => a.status === 'Late').length;
      const halfDayToday = todayAttendance.filter((a) => a.status === 'Half-day').length;

      // 3. Leaves
      const pendingLeaves = await Leave.countDocuments({ status: 'Pending' });

      // 4. Department distribution for Recharts PieChart
      const departmentDistribution = await User.aggregate([
        { $group: { _id: '$department', count: { $sum: 1 } } },
        { $project: { name: '$_id', value: '$count', _id: 0 } },
      ]);

      // 5. Weekly Attendance Trends (last 7 days) for Recharts BarChart
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dayStr = String(d.getDate()).padStart(2, '0');
        days.push(`${y}-${m}-${dayStr}`);
      }

      const attendanceTrends = await Promise.all(
        days.map(async (d) => {
          const records = await Attendance.find({ date: d });
          const present = records.filter((r) => r.status === 'Present' || r.status === 'Late').length;
          const late = records.filter((r) => r.status === 'Late').length;
          // Format day label: e.g. "Mon 24"
          const dateObj = new Date(d);
          const label = dateObj.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
          return { date: d, label, present, late };
        })
      );

      // 6. Recent announcements
      const recentAnnouncements = await Announcement.find()
        .populate('author', 'name designation')
        .sort({ isPinned: -1, createdAt: -1 })
        .limit(5);

      // 7. Recent activities
      const recentLeaves = await Leave.find()
        .populate('user', 'name designation avatar department')
        .sort({ createdAt: -1 })
        .limit(5);

      return res.json({
        success: true,
        data: {
          totalEmployees,
          activeEmployees,
          onLeaveEmployees,
          presentToday,
          lateToday,
          halfDayToday,
          pendingLeaves,
          departmentDistribution,
          attendanceTrends,
          recentAnnouncements,
          recentLeaves,
        },
      });
    }

    if (role === 'manager') {
      // Manager sees their department / team stats
      const dept = req.user.department;
      const teamEmployees = await User.find({ department: dept });
      const teamIds = teamEmployees.map((e) => e._id);

      const teamHeadcount = teamEmployees.length;
      const activeTeam = teamEmployees.filter((e) => e.status === 'active').length;

      const teamTodayAttendance = await Attendance.find({
        date: today,
        user: { $in: teamIds },
      });

      const teamPresentToday = teamTodayAttendance.filter((a) => a.status === 'Present' || a.status === 'Late').length;
      const teamLateToday = teamTodayAttendance.filter((a) => a.status === 'Late').length;

      const pendingTeamLeaves = await Leave.countDocuments({
        user: { $in: teamIds },
        status: 'Pending',
      });

      const recentAnnouncements = await Announcement.find({
        $or: [{ targetDepartment: 'All' }, { targetDepartment: dept }],
      })
        .populate('author', 'name designation')
        .sort({ isPinned: -1, createdAt: -1 })
        .limit(5);

      return res.json({
        success: true,
        data: {
          department: dept,
          teamHeadcount,
          activeTeam,
          teamPresentToday,
          teamLateToday,
          pendingTeamLeaves,
          recentAnnouncements,
        },
      });
    }

    // Role: employee
    const userAttendance = await Attendance.find({ user: req.user._id }).sort({ date: -1 });
    const userLeaves = await Leave.find({ user: req.user._id }).sort({ createdAt: -1 });
    const todayAttendance = await Attendance.findOne({ user: req.user._id, date: today });

    const totalDays = userAttendance.length;
    const presentDays = userAttendance.filter((a) => a.status === 'Present' || a.status === 'Late').length;
    const totalHours = userAttendance.reduce((acc, curr) => acc + (curr.workHours || 0), 0);

    const user = await User.findById(req.user._id);

    const announcements = await Announcement.find({
      $or: [{ targetDepartment: 'All' }, { targetDepartment: req.user.department }],
    })
      .populate('author', 'name designation')
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(5);

    const trainings = await Training.find({
      'enrolledEmployees.user': req.user._id,
    });

    return res.json({
      success: true,
      data: {
        totalDays,
        presentDays,
        totalHours: Math.round(totalHours * 10) / 10,
        averageHours: totalDays > 0 ? Math.round((totalHours / totalDays) * 10) / 10 : 0,
        leaveBalances: user ? user.leaveBalances : {},
        todayAttendance: todayAttendance || null,
        recentLeaves: userLeaves.slice(0, 5),
        announcements,
        enrolledTrainingsCount: trainings.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Export attendance summary report
// @route   GET /api/reports/attendance-export
// @access  Private (Admin, Manager)
const getAttendanceExport = async (req, res, next) => {
  try {
    const { startDate, endDate, department } = req.query;
    const query = {};

    if (startDate && endDate) {
      query.date = { $gte: startDate, $lte: endDate };
    }

    let userQuery = {};
    if (department && department !== 'All') {
      userQuery.department = department;
    }

    if (Object.keys(userQuery).length > 0) {
      const users = await User.find(userQuery).select('_id');
      query.user = { $in: users.map((u) => u._id) };
    }

    const records = await Attendance.find(query)
      .populate('user', 'name employeeId department designation')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardMetrics,
  getAttendanceExport,
};
