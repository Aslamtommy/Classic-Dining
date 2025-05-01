"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { motion, AnimatePresence } from "framer-motion"
import { BarChart4, Store, Tag, User, MessageSquare, Mail, Bell, LogOut, Calendar, Menu, X } from "lucide-react"
import { logoutRestaurent } from "../../../redux/restaurentSlice"
import type { RootState } from "../../../redux/store"
import restaurentApi from "../../../Axios/restaurentInstance"

const Sidebar = () => {
  const { restaurent, role } = useSelector((state: RootState) => state.restaurent)
  const isBranch = role === "branch"
  const branchId = restaurent?._id // Branch ID from Redux store
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("dashboard")
  const navigate = useNavigate()
  const dispatch = useDispatch()

  // Restaurant-specific menu items
  const restaurantMenuItems = [
    { name: "Dashboard", key: "dashboard", icon: <BarChart4 size={20} />, path: "/restaurent/dashboard" },
    { name: "Profile", key: "profile", icon: <User size={20} />, path: "/restaurent/profile" },
    { name: "Add Branch", key: "addbranch", icon: <Store size={20} />, path: "/restaurent/addbranch" },
    { name: "Branches", key: "branches", icon: <Tag size={20} />, path: "/restaurent/branches" },
    { name: "Chat with Branches", key: "chat-branches", icon: <MessageSquare size={20} />, path: "/restaurant/chat" },
    { name: "Chat with Admins", key: "chat-admins", icon: <Mail size={20} />, path: "/restaurent/chats/admins" },
    { name: "Notifications", key: "notifications", icon: <Bell size={20} />, path: "/restaurent/notifications" },
  ]

  // Branch-specific menu items
  const branchMenuItems = [
    { name: "Dashboard", key: "dashboard", icon: <BarChart4 size={20} />, path: "/branches/dashboard" },
    { name: "Bookings", key: "bookings", icon: <Calendar size={20} />, path: `/branches/${branchId}/bookings` },
    { name: "Tables", key: "tables", icon: <Store size={20} />, path: `/branches/${branchId}/tables` },
    { name: "Chat with Users", key: "chat-users", icon: <MessageSquare size={20} />, path: `/branch/chat/users` },
    { name: "Chat with Restaurant", key: "chat-restaurant", icon: <Mail size={20} />, path: `/branch/chat/restaurant` },
    { name: "Profile", key: "profile", icon: <User size={20} />, path: "/branches/profile" },
    { name: "Notifications", key: "notifications", icon: <Bell size={20} />, path: "/branch/notifications" },
  ]

  const menuItems = isBranch ? branchMenuItems : restaurantMenuItems

  const handleNavigation = (path: string, key: string) => {
    setActiveSection(key)
    navigate(path)
    if (window.innerWidth < 1024) {
      setMobileOpen(false)
    }
  }

  const handleLogout = async () => {
    try {
      await restaurentApi.post("/logout")
      await dispatch(logoutRestaurent())
      navigate("/restaurent/login")
    } catch (error) {
      console.error("Error during logout:", error)
    }
  }

  // Mobile overlay
  const MobileOverlay = () => (
    <AnimatePresence>
      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
    </AnimatePresence>
  )

  // Mobile menu button
  const MobileMenuButton = () => (
    <button
      onClick={() => setMobileOpen(true)}
      className="fixed top-4 left-4 z-30 lg:hidden bg-white p-2 rounded-full shadow-md"
    >
      <Menu className="h-6 w-6 text-amber-800" />
    </button>
  )

  return (
    <>
      <MobileOverlay />
      <MobileMenuButton />

      <aside
        className={`fixed top-0 left-0 h-screen w-72 bg-white border-r border-amber-100 shadow-xl z-50 transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 right-4 lg:hidden text-amber-800 hover:text-amber-900"
        >
          <X size={24} />
        </button>

        {/* Logo */}
        <div className="p-6 border-b border-amber-100">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-800 rounded-full flex items-center justify-center shadow-md">
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
            <div className="ml-3">
              <h1 className="text-xl font-bold text-black">Classic Dining</h1>
              <p className="mt-1 text-xs text-gray-600">{isBranch ? "Branch Management" : "Restaurant Management"}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <motion.button
              key={item.key}
              onClick={() => handleNavigation(item.path, item.key)}
              className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-300 ${
                activeSection === item.key
                  ? "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md"
                  : "text-black hover:bg-amber-50"
              }`}
              whileHover={{ x: activeSection === item.key ? 0 : 5 }}
              whileTap={{ scale: 0.98 }}
            >
              {item.icon}
              <span className="text-sm font-medium">{item.name}</span>
            </motion.button>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-amber-100">
          <div className="flex items-center mb-4 p-3 bg-amber-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center">
              <User size={18} className="text-amber-700" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-black truncate max-w-[180px]">
                {restaurent?.name || "Restaurant"}
              </p>
              <p className="text-xs text-gray-600">{isBranch ? "Branch Admin" : "Restaurant Owner"}</p>
            </div>
          </div>

          <motion.button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full p-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300"
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </motion.button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
