import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FiMenu, FiX, FiLogOut, FiHome, FiSettings, FiBell } from 'react-icons/fi';
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
            <img src="/Logo.png" alt="CareerPath AI Logo" className="h-40 w-40 rounded-xl shadow-lg group-hover:shadow-xl transition" />
            <span className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent hidden sm:inline whitespace-nowrap">
              CAREERPATH <span className="text-cyan-300">AI</span>
            </span>
          </Link>

          {/* Search Bar - Desktop */}

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {/* Home Link - Always visible */}
            <Link
              to="/"
              className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-cyan-400 hover:bg-cyan-900 hover:bg-opacity-50 rounded-lg transition font-semibold text-lg"
            >
              <FiHome size={20} />
              <span className="font-bold">Home</span>
            </Link>

            {/* About Link - Always visible */}
            <Link
              to="/about"
              className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:text-cyan-400 hover:bg-cyan-900 hover:bg-opacity-50 rounded-lg transition font-semibold text-lg"
            >
              <span className="font-bold">About</span>
            </Link>

            {isAuthenticated && (
              <>
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
                {/* Notifications */}
                <button className="p-2 text-gray-300 hover:text-cyan-400 hover:bg-cyan-900 hover:bg-opacity-50 rounded-lg transition relative">
                  <FiBell size={20} />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-cyan-500 rounded-full"></span>
                </button>

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
              </>
            )}

            {/* Mobile Contact Options */}
            <div className="border-t border-cyan-800 pt-4 mt-4 space-y-2">
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
