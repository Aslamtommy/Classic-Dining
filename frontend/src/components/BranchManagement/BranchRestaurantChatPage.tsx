"use client"

import { useState, useEffect, useRef } from "react"
import io from "socket.io-client"
import { useSelector } from "react-redux"
import type { RootState } from "../../redux/store"
import restaurentApi from "../../Axios/restaurentInstance"
import { BaseUrl } from "../../../Config/BaseUrl"
import { motion, AnimatePresence } from "framer-motion"
import { Send, MessageSquare, Building } from 'lucide-react'

interface Message {
  restaurantId: string
  branchId: string
  senderId: string
  senderRole: "restaurent" | "branch"
  message: string
  timestamp: string | Date
}

interface Restaurant {
  id: string
  name: string
  lastMessage?: string
  lastMessageTime?: string
}

const SOCKET_URL = BaseUrl

const BranchRestaurantChatPage: React.FC = () => {
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState<string>("")
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string | null>(null)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const branchId = useSelector((state: RootState) => state.restaurent.restaurent?._id)
  const token = useSelector((state: RootState) => state.restaurent.restaurent?.accessToken)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchRestaurant = async () => {
    try {
      if (!branchId || !token) {
        setError("Missing branch ID or token")
        return
      }
      const response: any = await restaurentApi.get("/chats/restaurant")
      const restaurant = response.data.data?.restaurant
      if (restaurant) {
        setRestaurants([
          { 
            id: restaurant.id, 
            name: restaurant.name, 
            lastMessage: restaurant.lastMessage, 
            lastMessageTime: restaurant.lastMessageTime 
          }
        ])
        setSelectedRestaurantId(restaurant.id)
      } else {
        setRestaurants([])
      }
      setError(null)
    } catch (error: any) {
      console.error("Error fetching restaurant:", error.response?.data || error.message)
      setError("Failed to fetch restaurant.")
      setRestaurants([])
    }
  }

  useEffect(() => {
    if (!token || !branchId) {
      setError("Please log in as a branch manager.")
      return
    }

    fetchRestaurant()

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
  }, [token, branchId])

  useEffect(() => {
    if (!socket || !selectedRestaurantId || !isConnected) return

    socket.emit("joinChat", { restaurantId: selectedRestaurantId, branchId })

    socket.on("previousMessages", (previousMessages: Message[]) => {
      setMessages(previousMessages || [])
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    })

    socket.on("receiveMessage", (message: Message) => {
      if (message.branchId === branchId && message.restaurantId === selectedRestaurantId) {
        setMessages((prev) => [...prev, message])
        setTimeout(() => {
          scrollToBottom()
        }, 100)
      }
      // Update restaurants list with new message
      setRestaurants((prev: any) => {
        const updated = prev.map((restaurant: any) =>
          restaurant.id === message.restaurantId
            ? { ...restaurant, lastMessage: message.message, lastMessageTime: message.timestamp }
            : restaurant
        )
        return updated
      })
    })

    return () => {
      socket.off("previousMessages")
      socket.off("receiveMessage")
    }
  }, [socket, selectedRestaurantId, isConnected, branchId])

  const sendMessage = () => {
    if (!input.trim() || !socket || !isConnected || !selectedRestaurantId) return
    const messageData = { restaurantId: selectedRestaurantId, branchId, message: input }
    socket.emit("sendMessage", messageData)
    // Optimistically update restaurants list
    setRestaurants((prev) => {
      const updated = prev.map((restaurant) =>
        restaurant.id === selectedRestaurantId
          ? { ...restaurant, lastMessage: input, lastMessageTime: new Date().toISOString() }
          : restaurant
      )
      return updated
    })
    setInput("")
  }

  const formatTime = (timestamp: string | Date) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden h-[calc(100vh-12rem)]">
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-1/3 border-r border-amber-100 h-full flex flex-col">
          <div className="p-4 border-b border-amber-100">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Building className="w-5 h-5 text-amber-600" />
              Restaurant
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto">
            {error ? (
              <div className="p-4 text-red-500 text-center">{error}</div>
            ) : restaurants.length === 0 ? (
              <div className="p-8 text-center">
                <Building className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No restaurant assigned.</p>
              </div>
            ) : (
              restaurants.map((restaurant) => (
                <motion.div
                  key={restaurant.id}
                  className="p-4 cursor-pointer transition-colors duration-200 bg-amber-50"
                  whileHover={{ x: 5 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                      <Building className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-gray-900 truncate">{restaurant.name}</h4>
                        {restaurant.lastMessageTime && (
                          <span className="text-xs text-gray-500">
                            {new Date(restaurant.lastMessageTime).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {restaurant.lastMessage ? (
                        <p className="text-sm text-gray-500 truncate">{restaurant.lastMessage}</p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No messages yet</p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="w-2/3 flex flex-col h-full">
          {selectedRestaurantId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-amber-100 flex items-center">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 mr-3">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    {restaurants.find((r) => r.id === selectedRestaurantId)?.name || "Restaurant"}
                  </h3>
                  <p className="text-xs text-gray-500">Restaurant Management</p>
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
                      Send a message to start the conversation with your restaurant.
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
                          className={`flex ${msg.senderRole === "branch" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] px-4 py-3 rounded-lg ${
                              msg.senderRole === "branch"
                                ? "bg-amber-600 text-white"
                                : "bg-white border border-gray-200 text-gray-800"
                            }`}
                          >
                            <p>{msg.message}</p>
                            <p
                              className={`text-xs mt-1 text-right ${
                                msg.senderRole === "branch" ? "text-amber-100" : "text-gray-500"
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
              <div className="p-4 border-t border-amber-100 bg-white">
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
                    className="flex-1 p-3 border border-amber-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    disabled={!isConnected || !selectedRestaurantId}
                  />
                  <motion.button
                    type="submit"
                    className={`p-3 rounded-lg ${
                      !input.trim() || !isConnected || !selectedRestaurantId
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-amber-600 text-white hover:bg-amber-700"
                    }`}
                    disabled={!input.trim() || !isConnected || !selectedRestaurantId}
                    whileHover={input.trim() && isConnected && selectedRestaurantId ? { scale: 1.05 } : {}}
                    whileTap={input.trim() && isConnected && selectedRestaurantId ? { scale: 0.95 } : {}}
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <Building className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">No Restaurant Available</h3>
              <p className="text-gray-500 max-w-md">
                You don't have any restaurant assigned to chat with. Please contact your administrator.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BranchRestaurantChatPage
