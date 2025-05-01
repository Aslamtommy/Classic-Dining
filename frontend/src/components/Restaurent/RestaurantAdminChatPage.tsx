"use client"

import { useState, useEffect, useRef } from "react"
import io from "socket.io-client"
import { useSelector } from "react-redux"
import type { RootState } from "../../redux/store"
import restaurentApi from "../../Axios/restaurentInstance"
import { BaseUrl } from "../../../Config/BaseUrl"
import { motion, AnimatePresence } from "framer-motion"
import { Send, MessageSquare, Shield } from "lucide-react"

interface Message {
  adminId: string
  restaurantId: string
  senderId: string
  senderRole: "admin" | "restaurent"
  message: string
  timestamp: string | Date
}

interface Admin {
  id: string
  email: string
  lastMessage?: string
  lastMessageTime?: string
}

const SOCKET_URL = BaseUrl

const RestaurantAdminChatPage = () => {
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState<string>("")
  const [superAdmin, setSuperAdmin] = useState<Admin | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const restaurantId = useSelector((state: RootState) => state.restaurent.restaurent?._id)
  const token = useSelector((state: RootState) => state.restaurent.restaurent?.accessToken)

  const fetchSuperAdmin = async () => {
    try {
      if (!restaurantId || !token) {
        setError("Missing restaurant ID or token")
        return
      }
      setLoading(true)
      const response: any = await restaurentApi.get("/chats/admins")
      const fetchedAdmins = response.data.data?.admins || []
      if (fetchedAdmins.length > 0) {
        setSuperAdmin(fetchedAdmins[0])
      } else {
        setSuperAdmin(null)
      }
      setError(null)
    } catch (error: any) {
      console.error("Error fetching super admin:", error.response?.data || error.message)
      setError("Failed to fetch super admin.")
      setSuperAdmin(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token || !restaurantId) {
      setError("Please log in as a restaurant manager.")
      return
    }

    fetchSuperAdmin()

    const newSocket = io(SOCKET_URL, { auth: { token } })
    setSocket(newSocket)

    newSocket.on("connect", () => {
      setIsConnected(true)
      setError(null)
    })

    newSocket.on("connect_error", (err: any) => {
      setIsConnected(false)
      setError("Socket connection failed.")
    })

    newSocket.on("error", (error: string) => {
      setError(`Socket error: ${error}`)
    })

    return () => {
      newSocket.disconnect()
    }
  }, [token, restaurantId])

  useEffect(() => {
    if (!socket || !superAdmin || !isConnected) return

    socket.emit("joinChat", { adminId: superAdmin.id, restaurantId })

    socket.on("previousMessages", (previousMessages: Message[]) => {
      setMessages(previousMessages || [])
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    })

    socket.on("receiveMessage", (message: Message) => {
      if (superAdmin && message.adminId === superAdmin.id && message.restaurantId === restaurantId) {
        setMessages((prev) => [...prev, message])
        setTimeout(() => {
          scrollToBottom()
        }, 100)
        setSuperAdmin((prev: any) =>
          prev ? { ...prev, lastMessage: message.message, lastMessageTime: message.timestamp } : prev,
        )
      }
    })

    return () => {
      socket.off("previousMessages")
      socket.off("receiveMessage")
    }
  }, [socket, superAdmin, isConnected, restaurantId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const sendMessage = () => {
    if (!input.trim() || !socket || !isConnected || !superAdmin) return
    const messageData = {
      adminId: superAdmin.id,
      restaurantId,
      message: input,
      senderId: restaurantId,
      senderRole: "restaurent",
    }
    socket.emit("sendMessage", messageData)
    setInput("")
    setSuperAdmin((prev) => (prev ? { ...prev, lastMessage: input, lastMessageTime: new Date().toISOString() } : prev))
  }

  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden h-[calc(100vh-12rem)]">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-1/3 border-r border-gray-200 h-full flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-black flex items-center gap-2">
              <Shield className="w-5 h-5 text-amber-600" />
              Admin Support
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="p-4 text-red-500 text-center">{error}</div>
            ) : !superAdmin ? (
              <div className="p-8 text-center">
                <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No admin available.</p>
              </div>
            ) : (
              <motion.div
                onClick={() => {}}
                className="p-4 cursor-pointer transition-colors duration-200 bg-amber-50"
                whileHover={{ x: 5 }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium text-black truncate">Admin Support</h4>
                      {superAdmin.lastMessageTime && (
                        <span className="text-xs text-gray-500">
                          {new Date(superAdmin.lastMessageTime).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    {superAdmin.lastMessage ? (
                      <p className="text-sm text-gray-500 truncate">{superAdmin.lastMessage}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No messages yet</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{superAdmin.email}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="w-2/3 flex flex-col h-full">
          {superAdmin ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 mr-3">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-black">Admin Support</h3>
                  <p className="text-xs text-gray-500">{superAdmin.email}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                {!isConnected && (
                  <div className="bg-yellow-50 text-yellow-800 p-3 rounded-lg mb-4 text-sm">
                    Connecting to chat server...
                  </div>
                )}

                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6">
                    <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
                    <h4 className="text-gray-700 font-medium mb-2">No messages yet</h4>
                    <p className="text-gray-500 text-sm">
                      Send a message to start the conversation with admin support.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {messages.map((msg, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`flex ${msg.senderRole === "restaurent" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] px-4 py-3 rounded-lg ${
                              msg.senderRole === "restaurent"
                                ? "bg-amber-600 text-white"
                                : "bg-white border border-gray-200 text-black"
                            }`}
                          >
                            <p>{msg.message}</p>
                            <p
                              className={`text-xs mt-1 text-right ${
                                msg.senderRole === "restaurent" ? "text-amber-100" : "text-gray-500"
                              }`}
                            >
                              {formatTime(msg.timestamp)}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-200 bg-white">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    sendMessage()
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    disabled={!isConnected || !superAdmin}
                  />
                  <motion.button
                    type="submit"
                    className={`p-3 rounded-lg ${
                      !input.trim() || !isConnected || !superAdmin
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-amber-600 text-white hover:bg-amber-700"
                    }`}
                    disabled={!input.trim() || !isConnected || !superAdmin}
                    whileHover={input.trim() && isConnected && superAdmin ? { scale: 1.05 } : {}}
                    whileTap={input.trim() && isConnected && superAdmin ? { scale: 0.95 } : {}}
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <Shield className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">Admin Support</h3>
              <p className="text-gray-500 max-w-md">
                Connect with our admin team for support, inquiries, or assistance with your restaurant management.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RestaurantAdminChatPage
