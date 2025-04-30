"use client"

import React from "react"
import { useState } from "react"
import { Outlet } from "react-router-dom"
import Sidebar from "../Siderbar"// Fixed typo: Siderbar → Sidebar
import { motion } from "framer-motion"

const UserLayout: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sepia-50 to-white flex flex-col">
      <Sidebar isCollapsed={isCollapsed} toggleSidebar={toggleSidebar} />

      <motion.main
        className="flex-1 pt-16 overflow-hidden transition-all duration-300"
        style={{
          marginLeft: window.innerWidth < 1024 ? "0px" : isCollapsed ? "80px" : "280px",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="max-w-7xl mx-auto px-0">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-elegant px-8 pb-8 pt-4 min-h-[calc(100vh-8rem)]"
          >
            <Outlet />
          </motion.div>
        </div>
      </motion.main>
    </div>
  )
}

export default UserLayout