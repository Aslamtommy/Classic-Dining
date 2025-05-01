"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ChevronLeft } from "lucide-react"
import RestaurantLogin from "../../Restaurent/RestaurentLogin"
import RestaurentSignup from "../../Restaurent/restaurentSignup"

interface RestaurantAuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialView?: "login" | "signup"
}

const RestaurantAuthModal: React.FC<RestaurantAuthModalProps> = ({ isOpen, onClose, initialView = "login" }) => {
  const [view, setView] = useState<"login" | "signup">(initialView)

  // Update view when initialView prop changes
  useEffect(() => {
    if (isOpen) {
      setView(initialView)
    }
  }, [initialView, isOpen])

  useEffect(() => {
    if (isOpen) {
      // Prevent scrolling when modal is open
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }

    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  const modalVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
      },
    },
    exit: {
      opacity: 0,
      y: 50,
      transition: {
        duration: 0.2,
      },
    },
  }

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.2 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />

          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  {view === "signup" && (
                    <button
                      onClick={() => setView("login")}
                      className="text-gray-800 hover:text-amber-600 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                  )}

                  <h2 className="text-2xl font-bold text-black mx-auto">
                    {view === "login" ? "Restaurant Login" : "Restaurant Signup"}
                  </h2>

                  <button onClick={onClose} className="text-gray-800 hover:text-amber-600 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6">
                  {view === "login" ? (
                    <>
                      <RestaurantLogin />
                      <div className="mt-6 text-center">
                        <p className="text-gray-700">
                          Don't have an account?{" "}
                          <button
                            onClick={() => setView("signup")}
                            className="text-amber-700 font-medium hover:underline"
                          >
                            Sign up
                          </button>
                        </p>
                      </div>
                    </>
                  ) : (
                    <RestaurentSignup />
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default RestaurantAuthModal
