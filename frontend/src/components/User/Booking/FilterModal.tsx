"use client"

import type React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SlidersHorizontal, X, ArrowDownNarrowWide, ArrowUpNarrowWide, Check } from "lucide-react"

interface FilterModalProps {
  isOpen: boolean
  onClose: () => void
  sortOrder: "asc" | "desc"
  setSortOrder: (order: "asc" | "desc") => void
}

const FilterModal: React.FC<FilterModalProps> = ({ isOpen, onClose, sortOrder, setSortOrder }) => (
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
          className="bg-white rounded-xl p-8 w-full max-w-md shadow-premium border border-sepia-200 overflow-hidden"
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-playfair text-sepia-900 flex items-center">
              <SlidersHorizontal className="w-6 h-6 mr-3 text-gold-600" />
              Sort Options
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

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <motion.button
                onClick={() => setSortOrder("asc")}
                className={`px-5 py-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center ${
                  sortOrder === "asc"
                    ? "bg-gradient-to-r from-sepia-700 to-sepia-900 text-white shadow-md"
                    : "bg-sepia-50 text-sepia-900 hover:bg-sepia-100"
                }`}
                whileHover={{ scale: sortOrder !== "asc" ? 1.03 : 1 }}
                whileTap={{ scale: sortOrder !== "asc" ? 0.97 : 1 }}
              >
                <ArrowUpNarrowWide className="w-4 h-4 mr-2" />
                <span>Low to High</span>
                {sortOrder === "asc" && <Check className="w-4 h-4 ml-2" />}
              </motion.button>

              <motion.button
                onClick={() => setSortOrder("desc")}
                className={`px-5 py-3 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center ${
                  sortOrder === "desc"
                    ? "bg-gradient-to-r from-sepia-700 to-sepia-900 text-white shadow-md"
                    : "bg-sepia-50 text-sepia-900 hover:bg-sepia-100"
                }`}
                whileHover={{ scale: sortOrder !== "desc" ? 1.03 : 1 }}
                whileTap={{ scale: sortOrder !== "desc" ? 0.97 : 1 }}
              >
                <ArrowDownNarrowWide className="w-4 h-4 mr-2" />
                <span>High to Low</span>
                {sortOrder === "desc" && <Check className="w-4 h-4 ml-2" />}
              </motion.button>
            </div>

            <motion.button
              onClick={onClose}
              className="w-full py-3 bg-gradient-to-r from-sepia-700 to-sepia-900 text-white rounded-lg font-medium hover:from-sepia-800 hover:to-sepia-950 transition-all duration-300 shadow-md mt-4"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Apply Sorting
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
)

export default FilterModal
