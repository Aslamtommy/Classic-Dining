"use client"

import type React from "react"

import { useState, useEffect } from "react"
import api from "../../Axios/userInstance"
import { toast } from "react-hot-toast"
import {
  Wallet,
  DollarSign,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import type {
  WalletResponse,
  OrderResponse,
  ConfirmAddResponse,
  Transaction,
  RazorpayOptions,
  RazorpayResponse,
  RazorpayErrorResponse,
} from "../../types/wallet"
import type { AxiosError } from "../../types/auth"

const WalletPage: React.FC = () => {
  const [balance, setBalance] = useState<number>(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [amount, setAmount] = useState<string>("")
  const [isAdding, setIsAdding] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [activeTab, setActiveTab] = useState<"all" | "credits" | "debits">("all")
  const limit = 6

  useEffect(() => {
    fetchWalletData(currentPage)
  }, [currentPage, activeTab])

  const fetchWalletData = async (page: number) => {
    try {
      setIsLoading(true)
      const type = activeTab === "all" ? undefined : activeTab === "credits" ? "credit" : "debit"
      const response = await api.get<WalletResponse>(
        `/wallet?page=${page}&limit=${limit}${type ? `&type=${type}` : ""}`,
      )
      setBalance(response.data.data.balance)
      setTransactions(response.data.data.transactions)
      setTotalPages(Math.ceil(response.data.data.totalTransactions / limit))
    } catch (error: unknown) {
      const axiosError = error as AxiosError
      toast.error(axiosError.response?.data?.message || "Failed to fetch wallet data", {
        duration: 4000,
        position: "top-center",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMoney = async () => {
    const parsedAmount = Number.parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error("Please enter a valid amount", { duration: 4000, position: "top-center" })
      return
    }
    try {
      setIsAdding(true)
      const response = await api.post<OrderResponse>("/wallet/create-order", { amount: parsedAmount })
      const orderData = response.data.data

      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.async = true
      document.body.appendChild(script)

      await new Promise<void>((resolve) => {
        script.onload = () => resolve()
      })

      const options: RazorpayOptions = {
        key: "rzp_test_ihsNz6lracNIu3",
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.id,
        name: "Classic Dining",
        description: "Add Money to Wallet",
        handler: async (response: RazorpayResponse) => {
          try {
            const confirmResponse = await api.post<ConfirmAddResponse>("/wallet/confirm-add", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: parsedAmount,
            })
            setBalance(confirmResponse.data.data.balance)
            setTransactions(confirmResponse.data.data.transactions)
            setAmount("")
            toast.success("Money added successfully", {
              duration: 4000,
              position: "top-center",
              style: {
                background: "#faf7f2",
                color: "#2c2420",
                border: "1px solid #e8e2d9",
              },
              iconTheme: {
                primary: "#8b5d3b",
                secondary: "#fff",
              },
            })
          } catch (error: unknown) {
            const axiosError = error as AxiosError
            toast.error(axiosError.response?.data?.message || "Failed to confirm payment", {
              duration: 4000,
              position: "top-center",
            })
          } finally {
            setIsAdding(false)
          }
        },
        modal: {
          ondismiss: () => {
            setIsAdding(false)
            toast.error("Payment cancelled", { duration: 4000, position: "top-center" })
          },
        },
        theme: {
          color: "#8b5d3b",
        },
      }

      const razorpay = new window.Razorpay(options)
      razorpay.on("payment.failed", (response: RazorpayErrorResponse) => {
        toast.error(`Payment failed: ${response.error.description}`, {
          duration: 4000,
          position: "top-center",
        })
        setIsAdding(false)
      })
      razorpay.open()

      // Cleanup script after use
      return () => {
        document.body.removeChild(script)
      }
    } catch (error: unknown) {
      const axiosError = error as AxiosError
      toast.error(axiosError.response?.data?.message || "Failed to initiate payment", {
        duration: 4000,
        position: "top-center",
      })
      setIsAdding(false)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
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

  if (isLoading && currentPage === 1) {
    return (
      <div className="bg-sepia-50 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-16 h-16 border-4 border-sepia-200 border-t-sepia-700 rounded-full mb-4"
          />
          <p className="text-sepia-700 font-medium">Loading your wallet...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-b from-sepia-50 to-white min-h-screen pt-8 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="font-playfair text-4xl md:text-5xl text-sepia-900 font-bold mb-4">Your Wallet</h1>
          <div className="h-1 w-24 bg-gold-500 mx-auto"></div>
        </motion.div>

        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-8">
          {/* Balance Card */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-elegant border border-sepia-200 overflow-hidden"
          >
            <div className="p-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-to-r from-sepia-700 to-sepia-900 p-3 rounded-full shadow-md">
                  <Wallet className="h-8 w-8 text-gold-300" />
                </div>
                <div>
                  <h2 className="font-playfair text-2xl text-sepia-900 font-bold">My Wallet</h2>
                  <p className="text-bronze-700 text-sm">Manage your funds</p>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-sepia-900 to-sepia-700 p-8 shadow-md">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mt-12 -mr-12"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -mb-8 -ml-8"></div>

                <div className="relative">
                  <p className="text-sepia-200 text-sm mb-1">Current Balance</p>
                  <div className="flex items-end gap-2">
                    <p className="text-4xl font-bold text-white">₹{balance.toFixed(2)}</p>
                    <p className="text-gold-300 text-sm mb-1">Available</p>
                  </div>

                  <div className="mt-6 flex items-center text-sepia-200 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    <p>Last updated: {new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Add Money Section */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-elegant border border-sepia-200 overflow-hidden"
          >
            <div className="p-8">
              <h2 className="font-playfair text-2xl text-sepia-900 font-bold mb-6">Add Funds</h2>

              <div className="bg-sepia-50 p-6 rounded-xl border border-sepia-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-5 w-5 text-bronze-500" />
                    </div>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full pl-10 pr-4 py-3 border border-sepia-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-transparent bg-white shadow-sm"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <motion.button
                    onClick={handleAddMoney}
                    disabled={isAdding || !amount || Number.parseFloat(amount) <= 0}
                    className={`px-6 py-3 bg-gradient-to-r from-sepia-700 to-sepia-900 text-white rounded-lg flex items-center justify-center shadow-md ${
                      isAdding || !amount || Number.parseFloat(amount) <= 0
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:from-sepia-800 hover:to-sepia-950"
                    }`}
                    whileHover={!isAdding && amount && Number.parseFloat(amount) > 0 ? { scale: 1.02 } : {}}
                    whileTap={!isAdding && amount && Number.parseFloat(amount) > 0 ? { scale: 0.98 } : {}}
                  >
                    {isAdding ? (
                      <div className="flex items-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                        />
                        Processing...
                      </div>
                    ) : (
                      <>
                        <PlusCircle className="h-5 w-5 mr-2" />
                        Add Money
                      </>
                    )}
                  </motion.button>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  {[500, 1000, 2000].map((quickAmount) => (
                    <motion.button
                      key={quickAmount}
                      onClick={() => setAmount(quickAmount.toString())}
                      className="py-2 px-4 bg-white border border-sepia-300 rounded-lg text-sepia-900 hover:bg-sepia-100 transition-colors shadow-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      ₹{quickAmount}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Transactions List */}
          <motion.div
            variants={itemVariants}
            className="bg-white rounded-2xl shadow-elegant border border-sepia-200 overflow-hidden"
          >
            <div className="p-8">
              <h2 className="font-playfair text-2xl text-sepia-900 font-bold mb-6">Transaction History</h2>

              {/* Tabs */}
              <div className="flex border-b border-sepia-200 mb-6">
                <button
                  onClick={() => {
                    setActiveTab("all")
                    setCurrentPage(1)
                  }}
                  className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                    activeTab === "all" ? "text-sepia-900" : "text-bronze-500 hover:text-sepia-700"
                  }`}
                >
                  All Transactions
                  {activeTab === "all" && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("credits")
                    setCurrentPage(1)
                  }}
                  className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                    activeTab === "credits" ? "text-sepia-900" : "text-bronze-500 hover:text-sepia-700"
                  }`}
                >
                  Credits
                  {activeTab === "credits" && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
                <button
                  onClick={() => {
                    setActiveTab("debits")
                    setCurrentPage(1)
                  }}
                  className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                    activeTab === "debits" ? "text-sepia-900" : "text-bronze-500 hover:text-sepia-700"
                  }`}
                >
                  Debits
                  {activeTab === "debits" && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold-500"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              </div>

              {isLoading && currentPage > 1 ? (
                <div className="flex justify-center py-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="w-8 h-8 border-3 border-sepia-200 border-t-sepia-700 rounded-full"
                  />
                </div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-12 bg-sepia-50 rounded-xl border border-sepia-200">
                  <div className="w-16 h-16 mx-auto mb-4 text-bronze-500">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-sepia-900 font-medium mb-2">No transactions found</p>
                  <p className="text-bronze-700 text-sm">
                    {activeTab === "all"
                      ? "Your transaction history will appear here"
                      : activeTab === "credits"
                        ? "No credits found in your transaction history"
                        : "No debits found in your transaction history"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`transactions-${currentPage}-${activeTab}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {transactions.map((transaction) => (
                        <motion.div
                          key={transaction._id}
                          className="bg-white p-4 rounded-lg shadow-sm border border-sepia-200 hover:border-sepia-300 transition-colors"
                          whileHover={{ x: 5 }}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-full ${
                                  transaction.type === "credit"
                                    ? "bg-green-100 text-green-600"
                                    : "bg-red-100 text-red-600"
                                }`}
                              >
                                {transaction.type === "credit" ? (
                                  <ArrowUpRight className="h-5 w-5" />
                                ) : (
                                  <ArrowDownLeft className="h-5 w-5" />
                                )}
                              </div>
                              <div>
                                <p className="text-sepia-900 font-medium">{transaction.description}</p>
                                <p className="text-sm text-bronze-700 flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {formatDate(transaction.date)}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`font-bold ${
                                transaction.type === "credit" ? "text-green-600" : "text-red-600"
                              }`}
                            >
                              {transaction.type === "credit" ? "+" : "-"}₹{transaction.amount.toFixed(2)}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>
              )}

              {/* Pagination Controls */}
              {transactions.length > 0 && (
                <div className="flex justify-between items-center mt-8">
                  <motion.button
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                      currentPage === 1
                        ? "bg-sepia-100 text-sepia-400 cursor-not-allowed"
                        : "bg-white text-sepia-900 border border-sepia-300 hover:bg-sepia-50 shadow-sm"
                    }`}
                    whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
                    whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
                  >
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Previous
                  </motion.button>

                  <span className="px-4 py-2 bg-white rounded-lg border border-sepia-200 text-sepia-900 font-medium shadow-sm">
                    Page {currentPage} of {totalPages}
                  </span>

                  <motion.button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                      currentPage === totalPages
                        ? "bg-sepia-100 text-sepia-400 cursor-not-allowed"
                        : "bg-white text-sepia-900 border border-sepia-300 hover:bg-sepia-50 shadow-sm"
                    }`}
                    whileHover={currentPage !== totalPages ? { scale: 1.05 } : {}}
                    whileTap={currentPage !== totalPages ? { scale: 0.95 } : {}}
                  >
                    Next
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default WalletPage
