"use client"

import type React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { CheckCircle, Calendar, ArrowRight } from "lucide-react"

const SuccessPage: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { paymentMethod, amount } = location.state || {}

  const handleGoToBookings = () => {
    navigate("/bookings")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sepia-50 to-white flex items-center justify-center p-4">
      <motion.div
        className="max-w-md w-full bg-white rounded-2xl shadow-premium border border-sepia-200 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-gradient-to-r from-sepia-700 to-sepia-900 p-6 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 20 }}
            className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center"
          >
            <CheckCircle className="w-12 h-12 text-green-600" />
          </motion.div>
        </div>

        <div className="p-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <h1 className="font-playfair text-3xl text-sepia-900 font-bold mb-6 text-center">Reservation Confirmed!</h1>

            <div className="bg-sepia-50 rounded-xl p-6 mb-6 border border-sepia-200">
              <div className="grid grid-cols-2 gap-y-4">
                <div className="text-bronze-700 font-medium">Payment Method:</div>
                <div className="text-sepia-900 font-semibold capitalize">{paymentMethod || "Unknown"}</div>

                <div className="text-bronze-700 font-medium">Amount Paid:</div>
                <div className="text-sepia-900 font-semibold">₹{amount?.toFixed(2) || "Unknown"}</div>
              </div>
            </div>

            <p className="text-sepia-700 text-center mb-8">
              Your table has been reserved. A confirmation email has been sent with all the details.
            </p>

            <motion.button
              onClick={handleGoToBookings}
              className="w-full py-3 bg-gradient-to-r from-sepia-700 to-sepia-900 text-white rounded-lg font-medium hover:from-sepia-800 hover:to-sepia-950 transition-all duration-300 shadow-md flex items-center justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Calendar className="w-5 h-5 mr-2" />
              View My Bookings
              <ArrowRight className="w-5 h-5 ml-2" />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default SuccessPage
