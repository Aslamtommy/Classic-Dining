import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coupon } from '../../../types/reservation';

interface CouponModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableCoupons: Coupon[];
  applyCoupon: (code: string) => void;
}

const CouponModal: React.FC<CouponModalProps> = ({ isOpen, onClose, availableCoupons, applyCoupon }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#2c2420] flex items-center">
              <span className="mr-2 text-[#d4a373]">✨</span> Exclusive Offers
            </h2>
            <button
              onClick={onClose}
              className="text-[#2c2420] hover:text-[#8b5d3b] text-lg"
            >
              ✕
            </button>
          </div>
          {availableCoupons.length > 0 ? (
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {availableCoupons.map((coupon) => (
                <motion.div
                  key={coupon._id}
                  className="p-4 bg-[#faf7f2] rounded-lg border border-[#d4a373] shadow-sm"
                  whileHover={{ scale: 1.02 }}
                >
                  <h3 className="font-bold text-[#2c2420]">{coupon.code}</h3>
                  <p className="text-sm text-[#8b5d3b]">
                    {coupon.discountType === 'percentage'
                      ? `${coupon.discount}% OFF`
                      : `₹${coupon.discount} OFF`}
                  </p>
                  <p className="text-xs text-[#2c2420]/60">
                    Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                  </p>
                  {coupon.minOrderAmount && (
                    <p className="text-xs text-[#2c2420]/60">
                      Min. Spend: ₹{coupon.minOrderAmount}
                    </p>
                  )}
                  <motion.button
                    onClick={() => applyCoupon(coupon.code)}
                    className="mt-2 px-4 py-1 bg-[#8b5d3b] text-white rounded-full text-sm font-medium hover:bg-[#d4a373] transition-all duration-300"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Apply
                  </motion.button>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-[#8b5d3b] text-sm italic">No offers available yet</p>
          )}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default CouponModal;