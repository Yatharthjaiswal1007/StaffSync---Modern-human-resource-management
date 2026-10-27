import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  User,
  Mail,
  Phone,
  Building,
  Briefcase,
  MapPin,
  Shield,
  Key,
  CheckCircle,
  Save,
  Lock,
  HeartHandshake,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);

  // Form states
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'USA',
  });
  const [emergencyContact, setEmergencyContact] = useState({
    name: '',
    relationship: '',
    phone: '',
  });

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passSubmitting, setPassSubmitting] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/me');
      if (res.data.success) {
        const u = res.data.data;
        setProfileData(u);
        setPhone(u.phone || '');
        setAvatar(u.avatar || '');
        if (u.address) {
          setAddress({
            street: u.address.street || '',
            city: u.address.city || '',
            state: u.address.state || '',
            zip: u.address.zip || '',
            country: u.address.country || 'USA',
          });
        }
        if (u.emergencyContact) {
          setEmergencyContact({
            name: u.emergencyContact.name || '',
            relationship: u.emergencyContact.relationship || '',
            phone: u.emergencyContact.phone || '',
          });
        }
      }
    } catch (err) {
      toast.error('Failed to load profile details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put('/auth/profile', {
        phone,
        avatar,
        address,
        emergencyContact,
      });
      if (res.data.success) {
        toast.success('Profile details updated!');
        updateUser(res.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return toast.error('New passwords do not match');
    }
    if (newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters');
    }

    setPassSubmitting(true);
    try {
      const res = await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      if (res.data.success) {
        toast.success('Password changed successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed');
    } finally {
      setPassSubmitting(false);
    }
  };

  if (loading && !profileData) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
          Employee Account & Profile Settings
        </h1>
        <p className="mt-0.5 text-xs text-slate-500">
          Manage your personal information, emergency contacts, and security credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Profile Overview Card */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-center">
            <div className="relative mx-auto h-24 w-24">
              {avatar || profileData?.avatar ? (
                <img
                  src={avatar || profileData?.avatar}
                  alt={profileData?.name}
                  className="h-24 w-24 rounded-2xl object-cover ring-4 ring-slate-100 shadow-md"
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-500 text-white font-bold text-3xl shadow-md">
                  {profileData?.name ? profileData.name.slice(0, 2).toUpperCase() : 'SS'}
                </div>
              )}
            </div>

            <h2 className="mt-4 text-base font-bold text-slate-900">{profileData?.name}</h2>
            <p className="text-xs text-slate-500">{profileData?.designation}</p>

            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="font-mono text-xs font-semibold text-brand-600 bg-brand-50 border border-brand-200 px-2.5 py-0.5 rounded-full">
                {profileData?.employeeId}
              </span>
              <span className="text-xs font-semibold capitalize bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                {profileData?.role}
              </span>
            </div>

            <div className="mt-5 space-y-2 text-left border-t border-slate-100 pt-4 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-slate-400" />
                <span>Department: <strong className="text-slate-800">{profileData?.department}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-400" />
                <span className="truncate">{profileData?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-slate-400" />
                <span>Status: <strong className="capitalize text-emerald-600">{profileData?.status}</strong></span>
              </div>
            </div>
          </div>

          {/* Leave Balances Card */}
          {profileData?.leaveBalances && (
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Remaining Leave Balance
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-600">Casual Leave</span>
                  <span className="font-bold text-blue-600">{profileData.leaveBalances.casual} days</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-600">Sick Leave</span>
                  <span className="font-bold text-emerald-600">{profileData.leaveBalances.sick} days</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-600">Annual Vacation</span>
                  <span className="font-bold text-purple-600">{profileData.leaveBalances.annual} days</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-600">Parental Leave</span>
                  <span className="font-bold text-amber-600">{profileData.leaveBalances.maternityPaternity} days</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (2 Cols): Edit Form & Change Password */}
        <div className="space-y-6 lg:col-span-2">
          {/* Personal & Contact Details */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Personal & Contact Details</h3>
            <p className="text-xs text-slate-400 mb-5">Keep your corporate contact information current.</p>

            <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full rounded-lg border border-slate-300 p-2 focus:border-brand-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Avatar Image URL</label>
                  <input
                    type="url"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                    className="w-full rounded-lg border border-slate-300 p-2 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Address Fields */}
              <div className="border-t border-slate-100 pt-4">
                <span className="block font-bold text-slate-800 mb-3">Residential Address</span>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Street Address</label>
                    <input
                      type="text"
                      value={address.street}
                      onChange={(e) => setAddress({ ...address, street: e.target.value })}
                      placeholder="123 Main Street, Apt 4B"
                      className="w-full rounded-lg border border-slate-300 p-2 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">City</label>
                    <input
                      type="text"
                      value={address.city}
                      onChange={(e) => setAddress({ ...address, city: e.target.value })}
                      placeholder="New York"
                      className="w-full rounded-lg border border-slate-300 p-2 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">State / Province</label>
                    <input
                      type="text"
                      value={address.state}
                      onChange={(e) => setAddress({ ...address, state: e.target.value })}
                      placeholder="NY"
                      className="w-full rounded-lg border border-slate-300 p-2 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="border-t border-slate-100 pt-4">
                <span className="block font-bold text-slate-800 mb-3 flex items-center gap-1.5">
                  <HeartHandshake className="h-4 w-4 text-rose-500" /> Emergency Contact
                </span>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Contact Name</label>
                    <input
                      type="text"
                      value={emergencyContact.name}
                      onChange={(e) => setEmergencyContact({ ...emergencyContact, name: e.target.value })}
                      placeholder="Jane Doe"
                      className="w-full rounded-lg border border-slate-300 p-2 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Relationship</label>
                    <input
                      type="text"
                      value={emergencyContact.relationship}
                      onChange={(e) => setEmergencyContact({ ...emergencyContact, relationship: e.target.value })}
                      placeholder="Spouse / Parent"
                      className="w-full rounded-lg border border-slate-300 p-2 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 mb-1">Emergency Phone</label>
                    <input
                      type="text"
                      value={emergencyContact.phone}
                      onChange={(e) => setEmergencyContact({ ...emergencyContact, phone: e.target.value })}
                      placeholder="+1 (555) 999-9999"
                      className="w-full rounded-lg border border-slate-300 p-2 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700 shadow-sm transition"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Key className="h-4 w-4 text-brand-600" /> Security & Password
            </h3>
            <p className="text-xs text-slate-400 mb-4">Ensure your account uses a secure password.</p>

            <form onSubmit={handlePasswordChange} className="space-y-3.5 text-xs max-w-md">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 p-2 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full rounded-lg border border-slate-300 p-2 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  className="w-full rounded-lg border border-slate-300 p-2 focus:outline-none focus:border-brand-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={passSubmitting}
                  className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-800 transition disabled:opacity-50"
                >
                  <Lock className="h-4 w-4" />
                  <span>{passSubmitting ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
