import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineScale, HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff, HiOutlineUser, HiOutlineShieldCheck } from 'react-icons/hi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Lawyer'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getPasswordStrength(formData.password);
  const strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-emerald-500'];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role
    });
    setIsLoading(false);

    if (result?.success) {
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } else {
      toast.error(result?.message || 'Registration failed');
    }
  };

  const roles = [
    { value: 'Admin', label: 'Admin', desc: 'Full system access' },
    { value: 'Judge', label: 'Judge', desc: 'Manage assigned cases' },
    // { value: 'CourtStaff', label: 'Court Staff', desc: 'Case filing & scheduling' },
    { value: 'Lawyer', label: 'Lawyer', desc: 'File & track cases' }
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-32 left-16 w-80 h-80 bg-indigo-500 rounded-full blur-3xl" />
          <div className="absolute bottom-16 right-24 w-72 h-72 bg-purple-500 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-md"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <HiOutlineScale className="text-white text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Smart Judiciary System</h1>
              <p className="text-indigo-300/70 text-sm">Case Management System</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Join the Platform for
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent"> Smarter Justice</span>
          </h2>
          <p className="text-slate-400 text-lg">
            Create your account and start managing cases with intelligent tracking and automated scheduling.
          </p>

          <div className="mt-10 space-y-4">
            {['Smart case prioritization', 'Automated hearing scheduling', 'Real-time analytics dashboard'].map((feature, i) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.15 }}
                className="flex items-center gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <HiOutlineShieldCheck className="text-indigo-400" size={14} />
                </div>
                <span className="text-slate-300 text-sm">{feature}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <HiOutlineScale className="text-white text-xl" />
            </div>
            <h1 className="text-xl font-bold text-white">Smart Judiciary System</h1>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Create Account</h2>
          <p className="text-slate-400 mb-8">Register to get started with case management</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="form-label">Full Name</label>
              <div className="relative">
                {/* <HiOutlineUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} /> */}
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="form-input pl-11"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="form-label">Email Address</label>
              <div className="relative">
                {/* <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} /> */}
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="form-input pl-11"
                  required
                />
              </div>
            </div>

            {/* Role selection */}
            <div>
              <label className="form-label">Select Role</label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: r.value })}
                    className={`p-3 rounded-xl text-left border transition-all text-sm ${
                      formData.role === r.value
                        ? 'border-blue-500/50 bg-blue-500/10 text-blue-300'
                        : 'border-slate-700/50 bg-slate-800/40 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <p className="font-medium">{r.label}</p>
                    {/* <p className="text-[10px] mt-0.5 opacity-70">{r.desc}</p> */}
                  </button>
                ))}
              </div>
            </div>

            {/* Password */}
            <div className='mt-10'>
              <label className="form-label">Password</label>
              <div className="relative">
                {/* <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} /> */}
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a password"
                  className="form-input pl-11 pr-11"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                </button>
              </div>
              {/* Password strength */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${i < strength ? strengthColors[strength - 1] : 'bg-slate-700'}`} />
                    ))}
                  </div>
                  <p className={`text-xs ${strength >= 4 ? 'text-emerald-400' : strength >= 3 ? 'text-blue-400' : 'text-amber-400'}`}>
                    {strengthLabels[strength - 1] || 'Too short'}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="form-label">Confirm Password</label>
              <div className="relative">
                {/* <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} /> */}
                <input
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  className="form-input pl-11 pr-11"
                  required
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                  {showConfirm ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                </button>
              </div>
              {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                <p className="text-xs text-red-400 mt-1">Passwords do not match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
