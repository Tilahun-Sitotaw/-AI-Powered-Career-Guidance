import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut, FiHome, FiTrendingUp, FiBook, FiBriefcase, FiBarChart2, FiMessageSquare, FiAward } from 'react-icons/fi';
import { MdDashboard } from 'react-icons/md';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
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

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-2 text-gray-700 hover:bg-gray-200/50 rounded-lg transition"
              >
                {isOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-30 lg:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer */}
          <nav className="fixed top-14 sm:top-16 right-0 w-56 sm:w-64 max-h-[calc(100vh-56px)] sm:max-h-[calc(100vh-64px)] bg-white/95 backdrop-blur-md z-30 lg:hidden shadow-lg overflow-y-auto border-l border-gray-200/50">
            <div className="p-4 sm:p-6 space-y-1">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100/80 rounded-lg transition font-semibold text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <FiHome size={18} />
                    <span>Home</span>
                  </Link>

                  <Link
                    to="/about"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100/80 rounded-lg transition font-semibold text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <span>About</span>
                  </Link>

                  <Link
                    to="/contact"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100/80 rounded-lg transition font-semibold text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <span>Contact</span>
                  </Link>

                  {/* Mobile Login Button */}
                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 px-4 py-3 mt-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg transition font-bold text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <span>Login</span>
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100/80 rounded-lg transition font-semibold text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <MdDashboard size={18} />
                    <span>Dashboard</span>
                  </Link>

                  <div className="pt-3 pb-2 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Resources
                  </div>

                  <Link
                    to="/career-paths"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100/80 rounded-lg transition text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <FiTrendingUp size={16} />
                    <span>Career Paths</span>
                  </Link>

                  <Link
                    to="/learning-paths"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100/80 rounded-lg transition text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <FiBook size={16} />
                    <span>Learning Paths</span>
                  </Link>

                  <Link
                    to="/internships"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100/80 rounded-lg transition text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <FiBriefcase size={16} />
                    <span>Internships</span>
                  </Link>

                  <Link
                    to="/skill-gap-analysis"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100/80 rounded-lg transition text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <FiBarChart2 size={16} />
                    <span>Skill Gaps</span>
                  </Link>

                  <Link
                    to="/interview-prep"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100/80 rounded-lg transition text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <FiMessageSquare size={16} />
                    <span>Interview Prep</span>
                  </Link>

                  <Link
                    to="/scholarships"
                    className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100/80 rounded-lg transition text-sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <FiAward size={16} />
                    <span>Scholarships</span>
                  </Link>

                  <div className="pt-4 border-t border-gray-200/50">
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50/80 rounded-lg transition border border-red-200/50 font-bold text-sm"
                    >
                      <FiLogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </nav>
        </>
      )}
    </>
  );
};

export default Header;
