import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut, FiHome, FiSettings, FiBell, FiTrendingUp, FiBook, FiBriefcase, FiBarChart2, FiMessageSquare, FiAward } from 'react-icons/fi';
import { MdDashboard } from 'react-icons/md';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <header className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-b border-cyan-800 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img src="/Logo.png" alt="CareerPath AI Logo" className="h-10 w-10 rounded-lg shadow-md group-hover:shadow-lg transition" />
            <span className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent hidden sm:inline whitespace-nowrap">
              CAREERPATH <span className="text-cyan-300">AI</span>
            </span>
          </Link>

          {/* Search Bar - Desktop */}

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {!isAuthenticated ? (
              <>
                {/* Non-authenticated users: Home, About */}
                <Link
                  to="/"
                  className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-cyan-400 hover:bg-cyan-900 hover:bg-opacity-50 rounded-lg transition font-semibold text-lg"
                >
                  <FiHome size={20} />
                  <span className="font-bold">Home</span>
                </Link>

                <Link
                  to="/about"
                  className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-cyan-400 hover:bg-cyan-900 hover:bg-opacity-50 rounded-lg transition font-semibold text-lg"
                >
                  <span className="font-bold">About</span>
                </Link>
              </>
            ) : (
              <>
                {/* Authenticated users: Dashboard only */}
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-cyan-400 hover:bg-cyan-900 hover:bg-opacity-50 rounded-lg transition font-semibold text-lg"
                >
                  <MdDashboard size={20} />
                  <span className="font-bold">Dashboard</span>
                </Link>
              </>
            )}
          </nav>

          {/* Contact Options - Desktop */}
          <div className="hidden lg:flex items-center space-x-4 mr-4">
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Settings */}
                <button className="p-2 text-gray-300 hover:text-cyan-400 hover:bg-cyan-900 hover:bg-opacity-50 rounded-lg transition">
                  <FiSettings size={20} />
                </button>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-red-400 hover:bg-red-900 hover:bg-opacity-50 rounded-lg transition font-bold text-lg"
                >
                  <FiLogOut size={20} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-bold text-lg hover:shadow-lg hover:shadow-cyan-500/50 transition"
                >
                  Login
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 hover:bg-cyan-900 hover:bg-opacity-50 rounded-lg transition"
          >
            {isOpen ? <FiX size={24} className="text-white" /> : <FiMenu size={24} className="text-white" />}
          </button>
        </div>

        {/* Mobile Sidebar / Drawer */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setIsOpen(false)}
            ></div>
            
            {/* Drawer */}
            <nav className="fixed top-0 right-0 h-full w-64 bg-slate-900 z-50 md:hidden shadow-2xl transform transition-transform duration-300 ease-in-out p-6 flex flex-col overflow-y-auto border-l border-cyan-800">
              <div className="flex justify-between items-center mb-8">
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">MENU</span>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-white hover:bg-slate-800 rounded-lg transition"
                >
                  <FiX size={24} />
                </button>
              </div>

              <div className="space-y-1">
                {!isAuthenticated ? (
                  <>
                    <Link
                      to="/"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-purple-800 hover:bg-opacity-50 rounded-lg transition"
                      onClick={() => setIsOpen(false)}
                    >
                      <FiHome size={20} />
                      <span className="font-semibold">Home</span>
                    </Link>

                    <Link
                      to="/about"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-purple-800 hover:bg-opacity-50 rounded-lg transition"
                      onClick={() => setIsOpen(false)}
                    >
                      <span className="font-semibold px-1">About</span>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-purple-800 hover:bg-opacity-50 rounded-lg transition"
                      onClick={() => setIsOpen(false)}
                    >
                      <MdDashboard size={20} />
                      <span className="font-semibold">Dashboard</span>
                    </Link>

                    <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-500 uppercase tracking-widest">
                      Recommendations
                    </div>
                    
                    <Link
                      to="/career-paths"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-purple-800 hover:bg-opacity-50 rounded-lg transition"
                      onClick={() => setIsOpen(false)}
                    >
                      <FiTrendingUp size={18} />
                      <span>Career Paths</span>
                    </Link>

                    <Link
                      to="/learning-paths"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-purple-800 hover:bg-opacity-50 rounded-lg transition"
                      onClick={() => setIsOpen(false)}
                    >
                      <FiBook size={18} />
                      <span>Learning Paths</span>
                    </Link>

                    <Link
                      to="/internships"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-purple-800 hover:bg-opacity-50 rounded-lg transition"
                      onClick={() => setIsOpen(false)}
                    >
                      <FiBriefcase size={18} />
                      <span>Internships</span>
                    </Link>

                    <Link
                      to="/skill-gap-analysis"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-purple-800 hover:bg-opacity-50 rounded-lg transition"
                      onClick={() => setIsOpen(false)}
                    >
                      <FiBarChart2 size={18} />
                      <span>Skill Gaps</span>
                    </Link>

                    <Link
                      to="/interview-prep"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-purple-800 hover:bg-opacity-50 rounded-lg transition"
                      onClick={() => setIsOpen(false)}
                    >
                      <FiMessageSquare size={18} />
                      <span>Interview Prep</span>
                    </Link>

                    <Link
                      to="/scholarships"
                      className="flex items-center space-x-3 px-4 py-3 text-gray-300 hover:bg-purple-800 hover:bg-opacity-50 rounded-lg transition"
                      onClick={() => setIsOpen(false)}
                    >
                      <FiAward size={18} />
                      <span>Scholarships</span>
                    </Link>

                    <div className="mt-auto pt-8">
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-900 hover:bg-opacity-30 rounded-lg transition border border-red-900 border-opacity-30"
                      >
                        <FiLogOut size={20} />
                        <span className="font-bold">Logout</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </nav>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
