import { Link, useNavigate } from 'react-router-dom';
import { FiUser } from 'react-icons/fi';
import { MdDashboard } from 'react-icons/md';

const Header = () => {
  const navigate = useNavigate();

  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <>
      {/* Main Header */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/5 border-b border-white/10 shadow-sm">
        <div className="w-full px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20 md:h-24">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-1 sm:gap-4 py-2">
              <img 
                src="/Logo.png" 
                alt="CareerPath AI Logo" 
                className="h-24 w-24 sm:h-28 sm:w-28 md:h-32 md:w-32 object-contain scale-[3.5] md:scale-[3] origin-left mr-16 sm:mr-24 md:mr-28 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" 
              />
              <span className="block text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 bg-clip-text text-transparent whitespace-nowrap tracking-tight">
                CAREERPATH <span className="text-cyan-300">AI</span>
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
                <>
                  <Link to="/dashboard" className="text-gray-700 hover:text-purple-600 transition font-semibold text-sm flex items-center gap-2">
                    <MdDashboard size={16} />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => navigate('/profile')}
                    className="text-gray-700 hover:text-cyan-600 transition font-semibold text-sm flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-cyan-50"
                    title="Go to Profile"
                  >
                    <FiUser size={18} />
                    Profile
                  </button>
                </>
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
            </div>
          </div>
        </div>
      </header>
      
    </>
  );
};

export default Header;
