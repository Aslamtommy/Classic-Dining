import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../../redux/store';
import { logoutUser } from '../../../redux/userslice';
import { setLocation, clearLocation } from '../../../redux/locationSlice';
import api from '../../../Axios/userInstance';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, User, Wallet, Calendar, MapPin } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import SignupModal from '../SignupForm';
import LoginModal from '../LoginForm';
const GOOGLE_MAPS_API_KEY = "AIzaSyCmtwdLj4ezHr_PmZunPte9-bb14e4OUNU";

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.user);
  const location = useSelector((state: RootState) => state.location);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const handleLogout = async () => {
    try {
      await api.post('/logout');
      dispatch(logoutUser()); // Clears user and location from localStorage
      dispatch(clearLocation()); // Ensure location state is reset
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Failed to log out');
    }
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const toggleLocationDropdown = () => setIsLocationDropdownOpen(!isLocationDropdownOpen);

  const getLocationName = async (lat: number, lng: number) => {
    try {
      const response: any = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
      );
      if (response.data.status === 'OK' && response.data.results.length > 0) {
        const result = response.data.results[0];
        const addressComponents = result.address_components;
        const locality = addressComponents.find((comp: any) => comp.types.includes('locality'))?.long_name;
        const adminArea = addressComponents.find((comp: any) => comp.types.includes('administrative_area_level_1'))?.long_name;
        const neighborhood = addressComponents.find((comp: any) => comp.types.includes('neighborhood'))?.long_name;
        const placeName = locality || neighborhood || adminArea || result.formatted_address.split(',')[0];
        if (placeName.includes('+')) {
          return adminArea || 'Current Location';
        }
        return placeName;
      }
      return null;
    } catch (error) {
      console.error('Error fetching location name:', error);
      return null;
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const locationName = await getLocationName(latitude, longitude);
          dispatch(setLocation({ lat: latitude, lng: longitude, locationName }));
          setIsLocationDropdownOpen(false);
          toast.success(`Location set to ${locationName || 'your current position'}.`);
        },
        (error) => {
          toast.error('Failed to get your location.');
          console.error(error);
        }
      );
    } else {
      toast.error('Geolocation not supported.');
    }
  };

  const handleNearMeClick = () => {
    navigate('/search?nearMe=true');
  };

  // Check if user data is valid
  const isAuthenticated = user && user.name && user.email;
  // Check if location is valid
  const hasValidLocation = location.lat && location.lng && location.locationName;

  return (
    <header className="sticky top-0 bg-white shadow-sm z-50 border-b border-sepia-300">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <nav className="flex justify-between items-center">
          <button onClick={() => navigate('/')} className="flex items-center space-x-2 text-2xl font-semibold tracking-wide text-sepia-900 hover:text-sepia-700 transition-colors">
            <div className="w-10 h-10 bg-sepia-700 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-sepia-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-playfair">CLASSIC DINING</span>
          </button>

          <div className="flex items-center space-x-8">
            <button onClick={() => navigate('/')} className="text-sm text-sepia-900 hover:text-sepia-700 transition-colors">Home</button>
            <button onClick={() => navigate('/menu')} className="text-sm text-sepia-900 hover:text-sepia-700 transition-colors">Menu</button>
            <button onClick={() => navigate('/restaurentList')} className="text-sm text-sepia-900 hover:text-sepia-700 transition-colors">Restaurants</button>

            <button
              onClick={handleNearMeClick}
              className="flex items-center space-x-2 text-sm text-sepia-900 hover:text-sepia-700 transition-colors focus:outline-none"
            >
              <MapPin className="w-4 h-4" />
              <span>Near Me</span>
            </button>

            <div className="relative">
              <button
                onClick={toggleLocationDropdown}
                className="flex items-center space-x-2 text-sm text-sepia-900 hover:text-sepia-700 transition-colors focus:outline-none"
              >
                <MapPin className="w-4 h-4" />
                <span>
                  {hasValidLocation ? location.locationName : 'Set Location'}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {isLocationDropdownOpen && (
                  <motion.div
                    className="absolute right-0 mt-2 w-64 bg-sepia-50 rounded-lg shadow-lg border border-sepia-300 z-50"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-4">
                      <button
                        onClick={handleUseCurrentLocation}
                        className="w-full bg-sepia-700 text-sepia-50 p-2 rounded hover:bg-sepia-800 transition-colors"
                      >
                        Set My Location
                      </button>
                      {hasValidLocation && (
                        <button
                          onClick={() => dispatch(clearLocation())}
                          className="mt-2 w-full bg-sepia-900 text-sepia-50 p-2 rounded hover:bg-sepia-800 transition-colors"
                        >
                          Clear Location
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 text-sm text-sepia-900 hover:text-sepia-700 transition-colors focus:outline-none"
                >
                  <span>Hello, {user.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      className="absolute right-0 mt-2 w-48 bg-sepia-50 rounded-lg shadow-lg border border-sepia-300"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="py-2">
                        <button
                          onClick={() => navigate('/profile')}
                          className="w-full text-left flex items-center px-4 py-2 text-sm text-sepia-900 hover:bg-sepia-100 hover:text-sepia-700 transition-colors"
                        >
                          <User className="w-4 h-4 mr-2" />
                          Profile
                        </button>
                        <button
                          onClick={() => navigate('/wallet')}
                          className="flex items-center px-4 py-2 text-sm text-sepia-900 hover:bg-sepia-100 hover:text-sepia-700 transition-colors"
                        >
                          <Wallet className="w-4 h-4 mr-2" />
                          Wallet
                        </button>
                        <button
                          onClick={() => navigate('/bookings')}
                          className="flex items-center px-4 py-2 text-sm text-sepia-900 hover:bg-sepia-100 hover:text-sepia-700 transition-colors"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Bookings
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left flex items-center px-4 py-2 text-sm text-sepia-900 hover:bg-sepia-100 hover:text-sepia-700 transition-colors"
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
                <button
                  onClick={() => setIsSignupModalOpen(true)}
                  className="text-sm bg-sepia-700 text-sepia-50 py-2 px-6 rounded-lg hover:bg-sepia-800 transition-colors shadow-md"
                >
                  Sign Up
                </button>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-sm bg-sepia-900 text-sepia-50 py-2 px-6 rounded-lg hover:bg-sepia-800 transition-colors shadow-md"
                >
                  Log In
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {isSignupModalOpen && (
          <SignupModal
            show={isSignupModalOpen}
            onClose={() => setIsSignupModalOpen(false)}
            onLoginClick={() => {
              setIsSignupModalOpen(false);
              setIsLoginModalOpen(true);
            }}
          />
        )}
        {isLoginModalOpen && (
          <LoginModal
            show={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            onSignupClick={() => {
              setIsLoginModalOpen(false);
              setIsSignupModalOpen(true);
            }}
          />
        )}
      </AnimatePresence>
    </header>
  );
};
export default Header;