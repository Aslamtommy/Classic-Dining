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

const GOOGLE_MAPS_API_KEY = "AIzaSyCmtwdLj4ezHr_PmZunPte9-bb14e4OUNU";

const Header: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.user.user);
  const location = useSelector((state: RootState) => state.location);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      dispatch(logoutUser());
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
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

  return (
    <header className="sticky top-0 bg-white shadow-sm z-50 border-b border-[#e8e2d9]">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <nav className="flex justify-between items-center">
          <a href="/" className="flex items-center space-x-2 text-2xl font-semibold tracking-wide text-[#2c2420] hover:text-[#8b5d3b] transition-colors">
            <div className="w-10 h-10 bg-[#8b5d3b] rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-playfair">CLASSIC DINING</span>
          </a>

          <div className="flex items-center space-x-8">
            <a href="/" className="text-sm text-[#2c2420] hover:text-[#8b5d3b] transition-colors">Home</a>
            <a href="/menu" className="text-sm text-[#2c2420] hover:text-[#8b5d3b] transition-colors">Menu</a>
            <a href="/restaurentList" className="text-sm text-[#2c2420] hover:text-[#8b5d3b] transition-colors">Restaurants</a>

            <button
              onClick={handleNearMeClick}
              className="flex items-center space-x-2 text-sm text-[#2c2420] hover:text-[#8b5d3b] transition-colors focus:outline-none"
            >
              <MapPin className="w-4 h-4" />
              <span>Near Me</span>
            </button>

            <div className="relative">
              <button
                onClick={toggleLocationDropdown}
                className="flex items-center space-x-2 text-sm text-[#2c2420] hover:text-[#8b5d3b] transition-colors focus:outline-none"
              >
                <MapPin className="w-4 h-4" />
                <span>
                  {location.lat && location.lng && location.locationName
                    ? location.locationName
                    : location.lat && location.lng
                    ? 'Location Set'
                    : 'Set Location'}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {isLocationDropdownOpen && (
                  <motion.div
                    className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-[#e8e2d9] z-50"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="p-4">
                      <button
                        onClick={handleUseCurrentLocation}
                        className="w-full bg-[#8b5d3b] text-white p-2 rounded hover:bg-[#2c2420] transition-colors"
                      >
                        Set My Location
                      </button>
                      {location.lat && location.lng && (
                        <button
                          onClick={() => dispatch(clearLocation())}
                          className="mt-2 w-full bg-[#2c2420] text-white p-2 rounded hover:bg-[#8b5d3b] transition-colors"
                        >
                          Clear Location
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {user ? (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 text-sm text-[#2c2420] hover:text-[#8b5d3b] transition-colors focus:outline-none"
                >
                  <span>Hello, {user.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
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
                        <a href="/profile" className="flex items-center px-4 py-2 text-sm text-[#2c2420] hover:bg-[#faf7f2] hover:text-[#8b5d3b] transition-colors">
                          <User className="w-4 h-4 mr-2" />
                          Profile
                        </a>
                        <a href="/wallet" className="flex items-center px-4 py-2 text-sm text-[#2c2420] hover:bg-[#faf7f2] hover:text-[#8b5d3b] transition-colors">
                          <Wallet className="w-4 h-4 mr-2" />
                          Wallet
                        </a>
                        <a href="/bookings" className="flex items-center px-4 py-2 text-sm text-[#2c2420] hover:bg-[#faf7f2] hover:text-[#8b5d3b] transition-colors">
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
                <a href="/signup" className="text-sm text-[#8b5d3b] hover:bg-[#2c2420] hover:text-[#faf7f2] py-2 px-4 rounded transition-colors">
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