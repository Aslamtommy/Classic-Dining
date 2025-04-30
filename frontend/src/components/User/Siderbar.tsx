"use client"

import React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { RootState } from "../../redux/store"
import { logoutUser } from "../../redux/userslice"
import { motion } from "framer-motion"
import { User, Calendar, Wallet, LogOut, Utensils, Bell, ChevronRight, Home, Search, Menu, X } from "lucide-react"
import toast from "react-hot-toast"

interface SidebarProps {
  isCollapsed: boolean
  toggleSidebar: () => void
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, toggleSidebar }) => {
  const profile = useSelector((state: RootState) => state.user.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth < 1024) {
        setIsMobileOpen(false) // Close mobile menu on resize to mobile
      }
    }

    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  const handleNavigation = (path: string) => {
    if (path === "/logout") {
      try {
        dispatch(logoutUser())
        toast.success("Logged out successfully")
        navigate("/")
      } catch (error) {
        toast.error("Failed to log out")
      }
    } else {
      navigate(path)
    }
    if (isMobile) {
      setIsMobileOpen(false)
    }
  }

  // Animation variants
  const sidebarVariants = {
    expanded: {
      width: "280px",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    collapsed: {
      width: "80px",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  }

  const itemVariants = {
    expanded: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    collapsed: {
      opacity: 0,
      x: -10,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  }

  const iconVariants = {
    expanded: { marginRight: "16px" },
    collapsed: { marginRight: "0" },
  }

  const navItems = [
    { to: "/", icon: <Home className="w-5 h-5" />, text: "Home" },
    { to: "/profile", icon: <User className="w-5 h-5" />, text: "Profile" },
    { to: "/bookings", icon: <Calendar className="w-5 h-5" />, text: "Bookings" },
    { to: "/wallet", icon: <Wallet className="w-5 h-5" />, text: "Wallet" },
    { to: "/restaurentList", icon: <Utensils className="w-5 h-5" />, text: "Restaurants" },
    { to: "/search", icon: <Search className="w-5 h-5" />, text: "Search" },
    { to: "/notifications", icon: <Bell className="w-5 h-5" />, text: "Notifications" },
  ]

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={toggleMobileMenu}
          className="fixed top-4 left-4 z-50 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-lg border border-gold-200"
          aria-label="Toggle menu"
        >
          {isMobileOpen ? <X className="w-6 h-6 text-sepia-900" /> : <Menu className="w-6 h-6 text-sepia-900" />}
        </button>
      )}

      {/* Sidebar for Desktop */}
      <motion.div
        className={`fixed top-0 left-0 h-full bg-white/90 backdrop-blur-md border-r border-sepia-200 shadow-md z-40 overflow-hidden ${
          isMobile ? "hidden" : "flex"
        }`}
        variants={sidebarVariants}
        initial={isCollapsed ? "collapsed" : "expanded"}
        animate={isCollapsed ? "collapsed" : "expanded"}
      >
        <div className="flex flex-col h-full w-full relative">
          {/* Toggle Button */}
          <button
            onClick={toggleSidebar}
            className="absolute top-6 right-4 p-1.5 rounded-full bg-sepia-50 hover:bg-sepia-100 transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronRight
              className={`w-4 h-4 text-sepia-700 transition-transform duration-300 ${isCollapsed ? "" : "rotate-180"}`}
            />
          </button>

          {/* Logo */}
          <div className="flex items-center h-20 px-6 border-b border-gold-200">
            <div className="w-10 h-10 bg-gradient-to-br from-sepia-700 to-sepia-900 rounded-full flex items-center justify-center shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-sepia-100"
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
            <motion.span
              className="ml-3 font-playfair text-xl font-semibold text-sepia-900"
              variants={itemVariants}
              initial={isCollapsed ? "collapsed" : "expanded"}
              animate={isCollapsed ? "collapsed" : "expanded"}
            >
              Classic Dining
            </motion.span>
          </div>

          {/* Profile Section */}
          <div className="mt-6 px-4">
            <div
              className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
                isCollapsed ? "p-2" : "p-4"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-sepia-100/80 to-sepia-200/80 rounded-xl" />
              <div className="relative flex items-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-sepia-300 to-sepia-500 blur-sm opacity-70" />
                  <img
                    src={profile?.profilePicture || "/default-profile.jpg"}
                    alt="Profile"
                    className={`relative rounded-full border-2 border-white object-cover shadow-md transition-all duration-300 ${
                      isCollapsed ? "w-10 h-10" : "w-14 h-14"
                    }`}
                  />
                </div>
                <motion.div
                  className="ml-3"
                  variants={itemVariants}
                  initial={isCollapsed ? "collapsed" : "expanded"}
                  animate={isCollapsed ? "collapsed" : "expanded"}
                >
                  <h3 className="text-sepia-900 font-playfair font-semibold text-lg truncate max-w-[160px]">
                    {profile?.name || "User"}
                  </h3>
                  <p className="text-sepia-700 text-sm truncate max-w-[160px]">
                    {profile?.email || "email@example.com"}
                  </p>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 mt-6 px-3">
            <div className="space-y-1.5">
              {navItems.map((link, index) => {
                const isActive = window.location.pathname === link.to
                return (
                  <button
                    key={index}
                    onClick={() => handleNavigation(link.to)}
                    className={`group flex items-center w-full rounded-lg transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-sepia-700 to-sepia-900 text-white shadow-md py-3 px-4"
                        : "hover:bg-sepia-50 text-sepia-900 hover:text-sepia-700 py-3 px-4"
                    }`}
                  >
                    <motion.div
                      className={`${
                        isActive ? "text-sepia-200" : "text-sepia-700 group-hover:text-sepia-600"
                      } transition-colors duration-300`}
                      variants={iconVariants}
                      initial={isCollapsed ? "collapsed" : "expanded"}
                      animate={isCollapsed ? "collapsed" : "expanded"}
                    >
                      {link.icon}
                    </motion.div>
                    <motion.span
                      className="font-medium"
                      variants={itemVariants}
                      initial={isCollapsed ? "collapsed" : "expanded"}
                      animate={isCollapsed ? "collapsed" : "expanded"}
                    >
                      {link.text}
                    </motion.span>

                    {isActive && !isCollapsed && (
                      <motion.div
                        className="ml-auto w-1.5 h-1.5 rounded-full bg-sepia-200"
                        layoutId="activeNavIndicator"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="mt-auto pt-6 px-3 pb-6 border-t border-gold-200">
            <button
              onClick={() => handleNavigation("/logout")}
              className="flex items-center w-full rounded-lg text-sepia-900 hover:bg-red-50 hover:text-red-700 transition-all duration-300 py-3 px-4"
            >
              <motion.div
                className="text-bronze-700"
                variants={iconVariants}
                initial={isCollapsed ? "collapsed" : "expanded"}
                animate={isCollapsed ? "collapsed" : "expanded"}
              >
                <LogOut className="w-5 h-5" />
              </motion.div>
              <motion.span
                className="font-medium"
                variants={itemVariants}
                initial={isCollapsed ? "collapsed" : "expanded"}
                animate={isCollapsed ? "collapsed" : "expanded"}
              >
                Logout
              </motion.span>
            </button>

            {!isCollapsed && (
              <motion.div
                className="mt-6 text-center"
                variants={itemVariants}
                initial={isCollapsed ? "collapsed" : "expanded"}
                animate={isCollapsed ? "collapsed" : "expanded"}
              >
                <p className="text-bronze-700 text-xs">© 2024 Classic Dining</p>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Mobile Sidebar (Slide-in) */}
      <motion.div
        className={`fixed inset-0 bg-black/50 z-40 ${isMobileOpen ? "block" : "hidden"}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isMobileOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        onClick={() => setIsMobileOpen(false)}
      />

      <motion.div
        className={`fixed top-0 left-0 h-full w-[280px] bg-white/95 backdrop-blur-md border-r border-gold-200 shadow-2xl z-50 overflow-hidden ${
          isMobileOpen ? "block" : "hidden"
        }`}
        initial={{ x: "-100%" }}
        animate={{ x: isMobileOpen ? 0 : "-100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex flex-col h-full w-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-gold-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gradient-to-br from-sepia-700 to-sepia-900 rounded-full flex items-center justify-center shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6 text-gold-300"
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
              <span className="ml-3 font-playfair text-xl font-semibold text-sepia-900">Classic Dining</span>
            </div>
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-1.5 rounded-full bg-sepia-50 hover:bg-sepia-100 transition-colors"
            >
              <X className="w-5 h-5 text-sepia-700" />
            </button>
          </div>

          {/* Profile Section */}
          <div className="mt-6 px-4">
            <div className="relative rounded-xl overflow-hidden p-4">
              <div className="absolute inset-0 bg-gradient-to-r from-sepia-100/80 to-gold-100/80 rounded-xl" />
              <div className="relative flex items-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gold-300 to-gold-500 blur-sm opacity-70" />
                  <img
                    src={profile?.profilePicture || "/default-profile.jpg"}
                    alt="Profile"
                    className="relative w-14 h-14 rounded-full border-2 border-white object-cover shadow-md"
                  />
                </div>
                <div className="ml-3">
                  <h3 className="text-sepia-900 font-playfair font-semibold text-lg truncate max-w-[160px]">
                    {profile?.name || "User"}
                  </h3>
                  <p className="text-bronze-700 text-sm truncate max-w-[160px]">
                    {profile?.email || "email@example.com"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 mt-6 px-3">
            <div className="space-y-1.5">
              {navItems.map((link, index) => {
                const isActive = window.location.pathname === link.to
                return (
                  <button
                    key={index}
                    onClick={() => handleNavigation(link.to)}
                    className={`group flex items-center w-full rounded-lg transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-sepia-700 to-sepia-900 text-white shadow-md py-3 px-4"
                        : "hover:bg-sepia-50 text-sepia-900 hover:text-gold-700 py-3 px-4"
                    }`}
                  >
                    <div
                      className={`${
                        isActive ? "text-gold-300" : "text-bronze-700 group-hover:text-gold-500"
                      } transition-colors duration-300 mr-4`}
                    >
                      {link.icon}
                    </div>
                    <span className="font-medium">{link.text}</span>

                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-gold-300" />}
                  </button>
                )
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="mt-auto pt-6 px-3 pb-6 border-t border-gold-200">
            <button
              onClick={() => handleNavigation("/logout")}
              className="flex items-center w-full rounded-lg text-sepia-900 hover:bg-red-50 hover:text-red-700 transition-all duration-300 py-3 px-4"
            >
              <div className="text-bronze-700 mr-4">
                <LogOut className="w-5 h-5" />
              </div>
              <span className="font-medium">Logout</span>
            </button>

            <div className="mt-6 text-center">
              <p className="text-bronze-700 text-xs">© 2024 Classic Dining</p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

export default Sidebar