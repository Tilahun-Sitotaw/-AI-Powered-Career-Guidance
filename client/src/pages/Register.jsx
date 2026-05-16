import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import axios from 'axios';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Valid email is required');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await axios.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });

      setUserId(response.data.userId);
      setShowOTP(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/verify-otp', {
        userId,
        otp,
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
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
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Create Account</h1>
              <p className="text-gray-400 text-sm mt-2">Join CareerPath AI today</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-900 bg-opacity-50 border border-red-700 rounded-lg flex items-start space-x-3">
                <FiAlertCircle className="text-red-400 mt-0.5 flex-shrink-0 text-lg" />
                <p className="text-red-300 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Form */}
            {!showOTP ? (
              <form onSubmit={handleRegister} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Full Name</label>
                <div className="relative group">
                  <FiUser className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-cyan-400 transition" size={20} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="w-full pl-14 pr-4 py-3 border border-cyan-500 border-opacity-30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition bg-slate-800 text-white placeholder-gray-500 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address</label>
                <div className="relative group">
                  <FiMail className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-cyan-400 transition" size={20} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    className="w-full pl-14 pr-4 py-3 border border-cyan-500 border-opacity-30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition bg-slate-800 text-white placeholder-gray-500 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Phone Number</label>
                <div className="relative group">
                  <FiPhone className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-cyan-400 transition" size={20} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 123-4567"
                    className="w-full pl-14 pr-4 py-3 border border-cyan-500 border-opacity-30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition bg-slate-800 text-white placeholder-gray-500 text-sm sm:text-base"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Password</label>
                <div className="relative group">
                  <FiLock className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-cyan-400 transition" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full pl-14 pr-12 py-3 border border-cyan-500 border-opacity-30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition bg-slate-800 text-white placeholder-gray-500 text-sm sm:text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-400 transition"
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Confirm Password</label>
                <div className="relative group">
                  <FiLock className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-cyan-400 transition" size={20} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full pl-14 pr-12 py-3 border border-cyan-500 border-opacity-30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition bg-slate-800 text-white placeholder-gray-500 text-sm sm:text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-3.5 text-gray-500 hover:text-gray-400 transition"
                  >
                    {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start space-x-3 text-sm">
                <input type="checkbox" className="w-4 h-4 mt-1 rounded border-cyan-500 text-cyan-500 focus:ring-cyan-500 bg-slate-800" required />
                <span className="text-gray-400">
                  I agree to the{' '}
                  <a href="#" className="text-cyan-400 hover:text-cyan-300 font-medium">
                    Terms
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-cyan-400 hover:text-cyan-300 font-medium">
                    Privacy Policy
                  </a>
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mt-6 text-sm sm:text-base"
              >
                <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                {!loading && <FiArrowRight size={18} />}
              </button>
            </form>
            ) : (
              <form onSubmit={handleOTPSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Enter Verification Code
                  </label>
                  <p className="text-gray-400 text-xs mb-4">
                    We've sent a 6-digit code to <span className="text-cyan-400">{formData.email}</span>
                  </p>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="000000"
                    maxLength="6"
                    className="w-full px-4 py-3 border border-cyan-500 border-opacity-30 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition text-center text-2xl sm:text-3xl tracking-widest font-bold bg-slate-800 text-white placeholder-gray-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {loading ? 'Verifying...' : 'Verify & Complete Signup'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowOTP(false)}
                  className="w-full text-gray-400 text-sm hover:text-white transition mt-2"
                >
                  Back to registration
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="my-6 flex items-center space-x-3">
              <div className="flex-1 h-px bg-cyan-500 bg-opacity-20"></div>
              <span className="text-gray-500 text-sm">or</span>
              <div className="flex-1 h-px bg-cyan-500 bg-opacity-20"></div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-cyan-400 font-semibold hover:text-cyan-300 transition">
                  Sign in
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

export default Register;
