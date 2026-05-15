import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut, FiUser, FiHome, FiSettings, FiHelpCircle, FiBell, FiSearch } from 'react-icons/fi';
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

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <header className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-b border-cyan-800 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition">
              <span className="text-white font-bold text-lg">CP</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent hidden sm:inline">
              CareerPath
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          {isAuthenticated && (
            <div className="hidden lg:flex items-center bg-slate-800 rounded-lg px-4 py-2 w-64">
              <FiSearch className="text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search for careers, skills..."
                className="bg-transparent text-white placeholder-gray-400 ml-2 w-full outline-none text-sm"
              />
            </div>
          )}

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {/* Home Link - Always visible */}
            <Link
              to="/"
              className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-cyan-400 hover:bg-cyan-900 hover:bg-opacity-50 rounded-lg transition"
            >
              <FiHome size={18} />
              <span className="font-medium">Home</span>
            </Link>

            {/* About Link - Always visible */}
            <Link
              to="/about"
              className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-cyan-400 hover:bg-cyan-900 hover:bg-opacity-50 rounded-lg transition"
            >
              <span className="font-medium">About</span>
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-cyan-400 hover:bg-cyan-900 hover:bg-opacity-50 rounded-lg transition"
                >
                  <MdDashboard size={18} />
                  <span className="font-medium">Dashboard</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-cyan-400 hover:bg-cyan-900 hover:bg-opacity-50 rounded-lg transition"
                >
                  <FiUser size={18} />
                  <span className="font-medium">Profile</span>
                </Link>
                <Link
                  to="/recommendations"
                  className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-cyan-400 hover:bg-cyan-900 hover:bg-opacity-50 rounded-lg transition"
                >
                  <FiHelpCircle size={18} />
                  <span className="font-medium">Recommendations</span>
                </Link>
              </>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <button className="p-2 text-gray-300 hover:text-cyan-400 hover:bg-cyan-900 hover:bg-opacity-50 rounded-lg transition relative">
                  <FiBell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-500 rounded-full"></span>
                </button>

                {/* Settings */}
                <button className="p-2 text-gray-300 hover:text-cyan-400 hover:bg-cyan-900 hover:bg-opacity-50 rounded-lg transition">
                  <FiSettings size={20} />
                </button>

                {/* User Profile */}
                <div className="flex items-center space-x-3 px-4 py-2 bg-cyan-900 bg-opacity-50 rounded-lg border border-cyan-800">
                  <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-sm font-semibold text-white">{user.name || 'User'}</p>
                    <p className="text-xs text-gray-400">{user.email || 'user@example.com'}</p>
                  </div>
                </div>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-red-400 hover:bg-red-900 hover:bg-opacity-50 rounded-lg transition font-medium"
                >
                  <FiLogOut size={18} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition"
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

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="md:hidden pb-4 space-y-2 border-t border-cyan-800 pt-4">
            {/* Home Link - Always visible */}
            <Link
              to="/"
              className="flex items-center space-x-2 px-4 py-3 text-gray-300 hover:bg-cyan-900 hover:bg-opacity-50 rounded-lg transition"
              onClick={() => setIsOpen(false)}
            >
              <FiHome size={18} />
              <span>Home</span>
            </Link>

            {/* About Link - Always visible */}
            <Link
              to="/about"
              className="flex items-center space-x-2 px-4 py-3 text-gray-300 hover:bg-cyan-900 hover:bg-opacity-50 rounded-lg transition"
              onClick={() => setIsOpen(false)}
            >
              <span>About</span>
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 px-4 py-3 text-gray-300 hover:bg-cyan-900 hover:bg-opacity-50 rounded-lg transition"
                  onClick={() => setIsOpen(false)}
                >
                  <MdDashboard size={18} />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-4 py-3 text-gray-300 hover:bg-cyan-900 hover:bg-opacity-50 rounded-lg transition"
                  onClick={() => setIsOpen(false)}
                >
                  <FiUser size={18} />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/recommendations"
                  className="flex items-center space-x-2 px-4 py-3 text-gray-300 hover:bg-cyan-900 hover:bg-opacity-50 rounded-lg transition"
                  onClick={() => setIsOpen(false)}
                >
                  <FiHelpCircle size={18} />
                  <span>Recommendations</span>
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-3 text-red-400 hover:bg-red-900 hover:bg-opacity-50 rounded-lg transition"
                >
                  <FiLogOut size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-4 py-3 text-gray-300 hover:bg-cyan-900 hover:bg-opacity-50 rounded-lg transition font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg transition font-medium text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
