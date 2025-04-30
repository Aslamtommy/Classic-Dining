"use client"

import type React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { XCircle, RefreshCw, Home } from "lucide-react"

const FailurePage: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { errorMessage } = location.state || {}

  const handleTryAgain = () => {
    navigate(-1) // Go back to previous page
  }

  const handleGoHome = () => {
    navigate("/")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sepia-50 to-white flex items-center justify-center p-4">
      <motion.div
        className="max-w-md w-full bg-white rounded-2xl shadow-premium border border-sepia-200 overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="bg-gradient-to-r from-red-700 to-red-900 p-6 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 20 }}
            className="w-20 h-20 bg-white rounded-full mx-auto flex items-center justify-center"
          >
            <XCircle className="w-12 h-12 text-red-600" />
          </motion.div>
        </div>

        <div className="p-8">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
            <h1 className="font-playfair text-3xl text-sepia-900 font-bold mb-6 text-center">Payment Failed</h1>

            <div className="bg-red-50 rounded-xl p-6 mb-6 border border-red-200">
              <p className="text-red-700 text-center">
                {errorMessage ||
                  "We couldn't process your payment. Please try again or use a different payment method."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <motion.button
                onClick={handleTryAgain}
                className="py-3 bg-gradient-to-r from-sepia-700 to-sepia-900 text-white rounded-lg font-medium hover:from-sepia-800 hover:to-sepia-950 transition-all duration-300 shadow-md flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </motion.button>

              <motion.button
                onClick={handleGoHome}
                className="py-3 bg-white border border-sepia-300 text-sepia-900 rounded-lg font-medium hover:bg-sepia-50 transition-all duration-300 shadow-sm flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Home className="w-5 h-5 mr-2" />
                Go Home
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

export default FailurePage
