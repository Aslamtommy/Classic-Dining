"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import io from "socket.io-client"
import { useSelector } from "react-redux"
import type { RootState } from "../../redux/store"
import restaurentApi from "../../Axios/restaurentInstance"
import { BaseUrl } from "../../../Config/BaseUrl"
import { motion, AnimatePresence } from "framer-motion"
import { Send, MessageSquare, User } from "lucide-react"

interface Message {
  userId: string
  branchId: string
  senderId: string
  senderRole: "user" | "branch"
  message: string
  timestamp: string | Date
}

interface ChatUser {
  id: string
  name: string
  mobile?: string
  profilePicture?: string
  lastMessage?: string
  lastMessageTime?: string
}

const SOCKET_URL = BaseUrl

const BranchUserChatPage: React.FC = () => {
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState<string>("")
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [users, setUsers] = useState<ChatUser[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const branchId = useSelector((state: RootState) => state.restaurent.restaurent?._id)
  const token = useSelector((state: RootState) => state.restaurent.restaurent?.accessToken)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchUsersWithMessages = useCallback(async () => {
    try {
      if (!branchId || !token) {
        setError("Missing branch ID or token")
        return
      }
      const response: any = await restaurentApi.get(`/chats/users/${branchId}`)
      const fetchedUsers = response.data.data?.users || []
      // Sort by lastMessageTime (descending), undefined at bottom
      const sortedUsers = fetchedUsers.sort((a: ChatUser, b: ChatUser) => {
        const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0
        const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0
        return timeB - timeA
      })
      setUsers(sortedUsers)
      setError(null)
    } catch (error: any) {
      console.error("Error fetching users:", error.response?.data || error.message)
      setError("Failed to fetch users.")
      setUsers([])
    }
  }, [branchId, token])

  useEffect(() => {
    if (!token || !branchId) {
      setError("Please log in as a branch manager.")
      return
    }

    fetchUsersWithMessages()

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
  }, [token, branchId, fetchUsersWithMessages])

  useEffect(() => {
    if (!socket || !selectedUserId || !isConnected) return

    socket.emit("joinChat", { userId: selectedUserId, branchId })

    socket.on("previousMessages", (previousMessages: Message[]) => {
      setMessages(previousMessages || [])
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    })

    socket.on("receiveMessage", (message: Message) => {
      if (message.branchId === branchId && message.userId === selectedUserId) {
        setMessages((prev) => [...prev, message])
        setTimeout(() => {
          scrollToBottom()
        }, 100)
      }
      // Update users list with new message and re-sort
      setUsers((prev: any) => {
        const updated = prev.map((user: any) =>
          user.id === message.userId
            ? { ...user, lastMessage: message.message, lastMessageTime: message.timestamp }
            : user,
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
  }, [socket, selectedUserId, isConnected, branchId])

  const sendMessage = () => {
    if (!input.trim() || !socket || !isConnected || !selectedUserId) return
    const messageData = { userId: selectedUserId, branchId, message: input }
    socket.emit("sendMessage", messageData)
    // Optimistically update users list
    setUsers((prev) => {
      const updated = prev.map((user) =>
        user.id === selectedUserId ? { ...user, lastMessage: input, lastMessageTime: new Date().toISOString() } : user,
      )
      return updated.sort((a, b) => {
        const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0
        const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0
        return timeB - timeA
      })
    })
    setInput("")
  }

  const selectUser = (userId: string) => {
    setSelectedUserId(userId)
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
        <div className="w-1/3 border-r border-amber-100 h-full flex flex-col">
          <div className="p-4 border-b border-amber-100">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <User className="w-5 h-5 text-amber-600" />
              Customers
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto">
            {error ? (
              <div className="p-4 text-red-500 text-center">{error}</div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center">
                <User className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No users have messaged yet.</p>
              </div>
            ) : (
              users.map((user) => (
                <motion.div
                  key={user.id}
                  onClick={() => selectUser(user.id)}
                  className={`p-4 cursor-pointer transition-colors duration-200 ${
                    selectedUserId === user.id ? "bg-amber-50" : "hover:bg-gray-50"
                  }`}
                  whileHover={{ x: 5 }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden border border-amber-200">
                      {user.profilePicture ? (
                        <img
                          src={user.profilePicture || "/placeholder.svg"}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-amber-700" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium text-gray-900 truncate">{user.name}</h4>
                        {user.lastMessageTime && (
                          <span className="text-xs text-gray-500">
                            {new Date(user.lastMessageTime).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">{user.mobile || "N/A"}</span>
                      {user.lastMessage ? (
                        <p className="text-xs truncate text-gray-500 mt-1">{user.lastMessage}</p>
                      ) : (
                        <p className="text-xs italic text-gray-400 mt-1">No messages yet</p>
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
          {selectedUserId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-amber-100 flex items-center">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden border border-amber-200 mr-3">
                  {users.find((u) => u.id === selectedUserId)?.profilePicture ? (
                    <img
                      src={users.find((u) => u.id === selectedUserId)?.profilePicture || "/placeholder.svg"}
                      alt="User profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-amber-700" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">
                    {users.find((u) => u.id === selectedUserId)?.name || "User"}
                  </h3>
                  <p className="text-xs text-gray-500">{users.find((u) => u.id === selectedUserId)?.mobile || "N/A"}</p>
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
                      Send a message to start the conversation with this customer.
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
                          {msg.senderRole !== "branch" && (
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center overflow-hidden border border-amber-200 mr-2 self-end">
                              {users.find((u) => u.id === msg.userId)?.profilePicture ? (
                                <img
                                  src={users.find((u) => u.id === msg.userId)?.profilePicture || "/placeholder.svg"}
                                  alt="User profile"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="w-4 h-4 text-amber-700" />
                              )}
                            </div>
                          )}
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
                    disabled={!isConnected || !selectedUserId}
                  />
                  <motion.button
                    type="submit"
                    className={`p-3 rounded-lg ${
                      !input.trim() || !isConnected || !selectedUserId
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-amber-600 text-white hover:bg-amber-700"
                    }`}
                    disabled={!input.trim() || !isConnected || !selectedUserId}
                    whileHover={input.trim() && isConnected && selectedUserId ? { scale: 1.05 } : {}}
                    whileTap={input.trim() && isConnected && selectedUserId ? { scale: 0.95 } : {}}
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </form>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <User className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-xl font-bold text-gray-700 mb-2">Select a Customer</h3>
              <p className="text-gray-500 max-w-md">
                Choose a customer from the list to start chatting. You can provide assistance and answer their questions
                here.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BranchUserChatPage
