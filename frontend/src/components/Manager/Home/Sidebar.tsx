import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import the useNavigate hook
import { Home, Calendar, Tag, User, Mail, LogOut } from "lucide-react";
import { logoutManager } from "../../../redux/managerSlice";
import { useDispatch } from "react-redux";
const menuItems = [
  { name: "Dashboard", key: "dashboard", icon: <Home size={20} />, path: "/manager/dashboard" },
  { name: "Booking", key: "booking", icon: <Calendar size={20} />, path: "/manager/booking" },
  { name: "Offer", key: "offers", icon: <Tag size={20} />, path: "/manager/offers" },
  { name: "Profile", key: "profile", icon: <User size={20} />, path: "/manager/profile" },  // Added path for Profile
  { name: "Messages", key: "messages", icon: <Mail size={20} />, path: "/manager/messages" },
];

const Sidebar = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const navigate = useNavigate(); // Get the navigate function
  const dispatch = useDispatch();
  const handleNavigation = (path: string, key: string) => {
    setActiveSection(key); // Set active section
    navigate(path); // Navigate to the given path
  };
 


  const handleLogout=()=>{
    dispatch(logoutManager())
    navigate("/manager/login")
  }
  return (
    <aside className="w-72 h-screen bg-white border-r shadow-md flex flex-col justify-between">
      {/* Logo */}
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold tracking-wide">Classic Dining</h1>
      </div>
      
      {/* Menu */}
      <nav className="flex-1 p-4">
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => handleNavigation(item.path, item.key)}
            className={`flex items-center gap-3 w-full p-3 rounded-lg transition text-gray-700 font-medium ${
              activeSection === item.key 
                ? "bg-orange-600 text-white"  // Vintage orange color for active section
                : "hover:bg-gray-200"
            }`}
          >
            {item.icon}
            {item.name}
          </button>
        ))}
      </nav>

   {/* Log Out */}
   <div className="p-4 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full p-3 text-red-600 hover:bg-gray-100 rounded-lg transition"
        >
          <LogOut size={20} />
          Logout
        </button>
        </div>
    </aside>
  );
};

export default Sidebar;
