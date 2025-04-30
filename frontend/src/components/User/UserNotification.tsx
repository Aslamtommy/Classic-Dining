"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"
import type { RootState } from "../../redux/store"
import { getNotifications } from "../../Api/userApi"
import io from "socket.io-client"
import toast from "react-hot-toast"
import { format } from "date-fns"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Bell, CheckCircle, Clock, AlertCircle, MessageSquare, Calendar } from "lucide-react"
import { BaseUrl } from "../../../Config/BaseUrl"

interface Notification {
  _id: string
  message: string
  read: boolean
  timestamp: string
  type?: string // Optional type for different notification styles
}

const UserNotifications: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.user)
  const accessToken = user?.accessToken || ""
  const [page, setPage] = useState(1)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const limit = 10

  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await getNotifications(page, limit)
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
      console.log("New user notification:", notification)
      toast.success("New notification received!", {
        icon: "🔔",
        style: {
          background: "#faf7f2",
          color: "#2c2420",
          border: "1px solid #e8e2d9",
        },
      })
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

  // Get notification icon based on content
  const getNotificationIcon = (notification: Notification) => {
    const message = notification.message.toLowerCase()

    if (notification.type) {
      switch (notification.type) {
        case "booking":
          return <Calendar className="w-5 h-5 text-sepia-700" />
        case "message":
          return <MessageSquare className="w-5 h-5 text-blue-600" />
        case "alert":
          return <AlertCircle className="w-5 h-5 text-red-600" />
        case "success":
          return <CheckCircle className="w-5 h-5 text-green-600" />
        default:
          break
      }
    }

    if (message.includes("booking") || message.includes("reservation") || message.includes("table")) {
      return <Calendar className="w-5 h-5 text-sepia-700" />
    } else if (message.includes("message") || message.includes("chat") || message.includes("reply")) {
      return <MessageSquare className="w-5 h-5 text-blue-600" />
    } else if (message.includes("cancel") || message.includes("error") || message.includes("fail")) {
      return <AlertCircle className="w-5 h-5 text-red-600" />
    } else if (message.includes("success") || message.includes("confirm") || message.includes("complete")) {
      return <CheckCircle className="w-5 h-5 text-green-600" />
    }

    return <Bell className="w-5 h-5 text-bronze-700" />
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
      },
    },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sepia-50 to-white pt-8 pb-16 pl-0 lg:pl-[280px] transition-all duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="font-playfair text-4xl md:text-5xl text-sepia-900 font-bold mb-4">Notifications</h1>
          <div className="h-1 w-24 bg-sepia-600 mx-auto"></div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="w-12 h-12 border-4 border-sepia-200 border-t-sepia-700 rounded-full"
            />
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-xl shadow-elegant border border-sepia-200 overflow-hidden"
          >
            {notifications.length ? (
              <div className="divide-y divide-sepia-100">
                {notifications.map((notification) => (
                  <motion.div
                    key={notification._id}
                    variants={itemVariants}
                    className={`p-6 transition-colors duration-300 hover:bg-sepia-50 ${
                      notification.read ? "bg-sepia-50/50" : "bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full ${notification.read ? "bg-sepia-100" : "bg-sepia-200"}`}>
                        {getNotificationIcon(notification)}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sepia-900 text-base ${notification.read ? "font-normal" : "font-medium"}`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center mt-2 text-sm text-bronze-600">
                          <Clock className="w-4 h-4 mr-1" />
                          <time dateTime={notification.timestamp}>
                            {format(new Date(notification.timestamp), "PPP p")}
                          </time>
                        </div>
                      </div>
                      {!notification.read && (
                        <div className="w-2 h-2 rounded-full bg-sepia-600 mt-2 animate-pulse"></div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 text-sepia-300">
                  <Bell className="w-full h-full" />
                </div>
                <h3 className="text-xl font-playfair text-sepia-900 mb-2">No notifications yet</h3>
                <p className="text-sepia-700">We'll notify you when something important happens</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Pagination */}
        {total > limit && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-between items-center mt-8"
          >
            <motion.button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className={`flex items-center px-5 py-2 rounded-md transition-colors ${
                page === 1
                  ? "bg-sepia-100 text-sepia-400 cursor-not-allowed"
                  : "bg-white text-sepia-900 border border-sepia-300 hover:bg-sepia-50 shadow-sm"
              }`}
              whileHover={page !== 1 ? { scale: 1.05 } : {}}
              whileTap={page !== 1 ? { scale: 0.95 } : {}}
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Previous
            </motion.button>

            <span className="px-4 py-2 bg-white rounded-md border border-sepia-200 text-sepia-900 font-medium shadow-sm">
              Page {page} of {Math.ceil(total / limit)}
            </span>

            <motion.button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page >= Math.ceil(total / limit)}
              className={`flex items-center px-5 py-2 rounded-md transition-colors ${
                page >= Math.ceil(total / limit)
                  ? "bg-sepia-100 text-sepia-400 cursor-not-allowed"
                  : "bg-white text-sepia-900 border border-sepia-300 hover:bg-sepia-50 shadow-sm"
              }`}
              whileHover={page < Math.ceil(total / limit) ? { scale: 1.05 } : {}}
              whileTap={page < Math.ceil(total / limit) ? { scale: 0.95 } : {}}
            >
              Next
              <ChevronRight className="w-5 h-5 ml-1" />
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default UserNotifications
