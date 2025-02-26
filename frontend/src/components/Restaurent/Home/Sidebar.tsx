import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Home, Calendar, Tag, User, Mail, LogOut } from "lucide-react";
import { logoutRestaurent } from "../../../redux/restaurentSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import restaurentApi from "../../../Axios/restaurentInstance";

const Sidebar = () => {
  const { restaurent } = useSelector((state: RootState) => state.restaurent);
  const isBranch = restaurent?.role === "branch";
  const branchId = restaurent?._id; // Branch ID from Redux store

  const menuItems = [
    { name: "Dashboard", key: "dashboard", icon: <Home size={20} />, path: "/restaurent/dashboard" },
    {
      name: "Bookings",
      key: "bookings",
      icon: <Calendar size={20} />,
      path: isBranch ? `/restaurent/branches/${branchId}/bookings` : "/restaurent/bookings",
    },
    // Restaurant-only items
    ...(!isBranch
      ? [
          { name: "Add Branch", key: "addbranch", icon: <Tag size={20} />, path: "/restaurent/addbranch" },
          { name: "Profile", key: "profile", icon: <User size={20} />, path: "/restaurent/profile" },
          { name: "Branches", key: "branches", icon: <User size={20} />, path: "/restaurent/branches" },
          { name: "Messages", key: "messages", icon: <Mail size={20} />, path: "/restaurent/messages" },
        ]
      : []),
  ];

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
    <aside className="w-72 h-screen bg-white border-r shadow-md flex flex-col justify-between">
      <div className="p-6 border-b">
        <h1 className="text-xl font-bold tracking-wide">Classic Dining</h1>
      </div>
      <nav className="flex-1 p-4">
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => handleNavigation(item.path, item.key)}
            className={`flex items-center gap-3 w-full p-3 rounded-lg transition text-gray-700 font-medium ${
              activeSection === item.key ? "bg-orange-600 text-white" : "hover:bg-gray-200"
            }`}
          >
            {item.icon}
            {item.name}
          </button>
        ))}
      </nav>
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