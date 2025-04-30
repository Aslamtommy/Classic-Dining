"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

interface ModalWrapperProps {
  show: boolean
  onClose: () => void
  children: React.ReactNode
  title?: string
}

const ModalWrapper = ({ show, onClose, children, title }: ModalWrapperProps) => {
  const [scrollY, setScrollY] = useState(0)

  // Capture scroll position when modal opens
  useEffect(() => {
    if (show) {
      setScrollY(window.scrollY)
      document.body.style.position = "fixed"
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = "100%"
    } else {
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
      window.scrollTo(0, scrollY)
    }

    return () => {
      document.body.style.position = ""
      document.body.style.top = ""
      document.body.style.width = ""
    }
  }, [show, scrollY])

  if (!show) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 30, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.4,
          }}
          className="bg-sepia-50 rounded-xl shadow-premium border-2 border-sepia-200 w-full max-w-md p-8 relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-20 h-20 border-l-3 border-t-3 border-sepia-300 opacity-60"></div>
          <div className="absolute top-0 right-0 w-20 h-20 border-r-3 border-t-3 border-sepia-300 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 border-l-3 border-b-3 border-sepia-300 opacity-60"></div>
          <div className="absolute bottom-0 right-0 w-20 h-20 border-r-3 border-b-3 border-sepia-300 opacity-60"></div>

          {/* Gold accent */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-gold-300/20 to-gold-500/20 rounded-full blur-xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-br from-gold-300/20 to-gold-500/20 rounded-full blur-xl"></div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-sepia-700 hover:text-sepia-900 transition-colors"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>

          {title && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h2 className="text-3xl font-playfair text-sepia-900 mb-2 text-center">{title}</h2>
              <div className="flex justify-center mb-6">
                <motion.div
                  className="h-1 w-16 bg-gradient-to-r from-gold-400 to-gold-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: 64 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                />
              </div>
            </motion.div>
          )}

          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default ModalWrapper
