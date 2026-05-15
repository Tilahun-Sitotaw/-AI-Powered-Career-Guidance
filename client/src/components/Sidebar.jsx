import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiUser,
  FiTrendingUp,
  FiBook,
  FiAward,
  FiDollarSign,
  FiHelpCircle,
} from 'react-icons/fi';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/profile', label: 'Profile', icon: FiUser },
    { path: '/recommendations', label: 'Career Paths', icon: FiTrendingUp },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="hidden lg:block w-64 bg-white shadow-lg h-screen sticky top-0">
      <div className="p-6">
        <h2 className="text-lg font-bold text-gray-800 mb-8">Menu</h2>
        <nav className="space-y-2">
          {menuItems.map((item) => {
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
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Links */}
        <div className="mt-12 pt-6 border-t">
          <h3 className="text-sm font-semibold text-gray-600 mb-4">Resources</h3>
          <div className="space-y-2">
            <a
              href="#"
              className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <FiBook size={18} />
              <span className="text-sm">Learning Path</span>
            </a>
            <a
              href="#"
              className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <FiAward size={18} />
              <span className="text-sm">Certifications</span>
            </a>
            <a
              href="#"
              className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <FiDollarSign size={18} />
              <span className="text-sm">Salary Insights</span>
            </a>
            <a
              href="#"
              className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
            >
              <FiHelpCircle size={18} />
              <span className="text-sm">Help & Support</span>
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
