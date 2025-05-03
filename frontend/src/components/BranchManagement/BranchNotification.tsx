"use client"

import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "../../redux/store"
import { tableTypeApi } from "../../Api/restaurentApi"
import io from "socket.io-client"
import toast from "react-hot-toast"
import { format } from "date-fns"
import { ChevronLeft, ChevronRight, Bell, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from "framer-motion"
import { BaseUrl } from "../../../Config/BaseUrl"

interface Notification {
  _id: string
  message: string
  read: boolean
  timestamp: string
}

const BranchNotifications: React.FC = () => {
  const { restaurent, role } = useSelector((state: RootState) => state.restaurent)
  const accessToken = restaurent?.accessToken || ""
  const [page, setPage] = useState(1)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const limit = 10

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response: any = await tableTypeApi.getNotifications(page, limit)
      setNotifications(response.notifications)
      setTotal(response.total)
    } catch (error) {
      console.error("Error fetching notifications:", error)
      toast.error("Failed to load notifications")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [page])

  useEffect(() => {
    if (!accessToken) return

    const socket = io(BaseUrl, {
      auth: { token: accessToken },
    })

    socket.on("receiveNotification", (notification: any) => {
      console.log("New branch notification:", notification)
      toast.success("New notification received!")
      fetchNotifications()
    })

    socket.on("connect_error", (error: any) => {
      console.error("Socket connection error:", error)
      toast.error("Failed to connect to notification service")
    })

    return () => {
      socket.disconnect()
    }
  }, [accessToken])

  if (role !== "branch") {
    return (
      <div className="flex items-center justify-center h-screen text-red-500 text-lg font-playfair">
        Unauthorized Access
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white rounded-xl shadow-elegant p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mr-4">
            <Bell className="h-6 w-6 text-amber-700" />
          </div>
          <div>
            <h1 className="text-3xl font-playfair font-bold text-gray-900">Branch Notifications</h1>
            <p className="text-gray-600 text-sm">Stay updated with your branch activities</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-amber-700"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-amber-100">
            <AnimatePresence>
              {notifications.length ? (
                notifications.map((notification, index) => (
                  <motion.div
                    key={notification._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`p-6 border-b border-amber-100 last:border-b-0 ${
                      notification.read ? "bg-white" : "bg-amber-50"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex">
                        <div
                          className={`mt-1 mr-4 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            notification.read ? "bg-amber-100" : "bg-amber-200"
                          }`}
                        >
                          <CheckCircle
                            className={`h-4 w-4 ${notification.read ? "text-amber-600" : "text-amber-700"}`}
                          />
                        </div>
                        <div>
                          <p className="text-gray-800 text-base">{notification.message}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {format(new Date(notification.timestamp), "PPP p")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Bell className="h-8 w-8 text-amber-400" />
                  </div>
                  <p className="text-gray-600">No notifications available</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        {total > limit && (
          <div className="flex justify-between items-center mt-8">
            <motion.button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className={`flex items-center px-4 py-2 rounded-lg text-white shadow-md transition-all ${
                page === 1
                  ? "bg-amber-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950"
              }`}
              whileHover={page !== 1 ? { scale: 1.05 } : {}}
              whileTap={page !== 1 ? { scale: 0.95 } : {}}
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Previous
            </motion.button>

            <span className="text-amber-700 font-medium">
              Page {page} of {Math.ceil(total / limit)}
            </span>

            <motion.button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page >= Math.ceil(total / limit)}
              className={`flex items-center px-4 py-2 rounded-lg text-white shadow-md transition-all ${
                page >= Math.ceil(total / limit)
                  ? "bg-amber-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-amber-700 to-amber-900 hover:from-amber-800 hover:to-amber-950"
              }`}
              whileHover={page < Math.ceil(total / limit) ? { scale: 1.05 } : {}}
              whileTap={page < Math.ceil(total / limit) ? { scale: 0.95 } : {}}
            >
              Next
              <ChevronRight className="w-5 h-5 ml-1" />
            </motion.button>
          </div>
        )}
      </div>
    </div>
  )
}

export default BranchNotifications
