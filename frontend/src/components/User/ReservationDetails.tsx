"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { fetchReservation, submitReview } from "../../Api/userApi"
import toast, { Toaster } from "react-hot-toast"
import { motion } from "framer-motion"
import {
  Calendar,
  Clock,
  Users,
  CreditCard,
  MapPin,
  Star,
  MessageSquare,
  CheckCircle,
  XCircle,
  Utensils,
  Phone,
  Mail,
  User,
} from "lucide-react"

const ReservationDetails = () => {
  const { id } = useParams<{ id: string }>()
  const [reservation, setReservation] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [rating, setRating] = useState<number>(0)
  const [comment, setComment] = useState<string>("")
  const [hoverRating, setHoverRating] = useState<number>(0)
  const navigate = useNavigate()

  useEffect(() => {
    const loadReservation = async () => {
      try {
        if (!id) throw new Error("Reservation ID is missing")
        setLoading(true)
        const data = await fetchReservation(id)
        setReservation(data)
      } catch (error: any) {
        setError(error.message)
        toast.error(error.message, { duration: 4000, position: "top-center" })
      } finally {
        setLoading(false)
      }
    }
    loadReservation()
  }, [id])

  const handlePayNow = () => {
    if (reservation?._id) {
      navigate(`/confirmation/${reservation._id}`)
    }
  }

  const handleSubmitReview = async () => {
    if (!rating) {
      toast.error("Please select a rating", { duration: 4000, position: "top-center" })
      return
    }
    try {
      if (id) {
        const response = await submitReview(id, { rating, comment })
        setReservation(response.data)
        setRating(0)
        setComment("")
        toast.success("Review submitted successfully", { duration: 4000, position: "top-center" })
      }
    } catch (error: any) {
      toast.error(error.message, { duration: 4000, position: "top-center" })
    }
  }

  if (loading) {
    return (
      <div className="bg-sepia-50 min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [0.98, 1, 0.98],
          }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 1.5,
          }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 border-4 border-sepia-200 border-t-sepia-700 rounded-full animate-spin mb-4"></div>
          <p className="text-xl font-playfair text-sepia-800">Loading reservation details...</p>
        </motion.div>
      </div>
    )
  }

  if (error || !reservation) {
    return (
      <div className="bg-sepia-50 min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-xl font-playfair">{error || "Reservation not found"}</div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "text-green-600 bg-green-50 border-green-200"
      case "cancelled":
      case "expired":
        return "text-red-600 bg-red-50 border-red-200"
      case "completed":
        return "text-blue-600 bg-blue-50 border-blue-200"
      default:
        return "text-amber-600 bg-amber-50 border-amber-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "confirmed":
      case "completed":
        return <CheckCircle className="w-5 h-5 mr-2" />
      case "cancelled":
      case "expired":
        return <XCircle className="w-5 h-5 mr-2" />
      default:
        return <Clock className="w-5 h-5 mr-2" />
    }
  }

  return (
    <div className="bg-gradient-to-b from-sepia-50 to-white min-h-screen pt-16 pb-16">
      <Toaster />
      <div className="max-w-4xl mx-auto px-4">
        {/* Header with restaurant image */}
        <div className="relative mb-8 rounded-xl overflow-hidden shadow-elegant">
          <div className="h-48 md:h-64 bg-sepia-200">
            <img
              src={reservation.branch?.mainImage || "/placeholder.svg?height=400&width=1200"}
              alt={reservation.branch?.name || "Restaurant"}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-sepia-900/80 via-sepia-900/40 to-transparent" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <h1 className="font-playfair text-3xl md:text-4xl font-bold mb-2">Reservation Details</h1>
              <p className="text-white/80">{reservation.branch?.name || "Branch Name Not Available"}</p>
            </motion.div>
          </div>
        </div>

        <motion.div
          className="bg-white rounded-xl shadow-elegant overflow-hidden mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header with status */}
          <div className="bg-sepia-50 p-6 border-b border-sepia-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sepia-700 text-sm">Reservation #{reservation._id.substring(0, 8)}</p>
                <p className="text-sepia-700 text-sm">
                  Created:{" "}
                  {new Date(reservation.createdAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div
                className={`px-4 py-2 rounded-full text-sm font-medium flex items-center ${getStatusColor(reservation.status)}`}
              >
                {getStatusIcon(reservation.status)}
                {reservation.status.toUpperCase()}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left column */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-sepia-900 mb-3 flex items-center">
                    <Calendar className="w-5 h-5 text-gold-600 mr-2" />
                    Reservation Details
                  </h3>
                  <div className="bg-sepia-50 rounded-lg p-4 border border-sepia-100">
                    <div className="flex items-start mb-3">
                      <Calendar className="w-5 h-5 text-gold-600 mt-1 mr-3" />
                      <div>
                        <p className="text-sm text-sepia-600">Date</p>
                        <p className="text-sepia-900 font-medium">
                          {new Date(reservation.reservationDate).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start mb-3">
                      <Clock className="w-5 h-5 text-gold-600 mt-1 mr-3" />
                      <div>
                        <p className="text-sm text-sepia-600">Time</p>
                        <p className="text-sepia-900 font-medium">{reservation.timeSlot}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Users className="w-5 h-5 text-gold-600 mt-1 mr-3" />
                      <div>
                        <p className="text-sm text-sepia-600">Party Size</p>
                        <p className="text-sepia-900 font-medium">{reservation.partySize} people</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-sepia-900 mb-3 flex items-center">
                    <Utensils className="w-5 h-5 text-gold-600 mr-2" />
                    Table Information
                  </h3>
                  <div className="bg-sepia-50 rounded-lg p-4 border border-sepia-100">
                    <p className="text-sepia-900 mb-2">
                      <span className="font-medium">Table Type:</span> {reservation.tableType?.name || "Not Available"}
                    </p>
                    <p className="text-sepia-900 mb-2">
                      <span className="font-medium">Quantity:</span> {reservation.tableQuantity}
                    </p>

                    {reservation.preferences && reservation.preferences.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sepia-900 font-medium mb-2">Preferences:</p>
                        <ul className="list-disc list-inside text-sepia-700 text-sm">
                          {reservation.preferences.map((pref: string, index: number) => (
                            <li key={index}>{pref}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {reservation.specialRequests && (
                      <div className="mt-4">
                        <p className="text-sepia-900 font-medium mb-2">Special Requests:</p>
                        <p className="text-sepia-700 text-sm bg-white p-3 rounded border border-sepia-200">
                          {reservation.specialRequests}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-sepia-900 mb-3 flex items-center">
                    <User className="w-5 h-5 text-gold-600 mr-2" />
                    Customer Information
                  </h3>
                  <div className="bg-sepia-50 rounded-lg p-4 border border-sepia-100">
                    <div className="flex items-start mb-3">
                      <User className="w-5 h-5 text-gold-600 mt-1 mr-3" />
                      <div>
                        <p className="text-sm text-sepia-600">Name</p>
                        <p className="text-sepia-900 font-medium">{reservation.user.name}</p>
                      </div>
                    </div>

                    <div className="flex items-start mb-3">
                      <Mail className="w-5 h-5 text-gold-600 mt-1 mr-3" />
                      <div>
                        <p className="text-sm text-sepia-600">Email</p>
                        <p className="text-sepia-900 font-medium">{reservation.user.email}</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <Phone className="w-5 h-5 text-gold-600 mt-1 mr-3" />
                      <div>
                        <p className="text-sm text-sepia-600">Phone</p>
                        <p className="text-sepia-900 font-medium">{reservation.user.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-sepia-900 mb-3 flex items-center">
                    <CreditCard className="w-5 h-5 text-gold-600 mr-2" />
                    Payment Details
                  </h3>
                  <div className="bg-sepia-50 rounded-lg p-4 border border-sepia-100">
                    <div className="flex items-start mb-3">
                      <CreditCard className="w-5 h-5 text-gold-600 mt-1 mr-3" />
                      <div className="flex-1">
                        <p className="text-sm text-sepia-600">Payment Status</p>
                        <p
                          className={`font-medium ${
                            reservation.status === "confirmed" || reservation.status === "completed"
                              ? "text-green-600"
                              : "text-amber-600"
                          }`}
                        >
                          {reservation.status === "confirmed" || reservation.status === "completed"
                            ? "Paid"
                            : "Pending Payment"}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 mt-4">
                      {reservation.tableType?.price && (
                        <div className="flex justify-between text-sepia-700">
                          <span>Table Price</span>
                          <span>₹{reservation.tableType.price}</span>
                        </div>
                      )}

                      {reservation.couponCode && (
                        <div className="flex justify-between text-sepia-700">
                          <span>Discount ({reservation.couponCode})</span>
                          <span>-₹{reservation.discountApplied}</span>
                        </div>
                      )}

                      <div className="border-t border-sepia-200 pt-2 mt-2">
                        <div className="flex justify-between font-medium text-sepia-900">
                          <span>Total Amount</span>
                          <span>₹{reservation.finalAmount || reservation.tableType?.price || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-sepia-900 mb-3 flex items-center">
                    <MapPin className="w-5 h-5 text-gold-600 mr-2" />
                    Restaurant Location
                  </h3>
                  <div className="bg-sepia-50 rounded-lg p-4 border border-sepia-100 flex items-start">
                    <MapPin className="w-5 h-5 text-gold-600 mt-1 mr-3" />
                    <div>
                      <p className="text-sepia-900">{reservation.branch?.address || "Address not available"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              {(reservation.status === "pending" || reservation.status === "payment_failed") && (
                <motion.button
                  onClick={handlePayNow}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 bg-gradient-to-r from-sepia-700 to-sepia-900 text-white rounded-lg hover:from-sepia-800 hover:to-sepia-950 transition-colors shadow-md font-medium"
                >
                  Complete Payment
                </motion.button>
              )}

              <motion.button
                onClick={() => navigate("/bookings")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 bg-sepia-100 text-sepia-900 rounded-lg hover:bg-sepia-200 transition-colors border border-sepia-300 font-medium"
              >
                Back to Bookings
              </motion.button>
            </div>
          </div>

          {/* Review Section */}
          {reservation.status === "completed" && (
            <div className="border-t border-sepia-200 p-6 bg-gradient-to-b from-white to-sepia-50">
              <h3 className="text-xl font-playfair font-semibold text-sepia-900 mb-4 flex items-center">
                <Star className="w-5 h-5 text-gold-500 mr-2" /> Leave a Review
              </h3>

              {!reservation.reviews || reservation.reviews.length === 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center mb-2">
                    <p className="mr-4 text-sepia-700">Your Rating:</p>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="text-2xl focus:outline-none"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= (hoverRating || rating) ? "text-amber-400 fill-amber-400" : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start">
                    <MessageSquare className="w-5 h-5 text-sepia-600 mt-2 mr-2" />
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Share your experience at this restaurant..."
                      className="w-full p-3 border border-sepia-300 rounded-lg text-sepia-700 focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
                      rows={4}
                    />
                  </div>

                  <motion.button
                    onClick={handleSubmitReview}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-gradient-to-r from-sepia-700 to-sepia-900 text-white rounded-lg hover:from-sepia-800 hover:to-sepia-950 transition-colors shadow-md font-medium"
                  >
                    Submit Review
                  </motion.button>
                </div>
              ) : (
                <div className="bg-white p-5 rounded-lg shadow-sm border border-sepia-200">
                  <h4 className="text-md font-medium text-sepia-900 mb-3">Your Review:</h4>
                  {reservation.reviews.map((review: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center">
                        {Array(5)
                          .fill(0)
                          .map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${i < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`}
                            />
                          ))}
                        <span className="ml-2 text-sm text-sepia-600">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.comment && (
                        <p className="text-sepia-800 bg-sepia-50 p-3 rounded-lg border border-sepia-100">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default ReservationDetails
