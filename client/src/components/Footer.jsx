import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiMail, FiInstagram, FiPhone } from 'react-icons/fi';
import { SiSkype } from 'react-icons/si';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-white border-t border-cyan-500 border-opacity-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand with Logo */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src="/Logo.png" alt="CareerPath AI Logo" className="h-10 w-10" />
              <h3 className="text-lg font-bold bg-gradient-to-r from-cyan-500 to-blue-600 bg-clip-text text-transparent">CareerPath AI</h3>
            </div>
            <p className="text-gray-400 text-sm">
              AI-powered career guidance system helping students find their perfect career path.
            </p>

            {/* Contact & Support - Left Side */}
            <div className="mt-6 pt-6 border-t border-cyan-500 border-opacity-20">
              <h4 className="font-semibold mb-3 text-cyan-400">Contact & Support</h4>
              <div className="space-y-3">
                {/* Phone Numbers */}
                <div className="flex items-center space-x-2">
                  <FiPhone size={18} className="text-cyan-400" />
                  <div className="text-sm text-gray-400">
                    <a href="tel:+251985076701" className="hover:text-cyan-400 transition block">
                      +251 98 507 6701
                    </a>
                    <a href="tel:+251960286319" className="hover:text-cyan-400 transition block">
                      +251 96 028 6319
                    </a>
                  </div>
                </div>
                {/* Skype - Desktop only */}
                <div className="hidden md:flex items-center space-x-2">
                  <SiSkype size={18} className="text-cyan-400" />
                  <a href="skype:+251985076701?call" className="text-sm text-gray-400 hover:text-cyan-400 transition">
                    Skype Call
                  </a>
                </div>
                {/* Email Addresses */}
                <div className="flex items-center space-x-2">
                  <FiMail size={18} className="text-cyan-400" />
                  <div className="text-sm text-gray-400">
                    <a href="mailto:careerepathai@gmail.com" className="hover:text-cyan-400 transition block">
                      careerepathai@gmail.com
                    </a>
                    <a href="mailto:bereketmillion8@gmail.com" className="hover:text-cyan-400 transition block">
                      bereketmillion8@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-cyan-400">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/" className="hover:text-cyan-400 transition">Home</Link></li>
              <li><Link to="/about" className="hover:text-cyan-400 transition">About</Link></li>
              <li><Link to="/login" className="hover:text-cyan-400 transition">Login</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4 text-cyan-400">Resources</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/learning-paths" className="hover:text-cyan-400 transition">Learning Paths</Link></li>
              <li><Link to="/interview-prep" className="hover:text-cyan-400 transition">Interview Prep</Link></li>
              <li><Link to="/skill-gap-analysis" className="hover:text-cyan-400 transition">Skill Gap Analysis</Link></li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h4 className="font-semibold mb-4 text-cyan-400">Follow Us</h4>
            <div className="flex space-x-4">
              <a href="https://github.com/Tilahun-Sitotaw" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan-400 transition" title="GitHub">
                <FiGithub size={20} />
              </a>
              <a href="https://twitter.com/sitotaw_ti1319" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan-400 transition" title="Twitter">
                <FiTwitter size={20} />
              </a>
              <a href="https://instagram.com/Tilahun Sitotawan" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-cyan-400 transition" title="Instagram">
                <FiInstagram size={20} />
              </a>
              <a href="mailto:careerepathai@gmail.com" className="text-gray-400 hover:text-cyan-400 transition" title="Email">
                <FiMail size={20} />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-cyan-500 border-opacity-20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} CareerPath AI. All rights reserved. | Team: BrainWave Builders
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0 text-sm text-gray-400">
              <Link to="/privacy" className="hover:text-cyan-400 transition">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-cyan-400 transition">Terms of Service</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
