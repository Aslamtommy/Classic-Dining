"use client"

import type React from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { Coupon } from "../../../types/reservation"
import { Gift, X, Check, Calendar, Tag } from "lucide-react"

interface CouponModalProps {
  isOpen: boolean
  onClose: () => void
  availableCoupons: Coupon[]
  applyCoupon: (code: string) => void
}

const CouponModal: React.FC<CouponModalProps> = ({ isOpen, onClose, availableCoupons, applyCoupon }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-white rounded-xl p-8 w-full max-w-lg shadow-premium border border-sepia-200 overflow-hidden"
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-playfair text-sepia-900 flex items-center">
              <Gift className="w-6 h-6 mr-3 text-gold-600" />
              Exclusive Offers
            </h2>
            <motion.button
              onClick={onClose}
              className="text-sepia-700 hover:text-sepia-900 transition-colors p-1 rounded-full hover:bg-sepia-50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="h-px w-full bg-sepia-100 mb-6"></div>

          {availableCoupons.length > 0 ? (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {availableCoupons.map((coupon) => (
                <motion.div
                  key={coupon._id}
                  className="p-5 bg-gradient-to-r from-sepia-50 to-white rounded-lg border border-sepia-200 shadow-elegant relative overflow-hidden group"
                  whileHover={{ y: -4, boxShadow: "0 10px 25px -5px rgba(107, 82, 34, 0.15)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gold-500/10 rounded-full -mr-8 -mt-8 z-0"></div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-playfair text-xl text-sepia-900 font-semibold">{coupon.code}</h3>
                      <span className="px-3 py-1 bg-gold-100 text-gold-800 rounded-full text-xs font-medium">
                        {coupon.discountType === "percentage" ? `${coupon.discount}% OFF` : `₹${coupon.discount} OFF`}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-bronze-700 mb-4">
                      <Calendar className="w-4 h-4 mr-1.5" />
                      <span>
                        Expires: {new Date(coupon.expiryDate).toLocaleDateString("en-US", { dateStyle: "medium" })}
                      </span>
                    </div>

                    {coupon.minOrderAmount && (
                      <div className="flex items-center text-sm text-bronze-700 mb-4">
                        <Tag className="w-4 h-4 mr-1.5" />
                        <span>Min. Spend: ₹{coupon.minOrderAmount}</span>
                      </div>
                    )}

                    <motion.button
                      onClick={() => applyCoupon(coupon.code)}
                      className="mt-2 px-5 py-2 bg-gradient-to-r from-sepia-700 to-sepia-900 text-white rounded-full text-sm font-medium hover:from-sepia-800 hover:to-sepia-950 transition-all duration-300 shadow-md flex items-center justify-center w-full group-hover:shadow-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Check className="w-4 h-4 mr-1.5" />
                      Apply Coupon
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 text-sepia-300">
                <Gift className="w-full h-full" />
              </div>
              <p className="text-sepia-700 text-lg font-playfair mb-2">No offers available yet</p>
              <p className="text-bronze-600 text-sm">Check back later for exclusive discounts</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
)

export default CouponModal
