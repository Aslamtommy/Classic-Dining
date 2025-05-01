"use client"

import type React from "react"
import { useLocation, Link } from "react-router-dom"
import { motion } from "framer-motion"
import { AlertCircle, CheckCircle, ArrowLeft } from "lucide-react"

const PendingApproval: React.FC = () => {
  const location = useLocation()
  const { status, blockReason } = location.state || {}

  return (
    <div className="flex items-center justify-center min-h-screen bg-sepia-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-premium rounded-2xl p-10 max-w-md w-full text-center"
      >
        {status === "blocked" || blockReason ? (
          // Blocked state
          <>
            <div className="mb-6">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 15,
                  delay: 0.2,
                }}
                className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto"
              >
                <AlertCircle className="w-10 h-10 text-red-600" />
              </motion.div>
            </div>
            <h1 className="text-2xl font-playfair font-bold mb-4 text-red-600">Account Blocked</h1>
            <p className="text-sepia-700 mb-6">
              Your account has been blocked by the administrator. Please contact support to resolve this issue.
            </p>
            {blockReason && (
              <div className="bg-red-50 p-4 rounded-xl mb-6">
                <h3 className="text-sm font-medium text-red-800 mb-1">Block Reason:</h3>
                <p className="text-sm text-red-700">{blockReason}</p>
              </div>
            )}
          </>
        ) : (
          // Pending approval state
          <>
            <div className="mb-6">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 15,
                  delay: 0.2,
                }}
                className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto"
              >
                <CheckCircle className="w-10 h-10 text-blue-600" />
              </motion.div>
            </div>
            <h1 className="text-2xl font-playfair font-bold mb-4 text-sepia-900">Awaiting Approval</h1>
            <p className="text-sepia-700 mb-6">
              Your account is pending administrator approval. Once approved, you'll be able to:
            </p>
            <ul className="text-left space-y-3 mb-8 bg-sepia-50 p-4 rounded-xl">
              <li className="flex items-center text-sepia-800">
                <div className="w-6 h-6 bg-sepia-200 rounded-full flex items-center justify-center mr-3 text-sepia-800">
                  1
                </div>
                <span>Add branches</span>
              </li>
              <li className="flex items-center text-sepia-800">
                <div className="w-6 h-6 bg-sepia-200 rounded-full flex items-center justify-center mr-3 text-sepia-800">
                  2
                </div>
                <span>Modify menu items</span>
              </li>
              <li className="flex items-center text-sepia-800">
                <div className="w-6 h-6 bg-sepia-200 rounded-full flex items-center justify-center mr-3 text-sepia-800">
                  3
                </div>
                <span>Access full features</span>
              </li>
            </ul>
          </>
        )}

        <Link to="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-sepia-700 to-sepia-900 text-white rounded-lg font-medium text-sm shadow-md hover:from-sepia-800 hover:to-sepia-950 transition-all duration-300"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Home
          </motion.button>
        </Link>
      </motion.div>
    </div>
  )
}

export default PendingApproval
