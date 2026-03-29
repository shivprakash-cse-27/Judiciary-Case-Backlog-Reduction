import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  HiOutlineUser, 
  HiOutlineMail, 
  HiOutlineShieldCheck, 
  HiOutlineClock,
  HiOutlineCheck
} from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, checkAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.put('/users/profile', formData);
      if (res.data.success) {
        toast.success('Profile updated successfully');
        await checkAuth();
      }
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-tight">{user?.name}</h1>
          <p className="text-slate-400 font-medium">{user?.role} Profile</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="glass-card p-8">
            <h3 className="text-lg font-semibold text-white mb-6">Personal Information</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="form-label">Full Name</label>
                <div className="relative">
                  <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="form-input pl-11"
                  />
                </div>
              </div>
              <div>
                <label className="form-label">Email Address</label>
                <div className="relative">
                  <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="form-input pl-11"
                  />
                </div>
              </div>
              <div className="pt-4">
                <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
                  {loading ? <div className="spinner w-5 h-5 border-2"></div> : (
                    <>
                      <HiOutlineCheck size={20} />
                      Save Profile Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 border-blue-500/10">
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">Account Security</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <HiOutlineShieldCheck className="text-emerald-500" size={20} />
                <div className="text-xs">
                  <p className="text-white font-medium">Role: {user?.role}</p>
                  <p className="text-slate-500">Access level verified</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <HiOutlineClock className="text-blue-500" size={20} />
                <div className="text-xs">
                  <p className="text-white font-medium italic">Member Since</p>
                  <p className="text-slate-500">{new Date(user?.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <button className="w-full mt-6 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
              Change Password
            </button>
          </div>
          
          <div className="glass-card p-6 bg-slate-900/20">
            <h3 className="text-sm font-semibold text-white mb-2">Notice</h3>
            <p className="text-[10px] text-slate-500 leading-relaxed italic">
              Access to sensitive data is monitored for security compliance. 
              Please report any unauthorized access attempts to the administrator board immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
