import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiAlertCircle, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';
import Header from '../components/Header';
import Footer from '../components/Footer';
import api from '../utils/api';

const countries = [
  // Primary / Frequently used
  { code: '+251', name: 'Ethiopia', flag: '🇪🇹' },
  { code: '+1', name: 'United States', flag: '🇺🇸' },
  { code: '+1', name: 'Canada', flag: '🇨🇦' },
  // East Africa
  { code: '+254', name: 'Kenya', flag: '🇰🇪' },
  { code: '+256', name: 'Uganda', flag: '🇺🇬' },
  { code: '+255', name: 'Tanzania', flag: '🇹🇿' },
  { code: '+250', name: 'Rwanda', flag: '🇷🇼' },
  { code: '+252', name: 'Somalia', flag: '🇸🇴' },
  { code: '+253', name: 'Djibouti', flag: '🇩🇯' },
  { code: '+211', name: 'South Sudan', flag: '🇸🇸' },
  { code: '+249', name: 'Sudan', flag: '🇸🇩' },
  { code: '+257', name: 'Burundi', flag: '🇧🇮' },
  { code: '+265', name: 'Malawi', flag: '🇲🇼' },
  { code: '+260', name: 'Zambia', flag: '🇿🇲' },
  { code: '+263', name: 'Zimbabwe', flag: '🇿🇼' },
  { code: '+258', name: 'Mozambique', flag: '🇲🇿' },
  { code: '+261', name: 'Madagascar', flag: '🇲🇬' },
  { code: '+262', name: 'Réunion', flag: '🇷🇪' },
  { code: '+230', name: 'Mauritius', flag: '🇲🇺' },
  { code: '+248', name: 'Seychelles', flag: '🇸🇨' },
  { code: '+269', name: 'Comoros', flag: '🇰🇲' },
  { code: '+262', name: 'Mayotte', flag: '🇾🇹' },
  { code: '+290', name: 'Saint Helena', flag: '🇸🇭' },
  // North Africa
  { code: '+20', name: 'Egypt', flag: '🇪🇬' },
  { code: '+212', name: 'Morocco', flag: '🇲🇦' },
  { code: '+213', name: 'Algeria', flag: '🇩🇿' },
  { code: '+216', name: 'Tunisia', flag: '🇹🇳' },
  { code: '+218', name: 'Libya', flag: '🇱🇾' },
  // West Africa
  { code: '+234', name: 'Nigeria', flag: '🇳🇬' },
  { code: '+233', name: 'Ghana', flag: '🇬🇭' },
  { code: '+221', name: 'Senegal', flag: '🇸🇳' },
  { code: '+225', name: 'Ivory Coast', flag: '🇨🇮' },
  { code: '+237', name: 'Cameroon', flag: '🇨🇲' },
  { code: '+228', name: 'Togo', flag: '🇹🇬' },
  { code: '+229', name: 'Benin', flag: '🇧🇯' },
  { code: '+226', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: '+238', name: 'Cape Verde', flag: '🇨🇻' },
  { code: '+220', name: 'Gambia', flag: '🇬🇲' },
  { code: '+224', name: 'Guinea', flag: '🇬🇳' },
  { code: '+245', name: 'Guinea-Bissau', flag: '🇬🇼' },
  { code: '+231', name: 'Liberia', flag: '🇱🇷' },
  { code: '+223', name: 'Mali', flag: '🇲🇱' },
  { code: '+222', name: 'Mauritania', flag: '🇲🇷' },
  { code: '+227', name: 'Niger', flag: '🇳🇪' },
  { code: '+232', name: 'Sierra Leone', flag: '🇸🇱' },
  // Middle East
  { code: '+966', name: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+971', name: 'United Arab Emirates', flag: '🇦🇪' },
  { code: '+974', name: 'Qatar', flag: '🇶🇦' },
  { code: '+965', name: 'Kuwait', flag: '🇰🇼' },
  { code: '+973', name: 'Bahrain', flag: '🇧🇭' },
  { code: '+968', name: 'Oman', flag: '🇴🇲' },
  { code: '+972', name: 'Israel', flag: '🇮🇱' },
  { code: '+962', name: 'Jordan', flag: '🇯🇴' },
  { code: '+961', name: 'Lebanon', flag: '🇱🇧' },
  { code: '+964', name: 'Iraq', flag: '🇮🇶' },
  { code: '+967', name: 'Yemen', flag: '🇾🇪' },
  // Central & South Africa
  { code: '+27', name: 'South Africa', flag: '🇿🇦' },
  { code: '+244', name: 'Angola', flag: '🇦🇴' },
  { code: '+267', name: 'Botswana', flag: '🇧🇼' },
  { code: '+243', name: 'DR Congo', flag: '🇨🇩' },
  { code: '+242', name: 'Congo', flag: '🇨🇬' },
  { code: '+241', name: 'Gabon', flag: '🇬🇦' },
  { code: '+240', name: 'Equatorial Guinea', flag: '🇬🇶' },
  { code: '+266', name: 'Lesotho', flag: '🇱🇸' },
  { code: '+268', name: 'Eswatini', flag: '🇸🇿' },
  { code: '+264', name: 'Namibia', flag: '🇳🇦' },
  { code: '+235', name: 'Chad', flag: '🇹🇩' },
  { code: '+236', name: 'Central African Republic', flag: '🇨🇫' },
  { code: '+239', name: 'São Tomé and Príncipe', flag: '🇸🇹' },
  // Latin America & Caribbean
  { code: '+55', name: 'Brazil', flag: '🇧🇷' },
  { code: '+52', name: 'Mexico', flag: '🇲🇽' },
  { code: '+54', name: 'Argentina', flag: '🇦🇷' },
  { code: '+57', name: 'Colombia', flag: '🇨🇴' },
  { code: '+56', name: 'Chile', flag: '🇨🇱' },
  { code: '+51', name: 'Peru', flag: '🇵🇪' },
  { code: '+58', name: 'Venezuela', flag: '🇻🇪' },
  { code: '+593', name: 'Ecuador', flag: '🇪🇨' },
  { code: '+591', name: 'Bolivia', flag: '🇧🇴' },
  { code: '+595', name: 'Paraguay', flag: '🇵🇾' },
  { code: '+598', name: 'Uruguay', flag: '🇺🇾' },
  { code: '+506', name: 'Costa Rica', flag: '🇨🇷' },
  { code: '+507', name: 'Panama', flag: '🇵🇦' },
  { code: '+502', name: 'Guatemala', flag: '🇬🇹' },
  // Europe
  { code: '+44', name: 'United Kingdom', flag: '🇬🇧' },
  { code: '+49', name: 'Germany', flag: '🇩🇪' },
  { code: '+33', name: 'France', flag: '🇫🇷' },
  { code: '+39', name: 'Italy', flag: '🇮🇹' },
  { code: '+34', name: 'Spain', flag: '🇪🇸' },
  { code: '+7', name: 'Russia', flag: '🇷🇺' },
  { code: '+31', name: 'Netherlands', flag: '🇳🇱' },
  { code: '+41', name: 'Switzerland', flag: '🇨🇭' },
  { code: '+46', name: 'Sweden', flag: '🇸🇪' },
  { code: '+47', name: 'Norway', flag: '🇳🇴' },
  { code: '+358', name: 'Finland', flag: '🇫🇮' },
  { code: '+45', name: 'Denmark', flag: '🇩🇰' },
  { code: '+353', name: 'Ireland', flag: '🇮🇪' },
  { code: '+32', name: 'Belgium', flag: '🇧🇪' },
  { code: '+43', name: 'Austria', flag: '🇦🇹' },
  { code: '+48', name: 'Poland', flag: '🇵🇱' },
  { code: '+30', name: 'Greece', flag: '🇬🇷' },
  { code: '+351', name: 'Portugal', flag: '🇵🇹' },
  { code: '+90', name: 'Turkey', flag: '🇹🇷' },
  { code: '+380', name: 'Ukraine', flag: '🇺🇦' },
  { code: '+420', name: 'Czech Republic', flag: '🇨🇿' },
  { code: '+40', name: 'Romania', flag: '🇷🇴' },
  { code: '+36', name: 'Hungary', flag: '🇭🇺' },
  { code: '+385', name: 'Croatia', flag: '🇭🇷' },
  { code: '+359', name: 'Bulgaria', flag: '🇧🇬' },
  { code: '+421', name: 'Slovakia', flag: '🇸🇰' },
  { code: '+370', name: 'Lithuania', flag: '🇱🇹' },
  { code: '+371', name: 'Latvia', flag: '🇱🇻' },
  // Asia
  { code: '+91', name: 'India', flag: '🇮🇳' },
  { code: '+86', name: 'China', flag: '🇨🇳' },
  { code: '+81', name: 'Japan', flag: '🇯🇵' },
  { code: '+82', name: 'South Korea', flag: '🇰🇷' },
  { code: '+65', name: 'Singapore', flag: '🇸🇬' },
  { code: '+60', name: 'Malaysia', flag: '🇲🇾' },
  { code: '+62', name: 'Indonesia', flag: '🇮🇩' },
  { code: '+63', name: 'Philippines', flag: '🇵🇭' },
  { code: '+66', name: 'Thailand', flag: '🇹🇭' },
  { code: '+84', name: 'Vietnam', flag: '🇻🇳' },
  { code: '+92', name: 'Pakistan', flag: '🇵🇰' },
  { code: '+880', name: 'Bangladesh', flag: '🇧🇩' },
  { code: '+94', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+977', name: 'Nepal', flag: '🇳🇵' },
  { code: '+95', name: 'Myanmar', flag: '🇲🇲' },
  { code: '+855', name: 'Cambodia', flag: '🇰🇭' },
  { code: '+856', name: 'Laos', flag: '🇱🇦' },
  { code: '+886', name: 'Taiwan', flag: '🇹🇼' },
  { code: '+852', name: 'Hong Kong', flag: '🇭🇰' },
  { code: '+960', name: 'Maldives', flag: '🇲🇻' },
  { code: '+976', name: 'Mongolia', flag: '🇲🇳' },
  { code: '+7', name: 'Kazakhstan', flag: '🇰🇿' },
  { code: '+998', name: 'Uzbekistan', flag: '🇺🇿' },
  // Oceania
  { code: '+61', name: 'Australia', flag: '🇦🇺' },
  { code: '+64', name: 'New Zealand', flag: '🇳🇿' },
  { code: '+679', name: 'Fiji', flag: '🇫🇯' },
  { code: '+675', name: 'Papua New Guinea', flag: '🇵🇬' },
  { code: '+685', name: 'Samoa', flag: '🇼🇸' }
];

const Register = ({ setIsAuthenticated = () => {} }) => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState('');
  const [userId, setUserId] = useState('');
  
  const [selectedCountry, setSelectedCountry] = useState(countries[0]); // Default to Ethiopia (+251)
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const quickAccounts = [
    { name: 'Tilahun Sitotaw', email: 'tilahun@gmail.com' },
    { name: 'Demo Student', email: 'student.demopath@gmail.com' },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };

  const validatePhone = (phone, countryCode) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (countryCode === '+251') {
      return cleanPhone.length === 9;
    }
    if (countryCode === '+1') {
      return cleanPhone.length === 10;
    }
    if (countryCode === '+44') {
      return cleanPhone.length === 10;
    }
    if (countryCode === '+91') {
      return cleanPhone.length === 10;
    }
    return cleanPhone.length >= 7 && cleanPhone.length <= 15;
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
    if (!validatePhone(formData.phone, selectedCountry.code)) {
      if (selectedCountry.code === '+251') {
        setError('Ethiopian phone number must be exactly 9 digits (e.g. 912345678)');
      } else if (selectedCountry.code === '+1') {
        setError('US/Canada phone number must be exactly 10 digits (e.g. 2025550199)');
      } else if (selectedCountry.code === '+91') {
        setError('Indian phone number must be exactly 10 digits');
      } else if (selectedCountry.code === '+44') {
        setError('UK phone number must be exactly 10 digits');
      } else {
        setError('Please enter a valid phone number (between 7 and 15 digits)');
      }
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
      const fullPhone = `${selectedCountry.code}${formData.phone.replace(/^\+/, '').replace(/\s+/g, '')}`;
      const response = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        phone: fullPhone,
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
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Filter countries based on search term
  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(countrySearch.toLowerCase()) || 
    c.code.includes(countrySearch)
  );

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />

      <div className="flex-1 relative py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8" style={{
        backgroundImage: 'url(/Images/professional-team.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        <div className="absolute inset-0 bg-black bg-opacity-50 z-0"></div>
        <div className="max-w-md mx-auto w-full">
          <div className="bg-white bg-opacity-20 backdrop-blur-xl rounded-2xl shadow-2xl p-6 sm:p-8 border border-white border-opacity-30 relative z-10">
            
            {/* Logo & Subtitle */}
            <div className="text-center mb-6">
              <Link to="/" className="inline-block">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition mb-3 animate-pulse">
                  <span className="text-white font-bold text-xl">CP</span>
                </div>
              </Link>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Create Account</h1>
              <p className="text-gray-100 text-xs sm:text-sm mt-1">Start your AI-guided career journey today</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 p-4 bg-red-500 bg-opacity-30 border border-red-300 rounded-lg flex items-start space-x-3 backdrop-blur-sm">
                <FiAlertCircle className="text-red-200 mt-0.5 flex-shrink-0 text-base sm:text-lg" />
                <p className="text-red-100 text-xs sm:text-sm font-medium">{error}</p>
              </div>
            )}

            {!showOTP ? (
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-white mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g. Tilahun Sitotaw"
                  className="w-full px-3.5 py-2.5 border border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition bg-white bg-opacity-20 text-white placeholder-gray-200 text-xs sm:text-sm backdrop-blur-sm"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-white mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 border border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition bg-white bg-opacity-20 text-white placeholder-gray-200 text-xs sm:text-sm backdrop-blur-sm"
                  required
                />
              </div>

              {/* Phone Number with International Country Code Selection */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-white mb-1.5">
                  Phone Number
                </label>
                <div className="flex space-x-2 relative">
                  {/* Selector Button */}
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="flex items-center space-x-1.5 px-3 py-2.5 border border-white border-opacity-30 rounded-lg bg-white bg-opacity-20 text-white text-xs sm:text-sm backdrop-blur-sm hover:bg-opacity-30 transition"
                  >
                    <span>{selectedCountry.flag}</span>
                    <span className="font-semibold">{selectedCountry.code}</span>
                    <span className="text-[10px] text-gray-200">▼</span>
                  </button>

                  {/* Searchable Country Dropdown Popover */}
                  {showCountryDropdown && (
                    <div className="absolute left-0 bottom-full mb-2 w-64 bg-slate-900 bg-opacity-95 backdrop-blur-2xl border border-slate-700 rounded-xl shadow-2xl z-50 p-2 overflow-hidden max-h-60 flex flex-col">
                      {/* Search input field */}
                      <input
                        type="text"
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        placeholder="Search country or code..."
                        className="w-full px-2.5 py-1.5 mb-2 bg-slate-800 border border-slate-750 text-white text-xs rounded-lg outline-none focus:ring-1 focus:ring-cyan-400 placeholder-slate-400"
                        onClick={(e) => e.stopPropagation()} // Prevent closing dropdown on input click
                      />
                      <div className="overflow-y-auto flex-1 divide-y divide-slate-800">
                        {filteredCountries.length > 0 ? (
                          filteredCountries.map((c, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => {
                                setSelectedCountry(c);
                                setShowCountryDropdown(false);
                                setCountrySearch('');
                              }}
                              className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-cyan-600/30 transition text-xs text-white"
                            >
                              <div className="flex items-center space-x-2.5 truncate">
                                <span className="text-sm">{c.flag}</span>
                                <span className="font-medium truncate">{c.name}</span>
                              </div>
                              <span className="text-cyan-400 font-bold ml-1.5 flex-shrink-0">{c.code}</span>
                            </button>
                          ))
                        ) : (
                          <div className="text-[11px] text-slate-400 text-center py-2.5">No country matches search</div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Input field */}
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="912 345 678"
                    className="flex-1 px-3.5 py-2.5 border border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition bg-white bg-opacity-20 text-white placeholder-gray-200 text-xs sm:text-sm backdrop-blur-sm font-mono"
                    required
                  />
                </div>
                <p className="text-[10px] text-gray-200 mt-1">
                  Format for {selectedCountry.name}: E.g.{' '}
                  {selectedCountry.code === '+251' ? '912345678 (9 digits)' : 
                   selectedCountry.code === '+1' ? '2025550199 (10 digits)' : 
                   'valid international number'}
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-white mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full px-3.5 pr-11 py-2.5 border border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition bg-white bg-opacity-20 text-white placeholder-gray-200 text-xs sm:text-sm backdrop-blur-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 inset-y-0 flex items-center text-gray-200 hover:text-white transition"
                  >
                    {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-white mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full px-3.5 pr-11 py-2.5 border border-white border-opacity-30 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent outline-none transition bg-white bg-opacity-20 text-white placeholder-gray-200 text-xs sm:text-sm backdrop-blur-sm"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 inset-y-0 flex items-center text-gray-200 hover:text-white transition"
                  >
                    {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                  </button>
                </div>
              </div>

              {/* Terms Checkbox */}
              <label className="flex items-start space-x-2.5 cursor-pointer pt-1 text-xs">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded border-white border-opacity-30 text-cyan-400 focus:ring-cyan-400 bg-white bg-opacity-20 mt-0.5" 
                  required 
                />
                <span className="text-gray-100 leading-normal">
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
              </form>
            )}
          </div>
        </div>
      </div>


      <Footer />
    </div>
  );
};

export default Register;
