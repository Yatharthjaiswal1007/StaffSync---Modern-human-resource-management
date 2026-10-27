import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  CalendarCheck,
  Clock,
  MapPin,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Download,
  Filter,
  PlusCircle,
  Building,
  Laptop,
  Home,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import toast from 'react-hot-toast';

const DEPARTMENTS = ['All', 'Engineering', 'Human Resources', 'Marketing', 'Finance', 'Sales', 'Operations'];
const STATUSES = ['All', 'Present', 'Late', 'Half-day', 'Absent'];

const Attendance = () => {
  const { user } = useAuth();
  const isAdminOrManager = user?.role === 'admin' || user?.role === 'manager';

  const [activeTab, setActiveTab] = useState('my'); // 'my' or 'all'
  const [todayStatus, setTodayStatus] = useState(null);
  const [myRecords, setMyRecords] = useState([]);
  const [myStats, setMyStats] = useState({});
  const [allRecords, setAllRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);

  // Clock in form
  const [workMode, setWorkMode] = useState('Office');
  const [locationNote, setLocationNote] = useState('StaffSync HQ');
  const [clockNote, setClockNote] = useState('');

  // Filters for Org attendance
  const [filterDate, setFilterDate] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });
  const [filterDept, setFilterDept] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');

  // Regularize modal (Admin)
  const [showRegularizeModal, setShowRegularizeModal] = useState(false);
  const [staffList, setStaffList] = useState([]);
  const [regForm, setRegForm] = useState({
    userId: '',
    date: filterDate,
    clockIn: '09:00',
    clockOut: '17:30',
    status: 'Present',
    workMode: 'Office',
    notes: 'Regularized by HR',
  });
  const [regSubmitting, setRegSubmitting] = useState(false);

  const fetchTodayStatus = async () => {
    try {
      const res = await api.get('/attendance/today');
      if (res.data.success) {
        setTodayStatus(res.data);
      }
    } catch (err) {
      console.error('Failed to get today status', err);
    }
  };

  const fetchMyAttendance = async () => {
    try {
      setLoading(true);
      const res = await api.get('/attendance/my');
      if (res.data.success) {
        setMyRecords(res.data.data);
        setMyStats(res.data.stats || {});
      }
    } catch (err) {
      toast.error('Failed to load your attendance');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAttendance = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterDate) params.append('date', filterDate);
      if (filterDept !== 'All') params.append('department', filterDept);
      if (filterStatus !== 'All') params.append('status', filterStatus);

      const res = await api.get(`/attendance/all?${params.toString()}`);
      if (res.data.success) {
        setAllRecords(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load team attendance');
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffList = async () => {
    try {
      const res = await api.get('/employees');
      if (res.data.success) {
        setStaffList(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load staff list');
    }
  };

  useEffect(() => {
    fetchTodayStatus();
    if (activeTab === 'my') {
      fetchMyAttendance();
    } else {
      fetchAllAttendance();
    }
    if (user?.role === 'admin') {
      fetchStaffList();
    }
  }, [activeTab, filterDate, filterDept, filterStatus]);

  const handleClockIn = async () => {
    setClockLoading(true);
    try {
      const res = await api.post('/attendance/clock-in', {
        workMode,
        location: locationNote,
        notes: clockNote,
      });
      toast.success(res.data.message || 'Clocked in successfully!');
      await fetchTodayStatus();
      if (activeTab === 'my') fetchMyAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Clock in failed');
    } finally {
      setClockLoading(false);
    }
  };

  const handleClockOut = async () => {
    setClockLoading(true);
    try {
      const res = await api.post('/attendance/clock-out');
      toast.success(res.data.message || 'Clocked out successfully!');
      await fetchTodayStatus();
      if (activeTab === 'my') fetchMyAttendance();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Clock out failed');
    } finally {
      setClockLoading(false);
    }
  };

  const handleRegularizeSubmit = async (e) => {
    e.preventDefault();
    if (!regForm.userId || !regForm.date) {
      return toast.error('Please select an employee and date');
    }
    setRegSubmitting(true);
    try {
      const formattedClockIn = `${regForm.date}T${regForm.clockIn}:00`;
      const formattedClockOut = `${regForm.date}T${regForm.clockOut}:00`;

      const res = await api.post('/attendance/regularize', {
        ...regForm,
        clockIn: formattedClockIn,
        clockOut: formattedClockOut,
      });

      if (res.data.success) {
        toast.success('Attendance regularized successfully!');
        setShowRegularizeModal(false);
        fetchAllAttendance();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to regularize attendance');
    } finally {
      setRegSubmitting(false);
    }
  };

  const exportCSV = () => {
    const recordsToExport = activeTab === 'my' ? myRecords : allRecords;
    if (recordsToExport.length === 0) return toast.error('No records available to export');

    const headers = ['Date', 'Employee', 'Employee ID', 'Department', 'Clock In', 'Clock Out', 'Hours', 'Status', 'Work Mode'];
    const rows = recordsToExport.map((r) => [
      r.date,
      r.user?.name || user?.name,
      r.user?.employeeId || user?.employeeId,
      r.user?.department || user?.department,
      r.clockIn ? new Date(r.clockIn).toLocaleTimeString() : 'N/A',
      r.clockOut ? new Date(r.clockOut).toLocaleTimeString() : 'N/A',
      r.workHours || 0,
      r.status,
      r.workMode,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StaffSync_Attendance_${filterDate || 'Report'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Attendance report exported to CSV!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Attendance & Work Hours
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Log your daily shift, track working hours, and review organizational presence.
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
                My Attendance
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                  activeTab === 'all'
                    ? 'bg-brand-50 text-brand-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Team / Org View
              </button>
            </div>
          )}

          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Clock In / Out Banner Card (Shown for My Attendance or all) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:items-center">
          {/* Status info */}
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Today's Session
            </span>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {todayStatus?.isClockedOut
                  ? 'Shift Completed'
                  : todayStatus?.isClockedIn
                  ? 'Clocked In'
                  : 'Ready to Clock In'}
              </span>
              <span
                className={`h-3 w-3 rounded-full ${
                  todayStatus?.isClockedOut
                    ? 'bg-slate-400'
                    : todayStatus?.isClockedIn
                    ? 'bg-emerald-500 animate-ping'
                    : 'bg-amber-400'
                }`}
              />
            </div>
            <p className="text-xs text-slate-500">
              {todayStatus?.data?.clockIn
                ? `Clocked in at ${new Date(todayStatus.data.clockIn).toLocaleTimeString()}${
                    todayStatus.data.clockOut
                      ? ` • Clocked out at ${new Date(todayStatus.data.clockOut).toLocaleTimeString()}`
                      : ''
                  }`
                : 'Log in your arrival time to begin tracking active work duration.'}
            </p>
          </div>

          {/* Work mode selector */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Work Mode & Location
            </span>
            <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1">
              <button
                type="button"
                disabled={todayStatus?.isClockedIn}
                onClick={() => {
                  setWorkMode('Office');
                  setLocationNote('StaffSync HQ');
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded transition ${
                  workMode === 'Office' ? 'bg-white shadow-sm text-brand-700' : 'text-slate-500'
                }`}
              >
                <Building className="h-3.5 w-3.5" />
                <span>Office</span>
              </button>
              <button
                type="button"
                disabled={todayStatus?.isClockedIn}
                onClick={() => {
                  setWorkMode('Remote');
                  setLocationNote('Remote Workplace');
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded transition ${
                  workMode === 'Remote' ? 'bg-white shadow-sm text-brand-700' : 'text-slate-500'
                }`}
              >
                <Home className="h-3.5 w-3.5" />
                <span>Remote</span>
              </button>
              <button
                type="button"
                disabled={todayStatus?.isClockedIn}
                onClick={() => {
                  setWorkMode('Hybrid');
                  setLocationNote('Hybrid Co-Working');
                }}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium rounded transition ${
                  workMode === 'Hybrid' ? 'bg-white shadow-sm text-brand-700' : 'text-slate-500'
                }`}
              >
                <Laptop className="h-3.5 w-3.5" />
                <span>Hybrid</span>
              </button>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-col items-center justify-center md:items-end">
            {!todayStatus?.isClockedIn ? (
              <button
                onClick={handleClockIn}
                disabled={clockLoading || todayStatus?.isClockedOut}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 hover:bg-emerald-700 transition disabled:opacity-50"
              >
                <Clock className="h-4 w-4" />
                <span>{clockLoading ? 'Registering...' : 'Punch In Now'}</span>
              </button>
            ) : !todayStatus?.isClockedOut ? (
              <button
                onClick={handleClockOut}
                disabled={clockLoading}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 hover:bg-amber-700 transition disabled:opacity-50"
              >
                <Clock className="h-4 w-4" />
                <span>{clockLoading ? 'Recording...' : 'Punch Out Now'}</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-5 py-2.5 text-xs font-semibold text-slate-500">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>Shift Completed ({todayStatus.data?.workHours || 0} hrs)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MY ATTENDANCE TAB */}
      {activeTab === 'my' && (
        <div className="space-y-6">
          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500">Total Work Days</span>
              <p className="mt-1 text-2xl font-bold text-slate-900">{myStats.totalDays || 0}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500">Present (On Time)</span>
              <p className="mt-1 text-2xl font-bold text-emerald-600">{myStats.presentCount || 0}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500">Late Arrivals</span>
              <p className="mt-1 text-2xl font-bold text-amber-600">{myStats.lateCount || 0}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <span className="text-[11px] font-semibold text-slate-500">Total Hours Worked</span>
              <p className="mt-1 text-2xl font-bold text-brand-600">{myStats.totalHours || 0} hrs</p>
            </div>
          </div>

          {/* Records Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-50 px-5 py-3.5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                My Attendance History
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3 px-5">Date</th>
                    <th className="py-3 px-5">Clock In</th>
                    <th className="py-3 px-5">Clock Out</th>
                    <th className="py-3 px-5">Duration</th>
                    <th className="py-3 px-5">Work Mode</th>
                    <th className="py-3 px-5">Location</th>
                    <th className="py-3 px-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myRecords.length > 0 ? (
                    myRecords.map((r) => (
                      <tr key={r._id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-5 font-semibold text-slate-800">{r.date}</td>
                        <td className="py-3 px-5 text-slate-600">
                          {r.clockIn ? new Date(r.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="py-3 px-5 text-slate-600">
                          {r.clockOut ? new Date(r.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="py-3 px-5 font-medium text-slate-700">{r.workHours ? `${r.workHours} hrs` : '—'}</td>
                        <td className="py-3 px-5 text-slate-600">{r.workMode}</td>
                        <td className="py-3 px-5 text-slate-500 text-[11px]">{r.location}</td>
                        <td className="py-3 px-5">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                              r.status === 'Present'
                                ? 'bg-emerald-50 text-emerald-700'
                                : r.status === 'Late'
                                ? 'bg-amber-50 text-amber-700'
                                : r.status === 'Half-day'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-xs text-slate-400">
                        No attendance records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ORG / TEAM ATTENDANCE TAB (Admin & Manager) */}
      {activeTab === 'all' && isAdminOrManager && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Date</label>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Department</label>
                <select
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
                >
                  {DEPARTMENTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-400 uppercase mb-1">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {user?.role === 'admin' && (
              <button
                onClick={() => setShowRegularizeModal(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700 transition"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Regularize Attendance</span>
              </button>
            )}
          </div>

          {/* Org Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Clock In</th>
                    <th className="py-3 px-4">Clock Out</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Work Mode</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allRecords.length > 0 ? (
                    allRecords.map((r) => (
                      <tr key={r._id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {r.user?.avatar ? (
                              <img src={r.user.avatar} className="h-8 w-8 rounded-full object-cover" />
                            ) : (
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white font-bold text-xs">
                                {r.user?.name ? r.user.name.slice(0, 2).toUpperCase() : 'U'}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-900">{r.user?.name}</p>
                              <p className="text-[10px] font-mono text-slate-400">{r.user?.employeeId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{r.user?.department}</td>
                        <td className="py-3 px-4 text-slate-600">
                          {r.clockIn ? new Date(r.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {r.clockOut ? new Date(r.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">{r.workHours ? `${r.workHours} hrs` : '—'}</td>
                        <td className="py-3 px-4 text-slate-600">{r.workMode}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                              r.status === 'Present'
                                ? 'bg-emerald-50 text-emerald-700'
                                : r.status === 'Late'
                                ? 'bg-amber-50 text-amber-700'
                                : r.status === 'Half-day'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-rose-50 text-rose-700'
                            }`}
                          >
                            {r.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-xs text-slate-400">
                        No records found for date {filterDate}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Regularize Modal (Admin) */}
      {showRegularizeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <button
              onClick={() => setShowRegularizeModal(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900">Regularize Attendance Record</h3>
            <p className="text-xs text-slate-500 mb-4">Manually record or correct shift times for an employee.</p>

            <form onSubmit={handleRegularizeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Employee</label>
                <select
                  required
                  value={regForm.userId}
                  onChange={(e) => setRegForm({ ...regForm, userId: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 focus:outline-none focus:border-brand-500"
                >
                  <option value="">-- Choose Employee --</option>
                  {staffList.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.employeeId} - {s.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={regForm.date}
                  onChange={(e) => setRegForm({ ...regForm, date: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Clock In Time</label>
                  <input
                    type="time"
                    value={regForm.clockIn}
                    onChange={(e) => setRegForm({ ...regForm, clockIn: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Clock Out Time</label>
                  <input
                    type="time"
                    value={regForm.clockOut}
                    onChange={(e) => setRegForm({ ...regForm, clockOut: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={regForm.status}
                    onChange={(e) => setRegForm({ ...regForm, status: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 focus:outline-none"
                  >
                    <option value="Present">Present</option>
                    <option value="Late">Late</option>
                    <option value="Half-day">Half-day</option>
                    <option value="Absent">Absent</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Work Mode</label>
                  <select
                    value={regForm.workMode}
                    onChange={(e) => setRegForm({ ...regForm, workMode: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 p-2 focus:outline-none"
                  >
                    <option value="Office">Office</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Reason</label>
                <input
                  type="text"
                  value={regForm.notes}
                  onChange={(e) => setRegForm({ ...regForm, notes: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 p-2 focus:outline-none"
                  placeholder="e.g. Card scanner malfunction, manual check"
                />
              </div>

              <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => setShowRegularizeModal(false)}
                  className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={regSubmitting}
                  className="rounded-lg bg-brand-600 px-4 py-1.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {regSubmitting ? 'Saving...' : 'Apply Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;
