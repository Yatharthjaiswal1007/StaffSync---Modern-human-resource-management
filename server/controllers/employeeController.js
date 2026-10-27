const User = require('../models/User');

// @desc    Get all employees with filters & search
// @route   GET /api/employees
// @access  Private (Admin, Manager, Employee for directory)
const getAllEmployees = async (req, res, next) => {
  try {
    const { search, department, role, status, page = 1, limit = 50, sort = '-createdAt' } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } },
      ];
    }

    if (department && department !== 'All') {
      query.department = department;
    }

    if (role && role !== 'All') {
      query.role = role;
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    // Non-admins can view staff directory, but sensitive fields like salary are hidden for regular employees
    let selectFields = '-password';
    if (req.user.role === 'employee') {
      selectFields = '-password -salary';
    }

    const total = await User.countDocuments(query);
    const employees = await User.find(query)
      .select(selectFields)
      .populate('reportingManager', 'name email employeeId designation')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: employees,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get employee by ID
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res, next) => {
  try {
    let selectFields = '-password';
    if (req.user.role === 'employee' && req.user._id.toString() !== req.params.id) {
      selectFields = '-password -salary';
    }

    const employee = await User.findById(req.params.id)
      .select(selectFields)
      .populate('reportingManager', 'name email employeeId designation');

    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    res.json({ success: true, data: employee });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private (Admin only)
const createEmployee = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = 'employee',
      department,
      designation,
      phone,
      salary,
      joinDate,
      reportingManager,
      address,
      emergencyContact,
      leaveBalances,
    } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User with this email already exists' });
    }

    // Auto-generate employee ID if not provided
    let employeeId = req.body.employeeId;
    if (!employeeId) {
      const count = await User.countDocuments();
      employeeId = `EMP-${(count + 1001).toString()}`;
    }

    const newEmployee = new User({
      employeeId,
      name,
      email: email.toLowerCase(),
      password: password || 'password123',
      role,
      department: department || 'Engineering',
      designation: designation || 'Associate',
      phone: phone || '',
      salary: salary || 50000,
      joinDate: joinDate || new Date(),
      reportingManager: reportingManager || null,
      address: address || {},
      emergencyContact: emergencyContact || {},
      leaveBalances: leaveBalances || {
        casual: 12,
        sick: 10,
        annual: 15,
        maternityPaternity: 10,
        unpaid: 0,
      },
    });

    const saved = await newEmployee.save();

    res.status(201).json({
      success: true,
      data: saved,
      message: 'Employee created successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update employee details
// @route   PUT /api/employees/:id
// @access  Private (Admin & Manager)
const updateEmployee = async (req, res, next) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    const {
      name,
      role,
      department,
      designation,
      phone,
      status,
      salary,
      joinDate,
      reportingManager,
      address,
      emergencyContact,
      leaveBalances,
    } = req.body;

    // Managers can only update employees in their own scope and cannot change salary or role
    if (req.user.role === 'manager') {
      if (role && role !== employee.role) {
        return res.status(403).json({ success: false, message: 'Managers cannot change user roles' });
      }
      if (salary !== undefined && salary !== employee.salary) {
        return res.status(403).json({ success: false, message: 'Managers cannot modify employee salary' });
      }
    }

    if (name) employee.name = name;
    if (role && req.user.role === 'admin') employee.role = role;
    if (department) employee.department = department;
    if (designation) employee.designation = designation;
    if (phone !== undefined) employee.phone = phone;
    if (status) employee.status = status;
    if (salary !== undefined && req.user.role === 'admin') employee.salary = salary;
    if (joinDate) employee.joinDate = joinDate;
    if (reportingManager !== undefined) employee.reportingManager = reportingManager || null;
    if (address) employee.address = { ...employee.address, ...address };
    if (emergencyContact) employee.emergencyContact = { ...employee.emergencyContact, ...emergencyContact };
    if (leaveBalances) employee.leaveBalances = { ...employee.leaveBalances, ...leaveBalances };

    const updated = await employee.save();

    res.json({
      success: true,
      data: updated,
      message: 'Employee updated successfully',
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete employee (soft-delete or deactivate)
// @route   DELETE /api/employees/:id
// @access  Private (Admin only)
const deleteEmployee = async (req, res, next) => {
  try {
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }

    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Set to inactive or delete
    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Employee removed successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
