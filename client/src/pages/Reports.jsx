import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  BarChart3,
  Download,
  Calendar,
  Users,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
  PieChart as PieIcon,
  Filter,
} from 'lucide-react';
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
const DEPARTMENTS = ['All', 'Engineering', 'Human Resources', 'Marketing', 'Finance', 'Sales', 'Operations'];

const Reports = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Export filters
  const [exportStartDate, setExportStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 14);
    return d.toISOString().split('T')[0];
  });
  const [exportEndDate, setExportEndDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [exportDept, setExportDept] = useState('All');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const res = await api.get('/reports/dashboard');
        if (res.data.success) {
          setMetrics(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load reporting data');
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams({
        startDate: exportStartDate,
        endDate: exportEndDate,
      });
      if (exportDept !== 'All') params.append('department', exportDept);

      const res = await api.get(`/reports/attendance-export?${params.toString()}`);
      if (res.data.success && res.data.data.length > 0) {
        const headers = ['Date', 'Employee Name', 'Employee ID', 'Department', 'Designation', 'Clock In', 'Clock Out', 'Hours', 'Status', 'Work Mode'];
        const rows = res.data.data.map((r) => [
          r.date,
          r.user?.name || '',
          r.user?.employeeId || '',
          r.user?.department || '',
          r.user?.designation || '',
          r.clockIn ? new Date(r.clockIn).toLocaleTimeString() : 'N/A',
          r.clockOut ? new Date(r.clockOut).toLocaleTimeString() : 'N/A',
          r.workHours || 0,
          r.status,
          r.workMode,
        ]);

        const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((row) => row.map((v) => `"${v}"`).join(','))].join('\n');
        const encoded = encodeURI(csv);
        const link = document.createElement('a');
        link.setAttribute('href', encoded);
        link.setAttribute('download', `StaffSync_Report_${exportStartDate}_to_${exportEndDate}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`Exported ${res.data.data.length} records to CSV!`);
      } else {
        toast.error('No attendance records found for this date range');
      }
    } catch (err) {
      toast.error('Failed to generate export file');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Human Resources Analytics & Reporting
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
            Workforce KPIs, attendance distribution, and data export portal.
          </p>
        </div>
      </div>

      {/* CSV Export Panel */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <FileSpreadsheet className="h-4 w-4 text-brand-600" />
          <h3 className="text-sm font-bold text-slate-900">Custom Attendance & Shift Report Generator</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Select a date window and department to generate a formal corporate attendance audit.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 items-end">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Start Date</label>
            <input
              type="date"
              value={exportStartDate}
              onChange={(e) => setExportStartDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">End Date</label>
            <input
              type="date"
              value={exportEndDate}
              onChange={(e) => setExportEndDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Department</label>
            <select
              value={exportDept}
              onChange={(e) => setExportDept(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
            >
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 px-4 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              <span>{exporting ? 'Generating...' : 'Download CSV Report'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Attendance Trends */}
        {metrics?.attendanceTrends && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-1">7-Day Attendance Volume</h3>
            <p className="text-xs text-slate-400 mb-4">Daily shift turnout comparison</p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={metrics.attendanceTrends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="label" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }} />
                  <Bar dataKey="present" fill="#026fc1" name="On Time" radius={[4, 4, 0, 0]} barSize={22} />
                  <Bar dataKey="late" fill="#f59e0b" name="Late Arrivals" radius={[4, 4, 0, 0]} barSize={22} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Headcount Distribution */}
        {metrics?.departmentDistribution && (
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Headcount by Department</h3>
            <p className="text-xs text-slate-400 mb-4">Organizational resource distribution</p>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={metrics.departmentDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
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
      </div>

      {/* Corporate Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Active Employment Ratio</span>
          <p className="mt-2 text-2xl font-bold text-emerald-600">
            {metrics?.totalEmployees > 0 ? Math.round(((metrics?.activeEmployees || 0) / metrics.totalEmployees) * 100) : 100}%
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {metrics?.activeEmployees} active out of {metrics?.totalEmployees} total staff
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Today Attendance Rate</span>
          <p className="mt-2 text-2xl font-bold text-brand-600">
            {metrics?.totalEmployees > 0 ? Math.round(((metrics?.presentToday || 0) / metrics.totalEmployees) * 100) : 0}%
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {metrics?.presentToday} staff logged in today
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Pending Leave Workflows</span>
          <p className="mt-2 text-2xl font-bold text-amber-600">{metrics?.pendingLeaves || 0}</p>
          <p className="mt-1 text-xs text-slate-400">Applications currently awaiting manager sign-off</p>
        </div>
      </div>
    </div>
  );
};

export default Reports;
