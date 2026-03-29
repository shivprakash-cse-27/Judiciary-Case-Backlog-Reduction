import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineScale, HiOutlineMail, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from 'react-icons/hi';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result?.success) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error(result?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 items-center justify-center p-12">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-indigo-500 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-md"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <HiOutlineScale className="text-white text-3xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Smart Judiciary System</h1>
              <p className="text-blue-300/70 text-sm">Case Management System</p>
            </div>
          </div>

          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Reducing Case
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent"> Backlogs</span>,
            <br />Delivering Justice
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            A modern judiciary case management platform designed to track, prioritize, and resolve pending cases efficiently.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { value: '50K+', label: 'Cases Managed' },
              { value: '200+', label: 'Courts Active' },
              { value: '40%', label: 'Faster Resolution' }
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="text-center p-3 rounded-xl bg-white/5 border border-white/10"
              >
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-slate-400 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-slate-950">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <HiOutlineScale className="text-white text-xl" />
            </div>
            <h1 className="text-xl font-bold text-white">JudiTrack</h1>
          </div>

          <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-slate-400 mb-8">Sign in to access your dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="form-label">Email Address</label>
              <div className="relative p-6  ">
                {/* <HiOutlineMail className="absolute left-0  top-1/2 -translate-y-1/2 text-slate-500 " size={18} /> */}
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="form-input pl-11"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                {/* <HiOutlineLockClosed className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} /> */}
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="form-input pl-11 pr-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <HiOutlineEyeOff size={18} /> : <HiOutlineEye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-400">Remember me</span>
              </label>
              <button type="button" className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center py-3 text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          {/* <div className="mt-6 p-4 rounded-xl bg-slate-900/60 border border-slate-700/30">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Demo Credentials</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
              <div><span className="text-slate-300">Admin:</span> admin@judiciary.com</div>
              <div><span className="text-slate-300">Pass:</span> admin123</div>
              <div><span className="text-slate-300">Judge:</span> judge1@judiciary.com</div>
              <div><span className="text-slate-300">Pass:</span> judge123</div>
              <div><span className="text-slate-300">Staff:</span> staff@judiciary.com</div>
              <div><span className="text-slate-300">Pass:</span> staff123</div>
            </div>
          </div> */}

          {/* Register link */}
          <p className="mt-6 text-center text-sm text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
              Create account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
