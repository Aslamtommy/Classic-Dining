"use client";

import React from "react";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../redux/store";
import { getNotifications, markNotificationAsRead } from "../../Api/userApi";
import io from "socket.io-client";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Bell, CheckCircle, Clock, AlertCircle, MessageSquare, Calendar } from "lucide-react";
import { BaseUrl } from "../../../Config/BaseUrl";
import axios from "axios";
 

interface Notification {
  _id: string;
  senderId: any
  recipientType: 'restaurant' | 'branch' | 'user';
  recipientId: string;
  message: string;
  isRead: boolean;
  timestamp: string;
  type?: 'booking' | 'alert' | 'message' | 'success';
}

interface UnreadCountResponse {
  success: boolean;
  message: string;
  data: { count: number };
}

interface GetNotificationsResponse {
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
}

const UserNotifications: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.user);
  const accessToken = user?.accessToken || "";
  const [page, setPage] = useState(1);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const limit = 10;

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response :any= await getNotifications(page, limit) 
      console.log("fetchNotifications response:", response); // Temporary log for debugging
      setNotifications(response.notifications || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      console.error("Full response:", await getNotifications(page, limit)); // Log full response on error
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get<UnreadCountResponse>(`${BaseUrl}/users/notifications/unread-count`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      window.dispatchEvent(new CustomEvent('updateUnreadCount', { detail: response.data.data.count }));
    } catch (error) {
      console.error("Error fetching unread notification count:", error);
      toast.error("Failed to fetch notification count");
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      toast.success("Notification marked as read");
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Failed to mark notification as read");
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  useEffect(() => {
    if (!accessToken) return;

    const socket = io(BaseUrl, {
      auth: { token: accessToken },
    });

    socket.on("receiveNotification", (notification: Notification) => {
      console.log("New user notification:", notification);
      toast.success("New notification received!", {
        icon: "🔔",
        style: {
          background: "#faf7f2",
          color: "#2c2420",
          border: "1px solid #e8e2d9",
        },
      });
      fetchNotifications();
      fetchUnreadCount();
    });

    socket.on("notificationMarkedAsRead", (data: { notificationId: string }) => {
      console.log("Received notificationMarkedAsRead:", data);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === data.notificationId ? { ...notif, isRead: true } : notif
        )
      );
      fetchUnreadCount();
    });

    socket.on("connect_error", (error: any) => {
      console.error("Socket connection error:", error);
      toast.error("Failed to connect to notification service");
    });

    return () => {
      socket.disconnect();
    };
  }, [accessToken]);

  const getNotificationIcon = (notification: Notification) => {
    const message = notification.message.toLowerCase();

    if (notification.type) {
      switch (notification.type) {
        case "booking":
          return <Calendar className="w-5 h-5 text-sepia-700" />;
        case "message":
          return <MessageSquare className="w-5 h-5 text-blue-600" />;
        case "alert":
          return <AlertCircle className="w-5 h-5 text-red-600" />;
        case "success":
          return <CheckCircle className="w-5 h-5 text-green-600" />;
        default:
          return <Bell className="w-5 h-5 text-bronze-700" />;
      }
    }

    if (message.includes("reservation") || message.includes("table")) {
      return <Calendar className="w-5 h-5 text-sepia-700" />;
    } else if (message.includes("message") || message.includes("chat") || message.includes("reply")) {
      return <MessageSquare className="w-5 h-5 text-blue-600" />;
    } else if (message.includes("cancel") || message.includes("error") || message.includes("fail")) {
      return <AlertCircle className="w-5 h-5 text-red-600" />;
    } else if (message.includes("success") || message.includes("confirm") || message.includes("complete")) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }

    return <Bell className="w-5 h-5 text-bronze-700" />;
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

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
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sepia-50 to-white pt-8 pb-16 pl-0 transition-all duration-300">
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
                      notification.isRead ? "bg-sepia-50/50" : "bg-white"
                    }`}
                    onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full ${notification.isRead ? "bg-sepia-100" : "bg-sepia-200"}`}>
                        {getNotificationIcon(notification)}
                      </div>
                      <div className="flex-1">
                        <p className={`text-sepia-900 text-base ${notification.isRead ? "font-normal" : "font-medium"}`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center mt-2 text-sm text-bronze-600">
                          <Clock className="w-4 h-4 mr-1" />
                          <time dateTime={notification.timestamp}>
                            {format(new Date(notification.timestamp), "PPP p")}
                          </time>
                          <span className={`ml-4 px-2 py-1 rounded-full text-xs ${
                            notification.isRead ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}>
                            {notification.isRead ? "Read" : "Unread"}
                          </span>
                        </div>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 rounded-full bg-sepia-600 mt-2 animate-pulse"></div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto mb-1">
                  <Bell className="w-full text-sepia-300" />
                </div>
                <h3 className="text-xl font-playfair text-sepia-700 mb-2">No notifications yet.</h3>
                <p className="text-sm text-sepia-500">We'll let you know when something exciting happens!</p>
              </div>
            )}
          </motion.div>
        )}
        {total > limit && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex justify-between items-center mt-6"
          >
            <motion.button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className={`flex items-center gap-2 px-5 py-2 rounded-md transition-colors duration-200 ${
                page === 1
                  ? "bg-sepia-100 text-sepia-400 cursor-not-allowed"
                  : "bg-white text-sepia-900 border border-sepia-200 hover:bg-sepia-50"
              }`}
              whileHover={page !== 1 ? { scale: 1.05 } : {}}
              whileTap={page !== 1 ? { scale: 0.95 } : {}}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </motion.button>
            <span className="px-4 py-2 bg-white rounded-md border border-sepia-200 text-sepia-700 text-sm font-medium">
              Page {page} of {Math.ceil(total / limit)}
            </span>
            <motion.button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={page >= Math.ceil(total / limit)}
              className={`flex items-center gap-2 px-5 py-2 rounded-md transition-colors duration-200 ${
                page >= Math.ceil(total / limit)
                  ? "bg-sepia-100 text-sepia-400 cursor-not-allowed"
                  : "bg-white text-sepia-900 border border-sepia-200 hover:bg-sepia-50"
              }`}
              whileHover={page < Math.ceil(total / limit) ? { scale: 1.05 } : {}}
              whileTap={page < Math.ceil(total / limit) ? { scale: 0.95 } : {}}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default UserNotifications;