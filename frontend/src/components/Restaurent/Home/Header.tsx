"use client"

import { useSelector } from "react-redux"
import { motion } from "framer-motion"
import { Bell, Search } from "lucide-react"
import type { RootState } from "../../../redux/store"

const Header = () => {
  const { restaurent, role } = useSelector((state: RootState) => state.restaurent)

  return (
    <motion.header
      className="bg-white shadow-sm border-b border-amber-100 py-4 px-8 sticky top-0 z-10"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-black">
            {role === "branch" ? "Branch Dashboard" : "Restaurant Dashboard"}
          </h1>
          <p className="text-sm text-gray-600">Welcome back, {restaurent?.name || "User"}</p>
        </div>

        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative hidden md:block">
            <input
              type="text"
              placeholder="Search..."
              className="w-64 pl-10 pr-4 py-2 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>

          {/* Notifications */}
          <motion.button
            className="relative p-2 rounded-full bg-amber-50 hover:bg-amber-100 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell size={20} className="text-amber-700" />
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
              3
            </span>
          </motion.button>

          {/* User Avatar */}
          <motion.div
            className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center text-white cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {restaurent?.name?.charAt(0) || "U"}
          </motion.div>
        </div>
      </div>
    </motion.header>
  )
}

export default Header
