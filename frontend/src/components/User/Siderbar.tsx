import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { User, Calendar, Wallet, Settings, LogOut, Utensils } from 'lucide-react'; // Added Utensils for Restaurants
import { useSelector } from 'react-redux';

const Sidebar = () => {
  const profile = useSelector((state: any) => state.user.user);
  console.log(profile);

  return (
    <motion.div
      className="bg-white h-screen w-72 fixed left-0 top-0 shadow-xl overflow-hidden border-r border-[#e8e2d9]"
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
            src={profile.profilePicture}
            alt="Profile"
            className="w-14 h-14 rounded-full border-4 border-[#e8e2d9] object-cover shadow-lg"
          />
          <div>
            <h3 className="text-[#2c2420] font-semibold text-lg">{profile.name}</h3>
            <p className="text-[#8b5d3b] text-sm">{profile.email}</p>
          </div>
        </motion.div>

        {/* Navigation Links */}
        <nav className="space-y-3 flex-1">
          {[
            { to: '/profile', icon: <User className="w-5 h-5" />, text: 'Profile' },
            { to: '/bookings', icon: <Calendar className="w-5 h-5" />, text: 'Bookings' },
            { to: '/wallet', icon: <Wallet className="w-5 h-5" />, text: 'Wallet' },
            { to: '/restaurentList', icon: <Utensils className="w-5 h-5" />, text: 'Restaurants' }, // Added Restaurants
            { to: '/settings', icon: <Settings className="w-5 h-5" />, text: 'Settings' },
          ].map((link, index) => (
            <NavLink
              key={index}
              to={link.to}
              replace
              className={({ isActive }) =>
                `flex items-center gap-4 p-4 rounded-xl transition-all duration-300
                ${isActive
                  ? 'bg-gradient-to-r from-[#8b5d3b] to-[#2c2420] text-white shadow-lg'
                  : 'hover:bg-[#faf7f2] text-[#2c2420] hover:text-[#8b5d3b]'
                }`
              }
            >
              {link.icon}
              <span className="font-medium">{link.text}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-[#e8e2d9] pt-6">
          <NavLink
            to="/logout"
            replace
            className="flex items-center gap-4 p-4 rounded-xl text-[#2c2420] hover:bg-[#faf7f2] hover:text-[#8b5d3b] transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </NavLink>
          <p className="text-[#8b5d3b] text-sm text-center mt-4">
            © 2024 Classic Dining
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;