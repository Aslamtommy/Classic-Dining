import React from 'react';
import { motion } from 'framer-motion';
import { TableType } from '../../../types/types';

interface TableSelectionProps {
  selectedTime: string;
  filteredTables: TableType[];
  selectedTable: TableType | null;
  setSelectedTable: (table: TableType) => void;
  setIsFilterModalOpen: (open: boolean) => void;
}

const TableSelection: React.FC<TableSelectionProps> = ({
  selectedTime,
  filteredTables,
  selectedTable,
  setSelectedTable,
  setIsFilterModalOpen,
}) => (
  <div className="mb-8">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold text-[#2c2420] tracking-tight">
        Available Tables
      </h2>
      {selectedTime && (
        <button
          type="button"
          onClick={() => setIsFilterModalOpen(true)}
          className="text-[#d4a373] text-sm font-medium hover:text-[#8b5d3b] transition-colors"
        >
          Filter & Sort
        </button>
      )}
    </div>
    {selectedTime && filteredTables.length > 0 ? (
      <div className="space-y-4">
        {filteredTables.map((table) => (
          <motion.div
            key={table._id}
            className={`p-5 bg-white border rounded-lg shadow-sm transition-all duration-300 ${
              selectedTable?._id === table._id
                ? 'border-[#8b5d3b] bg-[#faf7f2]'
                : 'border-[#e8e2d9] hover:shadow-md'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium text-[#2c2420] text-lg">{table.name}</h3>
                <p className="text-[#8b5d3b] text-sm">Capacity: {table.capacity} people</p>
                {table.price && (
                  <p className="text-[#8b5d3b] text-sm">Price: ₹{table.price}</p>
                )}
                {table.description && (
                  <p className="text-[#2c2420]/70 text-sm mt-1">{table.description}</p>
                )}
              </div>
              <motion.button
                type="button"
                onClick={() => setSelectedTable(table)}
                className="px-5 py-2 bg-[#8b5d3b] text-white rounded-full text-sm font-medium hover:bg-[#d4a373] transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Select
              </motion.button>
            </div>
          </motion.div>
        ))}
      </div>
    ) : (
      <p className="text-[#8b5d3b] text-sm font-medium">
        {selectedTime
          ? 'No tables available within this price range.'
          : 'Select a time slot to view availability.'}
      </p>
    )}
  </div>
);

export default TableSelection;