import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../../redux/store';
import { logoutUser } from '../../../redux/userslice';
import api from '../../../Axios/userInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, User, Wallet, Calendar } from 'lucide-react';

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.user);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      dispatch(logoutUser());
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <header className="sticky top-0 bg-white shadow-sm z-50 border-b border-[#e8e2d9]">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <nav className="flex justify-between items-center">
          {/* Simple and Catchy Logo */}
          <a
            href="/"
            className="flex items-center space-x-2 text-2xl font-semibold tracking-wide text-[#2c2420] hover:text-[#8b5d3b] transition-colors"
          >
            {/* Icon */}
            <div className="w-10 h-10 bg-[#8b5d3b] rounded-full flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>

            {/* Logo Text */}
            <span className="font-playfair">CLASSIC DINING</span>
          </a>

          {/* Navigation Links */}
          <div className="flex items-center space-x-8">
            <a
              href="/"
              className="text-sm text-[#2c2420] hover:text-[#8b5d3b] transition-colors"
            >
              Home
            </a>
            <a
              href="/menu"
              className="text-sm text-[#2c2420] hover:text-[#8b5d3b] transition-colors"
            >
              Menu
            </a>
            <a
              href="/reservations"
              className="text-sm text-[#2c2420] hover:text-[#8b5d3b] transition-colors"
            >
              Reservations
            </a>

            {/* User Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 text-sm text-[#2c2420] hover:text-[#8b5d3b] transition-colors focus:outline-none"
                >
                  <span>Hello, {user.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#e8e2d9]"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="py-2">
                        <a
                          href="/profile"
                          className="flex items-center px-4 py-2 text-sm text-[#2c2420] hover:bg-[#faf7f2] hover:text-[#8b5d3b] transition-colors"
                        >
                          <User className="w-4 h-4 mr-2" />
                          Profile
                        </a>
                        <a
                          href="/wallet"
                          className="flex items-center px-4 py-2 text-sm text-[#2c2420] hover:bg-[#faf7f2] hover:text-[#8b5d3b] transition-colors"
                        >
                          <Wallet className="w-4 h-4 mr-2" />
                          Wallet
                        </a>
                        <a
                          href="/booking"
                          className="flex items-center px-4 py-2 text-sm text-[#2c2420] hover:bg-[#faf7f2] hover:text-[#8b5d3b] transition-colors"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Bookings
                        </a>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center px-4 py-2 text-sm text-[#2c2420] hover:bg-[#faf7f2] hover:text-[#8b5d3b] transition-colors"
                        >
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <a
                  href="/signup"
                  className="text-sm text-[#8b5d3b] hover:bg-[#2c2420] hover:text-[#faf7f2] py-2 px-4 rounded transition-colors"
                >
                  Register
                </a>
                <button
                  onClick={() => navigate('/login')}
                  className="text-sm text-[#8b5d3b] hover:bg-[#2c2420] hover:text-[#faf7f2] py-2 px-4 rounded transition-colors"
                >
                  Login
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;