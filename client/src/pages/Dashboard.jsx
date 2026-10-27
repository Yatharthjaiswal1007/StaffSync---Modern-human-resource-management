import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Users,
  CalendarCheck,
  CalendarDays,
  Clock,
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  Megaphone,
  Briefcase,
  ChevronRight,
  CheckCircle2,
  XCircle,
  FileText,
  UserCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import toast from 'react-hot-toast';

const COLORS = ['#026fc1', '#06b6d4', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

const Dashboard = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [todayStatus, setTodayStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [clockLoading, setClockLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [metricsRes, todayRes] = await Promise.all([
        api.get('/reports/dashboard'),
        api.get('/attendance/today'),
      ]);

      if (metricsRes.data.success) {
        setMetrics(metricsRes.data.data);
      }
      if (todayRes.data.success) {
        setTodayStatus(todayRes.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const handleClockIn = async () => {
    setClockLoading(true);
    try {
      const res = await api.post('/attendance/clock-in', {
        workMode: 'Office',
        location: 'StaffSync HQ',
      });
      toast.success(res.data.message || 'Clocked in successfully!');
      await fetchDashboardData();
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
      await fetchDashboardData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Clock out failed');
    } finally {
      setClockLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          <p className="text-xs font-semibold text-slate-500">Loading StaffSync Analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-brand-950 to-slate-900 p-6 text-white shadow-lg">
        <div className="relative z-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-full bg-brand-500/20 px-2.5 py-0.5 text-xs font-semibold text-brand-300 border border-brand-500/30">
                {user?.role === 'admin' ? 'HR Administrator Portal' : user?.role === 'manager' ? 'Management Overview' : 'Employee Workspace'}
              </span>
              <span className="text-xs text-slate-400">• {user?.department}</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Welcome back, {user?.name}!
            </h1>
            <p className="mt-1 text-xs text-slate-300">
              {user?.role === 'admin'
                ? 'Here is what is happening across the organization today.'
                : user?.role === 'manager'
                ? `Overseeing team operations in the ${user?.department} department.`
                : 'Here is your attendance summary and daily workplace updates.'}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {user?.role === 'admin' && (
              <Link
                to="/employees"
                className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur hover:bg-white/20 transition"
              >
                <Users className="h-4 w-4" />
                <span>Manage Staff</span>
              </Link>
            )}
            <Link
              to="/leaves"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-500 px-3.5 py-2 text-xs font-semibold text-white shadow-md shadow-brand-500/30 hover:bg-brand-600 transition"
            >
              <CalendarDays className="h-4 w-4" />
              <span>{user?.role === 'employee' ? 'Apply Leave' : 'Review Leaves'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Top Stat Cards Grid */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Headcount</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-brand-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{metrics?.totalEmployees || 0}</span>
              <span className="text-xs text-emerald-600 font-semibold flex items-center">
                <TrendingUp className="h-3 w-3 mr-0.5" /> Active: {metrics?.activeEmployees || 0}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Total registered staff members</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Present Today</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <UserCheck className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{metrics?.presentToday || 0}</span>
              <span className="text-xs text-amber-600 font-semibold">
                Late: {metrics?.lateToday || 0}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Clocked in employees today</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Pending Leave Requests</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{metrics?.pendingLeaves || 0}</span>
              <span className="text-xs text-slate-500 font-medium">Requires Action</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Awaiting management review</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">On Leave Today</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <CalendarCheck className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{metrics?.onLeaveEmployees || 0}</span>
              <span className="text-xs text-slate-500 font-medium">Approved Leaves</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Currently out of office</p>
          </div>
        </div>
      )}

      {user?.role === 'manager' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">{metrics?.department} Team Size</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{metrics?.teamHeadcount || 0}</span>
              <span className="text-xs text-emerald-600 font-semibold">Active: {metrics?.activeTeam || 0}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Direct team members</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Team Present Today</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <UserCheck className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{metrics?.teamPresentToday || 0}</span>
              <span className="text-xs text-amber-600 font-semibold">Late: {metrics?.teamLateToday || 0}</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Current shift attendance</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Pending Leave Approvals</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{metrics?.pendingTeamLeaves || 0}</span>
              <span className="text-xs text-amber-700 font-semibold">In your queue</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Applications from your department</p>
          </div>
        </div>
      )}

      {user?.role === 'employee' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Days Present</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <CalendarCheck className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{metrics?.presentDays || 0}</span>
              <span className="text-xs text-slate-500">/ {metrics?.totalDays || 0} days</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Recorded attendance cycle</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Work Hours</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-brand-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{metrics?.totalHours || 0} hrs</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Avg {metrics?.averageHours || 0} hrs/day</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Available Leaves</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <CalendarDays className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {(metrics?.leaveBalances?.casual || 0) + (metrics?.leaveBalances?.annual || 0)}
              </span>
              <span className="text-xs text-slate-500">days balance</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Casual: {metrics?.leaveBalances?.casual || 0} • Annual: {metrics?.leaveBalances?.annual || 0}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Skill Courses</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                <Briefcase className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{metrics?.enrolledTrainingsCount || 0}</span>
              <span className="text-xs text-brand-600 font-semibold">Enrolled</span>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">Professional training tracks</p>
          </div>
        </div>
      )}

      {/* Main Content Grid: Charts & Modules */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2 Cols): Analytics & Attendance Trends */}
        <div className="space-y-6 lg:col-span-2">
          {user?.role === 'admin' && metrics?.attendanceTrends && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Weekly Attendance Trends</h3>
                  <p className="text-xs text-slate-400">Present vs. Late arrivals over the last 7 days</p>
                </div>
                <Link to="/attendance" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                  View Detail <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.attendanceTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="present" fill="#026fc1" name="On Time" radius={[4, 4, 0, 0]} barSize={22} />
                    <Bar dataKey="late" fill="#f59e0b" name="Late Arrival" radius={[4, 4, 0, 0]} barSize={22} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Department Distribution (Admin) */}
          {user?.role === 'admin' && metrics?.departmentDistribution && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Headcount by Department</h3>
                  <p className="text-xs text-slate-400">Organization workforce breakdown</p>
                </div>
                <Link to="/employees" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                  Directory <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metrics.departmentDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {metrics.departmentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Recent Leave Requests List (Admin / Manager) */}
          {user?.role !== 'employee' && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">Recent Leave Applications</h3>
                <Link to="/leaves" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                  Review All <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="divide-y divide-slate-100">
                {metrics?.recentLeaves?.length > 0 ? (
                  metrics.recentLeaves.map((l) => (
                    <div key={l._id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        {l.user?.avatar ? (
                          <img src={l.user.avatar} className="h-9 w-9 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-700">
                            {l.user?.name ? l.user.name.slice(0, 2).toUpperCase() : 'U'}
                          </div>
                        )}
                        <div>
                          <p className="text-xs font-bold text-slate-800">{l.user?.name}</p>
                          <p className="text-[11px] text-slate-500">
                            {l.leaveType} Leave • {l.daysCount} {l.daysCount === 1 ? 'day' : 'days'}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          l.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : l.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {l.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-center text-xs text-slate-400">No recent leave requests</p>
                )}
              </div>
            </div>
          )}

          {/* Employee recent leaves */}
          {user?.role === 'employee' && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900">My Recent Leave Requests</h3>
                <Link to="/leaves" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                  View All <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="divide-y divide-slate-100">
                {metrics?.recentLeaves?.length > 0 ? (
                  metrics.recentLeaves.map((l) => (
                    <div key={l._id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-xs font-bold text-slate-800">{l.leaveType} Leave</p>
                        <p className="text-[11px] text-slate-500">
                          {new Date(l.startDate).toLocaleDateString()} - {new Date(l.endDate).toLocaleDateString()} ({l.daysCount} days)
                        </p>
                      </div>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          l.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : l.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {l.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="py-4 text-center text-xs text-slate-400">No leave requests filed yet</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (1 Col): Clock In Widget & Company Announcements */}
        <div className="space-y-6">
          {/* Shift & Time Clock Card */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Shift Clock & Attendance</h3>
            <p className="text-xs text-slate-400 mb-4">Manage your daily work session</p>

            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-center mb-4">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                Current Shift Status
              </span>
              <div className="mt-1 text-lg font-bold text-slate-900">
                {todayStatus?.isClockedOut ? (
                  <span className="text-slate-600 flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Shift Finished
                  </span>
                ) : todayStatus?.isClockedIn ? (
                  <span className="text-emerald-600 flex items-center justify-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" /> Working Now
                  </span>
                ) : (
                  <span className="text-slate-500">Not Clocked In Today</span>
                )}
              </div>

              {todayStatus?.data?.clockIn && (
                <div className="mt-2 text-xs text-slate-500 border-t border-slate-200/60 pt-2 flex justify-between">
                  <span>Clock In: <strong className="text-slate-700">{new Date(todayStatus.data.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                  {todayStatus.data.clockOut && (
                    <span>Clock Out: <strong className="text-slate-700">{new Date(todayStatus.data.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              {!todayStatus?.isClockedIn ? (
                <button
                  onClick={handleClockIn}
                  disabled={clockLoading || todayStatus?.isClockedOut}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-xs font-semibold text-white shadow-md shadow-emerald-500/20 hover:bg-emerald-700 transition disabled:opacity-50"
                >
                  <Clock className="h-4 w-4" />
                  <span>{clockLoading ? 'Registering...' : 'Clock In Now'}</span>
                </button>
              ) : !todayStatus?.isClockedOut ? (
                <button
                  onClick={handleClockOut}
                  disabled={clockLoading}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-amber-600 py-2.5 text-xs font-semibold text-white shadow-md shadow-amber-500/20 hover:bg-amber-700 transition disabled:opacity-50"
                >
                  <Clock className="h-4 w-4" />
                  <span>{clockLoading ? 'Recording...' : 'Clock Out Now'}</span>
                </button>
              ) : (
                <div className="text-center py-2 text-xs font-medium text-slate-500">
                  You have completed today's shift. Have a great evening!
                </div>
              )}

              <Link
                to="/attendance"
                className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                <span>View Attendance Logs</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Announcements Widget */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Megaphone className="h-4 w-4 text-brand-600" />
                <h3 className="text-sm font-bold text-slate-900">Company Notices</h3>
              </div>
              <Link to="/announcements" className="text-xs font-semibold text-brand-600 hover:text-brand-700">
                All Notices
              </Link>
            </div>

            <div className="space-y-3">
              {metrics?.recentAnnouncements?.length > 0 || metrics?.announcements?.length > 0 ? (
                (metrics?.recentAnnouncements || metrics?.announcements || []).slice(0, 3).map((a) => (
                  <div
                    key={a._id}
                    className="rounded-lg border border-slate-100 bg-slate-50/60 p-3 transition hover:border-slate-200 hover:bg-slate-50"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded-full">
                        {a.category}
                      </span>
                      {a.priority === 'High' && (
                        <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                          Urgent
                        </span>
                      )}
                    </div>
                    <h4 className="mt-2 text-xs font-bold text-slate-900 line-clamp-1">{a.title}</h4>
                    <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">{a.content}</p>
                  </div>
                ))
              ) : (
                <p className="py-4 text-center text-xs text-slate-400">No active announcements</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
