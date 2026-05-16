import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiMail, FiLock, FiAlertCircle, FiCheckCircle, FiArrowLeft } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/forgot-password', { email });
      setUserId(response.data.userId);
      setStep(2);
      setMessage('OTP sent to your email successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await axios.post('/api/auth/reset-password', {
        userId,
        otp,
        newPassword
      });
      setMessage('Password updated successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed. Invalid OTP or requirements not met.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      <Header />

      <main className="flex-1 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md mx-auto w-full">
          <div className="bg-gradient-to-br from-slate-900 to-purple-900 rounded-2xl shadow-2xl p-6 sm:p-8 border border-cyan-500 border-opacity-30">
            {/* Logo/Icon */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-4">
                <FiLock className="text-white text-3xl" />
              </div>
              <h1 className="text-2xl font-bold text-white">Reset Password</h1>
              <p className="text-gray-400 text-sm mt-2">
                {step === 1 ? 'Enter your email to receive an OTP' : 'Enter the code and your new password'}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-start space-x-3">
                <FiAlertCircle className="text-red-400 mt-0.5 flex-shrink-0" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            {message && (
              <div className="mb-6 p-4 bg-green-900/50 border border-green-700 rounded-lg flex items-start space-x-3">
                <FiCheckCircle className="text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-green-300 text-sm">{message}</p>
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleSendOTP} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <FiMail className="text-gray-500" size={20} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full pl-14 pr-4 py-3 bg-slate-800 border border-cyan-500/30 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 outline-none transition"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">OTP Code</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="000000"
                    className="w-full px-4 py-3 bg-slate-800 border border-cyan-500/30 rounded-lg text-white text-center text-2xl font-bold tracking-[0.5em] focus:ring-2 focus:ring-cyan-500 outline-none transition"
                    required
                    maxLength="6"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <FiLock className="text-gray-500" size={20} />
                    </div>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 8 characters"
                      className="w-full pl-14 pr-4 py-3 bg-slate-800 border border-cyan-500/30 rounded-lg text-white focus:ring-2 focus:ring-cyan-500 outline-none transition"
                      required
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-3 rounded-lg hover:shadow-lg hover:shadow-cyan-500/30 transition disabled:opacity-50"
                >
                  {loading ? 'Updating Password...' : 'Reset Password'}
                </button>
              </form>
            )}

            <div className="mt-8 pt-6 border-t border-cyan-500/20 text-center">
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center justify-center space-x-2">
                <FiArrowLeft />
                <span>Back to Login</span>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ForgotPassword;
