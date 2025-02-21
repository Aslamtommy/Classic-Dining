import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import the useNavigate hook
import { Home, Calendar, Tag, User, Mail, LogOut } from "lucide-react";
import { logoutRestaurent } from "../../../redux/restaurentSlice";
import { useDispatch } from "react-redux";
 import { useSelector } from "react-redux";
 import { RootState } from "../../../redux/store";
import restaurentApi from "../../../Axios/restaurentInstance";


const Sidebar = () => {

  const { restaurent } = useSelector((state: RootState) => state.restaurent);
const isBranch = restaurent?.role === "branch";
const menuItems = [
  { name: "Dashboard", key: "dashboard", icon: <Home size={20} />, path: "/restaurent/dashboard" },
  { name: "Bookings", key: "booking", icon: <Calendar size={20} />, path: "/restaurent/booking" },
  ...(!isBranch ? [
    { name: "AddBranch", key: "branch", icon: <Tag size={20} />, path: "/restaurent/addbranch" }
  ] : []),
...(!isBranch?[ { name: "Profile", key: "profile", icon: <User size={20} />, path: "/restaurent/profile" }]:[])
 ,
 ...(!isBranch?[ { name: "Branches", key: "branches", icon: <User size={20} />, path: "/restaurent/branches" }]:[])
 ,


  ...(!isBranch ? [
    { name: "Messages", key: "messages", icon: <Mail size={20} />, path: "/restaurent/messages" }
  ] : [])
];

  const [activeSection, setActiveSection] = useState("dashboard");
  const navigate = useNavigate(); // Get the navigate function
  const dispatch = useDispatch();
  const handleNavigation = (path: string, key: string) => {
    setActiveSection(key); // Set active section
    navigate(path); // Navigate to the given path
  };
 


  const handleLogout=async ()=>{

    try {
    await restaurentApi.post('/logout')
     await dispatch(logoutRestaurent())
      navigate("/restaurent/login")
    } catch (error) {
      console.error("Error during logout:", error);
    }

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
