import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiHome,
  FiUser,
  FiTrendingUp,
  FiBook,
  FiBarChart2,
  FiMessageSquare,
  FiAward,
  FiBriefcase,
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
    { path: '/learning-paths', label: 'Learning Paths', icon: FiBook },
    { path: '/internships', label: 'Internship Opportunities', icon: FiBriefcase },
    { path: '/skill-gap-analysis', label: 'Skill Gaps', icon: FiBarChart2 },
    { path: '/interview-prep', label: 'Interview Preparation', icon: FiMessageSquare },
    { path: '/scholarships', label: '🎓 Scholarships', icon: FiAward },
  ];

  const isActive = (path) => location.pathname === path;

  return (
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
  );
};

export default Sidebar;
