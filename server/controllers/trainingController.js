const Training = require('../models/Training');

// @desc    Get all trainings
// @route   GET /api/training
// @access  Private
const getAllTrainings = async (req, res, next) => {
  try {
    const { category, status } = req.query;

    const query = {};
    if (category && category !== 'All') {
      query.category = category;
    }
    if (status && status !== 'All') {
      query.status = status;
    }

    const trainings = await Training.find(query)
      .populate('enrolledEmployees.user', 'name email employeeId department avatar')
      .sort({ createdAt: -1 });

    // Format response to include user's specific progress
    const formatted = trainings.map((t) => {
      const obj = t.toObject();
      const userEnrollment = obj.enrolledEmployees.find(
        (e) => e.user && e.user._id.toString() === req.user._id.toString()
      );

      return {
        ...obj,
        myEnrollment: userEnrollment || null,
        totalEnrolled: obj.enrolledEmployees.length,
        completedCount: obj.enrolledEmployees.filter((e) => e.status === 'Completed').length,
      };
    });

    res.json({
      success: true,
      data: formatted,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get training by ID
// @route   GET /api/training/:id
// @access  Private
const getTrainingById = async (req, res, next) => {
  try {
    const training = await Training.findById(req.params.id).populate(
      'enrolledEmployees.user',
      'name email employeeId department designation avatar'
    );

    if (!training) {
      return res.status(404).json({ success: false, message: 'Training course not found' });
    }

    const obj = training.toObject();
    const userEnrollment = obj.enrolledEmployees.find(
      (e) => e.user && e.user._id.toString() === req.user._id.toString()
    );

    res.json({
      success: true,
      data: {
        ...obj,
        myEnrollment: userEnrollment || null,
      },
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create new training course
// @route   POST /api/training
// @access  Private (Admin, Manager)
const createTraining = async (req, res, next) => {
  try {
    const { title, description, category, instructor, durationHours, deadline, modules } = req.body;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: 'Title and description are required' });
    }

    const training = new Training({
      title,
      description,
      category: category || 'Technical',
      instructor: instructor || 'StaffSync HR Team',
      durationHours: durationHours || 3,
      deadline: deadline ? new Date(deadline) : null,
      modules: modules || [],
      enrolledEmployees: [],
    });

    await training.save();

    res.status(201).json({
      success: true,
      message: 'Training module created successfully',
      data: training,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Enroll current user in training
// @route   POST /api/training/:id/enroll
// @access  Private
const enrollCourse = async (req, res, next) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ success: false, message: 'Training course not found' });
    }

    const isEnrolled = training.enrolledEmployees.some(
      (e) => e.user.toString() === req.user._id.toString()
    );

    if (isEnrolled) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }

    training.enrolledEmployees.push({
      user: req.user._id,
      progress: 0,
      status: 'Not Started',
    });

    await training.save();

    res.json({
      success: true,
      message: 'Successfully enrolled in course',
      data: training,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update employee progress in training
// @route   PUT /api/training/:id/progress
// @access  Private
const updateProgress = async (req, res, next) => {
  try {
    const { progress, score } = req.body;
    const training = await Training.findById(req.params.id);

    if (!training) {
      return res.status(404).json({ success: false, message: 'Training course not found' });
    }

    let enrollment = training.enrolledEmployees.find(
      (e) => e.user.toString() === req.user._id.toString()
    );

    if (!enrollment) {
      // Auto enroll if not already
      enrollment = {
        user: req.user._id,
        progress: 0,
        status: 'In Progress',
      };
      training.enrolledEmployees.push(enrollment);
    }

    const numProgress = Math.min(100, Math.max(0, Number(progress)));
    enrollment.progress = numProgress;

    if (numProgress >= 100) {
      enrollment.status = 'Completed';
      enrollment.completedAt = new Date();
      if (score !== undefined) enrollment.score = score;
    } else if (numProgress > 0) {
      enrollment.status = 'In Progress';
    }

    await training.save();

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: training,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete training course
// @route   DELETE /api/training/:id
// @access  Private (Admin)
const deleteTraining = async (req, res, next) => {
  try {
    const training = await Training.findById(req.params.id);
    if (!training) {
      return res.status(404).json({ success: false, message: 'Training course not found' });
    }

    await Training.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Training course removed successfully',
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllTrainings,
  getTrainingById,
  createTraining,
  enrollCourse,
  updateProgress,
  deleteTraining,
};
