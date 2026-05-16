import React from 'react';
import { Link } from 'react-router-dom';
import { FiGithub, FiLinkedin, FiTwitter, FiMail } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="bg-slate-950 text-white border-t border-cyan-500 border-opacity-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">CareerPath AI</h3>
            <p className="text-gray-400 text-sm">
              AI-powered career guidance system helping students find their perfect career path.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-cyan-400">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-cyan-400 transition">Home</Link></li>
              <li><Link to="/about" className="hover:text-cyan-400 transition">About</Link></li>
              <li><Link to="/login" className="hover:text-cyan-400 transition">Login</Link></li>
              <li><Link to="/register" className="hover:text-cyan-400 transition">Register</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4 text-cyan-400">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-cyan-400 transition">Learning Paths</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition">Interview Prep</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition">Skill Gap Analysis</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition">Salary Insights</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-cyan-400">Connect With Us</h4>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition">
                <FiGithub size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition">
                <FiLinkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition">
                <FiTwitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-cyan-400 transition">
                <FiMail size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-cyan-500 border-opacity-20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 CareerPath AI. All rights reserved. | Team: BrainWave Builders
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0 text-sm text-gray-400">
              <Link to="/privacy" className="hover:text-cyan-400 transition">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-cyan-400 transition">Terms of Service</Link>
              <a href="mailto:contact@careerpath.ai" className="hover:text-cyan-400 transition">Contact</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
