import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Calendar, Wallet, Settings, LogOut, Utensils, Bell } from 'lucide-react';
import { useSelector } from 'react-redux';

const Sidebar = () => {
  const profile = useSelector((state: any) => state.user.user);
  const navigate = useNavigate();
  console.log(profile);

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <motion.div
      className="bg-white h-[calc(100vh-4rem)] w-72 fixed left-0 top-16 shadow-xl overflow-y-auto border-r border-[#e8e2d9]"
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <div className="p-8 flex flex-col h-full">
        {/* Profile Section */}
        <motion.div
          className="flex items-center gap-4 mb-12"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <img
            src={profile?.profilePicture || '/default-profile.jpg'}
            alt="Profile"
            className="w-14 h-14 rounded-full border-4 border-[#e8e2d9] object-cover shadow-lg"
          />
          <div>
            <h3 className="text-[#2c2420] font-semibold text-lg">{profile?.name || 'User'}</h3>
            <p className="text-[#8b5d3b] text-sm">{profile?.email || 'email@example.com'}</p>
          </div>
        </motion.div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-2">
          {[
            { to: '/profile', icon: <User className="w-5 h-5" />, text: 'Profile' },
            { to: '/bookings', icon: <Calendar className="w-5 h-5" />, text: 'Bookings' },
            { to: '/wallet', icon: <Wallet className="w-5 h-5" />, text: 'Wallet' },
            { to: '/restaurentList', icon: <Utensils className="w-5 h-5" />, text: 'Restaurants' },
            { to: '/search', icon: <Settings className="w-5 h-5" />, text: 'Search Restaurants' },
            { to: '/notifications', icon: <Bell className="w-5 h-5" />, text: 'Notifications' },
          ].map((link, index) => (
            <button
              key={index}
              onClick={() => handleNavigation(link.to)}
              className={`flex items-center gap-4 p-4 rounded-xl transition-all duration-300
                ${window.location.pathname === link.to
                  ? 'bg-gradient-to-r from-[#8b5d3b] to-[#2c2420] text-white shadow-lg'
                  : 'hover:bg-[#faf7f2] text-[#2c2420] hover:text-[#8b5d3b]'
                }`}
            >
              {link.icon}
              <span className="font-medium">{link.text}</span>
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-[#e8e2d9] pt-6">
          <button
            onClick={() => handleNavigation('/logout')}
            className="flex items-center gap-4 p-4 rounded-xl text-[#2c2420] hover:bg-[#faf7f2] hover:text-[#8b5d3b] transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
          <p className="text-[#8b5d3b] text-sm text-center mt-4">
            © 2024 Classic Dining
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;