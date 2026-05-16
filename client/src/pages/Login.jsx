import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiAlertCircle, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../utils/api';

const Login = ({ setIsAuthenticated = () => {} }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);

      if (response.data.requiresOTP) {
        setUserId(response.data.userId);
        setShowOTP(true);
      } else {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        setIsAuthenticated(true);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/auth/verify-otp', {
        userId,
        otp,
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Header />

      {/* Main Content */}
      <div className="flex-1 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto w-full">
          {/* Card */}
          <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-2xl shadow-2xl p-6 sm:p-8 border border-cyan-500 border-opacity-30">
            {/* Logo */}
            <div className="text-center mb-8">
              <Link to="/" className="inline-block">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition mb-4">
                  <span className="text-white font-bold text-xl">CP</span>
                </div>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Welcome Back</h1>
              <p className="text-gray-400 text-sm mt-2">Sign in to your account</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-900 bg-opacity-50 border border-red-700 rounded-lg flex items-start space-x-3">
                <FiAlertCircle className="text-red-400 mt-0.5 flex-shrink-0 text-lg" />
                <p className="text-red-300 text-sm font-medium">{error}</p>
              </div>
            )}

            {!showOTP ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border border-cyan-500 border-opacity-30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition bg-slate-800 text-white placeholder-gray-500 text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="w-full px-4 pr-12 py-3 border border-cyan-500 border-opacity-30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition bg-slate-800 text-white placeholder-gray-500 text-sm sm:text-base"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 inset-y-0 flex items-center text-gray-500 hover:text-gray-400 transition"
                    >
                      {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-sm">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-cyan-500 text-cyan-500 focus:ring-cyan-500 bg-slate-800" />
                    <span className="text-gray-400">Remember me</span>
                  </label>
                  <Link 
                    to="/forgot-password"
                    className="text-cyan-400 hover:text-cyan-300 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                  {!loading && <FiArrowRight size={18} />}
                </button>
              </form>
            ) : (
              <form onSubmit={handleOTPSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Enter OTP Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="000000"
                    maxLength="6"
                    className="w-full px-4 py-3 border border-cyan-500 border-opacity-30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition text-center text-2xl sm:text-3xl tracking-widest font-bold bg-slate-800 text-white placeholder-gray-500"
                    required
                  />
                  <p className="text-gray-400 text-sm mt-3">
                    Check your email for the 6-digit verification code
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="my-6 flex items-center space-x-3">
              <div className="flex-1 h-px bg-cyan-500 bg-opacity-20"></div>
              <span className="text-gray-500 text-sm">or</span>
              <div className="flex-1 h-px bg-cyan-500 bg-opacity-20"></div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Don't have an account?{' '}
                <Link to="/register" className="text-cyan-400 font-semibold hover:text-cyan-300 transition">
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Login;
