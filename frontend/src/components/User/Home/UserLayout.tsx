"use client"

import Sidebar from "../Siderbar"
import { Outlet } from "react-router-dom"
import Header from "../../User/Home/Header"
import { motion } from "framer-motion"

const UserLayout = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sepia-50 to-white flex flex-col">
      {/* Header fixed at the top */}
      <Header />

      {/* Container for Sidebar and Content */}
      <div className="flex flex-1">
        {/* Sidebar fixed on the left, below Header */}
        <Sidebar />

        {/* Main content area */}
        <motion.main
          className="flex-1 ml-72 pt-16 overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-white rounded-2xl shadow-elegant p-8 min-h-[calc(100vh-8rem)]"
            >
              <Outlet /> {/* Renders nested routes */}
            </motion.div>
          </div>
        </motion.main>
      </div>
    </div>
  )
}

export default UserLayout
