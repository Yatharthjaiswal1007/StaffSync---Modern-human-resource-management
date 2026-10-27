import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Bell,
  Clock,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Menu,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [todayStatus, setTodayStatus] = useState(null);
  const [clockLoading, setClockLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchTodayStatus = async () => {
    try {
      const res = await api.get('/attendance/today');
      if (res.data.success) {
        setTodayStatus(res.data);
      }
    } catch (err) {
      console.error('Error fetching today status', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTodayStatus();
    }
  }, [user]);

  const handleQuickClock = async () => {
    setClockLoading(true);
    try {
      if (!todayStatus?.isClockedIn) {
        const res = await api.post('/attendance/clock-in', {
          workMode: 'Office',
          location: 'Headquarters',
        });
        toast.success(res.data.message || 'Clocked in successfully!');
      } else if (!todayStatus?.isClockedOut) {
        const res = await api.post('/attendance/clock-out');
        toast.success(res.data.message || 'Clocked out successfully!');
      }
      await fetchTodayStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Attendance action failed');
    } finally {
      setClockLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'manager':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'HR Admin';
      case 'manager':
        return 'Manager';
      default:
        return 'Employee';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur transition-all sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
          title="Toggle Navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500">
          <Clock className="h-3.5 w-3.5 text-slate-400" />
          <span>
            {currentTime.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <span className="text-slate-300">•</span>
          <span className="font-mono text-slate-700 font-semibold">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Clock Button */}
        <button
          onClick={handleQuickClock}
          disabled={clockLoading || todayStatus?.isClockedOut}
          className={`hidden md:inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-all ${
            todayStatus?.isClockedOut
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
              : todayStatus?.isClockedIn
              ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 hover:border-amber-300'
              : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20'
          }`}
        >
          {todayStatus?.isClockedOut ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-slate-400" />
              <span>Shift Complete</span>
            </>
          ) : todayStatus?.isClockedIn ? (
            <>
              <Clock className="h-3.5 w-3.5 text-amber-600 animate-pulse" />
              <span>Clock Out</span>
            </>
          ) : (
            <>
              <Clock className="h-3.5 w-3.5" />
              <span>Clock In</span>
            </>
          )}
        </button>

        {/* Role Pill */}
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${getRoleBadge(
            user?.role
          )}`}
        >
          {getRoleLabel(user?.role)}
        </span>

        {/* Profile Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 rounded-lg p-1.5 hover:bg-slate-100 transition"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-8 w-8 rounded-full object-cover ring-2 ring-slate-100"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-white font-bold text-xs">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'SS'}
              </div>
            )}
            <div className="hidden text-left sm:block">
              <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.name}</p>
              <p className="text-[10px] text-slate-500 leading-tight">{user?.designation}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </button>

          {dropdownOpen && (
            <div
              className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg shadow-slate-200/50 z-50 animate-in fade-in slide-in-from-top-2"
              onMouseLeave={() => setDropdownOpen(false)}
            >
              <div className="border-b border-slate-100 px-4 py-2">
                <p className="text-xs font-semibold text-slate-800">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <p className="text-[10px] font-mono text-brand-600 font-semibold mt-0.5">
                  ID: {user?.employeeId}
                </p>
              </div>

              <Link
                to="/profile"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                <span>My Profile</span>
              </Link>

              <div className="my-1 border-t border-slate-100" />

              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
