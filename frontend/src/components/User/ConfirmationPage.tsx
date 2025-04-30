"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import toast, { Toaster } from "react-hot-toast"
import api from "../../Axios/userInstance"
import { confirmReservation, failReservation, fetchReservation, fetchWalletData } from "../../Api/userApi"
import type {
  Reservation,
  PaymentResponse,
  RazorpayOptions,
  RazorpayResponse,
  RazorpayErrorResponse,
} from "../../types/reservation"
import {
  Calendar,
  Clock,
  Users,
  DollarSign,
  Check,
  Wallet,
  CreditCard,
  MessageSquare,
  Phone,
  Mail,
  Star,
  Utensils,
  User,
} from "lucide-react"

const ConfirmationPage: React.FC = () => {
  const { reservationId } = useParams<{ reservationId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const [reservation, setReservation] = useState<Reservation | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false)
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [whatsappOptIn, setWhatsappOptIn] = useState<boolean>(false)

  useEffect(() => {
    const loadReservation = async () => {
      try {
        setLoading(true)
        if (reservationId) {
          console.log("Fetching reservation with ID:", reservationId)
          const data = await fetchReservation(reservationId)
          console.log("Reservation Data:", data)
          setReservation(data)
          setWhatsappOptIn(data.whatsappOptIn || false)
        } else if (location.state?.reservation) {
          console.log("Reservation from Location State:", location.state.reservation)
          setReservation(location.state.reservation as Reservation)
          setWhatsappOptIn((location.state.reservation as Reservation).whatsappOptIn || false)
        } else {
          console.error("No reservationId or location state provided")
          toast.error("Invalid reservation details", { duration: 4000, position: "top-center" })
          navigate("/booking")
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to load reservation details"
        console.error("Error loading reservation:", message, error)
        toast.error(message, { duration: 4000, position: "top-center" })
        navigate("/booking")
      } finally {
        setLoading(false)
      }
    }
    loadReservation()
  }, [reservationId, location, navigate])

  useEffect(() => {
    if (reservation) {
      const loadWalletData = async () => {
        try {
          console.log("Fetching wallet data")
          const walletData = await fetchWalletData()
          setWalletBalance(walletData.balance)
          console.log("Wallet Balance:", walletData.balance)
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Failed to load wallet balance"
          console.error("Error loading wallet data:", message, error)
          toast.error(message, { duration: 4000, position: "top-center" })
        }
      }
      loadWalletData()
    }
  }, [reservation])

  const handleRazorpayPayment = async () => {
    if (!reservation || isProcessing || reservation.status === "confirmed") {
      console.warn("Cannot initiate payment: ", { reservationExists: !!reservation, isProcessing, status: reservation?.status })
      return
    }

    setIsProcessing(true)

    try {
      console.log("Loading Razorpay checkout script")
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.async = true
      document.body.appendChild(script)

      await new Promise<void>((resolve, reject) => {
        script.onload = () => resolve()
        script.onerror = () => reject(new Error("Failed to load Razorpay checkout script"))
      })

      const paymentAmount =
        reservation.finalAmount !== undefined ? reservation.finalAmount : reservation.tableType.price
      console.log("Creating payment order with amount:", paymentAmount * 100, "currency: INR")

      const response = await api.post<PaymentResponse>("/payments/create-order", {
        amount: paymentAmount * 100,
        currency: "INR",
      })

      console.log("Payment order response:", response.data)

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to create payment order")
      }

      const orderData = response.data.data

      const options: RazorpayOptions = {
        key: "rzp_test_ihsNz6lracNIu3",
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.id,
        name: "ReserveBites",
        description: "Table Reservation Payment",
        image: "https://your-logo-url.com/logo.png",
        handler: async (response: RazorpayResponse) => {
          try {
            console.log("Payment successful, confirming reservation:", response)
            await confirmReservation(reservation._id, response.razorpay_payment_id, { whatsappOptIn })
            setPaymentSuccess(true)
            toast.success("Payment successful! Reservation confirmed.", {
              duration: 4000,
              position: "top-center",
            })
            navigate("/success", {
              state: {
                paymentId: response.razorpay_payment_id,
                amount: paymentAmount,
                paymentMethod: "razorpay",
              },
            })
          } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Failed to confirm reservation"
            console.error("Error confirming reservation:", message, error)
            toast.error(`${message}. Please contact support.`, {
              duration: 4000,
              position: "top-center",
            })
          } finally {
            setIsProcessing(false)
          }
        },
        modal: {
          ondismiss: async () => {
            if (paymentSuccess) return
            try {
              console.log("Payment modal dismissed, marking reservation as failed")
              await failReservation(reservation._id, "")
              toast.error("Payment cancelled. Reservation marked as payment failed.", {
                duration: 4000,
                position: "top-center",
              })
              navigate("/booking")
            } catch (error: unknown) {
              const message = error instanceof Error ? error.message : "Failed to update reservation status"
              console.error("Error marking reservation as failed:", message, error)
              toast.error(message, { duration: 4000, position: "top-center" })
            } finally {
              setIsProcessing(false)
            }
          },
        },
        prefill: {
          name: reservation.user.name,
          email: reservation.user.email,
          contact: reservation.user.phone,
        },
        theme: {
          color: "#8b5d3b",
        },
      }

      console.log("Opening Razorpay payment modal with options:", options)
      const razorpay = new window.Razorpay(options)
      razorpay.on("payment.failed", async (response: RazorpayErrorResponse) => {
        try {
          console.error("Payment failed:", response.error)
          await failReservation(reservation._id, response.error.metadata.payment_id || "")
          toast.error(`Payment failed: ${response.error.description || "Unknown error"}. Reservation marked as payment failed.`, {
            duration: 4000,
            position: "top-center",
          })
          navigate("/booking")
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : "Failed to update reservation status"
          console.error("Error handling payment failure:", message, error)
          toast.error(message, { duration: 4000, position: "top-center" })
        } finally {
          setIsProcessing(false)
        }
      })

      razorpay.open()
    } catch (error: unknown) {
      let message = error instanceof Error ? error.message : "Payment initialization failed"
      if (message.includes("Razorpay error")) {
        message = message.replace("Razorpay error:", "").trim() || "Payment service is currently unavailable"
      }
      console.error("Error initializing Razorpay payment:", message, error)
      toast.error(`${message}. Please try again or contact support.`, {
        duration: 4000,
        position: "top-center",
      })
      setIsProcessing(false)
    }
  }

  const handleWalletPayment = async () => {
    if (!reservation || isProcessing) {
      console.warn("Cannot initiate wallet payment: ", { reservationExists: !!reservation, isProcessing })
      return
    }

    setIsProcessing(true)

    try {
      const paymentAmount =
        reservation.finalAmount !== undefined ? reservation.finalAmount : reservation.tableType.price
      console.log("Confirming reservation with wallet payment, amount:", paymentAmount)
      await api.post(`/reservations/${reservation._id}/confirm-wallet`, { whatsappOptIn })
      setPaymentSuccess(true)
      toast.success("Payment successful! Reservation confirmed.", {
        duration: 4000,
        position: "top-center",
      })
      navigate("/success", {
        state: {
          paymentMethod: "wallet",
          amount: paymentAmount,
        },
      })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Failed to confirm reservation with wallet"
      console.error("Error processing wallet payment:", message, error)
      toast.error(message, { duration: 4000, position: "top-center" })
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading || !reservation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sepia-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sepia-200 border-t-sepia-700 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sepia-900 font-playfair text-xl">Loading reservation details...</p>
        </div>
      </div>
    )
  }

  const paymentAmount = reservation.finalAmount !== undefined ? reservation.finalAmount : reservation.tableType.price

  return (
    <div className="min-h-screen bg-gradient-to-b from-sepia-50 to-white py-12 px-4">
      <Toaster />
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="bg-white rounded-xl shadow-premium border border-sepia-200 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-gradient-to-r from-sepia-700 to-sepia-900 p-6 text-white">
            <h1 className="font-playfair text-3xl font-bold text-center">Confirm Your Reservation</h1>
          </div>

          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-6">
                <div className="flex items-start">
                  <Utensils className="w-6 h-6 text-sepia-700 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-bronze-700 text-sm font-medium">Restaurant</h3>
                    <p className="text-sepia-900 text-lg font-playfair">{reservation.branch.name}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="w-6 h-6 text-sepia-700 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-bronze-700 text-sm font-medium">Date</h3>
                    <p className="text-sepia-900">
                      {new Date(reservation.reservationDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="w-6 h-6 text-sepia-700 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-bronze-700 text-sm font-medium">Time</h3>
                    <p className="text-sepia-900">{reservation.timeSlot}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Users className="w-6 h-6 text-sepia-700 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-bronze-700 text-sm font-medium">Party Size</h3>
                    <p className="text-sepia-900">{reservation.partySize} people</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Star className="w-6 h-6 text-sepia-700 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-bronze-700 text-sm font-medium">Preferences</h3>
                    <p className="text-sepia-900">
                      {reservation.preferences && reservation.preferences.length > 0
                        ? reservation.preferences.map((p) => p.replace(/([A-Z])/g, " $1").trim()).join(", ")
                        : "None"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start">
                  <Utensils className="w-6 h-6 text-sepia-700 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-bronze-700 text-sm font-medium">Selected Table</h3>
                    <p className="text-sepia-900 text-lg font-playfair">{reservation.tableType.name}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <MessageSquare className="w-6 h-6 text-sepia-700 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-bronze-700 text-sm font-medium">Special Requests</h3>
                    <p className="text-sepia-900">{reservation.specialRequests || "No special requests"}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Check className="w-6 h-6 text-sepia-700 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-bronze-700 text-sm font-medium">Reservation Status</h3>
                    <p className="text-sepia-900 capitalize">{reservation.status}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <DollarSign className="w-6 h-6 text-sepia-700 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-bronze-700 text-sm font-medium">Payment Details</h3>
                    {reservation.couponCode ? (
                      <div>
                        <p className="text-sepia-700 text-sm">
                          Original Price: ₹{(reservation.tableType.price * reservation.tableQuantity).toFixed(2)}
                        </p>
                        <p className="text-sepia-700 text-sm">
                          Coupon Applied: {reservation.couponCode} (-₹{reservation.discountApplied?.toFixed(2) || 0})
                        </p>
                        <p className="text-sepia-900 text-xl font-semibold">
                          Final Amount: ₹{paymentAmount.toFixed(2)}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sepia-900 text-xl font-semibold">
                        ₹{(reservation.tableType.price * reservation.tableQuantity).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start">
                  <Wallet className="w-6 h-6 text-sepia-700 mr-3 mt-0.5" />
                  <div>
                    <h3 className="text-bronze-700 text-sm font-medium">Wallet Balance</h3>
                    <p className="text-sepia-900 text-xl font-semibold">
                      {walletBalance !== null ? `₹${walletBalance.toFixed(2)}` : "Loading..."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-sepia-50 rounded-xl p-6 mb-8 border border-sepia-200">
              <h3 className="text-sepia-900 font-playfair text-lg font-semibold mb-4">Contact Information</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex items-center">
                  <User className="w-5 h-5 text-sepia-700 mr-2" />
                  <span className="text-sepia-900">{reservation.user.name}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-sepia-700 mr-2" />
                  <span className="text-sepia-900">{reservation.user.email}</span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-sepia-700 mr-2" />
                  <span className="text-sepia-900">{reservation.user.phone}</span>
                </div>
              </div>
            </div>

            {reservation.status === "confirmed" ? (
              <div className="bg-green-50 p-6 rounded-xl border border-green-200 text-center">
                <Check className="w-10 h-10 text-green-600 mx-auto mb-2" />
                <p className="text-green-800 font-medium text-lg">
                  This reservation is already confirmed. A confirmation email was sent to {reservation.user.email}.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-sepia-700 text-center">
                  Upon successful payment, a confirmation email will be sent to {reservation.user.email}. Please check
                  your spam/junk folder if you don't see it in your inbox.
                </p>

                <label className="flex items-center justify-center text-sepia-900 bg-sepia-50 p-4 rounded-lg border border-sepia-200">
                  <input
                    type="checkbox"
                    checked={whatsappOptIn}
                    onChange={(e) => setWhatsappOptIn(e.target.checked)}
                    className="mr-2 h-4 w-4 text-sepia-700 border-sepia-300 rounded focus:ring-sepia-600"
                  />
                  Receive confirmation via WhatsApp
                </label>

                <div className="grid md:grid-cols-2 gap-4">
                  <motion.button
                    onClick={handleWalletPayment}
                    disabled={isProcessing || walletBalance === null || walletBalance < paymentAmount}
                    className={`py-4 bg-gradient-to-r from-sepia-700 to-sepia-900 text-white rounded-lg font-medium hover:from-sepia-800 hover:to-sepia-950 transition-all duration-300 shadow-md flex items-center justify-center ${
                      isProcessing || walletBalance === null || walletBalance < paymentAmount
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    whileHover={
                      isProcessing || walletBalance === null || walletBalance < paymentAmount ? {} : { scale: 1.02 }
                    }
                    whileTap={
                      isProcessing || walletBalance === null || walletBalance < paymentAmount ? {} : { scale: 0.98 }
                    }
                  >
                    {isProcessing ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      <>
                        <Wallet className="w-5 h-5 mr-2" />
                        Pay with Wallet
                      </>
                    )}
                  </motion.button>

                  <motion.button
                    onClick={handleRazorpayPayment}
                    disabled={isProcessing || reservation.status === "cancelled"}
                    className={`py-4 bg-gradient-to-r from-sepia-700 to-sepia-900 text-white rounded-lg font-medium hover:from-sepia-800 hover:to-sepia-950 transition-all duration-300 shadow-md flex items-center justify-center ${
                      isProcessing || reservation.status === "cancelled" ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    whileHover={isProcessing || reservation.status === "cancelled" ? {} : { scale: 1.02 }}
                    whileTap={isProcessing || reservation.status === "cancelled" ? {} : { scale: 0.98 }}
                  >
                    {isProcessing ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </div>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Pay with Razorpay
                      </>
                    )}
                  </motion.button>
                </div>

                {walletBalance !== null && walletBalance < paymentAmount && (
                  <p className="text-red-600 text-sm text-center">
                    Insufficient wallet balance. Please add money or use another payment method.
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default ConfirmationPage