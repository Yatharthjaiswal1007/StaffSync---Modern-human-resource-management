import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  GraduationCap,
  Clock,
  BookOpen,
  Award,
  CheckCircle,
  Plus,
  Trash2,
  Calendar,
  User,
  ArrowRight,
  Sparkles,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = ['All', 'Technical', 'Compliance & Safety', 'Leadership', 'Soft Skills', 'Onboarding'];

const Training = () => {
  const { user } = useAuth();
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

  const [trainings, setTrainings] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  // Update Progress modal
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressVal, setProgressVal] = useState(0);
  const [updating, setUpdating] = useState(false);

  // Create course modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    category: 'Technical',
    instructor: 'StaffSync HR Team',
    durationHours: 3,
    deadline: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchTrainings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory !== 'All') params.append('category', selectedCategory);

      const res = await api.get(`/training?${params.toString()}`);
      if (res.data.success) {
        setTrainings(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load training programs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, [selectedCategory]);

  const handleEnroll = async (courseId) => {
    try {
      const res = await api.post(`/training/${courseId}/enroll`);
      if (res.data.success) {
        toast.success('Successfully enrolled in training track!');
        fetchTrainings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed');
    }
  };

  const openProgressModal = (course) => {
    setSelectedCourse(course);
    setProgressVal(course.myEnrollment ? course.myEnrollment.progress : 0);
    setShowProgressModal(true);
  };

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse) return;
    setUpdating(true);
    try {
      const res = await api.put(`/training/${selectedCourse._id}/progress`, {
        progress: progressVal,
        score: progressVal === 100 ? 95 : 0,
      });
      if (res.data.success) {
        toast.success(
          progressVal === 100
            ? 'Congratulations! You completed this course!'
            : 'Progress updated!'
        );
        setShowProgressModal(false);
        fetchTrainings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update progress');
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!courseForm.title || !courseForm.description) {
      return toast.error('Title and description are required');
    }
    setSubmitting(true);
    try {
      const res = await api.post('/training', courseForm);
      if (res.data.success) {
        toast.success('Training program created!');
        setShowCreateModal(false);
        setCourseForm({
          title: '',
          description: '',
          category: 'Technical',
          instructor: 'StaffSync HR Team',
          durationHours: 3,
          deadline: '',
        });
        fetchTrainings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create training');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      const res = await api.delete(`/training/${id}`);
      if (res.data.success) {
        toast.success('Course removed');
        fetchTrainings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete course');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Training & Professional Development
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Upskill your capabilities, complete compliance certifications, and track team growth.
          </p>
        </div>

        {isAdminOrManager && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-brand-500/25 hover:bg-brand-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Create Training Track</span>
          </button>
        )}
      </div>

      {/* Categories */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Trainings Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
        </div>
      ) : trainings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-slate-300" />
          <h3 className="mt-3 text-sm font-semibold text-slate-900">No courses available</h3>
          <p className="mt-1 text-xs text-slate-500">New curriculum will be posted shortly.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {trainings.map((t) => {
            const isEnrolled = Boolean(t.myEnrollment);
            const isCompleted = t.myEnrollment?.status === 'Completed';
            const progress = t.myEnrollment ? t.myEnrollment.progress : 0;

            return (
              <div
                key={t._id}
                className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="rounded-full bg-brand-50 border border-brand-200 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-brand-700">
                      {t.category}
                    </span>

                    <div className="flex items-center gap-1">
                      {isCompleted && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 px-2 py-0.5 text-[10px] font-bold">
                          <CheckCircle className="h-3 w-3" /> Certified
                        </span>
                      )}
                      {user?.role === 'admin' && (
                        <button
                          onClick={() => handleDeleteCourse(t._id)}
                          className="rounded p-1 text-slate-400 hover:text-rose-600"
                          title="Delete Course"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <h3 className="mt-3 text-sm font-bold text-slate-900 leading-snug">{t.title}</h3>
                  <p className="mt-1.5 text-xs text-slate-500 line-clamp-3 leading-relaxed">
                    {t.description}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-[11px] text-slate-500 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <span className="truncate">{t.instructor}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>{t.durationHours} hours estimated</span>
                    </div>
                  </div>

                  {/* Modules preview */}
                  {t.modules?.length > 0 && (
                    <div className="mt-3 rounded-lg bg-slate-50 p-2 text-[11px] text-slate-600">
                      <span className="font-semibold text-slate-700">Course Syllabus:</span> {t.modules.length} lessons
                    </div>
                  )}
                </div>

                {/* Progress & Actions */}
                <div className="mt-5 border-t border-slate-100 pt-3">
                  {isEnrolled ? (
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className="text-slate-600">My Progress</span>
                        <span className="text-brand-600">{progress}%</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCompleted ? 'bg-emerald-500' : 'bg-brand-600'
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <button
                        onClick={() => openProgressModal(t)}
                        className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                      >
                        <span>Update Course Progress</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEnroll(t._id)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Enroll in Course</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Update Progress Modal */}
      {showProgressModal && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <button
              onClick={() => setShowProgressModal(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900">Track Course Progression</h3>
            <p className="text-xs text-slate-500 mb-4">{selectedCourse.title}</p>

            <form onSubmit={handleProgressSubmit} className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>Completion Status:</span>
                  <span className="text-brand-600 font-bold">{progressVal}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={progressVal}
                  onChange={(e) => setProgressVal(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setProgressVal(50)}
                  className="flex-1 rounded-lg border border-slate-200 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  50% Halfway
                </button>
                <button
                  type="button"
                  onClick={() => setProgressVal(100)}
                  className="flex-1 rounded-lg bg-emerald-50 border border-emerald-200 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                >
                  100% Complete!
                </button>
              </div>

              {progressVal === 100 && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-center text-xs text-emerald-800">
                  <Award className="h-6 w-6 text-emerald-600 mx-auto mb-1" />
                  <p className="font-bold">Course Ready for Certification!</p>
                  <p className="text-[11px] text-emerald-600">Completing will issue a certificate badge on your profile.</p>
                </div>
              )}

              <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setShowProgressModal(false)}
                  className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="rounded-lg bg-brand-600 px-4 py-1.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {updating ? 'Saving...' : 'Save Progress'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900">Add New Training Course</h3>
            <p className="text-xs text-slate-500 mb-4">Introduce a new learning curriculum for staff members.</p>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Title</label>
                <input
                  type="text"
                  required
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  placeholder="e.g. Advanced Cloud Security Architecture"
                  className="w-full rounded-lg border border-slate-300 p-2 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={courseForm.category}
                    onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 focus:outline-none"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    value={courseForm.durationHours}
                    onChange={(e) => setCourseForm({ ...courseForm, durationHours: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 p-2 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Instructor / Provider</label>
                <input
                  type="text"
                  value={courseForm.instructor}
                  onChange={(e) => setCourseForm({ ...courseForm, instructor: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Course Curriculum Description</label>
                <textarea
                  rows="3"
                  required
                  value={courseForm.description}
                  onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                  placeholder="Summarize course goals and outcomes..."
                  className="w-full rounded-lg border border-slate-300 p-2 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Course'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Training;
