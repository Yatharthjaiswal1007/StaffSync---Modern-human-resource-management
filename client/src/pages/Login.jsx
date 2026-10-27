import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  UserCheck,
  CheckCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      navigate('/dashboard');
    }
  };

  const handleDemoLogin = async (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setLoading(true);
    const res = await login(demoEmail, demoPass);
    setLoading(false);
    if (res.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Left panel: Form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:flex-none lg:w-[540px] xl:w-[600px] sm:px-12">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-lg shadow-brand-500/25">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Staff<span className="text-brand-600">Sync</span>
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Modern HR Operations
              </span>
            </div>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Sign in to your workplace
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Enter your credentials or choose a pre-configured demo account below.
          </p>

          {/* Quick Demo Access Cards */}
          <div className="mt-6 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              One-Click Role Demo Access
            </p>

            <button
              type="button"
              onClick={() => handleDemoLogin('admin@staffsync.com', 'password123')}
              className="group flex w-full items-center justify-between rounded-xl border border-purple-200 bg-purple-50/60 p-3 text-left transition hover:border-purple-300 hover:bg-purple-100/60"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white shadow-sm">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-purple-950">HR Administrator</p>
                  <p className="text-[11px] text-purple-700">Eleanor Vance • All Privileges</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-purple-400 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('manager@staffsync.com', 'password123')}
              className="group flex w-full items-center justify-between rounded-xl border border-blue-200 bg-blue-50/60 p-3 text-left transition hover:border-blue-300 hover:bg-blue-100/60"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-950">Team Manager</p>
                  <p className="text-[11px] text-blue-700">Marcus Brody • Engineering Dept</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-blue-400 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              type="button"
              onClick={() => handleDemoLogin('employee@staffsync.com', 'password123')}
              className="group flex w-full items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-left transition hover:border-emerald-300 hover:bg-emerald-100/60"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
                  <UserCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-950">Staff Employee</p>
                  <p className="text-[11px] text-emerald-700">Alex Rivera • Software Engineer</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-emerald-400 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-50 px-3 text-slate-400 uppercase font-medium text-[10px]">
                or sign in with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Corporate Email Address
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="block w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-10 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 py-2.5 px-4 text-xs font-semibold text-white shadow-md shadow-brand-500/25 transition hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In to StaffSync'}
            </button>
          </form>
        </div>
      </div>

      {/* Right panel: Brand showcase */}
      <div className="relative hidden w-0 flex-1 lg:block bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:24px_24px] opacity-20" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand-300">
            <span className="inline-block h-2 w-2 rounded-full bg-brand-400 animate-ping" />
            Next-Gen Workforce Management
          </div>

          <div className="max-w-xl space-y-6">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl leading-tight">
              Empower your teams with <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-sky-200">StaffSync</span>.
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              A comprehensive HRMS platform integrating employee directories, automated attendance tracking, instant leave management workflows, company notices, and skill progression.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-brand-300 font-semibold text-xs mb-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>Role-Based Access</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Tailored experiences for HR Admins, Department Managers, and Staff Members.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <div className="flex items-center gap-2 text-brand-300 font-semibold text-xs mb-1">
                  <CheckCircle className="h-4 w-4" />
                  <span>Real-Time Insights</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Interactive dashboards, attendance analytics, and leave reporting built-in.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-white/10 pt-6">
            <span>© 2026 StaffSync Systems Inc.</span>
            <span>MERN Stack Production Architecture</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
