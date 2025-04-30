"use client"

import type React from "react"
import { motion } from "framer-motion"
import type { TableType } from "../../../types/reservation"
import { Users, DollarSign, Check, Filter, Star, Info } from "lucide-react"

interface TableSelectionProps {
  selectedTime: string
  filteredTables: TableType[]
  selectedTable: TableType | null
  setSelectedTable: (table: TableType) => void
  setIsFilterModalOpen: (open: boolean) => void
  partySize: number
  preferences: string[]
}

const TableSelection: React.FC<TableSelectionProps> = ({
  selectedTime,
  filteredTables,
  selectedTable,
  setSelectedTable,
  setIsFilterModalOpen,
  partySize,
  preferences,
}) => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
      },
    },
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-playfair text-sepia-900 font-semibold">Available Tables</h2>
        {selectedTime && (
          <motion.button
            type="button"
            onClick={() => setIsFilterModalOpen(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-sepia-700 hover:text-sepia-900 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Filter className="w-4 h-4 mr-1.5" />
            Sort Options
          </motion.button>
        )}
      </div>

      {selectedTime && filteredTables.length > 0 ? (
        <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-5">
          {filteredTables.map((table) => {
            const tableQuantity = Math.ceil(partySize / table.capacity)
            const matchesPreferences = preferences.every((pref) => table.features.includes(pref))
            const isSelected = selectedTable?._id === table._id

            return (
              <motion.div
                key={table._id}
                variants={itemVariants}
                className={`p-6 rounded-xl transition-all duration-300 ${
                  isSelected
                    ? "bg-gradient-to-r from-sepia-50 to-white border-2 border-sepia-600 shadow-premium"
                    : "bg-white border border-sepia-200 hover:border-sepia-300 shadow-elegant hover:shadow-md"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="font-playfair text-xl text-sepia-900 font-semibold">{table.name}</h3>
                      {matchesPreferences && preferences.length > 0 && (
                        <span className="ml-3 px-2.5 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium flex items-center">
                          <Check className="w-3 h-3 mr-1" />
                          Matches Preferences
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-3">
                      <div className="flex items-center text-sm text-bronze-700">
                        <Users className="w-4 h-4 mr-1.5 text-bronze-600" />
                        <span>Capacity: {table.capacity} people</span>
                      </div>

                      {tableQuantity > 1 && (
                        <div className="flex items-center text-sm text-bronze-700">
                          <Info className="w-4 h-4 mr-1.5 text-bronze-600" />
                          <span>Requires: {tableQuantity} tables</span>
                        </div>
                      )}

                      {table.price && (
                        <div className="flex items-center text-sm text-bronze-700">
                          <DollarSign className="w-4 h-4 mr-1.5 text-bronze-600" />
                          <span>Price: ₹{(table.price * tableQuantity).toFixed(2)}</span>
                        </div>
                      )}

                      {table.features.length > 0 && (
                        <div className="flex items-center text-sm text-bronze-700">
                          <Star className="w-4 h-4 mr-1.5 text-bronze-600" />
                          <span className="truncate">
                            Features: {table.features.map((f) => f.replace(/([A-Z])/g, " $1").trim()).join(", ")}
                          </span>
                        </div>
                      )}
                    </div>

                    {table.description && <p className="text-sm text-sepia-700 mt-2 italic">{table.description}</p>}
                  </div>

                  <div className="ml-4">
                    {isSelected ? (
                      <div className="px-4 py-2 bg-sepia-100 text-sepia-900 rounded-lg text-sm font-medium flex items-center">
                        <Check className="w-4 h-4 mr-1.5 text-sepia-700" />
                        Selected
                      </div>
                    ) : (
                      <motion.button
                        type="button"
                        onClick={() => setSelectedTable(table)}
                        className="px-5 py-2.5 bg-gradient-to-r from-sepia-700 to-sepia-900 text-white rounded-lg text-sm font-medium hover:from-sepia-800 hover:to-sepia-950 transition-all duration-300 shadow-md"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Select
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      ) : (
        <div className="p-8 bg-sepia-50 rounded-xl text-center border border-sepia-200">
          <div className="w-12 h-12 mx-auto mb-4 text-sepia-300">
            <Info className="w-full h-full" />
          </div>
          <p className="text-sepia-900 font-medium mb-1">
            {selectedTime ? "No tables available within this price range." : "Select a time slot to view availability."}
          </p>
          <p className="text-bronze-600 text-sm">
            {selectedTime
              ? "Try adjusting your filters or selecting a different time."
              : "Available tables will be shown here."}
          </p>
        </div>
      )}
    </div>
  )
}

export default TableSelection
