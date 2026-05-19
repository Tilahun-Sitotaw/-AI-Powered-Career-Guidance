import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../utils/api';

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
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must be at least 8 characters and include a letter, a number, and a special character');
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
      const response = await api.post('/auth/register', {
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
      const response = await api.post('/auth/verify-otp', {
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
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header - White like Home page */}
      <Header />

      {/* Main Content with Background Image */}
      <div className="flex-1 relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8" style={{
        backgroundImage: 'url(/Images/professional-team.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        {/* Background overlay for readability */}
        <div className="absolute inset-0 bg-black bg-opacity-50 z-0"></div>
        <div className="max-w-md mx-auto w-full">
          {/* Card - White background, not glassmorphic */}
          <div className="bg-white bg-opacity-20 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-white border-opacity-30 relative z-10">
            {/* Logo */}
            <div className="text-center mb-8">
              <Link to="/" className="inline-block">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition mb-4">
                  <span className="text-white font-bold text-xl">CP</span>
                </div>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Create Account</h1>
              <p className="text-gray-100 text-sm mt-2">Join CareerPath AI today</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-500 bg-opacity-30 border border-red-300 rounded-lg flex items-start space-x-3 backdrop-blur-sm">
                <FiAlertCircle className="text-red-200 mt-0.5 flex-shrink-0 text-lg" />
                <p className="text-red-100 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Form */}
            {!showOTP ? (
              <form onSubmit={handleRegister} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  className="w-full px-4 py-3 border border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition bg-white bg-opacity-20 text-white placeholder-gray-200 text-sm sm:text-base backdrop-blur-sm"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Your email"
                  className="w-full px-4 py-3 border border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition bg-white bg-opacity-20 text-white placeholder-gray-200 text-sm sm:text-base backdrop-blur-sm"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Your phone"
                  className="w-full px-4 py-3 border border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition bg-white bg-opacity-20 text-white placeholder-gray-200 text-sm sm:text-base backdrop-blur-sm"
                  required
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Password</label>
                <div className="relative group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full px-4 pr-12 py-3 border border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition bg-white bg-opacity-20 text-white placeholder-gray-200 text-sm sm:text-base backdrop-blur-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 inset-y-0 flex items-center text-gray-200 hover:text-white transition"
                  >
                    {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Confirm Password</label>
                <div className="relative group">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full px-4 pr-12 py-3 border border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition bg-white bg-opacity-20 text-white placeholder-gray-200 text-sm sm:text-base backdrop-blur-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 inset-y-0 flex items-center text-gray-200 hover:text-white transition"
                  >
                    {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start space-x-3 text-sm">
                <input type="checkbox" className="w-4 h-4 mt-1 rounded border-white border-opacity-30 text-cyan-400 focus:ring-cyan-400 bg-white bg-opacity-20" required />
                <span className="text-gray-100">
                  I agree to the{' '}
                  <a href="#" className="text-cyan-200 hover:text-cyan-100 font-medium">
                    Terms
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-cyan-200 hover:text-cyan-100 font-medium">
                    Privacy Policy
                  </a>
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 mt-6 text-sm sm:text-base"
              >
                <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
                {!loading && <FiArrowRight size={18} />}
              </button>
            </form>
            ) : (
              <form onSubmit={handleOTPSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Enter Verification Code
                  </label>
                  <p className="text-gray-100 text-xs mb-4">
                    We've sent a 6-digit code to <span className="text-cyan-200">{formData.email}</span>
                  </p>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="000000"
                    maxLength="6"
                    className="w-full px-4 py-3 border border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition text-center text-2xl sm:text-3xl tracking-widest font-bold bg-white bg-opacity-20 text-white placeholder-gray-200 backdrop-blur-sm"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold py-3 rounded-lg hover:shadow-lg hover:shadow-green-500/50 transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {loading ? 'Verifying...' : 'Verify & Complete Signup'}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowOTP(false)}
                  className="w-full text-gray-200 text-sm hover:text-white transition mt-2"
                >
                  Back to registration
                </button>
              </form>
            )}

            {/* Divider */}
            <div className="my-6 flex items-center space-x-3">
              <div className="flex-1 h-px bg-white bg-opacity-30"></div>
              <span className="text-gray-100 text-sm">or</span>
              <div className="flex-1 h-px bg-white bg-opacity-30"></div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-gray-100 text-sm">
                Already have an account?{' '}
                <Link to="/login" className="text-cyan-200 font-semibold hover:text-cyan-100 transition">
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
