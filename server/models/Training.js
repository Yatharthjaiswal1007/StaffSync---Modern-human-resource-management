const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  durationMinutes: { type: Number, default: 30 },
  resourceLink: { type: String, default: '' },
});

const enrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0,
  },
  status: {
    type: String,
    enum: ['Not Started', 'In Progress', 'Completed'],
    default: 'Not Started',
  },
  completedAt: {
    type: Date,
    default: null,
  },
  score: {
    type: Number,
    default: 0,
  },
});

const trainingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['Technical', 'Compliance & Safety', 'Leadership', 'Soft Skills', 'Onboarding'],
      default: 'Technical',
    },
    instructor: {
      type: String,
      default: 'Internal HR Team',
    },
    durationHours: {
      type: Number,
      default: 4,
    },
    deadline: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['Active', 'Upcoming', 'Archived'],
      default: 'Active',
    },
    modules: [moduleSchema],
    enrolledEmployees: [enrollmentSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Training', trainingSchema);
