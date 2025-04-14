// src/components/Sidebar.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Calendar, Tag, User, Mail, LogOut } from "lucide-react";
import { logoutRestaurent } from "../../../redux/restaurentSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import restaurentApi from "../../../Axios/restaurentInstance";

const Sidebar = () => {
  const { restaurent, role } = useSelector((state: RootState) => state.restaurent);
  const isBranch = role === "branch";
  const branchId = restaurent?._id; // Branch ID from Redux store

  // Restaurant-specific menu items
  const restaurantMenuItems = [
    { name: "Dashboard", key: "dashboard", icon: <Home size={24} />, path: "/restaurent/dashboard" },
    { name: "Profile", key: "profile", icon: <User size={24} />, path: "/restaurent/profile" },
    { name: "Add Branch", key: "addbranch", icon: <Tag size={24} />, path: "/restaurent/addbranch" },
    { name: "Branches", key: "branches", icon: <User size={24} />, path: "/restaurent/branches" },
    { name: "Chat with Branches", key: "chat-branches", icon: <Mail size={24} />, path: "/restaurant/chat" },
    { name: 'Chat with Admins', key: 'chat-admins', icon: <Mail size={24} />, path: '/restaurent/chats/admins' },  
  ];

  // Branch-specific menu items
  const branchMenuItems = [
    { name: "Dashboard", key: "dashboard", icon: <Home size={24} />, path: "/branches/dashboard" },
    { name: "Bookings", key: "bookings", icon: <Calendar size={24} />, path: `/branches/${branchId}/bookings` },
    { name: "Chat with Users", key: "chat-users", icon: <Mail size={24} />, path: `/branch/chat/users` },
    { name: "Chat with Restaurant", key: "chat-restaurant", icon: <Mail size={24} />, path: `/branch/chat/restaurant` },
    { name: "Profile", key: "profile", icon: <User size={24} />, path: "/branches/profile" },
  ];

  const menuItems = isBranch ? branchMenuItems : restaurantMenuItems;

  const [activeSection, setActiveSection] = useState("dashboard");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleNavigation = (path: string, key: string) => {
    setActiveSection(key);
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await restaurentApi.post("/logout");
      await dispatch(logoutRestaurent());
      navigate("/restaurent/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <aside className="w-72 h-screen bg-white border-r border-[#e8e2d9] shadow-md flex flex-col justify-between fixed top-0 left-0">
      {/* Header */}
      <div className="p-6 border-b border-[#e8e2d9]">
        <h1 className="text-2xl font-serif font-semibold text-[#2c2420] tracking-tight">
          Classic Dining
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => handleNavigation(item.path, item.key)}
            className={`flex items-center gap-4 w-full p-3 rounded-lg transition-all duration-300 text-[#8b5d3b] hover:bg-[#f4ede8] ${
              activeSection === item.key
                ? "bg-[#d4a373] text-white hover:bg-[#d4a373]"
                : "hover:text-[#2c2420]"
            }`}
          >
            {item.icon}
            <span className="text-sm font-medium">{item.name}</span>
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-[#e8e2d9]">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 w-full p-3 text-[#e63946] hover:bg-[#f4ede8] hover:text-[#f17c85] rounded-lg transition-all duration-300"
        >
          <LogOut size={24} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;