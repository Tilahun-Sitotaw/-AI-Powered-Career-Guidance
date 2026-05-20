import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  FiHome,
  FiUser,
  FiTrendingUp,
  FiBook,
  FiBarChart2,
  FiMessageSquare,
  FiAward,
  FiBriefcase,
  FiClipboard,
  FiSearch,
  FiLogOut,
} from 'react-icons/fi';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const mainItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/profile', label: 'Profile', icon: FiUser },
  ];

  const recommendationItems = [
    { path: '/career-paths', label: 'Career Paths', icon: FiTrendingUp },
    { path: '/skill-examination', label: 'Skill Examination', icon: FiClipboard },
    { path: '/skill-gap-analysis', label: 'Skill Gaps', icon: FiBarChart2 },
    { path: '/learning-paths', label: 'Learning Paths', icon: FiBook },
    { path: '/internships', label: 'Internship Opportunities', icon: FiBriefcase },
    { path: '/scholarships', label: '🎓 Scholarships', icon: FiAward },
    { path: '/job-opportunities', label: 'Job Opportunities', icon: FiSearch },
    { path: '/interview-prep', label: 'Interview Preparation', icon: FiMessageSquare },
  ];

  const isActive = (path) => location.pathname === path;

  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile hamburger and drawer (small screens only) */}
      <div className="lg:hidden">
        <div className="fixed top-3 left-3 z-50">
          <button
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
            className="p-2 bg-white rounded-md shadow text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Drawer backdrop */}
        {mobileOpen && (
          <div className="fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black opacity-30" onClick={() => setMobileOpen(false)} />

            <nav className="absolute left-0 top-0 h-full w-64 bg-white shadow-lg p-6 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <div className="font-bold text-lg">Menu</div>
                <button onClick={() => setMobileOpen(false)} className="p-2 rounded-md hover:bg-gray-100">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-2 mb-4">
                {mainItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                        isActive(item.path) ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={18} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Recommendations</h2>
              <div className="space-y-1">
                {recommendationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                        isActive(item.path) ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon size={16} />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-6 pt-4 border-t">
                <button
                  onClick={() => { setMobileOpen(false); handleLogout(); }}
                  className="flex items-center space-x-3 px-3 py-2 w-full text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <FiLogOut size={16} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>

      <aside className="hidden lg:flex flex-col w-64 bg-white shadow-lg flex-shrink-0 overflow-hidden"
        style={{ height: 'calc(100vh - 64px)', position: 'sticky', top: '64px' }}>
        <div className="p-6 pt-2 flex flex-col h-full overflow-y-auto">
        <nav className="space-y-1 mb-6">
            {mainItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

        {/* Recommendations */}
        <div className="mb-6 pt-4 border-t">
          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Recommendations</h2>
          <nav className="space-y-1">
            {recommendationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={18} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout */}
        <div className="mt-auto pt-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-3 px-4 py-3 w-full text-red-500 hover:bg-red-50 rounded-lg transition"
          >
            <FiLogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>

      </div>
    </aside>
    </>
  );
};

export default Sidebar;
