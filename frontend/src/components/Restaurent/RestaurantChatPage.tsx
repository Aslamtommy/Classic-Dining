"use client"

import { useState, useEffect, useRef } from "react"
import io from "socket.io-client"
import { useSelector } from "react-redux"
import type { RootState } from "../../redux/store"
import restaurentApi from "../../Axios/restaurentInstance"
import { BaseUrl } from "../../../Config/BaseUrl"
import { motion, AnimatePresence } from "framer-motion"
import { Send, MessageSquare } from "lucide-react"

interface Message {
  restaurantId: string
  branchId: string
  senderId: string
  senderRole: "restaurent" | "branch"
  message: string
  timestamp: string | Date
}

interface Branch {
  id: string
  name: string
  location?: string
  lastMessage?: string
  lastMessageTime?: string
}

const SOCKET_URL = BaseUrl

const RestaurantChatPage = () => {
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState<string>("")
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null)
  const [branches, setBranches] = useState<Branch[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const restaurantId = useSelector((state: RootState) => state.restaurent.restaurent?._id)
  const token = useSelector((state: RootState) => state.restaurent.restaurent?.accessToken)

  const fetchBranches = async () => {
    try {
      if (!restaurantId || !token) {
        setError("Missing restaurant ID or token")
        return
      }
      setLoading(true)
      const response: any = await restaurentApi.get("/chats/branches")
      const fetchedBranches = response.data.data?.branches || []
      // Sort by lastMessageTime (descending), undefined at bottom
      const sortedBranches = fetchedBranches.sort((a: Branch, b: Branch) => {
        const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0
        const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0
        return timeB - timeA
      })
      setBranches(sortedBranches)
      setError(null)
    } catch (error: any) {
      console.error("Error fetching branches:", error.response?.data || error.message)
      setError("Failed to fetch branches.")
      setBranches([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token || !restaurantId) {
      setError("Please log in as a restaurant manager.")
      return
    }

    fetchBranches()

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
    if (!socket || !selectedBranchId || !isConnected) return

    socket.emit("joinChat", { restaurantId, branchId: selectedBranchId })

    socket.on("previousMessages", (previousMessages: Message[]) => {
      setMessages(previousMessages || [])
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    })

    socket.on("receiveMessage", (message: Message) => {
      if (message.restaurantId === restaurantId && message.branchId === selectedBranchId) {
        setMessages((prev) => [...prev, message])
        setTimeout(() => {
          scrollToBottom()
        }, 100)
      }
      // Update branches list with new message and re-sort
      setBranches((prev: any) => {
        const updated = prev.map((branch: any) =>
          branch.id === message.branchId
            ? { ...branch, lastMessage: message.message, lastMessageTime: message.timestamp }
            : branch,
        )
        return updated.sort((a: any, b: any) => {
          const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0
          const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0
          return timeB - timeA
        })
      })
    })

    return () => {
      socket.off("previousMessages")
      socket.off("receiveMessage")
    }
  }, [socket, selectedBranchId, isConnected, restaurantId])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const sendMessage = () => {
    if (!input.trim() || !socket || !isConnected || !selectedBranchId) return
    const messageData = { restaurantId, branchId: selectedBranchId, message: input }
    socket.emit("sendMessage", messageData)
    // Optimistically update branches list
    setBranches((prev) => {
      const updated = prev.map((branch) =>
        branch.id === selectedBranchId
          ? { ...branch, lastMessage: input, lastMessageTime: new Date().toISOString() }
          : branch,
      )
      return updated.sort((a, b) => {
        const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0
        const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0
        return timeB - timeA
      })
    })
    setInput("")
  }

  const selectBranch = (branchId: string) => {
    setSelectedBranchId(branchId)
    setMessages([])
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
              <MessageSquare className="w-5 h-5 text-amber-600" />
              Branch Conversations
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : error ? (
              <div className="p-4 text-red-500 text-center">{error}</div>
            ) : branches.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No branches available.</p>
              </div>
            ) : (
              branches.map((branch) => (
                <motion.div
                  key={branch.id}
                  onClick={() => selectBranch(branch.id)}
                  className={`p-4 cursor-pointer transition-colors duration-200 ${
                    selectedBranchId === branch.id ? "bg-amber-50" : "hover:bg-gray-50"
                  }`}
                  whileHover={{ x: 5 }}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        selectedBranchId === branch.id ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {branch.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-black truncate">{branch.name}</h4>
                        {branch.lastMessageTime && (
                          <span className="text-xs text-gray-500">
                            {new Date(branch.lastMessageTime).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {branch.lastMessage ? (
                        <p className="text-sm text-gray-500 truncate">{branch.lastMessage}</p>
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
          {selectedBranchId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 flex items-center">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 mr-3">
                  {branches
                    .find((b) => b.id === selectedBranchId)
                    ?.name.charAt(0)
                    .toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-black">{branches.find((b) => b.id === selectedBranchId)?.name}</h3>
                  <p className="text-xs text-gray-500">
                    {branches.find((b) => b.id === selectedBranchId)?.location || "No location set"}
                  </p>
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
                    <p className="text-gray-500 text-sm">Send a message to start the conversation with this branch.</p>
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
                    disabled={!isConnected || !selectedBranchId}
                  />
                  <motion.button
                    type="submit"
                    className={`p-3 rounded-lg ${
                      !input.trim() || !isConnected || !selectedBranchId
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-amber-600 text-white hover:bg-amber-700"
                    }`}
                    disabled={!input.trim() || !isConnected || !selectedBranchId}
                    whileHover={input.trim() && isConnected && selectedBranchId ? { scale: 1.05 } : {}}
                    whileTap={input.trim() && isConnected && selectedBranchId ? { scale: 0.95 } : {}}
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">Select a Branch</h3>
              <p className="text-gray-500 max-w-md">
                Choose a branch from the list to start chatting. You can communicate with your branch managers here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default RestaurantChatPage
