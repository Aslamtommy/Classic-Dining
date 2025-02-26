import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
  maxPrice: number;
  sortOrder: 'asc' | 'desc' | null;
  setSortOrder: (order: 'asc' | 'desc' | null) => void;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  priceRange,
  setPriceRange,
  maxPrice,
  sortOrder,
  setSortOrder,
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-[#2c2420]">Filter by Price</h2>
            <button
              onClick={onClose}
              className="text-[#2c2420] hover:text-[#8b5d3b] text-lg"
            >
              ✕
            </button>
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-[#2c2420]">₹{priceRange[0]}</span>
                <span className="text-sm text-[#2c2420]">₹{priceRange[1]}</span>
              </div>
              <input
                type="range"
                min={0}
                max={maxPrice}
                value={priceRange[0]}
                onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                className="w-full h-2 bg-[#e8e2d9] rounded-lg appearance-none cursor-pointer accent-[#8b5d3b]"
              />
              <input
                type="range"
                min={0}
                max={maxPrice}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                className="w-full h-2 bg-[#e8e2d9] rounded-lg appearance-none cursor-pointer accent-[#8b5d3b] mt-2"
              />
            </div>
            <div className="flex gap-4">
              <motion.button
                onClick={() => setSortOrder('asc')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  sortOrder === 'asc'
                    ? 'bg-[#8b5d3b] text-white'
                    : 'bg-[#e8e2d9] text-[#2c2420] hover:bg-[#d4a373] hover:text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Price: Low to High
              </motion.button>
              <motion.button
                onClick={() => setSortOrder('desc')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  sortOrder === 'desc'
                    ? 'bg-[#8b5d3b] text-white'
                    : 'bg-[#e8e2d9] text-[#2c2420] hover:bg-[#d4a373] hover:text-white'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Price: High to Low
              </motion.button>
            </div>
            <motion.button
              onClick={onClose}
              className="w-full py-2 bg-[#8b5d3b] text-white rounded-full font-medium hover:bg-[#d4a373] transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Apply Filters
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default FilterModal;