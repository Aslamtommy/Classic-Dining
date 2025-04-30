"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { fetchUserReservations, cancelReservation } from "../../Api/userApi"
import toast, { Toaster } from "react-hot-toast"
import { motion, AnimatePresence } from "framer-motion"
import type { Reservation } from "../../types/reservation"
import {
  Calendar,
  Clock,
  Users,
  DollarSign,
  Tag,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Filter,
  ChevronDown,
} from "lucide-react"

const Bookings: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [total, setTotal] = useState<number>(0)
  const [page, setPage] = useState<number>(1)
  const [limit] = useState<number>(10)
  const [status, setStatus] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false)
  const navigate = useNavigate()

  useEffect(() => {
    const loadReservations = async () => {
      try {
        setLoading(true)
        const data = await fetchUserReservations(page, limit, status)
        setReservations(data.reservations)
        setTotal(data.total)
      } catch (error: any) {
        setError(error.message)
        toast.error(error.message, { duration: 4000, position: "top-center" })
      } finally {
        setLoading(false)
      }
    }
    loadReservations()
  }, [page, status])

  const handlePayNow = (reservationId: string) => {
    navigate(`/confirmation/${reservationId}`)
  }

  const handleCancel = (reservationId: string) => {
    toast(
      (t) => (
        <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-lg border border-sepia-200">
          <AlertTriangle className="w-12 h-12 text-red-500 mb-3" />
          <p className="mb-4 text-sepia-900 font-medium text-center">
            Are you sure you want to cancel this reservation?
          </p>
          <div className="flex space-x-4">
            <button
              onClick={async () => {
                try {
                  await cancelReservation(reservationId)
                  const data = await fetchUserReservations(page, limit, status)
                  setReservations(data.reservations)
                  setTotal(data.total)
                  toast.dismiss(t.id)
                  toast.success("Reservation cancelled successfully", {
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
                } catch (error: any) {
                  toast.dismiss(t.id)
                  toast.error(error.message, { duration: 4000, position: "top-center" })
                }
              }}
              className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-md hover:from-red-700 hover:to-red-800 transition-colors shadow-md"
            >
              Yes, Cancel
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-6 py-2 bg-white text-sepia-900 border border-sepia-300 rounded-md hover:bg-sepia-50 transition-colors"
            >
              No, Keep It
            </button>
          </div>
        </div>
      ),
      {
        duration: Number.POSITIVE_INFINITY,
        position: "top-center",
      },
    )
  }

  const handleViewDetails = (reservationId: string) => {
    navigate(`/bookings/${reservationId}`)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-300"
      case "cancelled":
      case "expired":
        return "bg-red-100 text-red-800 border-red-300"
      case "pending":
        return "bg-sepia-100 text-sepia-800 border-sepia-300"
      case "payment_failed":
        return "bg-orange-100 text-orange-800 border-orange-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  if (loading) {
    return (
      <div className="bg-sepia-50 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
            className="w-16 h-16 border-4 border-sepia-200 border-t-sepia-700 rounded-full mb-4"
          />
          <p className="text-sepia-700 font-medium">Loading your reservations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-sepia-50 min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md border border-sepia-200 max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-center text-sepia-900 font-medium">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 w-full py-2 bg-sepia-700 text-white rounded-md hover:bg-sepia-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-b from-sepia-50 to-white min-h-screen  ">
      <Toaster />
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="font-playfair text-4xl md:text-5xl text-sepia-900 font-bold mb-4">Your Reservations</h1>
          <div className="h-1 w-24 bg-gold-500 mx-auto"></div>
        </motion.div>

        {/* Filter Section */}
        <motion.div
          className="mb-8 bg-white rounded-lg shadow-md border border-sepia-200 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="p-4 flex justify-between items-center">
            <div className="flex items-center">
              <Filter className="w-5 h-5 text-sepia-700 mr-2" />
              <h3 className="font-playfair text-lg text-sepia-900">Filter Reservations</h3>
            </div>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="text-sepia-700 hover:text-gold-700 transition-colors"
            >
              <ChevronDown
                className={`w-5 h-5 transition-transform duration-300 ${isFilterOpen ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          <AnimatePresence>
            {isFilterOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="px-4 pb-4 overflow-hidden"
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  <button
                    onClick={() => {
                      setStatus(undefined)
                      setPage(1)
                    }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      status === undefined
                        ? "bg-sepia-700 text-white"
                        : "bg-sepia-100 text-sepia-700 hover:bg-sepia-200"
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => {
                      setStatus("pending")
                      setPage(1)
                    }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      status === "pending"
                        ? "bg-sepia-700 text-white"
                        : "bg-sepia-100 text-sepia-800 hover:bg-sepia-200"
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => {
                      setStatus("confirmed")
                      setPage(1)
                    }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      status === "confirmed"
                        ? "bg-green-500 text-white"
                        : "bg-green-100 text-green-700 hover:bg-green-200"
                    }`}
                  >
                    Confirmed
                  </button>
                  <button
                    onClick={() => {
                      setStatus("cancelled")
                      setPage(1)
                    }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      status === "cancelled" ? "bg-red-500 text-white" : "bg-red-100 text-red-700 hover:bg-red-200"
                    }`}
                  >
                    Cancelled
                  </button>
                  <button
                    onClick={() => {
                      setStatus("payment_failed")
                      setPage(1)
                    }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      status === "payment_failed"
                        ? "bg-orange-500 text-white"
                        : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                    }`}
                  >
                    Payment Failed
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Reservations List */}
        {reservations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white p-8 rounded-lg shadow-md border border-sepia-200 text-center"
          >
            <img
              src="/placeholder.svg?height=120&width=120"
              alt="No reservations"
              className="w-24 h-24 mx-auto mb-4 opacity-50"
            />
            <p className="text-sepia-700 text-lg mb-2">No reservations found for the selected status.</p>
            <p className="text-bronze-600 mb-6">Try selecting a different filter or make a new reservation.</p>
            <button
              onClick={() => navigate("/restaurentList")}
              className="px-6 py-2 bg-gradient-to-r from-sepia-700 to-sepia-900 text-white rounded-md hover:from-sepia-800 hover:to-sepia-950 transition-colors shadow-md"
            >
              Browse Restaurants
            </button>
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-6">
            {reservations.map((res) => (
              <motion.div
                key={res._id}
                variants={itemVariants}
                className="bg-white rounded-lg shadow-md border border-sepia-200 overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="md:flex">
                  {/* Left side with image or placeholder */}
                  <div className="md:w-1/3 bg-sepia-50 relative">
                    <img
                      src={res.branch?.mainImage || "/placeholder.svg?height=300&width=400"}
                      alt={res.branch?.name || "Restaurant"}
                      className="w-full h-48 md:h-full object-cover"
                      style={{ maxHeight: "220px" }}
                    />
                    <div className="absolute top-0 right-0 m-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(res.status)}`}
                      >
                        {res.status.replace("_", " ")}
                      </span>
                    </div>
                  </div>

                  {/* Right side with details */}
                  <div className="p-6 md:w-2/3 flex flex-col justify-between">
                    <div>
                      <h2 className="text-2xl font-playfair font-bold text-sepia-900 mb-2">
                        {res.branch?.name || "Restaurant Name Not Available"}
                      </h2>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div className="flex items-start">
                          <Calendar className="w-5 h-5 text-bronze-700 mr-2 mt-0.5" />
                          <div>
                            <p className="text-sm text-bronze-500 font-medium">Date</p>
                            <p className="text-sepia-900">
                              {new Date(res.reservationDate).toLocaleDateString("en-US", {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <Clock className="w-5 h-5 text-bronze-700 mr-2 mt-0.5" />
                          <div>
                            <p className="text-sm text-bronze-500 font-medium">Time</p>
                            <p className="text-sepia-900">{res.timeSlot}</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <Users className="w-5 h-5 text-bronze-700 mr-2 mt-0.5" />
                          <div>
                            <p className="text-sm text-bronze-500 font-medium">Party Size</p>
                            <p className="text-sepia-900">{res.partySize} people</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <DollarSign className="w-5 h-5 text-bronze-700 mr-2 mt-0.5" />
                          <div>
                            <p className="text-sm text-bronze-500 font-medium">Table Type</p>
                            <p className="text-sepia-900">{res.tableType?.name || "Standard"}</p>
                          </div>
                        </div>
                      </div>

                      {/* Price details */}
                      <div className="mt-6 p-4 bg-sepia-50 rounded-lg">
                        {res.couponCode ? (
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <p className="text-sepia-900">Original Price:</p>
                              <p className="text-sepia-900 font-medium">₹{res.tableType?.price || "N/A"}</p>
                            </div>
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">
                                <Tag className="w-4 h-4 text-green-600 mr-1" />
                                <p className="text-green-700">Coupon: {res.couponCode}</p>
                              </div>
                              <p className="text-green-700 font-medium">-₹{res.discountApplied}</p>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-sepia-200">
                              <p className="text-sepia-900 font-bold">Final Amount:</p>
                              <p className="text-sepia-900 font-bold">₹{res.finalAmount || "N/A"}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <p className="text-sepia-900 font-bold">Price:</p>
                            <p className="text-sepia-900 font-bold">₹{res.tableType?.price || "N/A"}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-3 mt-6 justify-end">
                      {(res.status === "pending" || res.status === "payment_failed") && (
                        <motion.button
                          onClick={() => handlePayNow(res._id)}
                          className="px-5 py-2 bg-gradient-to-r from-sepia-700 to-sepia-900 text-white rounded-md hover:from-sepia-800 hover:to-sepia-950 transition-colors shadow-md flex items-center"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <DollarSign className="w-4 h-4 mr-1" />
                          Pay Now
                        </motion.button>
                      )}
                      {res.status === "confirmed" && (
                        <motion.button
                          onClick={() => handleCancel(res._id)}
                          className="px-5 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-md hover:from-red-700 hover:to-red-800 transition-colors shadow-md flex items-center"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          Cancel
                        </motion.button>
                      )}
                      <motion.button
                        onClick={() => handleViewDetails(res._id)}
                        className="px-5 py-2 bg-white border border-sepia-300 text-sepia-900 rounded-md hover:bg-sepia-50 transition-colors flex items-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                        View Details
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Pagination Controls */}
        {reservations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
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
              onClick={() => setPage((prev) => (total > prev * limit ? prev + 1 : prev))}
              disabled={page * limit >= total}
              className={`flex items-center px-5 py-2 rounded-md transition-colors ${
                page * limit >= total
                  ? "bg-sepia-100 text-sepia-400 cursor-not-allowed"
                  : "bg-white text-sepia-900 border border-sepia-300 hover:bg-sepia-50 shadow-sm"
              }`}
              whileHover={page * limit < total ? { scale: 1.05 } : {}}
              whileTap={page * limit < total ? { scale: 0.95 } : {}}
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

export default Bookings
