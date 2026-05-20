import { Link, useNavigate } from 'react-router-dom';
import { FiLogOut, FiHome, FiTrendingUp, FiBook, FiBriefcase, FiBarChart2, FiMessageSquare, FiAward } from 'react-icons/fi';
import { MdDashboard } from 'react-icons/md';

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <>
      {/* Main Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/5 border-b border-white/10 shadow-sm">
        <div className="w-full px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16 md:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <img 
                src="/Logo.png" 
                alt="CareerPath AI Logo" 
                className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-lg" 
              />
              <span className="hidden sm:block text-xs sm:text-sm md:text-base font-bold text-gray-800">
                CAREERPATH <span className="text-blue-600">AI</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-6">
              {!isAuthenticated ? (
                <>
                  <Link to="/" className="text-gray-700 hover:text-purple-600 transition font-semibold text-sm">
                    Home
                  </Link>
                  <Link to="/about" className="text-gray-700 hover:text-purple-600 transition font-semibold text-sm">
                    About
                  </Link>
                  <Link to="/contact" className="text-gray-700 hover:text-purple-600 transition font-semibold text-sm">
                    Contact
                  </Link>
                </>
              ) : (
                <Link to="/dashboard" className="text-gray-700 hover:text-purple-600 transition font-semibold text-sm flex items-center gap-2">
                  <MdDashboard size={16} />
                  Dashboard
                </Link>
              )}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Login Button - Desktop */}
              {!isAuthenticated && (
                <Link
                  to="/login"
                  className="hidden sm:block px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold text-xs sm:text-sm hover:shadow-lg hover:shadow-green-500/50 transition"
                >
                  Login
                </Link>
              )}

              {/* (Removed right-side mobile dropdown) */}
            </div>
          </div>
        </div>
      </header>
      
    </>
  );
};

export default Header;
