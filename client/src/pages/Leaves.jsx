import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  CalendarDays,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  AlertCircle,
  Check,
  X,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';

const LEAVE_TYPES = ['Casual', 'Sick', 'Annual', 'Maternity/Paternity', 'Unpaid'];

const Leaves = () => {
  const { user } = useAuth();
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

  const [activeTab, setActiveTab] = useState('my'); // 'my' or 'approval'
  const [myLeaves, setMyLeaves] = useState([]);
  const [balances, setBalances] = useState({});
  const [allLeaves, setAllLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  // Apply modal
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({
    leaveType: 'Casual',
    startDate: '',
    endDate: '',
    isHalfDay: false,
    reason: '',
  });
  const [calculatedDays, setCalculatedDays] = useState(1);
  const [applying, setApplying] = useState(false);

  // Review modal
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState('Approved'); // 'Approved' or 'Rejected'
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewing, setReviewing] = useState(false);

  // Filter for approvals
  const [filterStatus, setFilterStatus] = useState('Pending');

  const fetchMyLeaves = async () => {
    try {
      setLoading(true);
      const res = await api.get('/leaves/my');
      if (res.data.success) {
        setMyLeaves(res.data.data);
        setBalances(res.data.balances || {});
      }
    } catch (err) {
      toast.error('Failed to load your leaves');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllLeaves = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== 'All') params.append('status', filterStatus);

      const res = await api.get(`/leaves/all?${params.toString()}`);
      if (res.data.success) {
        setAllLeaves(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load leave requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'my') {
      fetchMyLeaves();
    } else {
      fetchAllLeaves();
    }
  }, [activeTab, filterStatus]);

  // Re-calculate days when dates change
  useEffect(() => {
    if (applyForm.isHalfDay) {
      setCalculatedDays(0.5);
      return;
    }
    if (applyForm.startDate && applyForm.endDate) {
      const s = new Date(applyForm.startDate);
      const e = new Date(applyForm.endDate);
      if (e >= s) {
        const diff = Math.ceil(Math.abs(e - s) / (1000 * 60 * 60 * 24)) + 1;
        setCalculatedDays(diff);
      } else {
        setCalculatedDays(0);
      }
    }
  }, [applyForm.startDate, applyForm.endDate, applyForm.isHalfDay]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!applyForm.startDate || !applyForm.endDate || !applyForm.reason) {
      return toast.error('Please fill in all required fields');
    }
    if (calculatedDays <= 0) {
      return toast.error('End date cannot precede start date');
    }

    setApplying(true);
    try {
      const res = await api.post('/leaves/apply', applyForm);
      if (res.data.success) {
        toast.success('Leave application submitted!');
        setShowApplyModal(false);
        setApplyForm({
          leaveType: 'Casual',
          startDate: '',
          endDate: '',
          isHalfDay: false,
          reason: '',
        });
        fetchMyLeaves();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply for leave');
    } finally {
      setApplying(false);
    }
  };

  const handleCancelLeave = async (id) => {
    if (!window.confirm('Cancel this pending leave application?')) return;
    try {
      const res = await api.put(`/leaves/${id}/cancel`);
      if (res.data.success) {
        toast.success('Leave cancelled');
        fetchMyLeaves();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel leave');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLeave) return;
    setReviewing(true);
    try {
      const res = await api.put(`/leaves/${selectedLeave._id}/review`, {
        status: reviewAction,
        reviewNotes,
      });
      if (res.data.success) {
        toast.success(`Leave application marked as ${reviewAction}!`);
        setShowReviewModal(false);
        setSelectedLeave(null);
        setReviewNotes('');
        fetchAllLeaves();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to review leave');
    } finally {
      setReviewing(false);
    }
  };

  const openReview = (leave, action) => {
    setSelectedLeave(leave);
    setReviewAction(action);
    setReviewNotes(action === 'Approved' ? 'Approved by supervisor.' : 'Leave request declined.');
    setShowReviewModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Leave & Time-Off Management
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Request time-off, monitor allowances, and manage team absence requests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdminOrManager && (
            <div className="flex rounded-lg border border-slate-200 bg-white p-1">
              <button
                onClick={() => setActiveTab('my')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === 'my'
                    ? 'bg-brand-50 text-brand-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                My Leaves
              </button>
              <button
                onClick={() => setActiveTab('approval')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === 'approval'
                    ? 'bg-brand-50 text-brand-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Review Approvals
              </button>
            </div>
          )}

          <button
            onClick={() => setShowApplyModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-brand-500/25 hover:bg-brand-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Apply For Leave</span>
          </button>
        </div>
      </div>

      {/* Leave Balances Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Casual Leave
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-600">{balances.casual ?? 12}</span>
            <span className="text-xs text-slate-400">days available</span>
          </div>
          <p className="mt-1 text-[10px] text-slate-400">For personal errands & urgent needs</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Sick Leave
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">{balances.sick ?? 10}</span>
            <span className="text-xs text-slate-400">days available</span>
          </div>
          <p className="mt-1 text-[10px] text-slate-400">Medical recovery & doctor checkups</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Annual Leave
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-600">{balances.annual ?? 15}</span>
            <span className="text-xs text-slate-400">days available</span>
          </div>
          <p className="mt-1 text-[10px] text-slate-400">Paid vacation & planned holidays</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Parental Leave
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">{balances.maternityPaternity ?? 10}</span>
            <span className="text-xs text-slate-400">days available</span>
          </div>
          <p className="mt-1 text-[10px] text-slate-400">Maternity / Paternity allowance</p>
        </div>
      </div>

      {/* MY LEAVES TAB */}
      {activeTab === 'my' && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-5 py-3.5">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              My Submitted Leave Applications
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="py-3 px-5">Type</th>
                  <th className="py-3 px-5">Duration</th>
                  <th className="py-3 px-5">Days</th>
                  <th className="py-3 px-5">Reason</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Review Note</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myLeaves.length > 0 ? (
                  myLeaves.map((l) => (
                    <tr key={l._id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3 px-5 font-bold text-slate-800">{l.leaveType}</td>
                      <td className="py-3 px-5 text-slate-600">
                        {new Date(l.startDate).toLocaleDateString()} — {new Date(l.endDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-5 font-semibold text-slate-700">{l.daysCount} {l.daysCount === 1 ? 'day' : 'days'}</td>
                      <td className="py-3 px-5 text-slate-600 max-w-xs truncate">{l.reason}</td>
                      <td className="py-3 px-5">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                            l.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : l.status === 'Rejected'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : l.status === 'Cancelled'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {l.status}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-slate-500 text-[11px] italic">
                        {l.reviewNotes || '—'}
                      </td>
                      <td className="py-3 px-5 text-right">
                        {l.status === 'Pending' && (
                          <button
                            onClick={() => handleCancelLeave(l._id)}
                            className="rounded px-2 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-50"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-xs text-slate-400">
                      No leave applications recorded yet. Click "Apply For Leave" to submit.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REVIEW APPROVALS TAB (Admin & Manager) */}
      {activeTab === 'approval' && isAdminOrManager && (
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600">Filter By Status:</span>
              <div className="flex gap-1">
                {['Pending', 'Approved', 'Rejected', 'All'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                      filterStatus === st
                        ? 'bg-brand-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
            <span className="text-xs text-slate-400">
              {allLeaves.length} {allLeaves.length === 1 ? 'application' : 'applications'}
            </span>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Applicant</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Date Range</th>
                    <th className="py-3 px-4">Days</th>
                    <th className="py-3 px-4">Reason</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Decision</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allLeaves.length > 0 ? (
                    allLeaves.map((l) => (
                      <tr key={l._id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            {l.user?.avatar ? (
                              <img src={l.user.avatar} className="h-7 w-7 rounded-full object-cover" />
                            ) : (
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-white text-[10px] font-bold">
                                {l.user?.name ? l.user.name.slice(0, 2).toUpperCase() : 'U'}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-900">{l.user?.name}</p>
                              <p className="text-[10px] text-slate-400">{l.user?.employeeId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{l.user?.department}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">{l.leaveType}</td>
                        <td className="py-3 px-4 text-slate-600">
                          {new Date(l.startDate).toLocaleDateString()} — {new Date(l.endDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700">{l.daysCount}</td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{l.reason}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                              l.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-700'
                                : l.status === 'Rejected'
                                ? 'bg-rose-50 text-rose-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {l.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {l.status === 'Pending' ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openReview(l, 'Approved')}
                                className="inline-flex items-center gap-1 rounded bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 transition"
                              >
                                <Check className="h-3 w-3" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => openReview(l, 'Rejected')}
                                className="inline-flex items-center gap-1 rounded bg-rose-50 px-2.5 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-100 transition"
                              >
                                <X className="h-3 w-3" />
                                <span>Reject</span>
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400 font-medium">Decided</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="py-8 text-center text-xs text-slate-400">
                        No leave applications matching status "{filterStatus}".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in">
            <button
              onClick={() => setShowApplyModal(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900">Apply For Time-Off</h3>
            <p className="text-xs text-slate-500 mb-4">Submit a formal request to your reporting manager.</p>

            <form onSubmit={handleApplySubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Leave Category</label>
                <select
                  value={applyForm.leaveType}
                  onChange={(e) => setApplyForm({ ...applyForm, leaveType: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 focus:outline-none focus:border-brand-500"
                >
                  {LEAVE_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t} Leave
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={applyForm.startDate}
                    onChange={(e) => setApplyForm({ ...applyForm, startDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={applyForm.endDate}
                    onChange={(e) => setApplyForm({ ...applyForm, endDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-50 border border-slate-200 p-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyForm.isHalfDay}
                    onChange={(e) => setApplyForm({ ...applyForm, isHalfDay: e.target.checked })}
                    className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  />
                  <span className="font-semibold text-slate-700">Half-day Request</span>
                </label>
                <span className="font-bold text-brand-600">
                  Total Duration: {calculatedDays} {calculatedDays === 1 ? 'day' : 'days'}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Leave</label>
                <textarea
                  rows="3"
                  required
                  value={applyForm.reason}
                  onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                  placeholder="Provide brief context for your supervisor..."
                  className="w-full rounded-lg border border-slate-300 p-2 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="rounded-lg border border-slate-200 px-4 py-2 font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {applying ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal (Admin & Manager) */}
      {showReviewModal && selectedLeave && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <button
              onClick={() => setShowReviewModal(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900">
              {reviewAction === 'Approved' ? 'Approve' : 'Reject'} Leave Request
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Decision for {selectedLeave.user?.name} ({selectedLeave.leaveType} Leave - {selectedLeave.daysCount} days)
            </p>

            <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600 mb-4">
              <span className="font-semibold text-slate-700">Applicant's Reason:</span>
              <p className="mt-1 italic">"{selectedLeave.reason}"</p>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supervisor Notes / Remarks</label>
                <textarea
                  rows="3"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewing}
                  className={`rounded-lg px-4 py-1.5 font-semibold text-white disabled:opacity-50 ${
                    reviewAction === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {reviewing ? 'Processing...' : `Confirm ${reviewAction}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaves;
