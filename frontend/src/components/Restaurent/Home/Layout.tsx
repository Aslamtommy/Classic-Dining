"use client"
import { useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import { motion } from "framer-motion"
import Sidebar from "./Sidebar"
import Header from "./Header"

const Layout = () => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />
      <motion.div
        className="flex-1 lg:ml-72 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Header />
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </motion.div>
    </div>
  )
}

export default Layout
