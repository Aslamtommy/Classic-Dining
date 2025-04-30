"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { fetchReservation, submitReview } from "../../Api/userApi"
import toast, { Toaster } from "react-hot-toast"
import { motion } from "framer-motion"
import type { Reservation } from "../../types/reservation"

const ReservationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [rating, setRating] = useState<number>(0)
  const [comment, setComment] = useState<string>("")
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
      <div className="bg-[#faf7f2] min-h-screen flex items-center justify-center">
        <div className="text-[#2c2420] text-xl">Loading reservation details...</div>
      </div>
    )
  }

  if (error || !reservation) {
    return (
      <div className="bg-[#faf7f2] min-h-screen flex items-center justify-center">
        <div className="text-[#2c2420] text-xl">{error || "Reservation not found"}</div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-b from-sepia-50 to-white min-h-screen pt-16">
      <Toaster />
      <div className="max-w-3xl mx-auto px-4">
        <motion.h1
          className="font-playfair text-3xl text-sepia-900 font-bold mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Reservation Details
        </motion.h1>

        <motion.div
          className="bg-white rounded-lg shadow-elegant p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-4">
            {/* Existing reservation details */}
            <div>
              <h2 className="text-xl font-semibold text-sepia-900">
                {reservation.branch?.name || "Branch Name Not Available"}
              </h2>
              <p className="text-sepia-700 text-sm">
                Reserved On:{" "}
                {new Date(reservation.createdAt).toLocaleString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "numeric",
                  minute: "numeric",
                  hour12: true,
                })}
              </p>
              <p className="text-sepia-700 text-sm">
                Booking For: {new Date(reservation.reservationDate).toLocaleDateString()}
              </p>
              <p className="text-sepia-700 text-sm">Time: {reservation.timeSlot}</p>
            </div>

            <div>
              <p className="text-[#8b5d3b] text-sm">Table Type: {reservation.tableType?.name || "Not Available"}</p>
              <p className="text-[#8b5d3b] text-sm">Party Size: {reservation.partySize}</p>
              <p className="text-[#8b5d3b] text-sm">Table Quantity: {reservation.tableQuantity}</p>
            </div>

            <div>
              <p className="text-[#8b5d3b] text-sm">
                User: {reservation.user.name} ({reservation.user.email})
              </p>
              <p className="text-[#8b5d3b] text-sm">Phone: {reservation.user.phone}</p>
            </div>

            {reservation.preferences && reservation.preferences.length > 0 && (
              <div>
                <p className="text-[#2c2420] font-medium">Preferences:</p>
                <ul className="list-disc list-inside text-[#8b5d3b] text-sm">
                  {reservation.preferences.map((pref, index) => (
                    <li key={index}>{pref}</li>
                  ))}
                </ul>
              </div>
            )}

            {reservation.specialRequests && (
              <div>
                <p className="text-[#2c2420] font-medium">Special Requests:</p>
                <p className="text-[#8b5d3b] text-sm">{reservation.specialRequests}</p>
              </div>
            )}

            <div>
              {reservation.couponCode ? (
                <>
                  <p className="text-[#2c2420]/80 text-base">
                    Original Price:{" "}
                    <span className="text-[#8b5d3b] font-medium">₹{reservation.tableType?.price || "N/A"}</span>
                  </p>
                  <p className="text-[#2c2420]/80 text-base">
                    Coupon: <span className="text-[#8b5d3b] font-medium">{reservation.couponCode}</span> (-₹
                    {reservation.discountApplied})
                  </p>
                  <p className="text-[#2c2420] text-lg font-bold">
                    Final Amount: <span className="text-[#8b5d3b]">₹{reservation.finalAmount || "N/A"}</span>
                  </p>
                </>
              ) : (
                <p className="text-[#2c2420] text-lg font-bold">
                  Price: <span className="text-[#8b5d3b]">₹{reservation.tableType?.price || "N/A"}</span>
                </p>
              )}
            </div>

            <p
              className={`text-sm font-medium ${
                reservation.status === "confirmed"
                  ? "text-green-600"
                  : reservation.status === "cancelled" || reservation.status === "expired"
                    ? "text-red-600"
                    : reservation.status === "completed"
                      ? "text-blue-600"
                      : "text-yellow-600"
              }`}
            >
              Status: {reservation.status.toUpperCase()}
            </p>

            {(reservation.status === "pending" || reservation.status === "payment_failed") && (
              <button
                onClick={handlePayNow}
                className="px-4 py-2 bg-gradient-to-r from-sepia-700 to-sepia-900 text-white rounded-full hover:from-sepia-800 hover:to-sepia-950 transition-colors shadow-md"
              >
                Pay Now
              </button>
            )}

            {/* Review Section */}
            {reservation.status === "completed" && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-sepia-900 mb-2">Leave a Review</h3>
                {!reservation.reviews || reservation.reviews.length === 0 ? (
                  <div>
                    <div className="flex items-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => setRating(star)}
                          className={`text-2xl ${star <= rating ? "text-amber-400" : "text-gray-300"}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Write your review here..."
                      className="w-full p-2 border rounded text-sepia-700 mb-2"
                      rows={4}
                    />
                    <button
                      onClick={handleSubmitReview}
                      className="px-4 py-2 bg-gradient-to-r from-sepia-700 to-sepia-900 text-white rounded-full hover:from-sepia-800 hover:to-sepia-950 transition-colors shadow-md"
                    >
                      Submit Review
                    </button>
                  </div>
                ) : (
                  <div>
                    <h4 className="text-md font-medium text-sepia-900">Your Review:</h4>
                    {reservation.reviews.map((review, index) => (
                      <div key={index} className="mt-2">
                        <div className="flex items-center">
                          {Array(5)
                            .fill(0)
                            .map((_, i) => (
                              <span
                                key={i}
                                className={`text-xl ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                              >
                                ★
                              </span>
                            ))}
                        </div>
                        {review.comment && <p className="text-[#8b5d3b] text-sm mt-1">{review.comment}</p>}
                        <p className="text-gray-500 text-xs mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>

        <button
          onClick={() => navigate("/bookings")}
          className="mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          Back to Bookings
        </button>
      </div>
    </div>
  )
}

export default ReservationDetails
