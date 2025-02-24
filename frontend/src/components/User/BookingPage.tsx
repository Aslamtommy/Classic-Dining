import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Branch, TableType } from '../../types/types';
import { fetchBranchDetails, fetchAvailableTables, createReservation } from '../../Api/userApi';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';

const BookingPage: React.FC = () => {
  const { branchId } = useParams<{ branchId: string }>();
  const navigate = useNavigate();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [availableTables, setAvailableTables] = useState<TableType[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [partySize, setPartySize] = useState<number>(2);
  const [selectedTable, setSelectedTable] = useState<TableType | null>(null);
  const [timeSlots] = useState<string[]>(['18:00', '19:00', '20:00', '21:00']);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const user = useSelector((state: any) => state.user.user);
console.log(user)
  useEffect(() => {
    const loadBranch = async () => {
      try {
        if (!branchId) {
          throw new Error('No branch ID provided');
        }
        setLoading(true);
        const data = await fetchBranchDetails(branchId);
        setBranch(data.data);
      } catch (error: any) {
        const errorMessage = error.message || 'Failed to load branch details';
        console.error('Error loading branch details:', errorMessage);
        setError(errorMessage);
        toast.error(errorMessage, { duration: 4000, position: 'top-center' });
      } finally {
        setLoading(false);
      }
    };
    loadBranch();
  }, [branchId]);

  useEffect(() => {
    if (selectedDate && selectedTime && branchId) {
      fetchAvailability();
    }
  }, [selectedDate, selectedTime, branchId]);

  const fetchAvailability = async () => {
    try {
      const formattedDate = selectedDate!.toISOString().split('T')[0];
      const available = await fetchAvailableTables(branchId!, formattedDate, selectedTime);
      setAvailableTables(available);
      if (selectedTable && !available.some((t: TableType) => t._id === selectedTable._id)) {
        setSelectedTable(null);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to fetch available tables';
      console.error('Availability fetch error:', errorMessage);
      setError(errorMessage);
      toast.error(errorMessage, { duration: 4000, position: 'top-center' });
      setAvailableTables([]);
    }
  };

  const handleTimeSlotClick = (time: string) => {
    setSelectedTime(time);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable || !selectedTime || !selectedDate || !branchId || !branch) {
      toast.error('Please select a table and time slot', { duration: 4000, position: 'top-center' });
      return;
    }

    try {
      const reservationData = {
        branch: branchId,
        tableType: selectedTable._id,
        reservationDate: selectedDate,
        timeSlot: selectedTime,
        partySize,
        user: {
          name: user.name,
          email: user.email,
          phone: user.mobile,
        },
      };

      console.log(reservationData)

      const response: any = await createReservation(reservationData);
      const reservationId = response.data._id;
console.log(response)
      const reservationDetails = {
        reservationId,
        branch: branch.name,
        tableType: selectedTable.name,
        reservationDate: selectedDate,
        timeSlot: selectedTime,
        partySize,
        price: selectedTable.price || 0,
        user: {
          name: user.name,
          email: user.email,
          phone: user.mobile,
        },
        specialRequests: '',
      };

      toast.success(response.message || 'Reservation created successfully!', {
        duration: 4000,
        position: 'top-center',
      });

      setTimeout(() => navigate('/confirmation', { state: { reservation: reservationDetails } }), 2000);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create reservation. Please try again.';
      console.error('Reservation failed:', errorMessage);
      toast.error(errorMessage, { duration: 4000, position: 'top-center' });
      setError(errorMessage);
      setSelectedTable(null); // Reset selection on error
    }
  };

  if (loading) {
    return (
      <div className="bg-[#faf7f2] min-h-screen flex items-center justify-center">
        <div className="text-[#2c2420] text-xl">Loading branch details...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#faf7f2] min-h-screen pt-16">
      <Toaster />
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <motion.h1
            className="font-playfair text-3xl text-[#2c2420] font-bold mb-2"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {branch ? branch.name : 'Branch Not Found'}
          </motion.h1>
          <div className="flex items-center justify-center">
            <div className="h-px w-12 bg-[#8b5d3b]"></div>
            <p className="mx-3 text-sm text-[#2c2420]/80">Book Your Table</p>
            <div className="h-px w-12 bg-[#8b5d3b]"></div>
          </div>
        </div>

        {branch && (
          <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <img
              src={branch.image || 'https://via.placeholder.com/150'}
              alt={branch.name}
              className="w-full h-48 object-cover rounded-lg shadow-md"
              onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')}
            />
          </motion.div>
        )}

        <motion.form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-[#2c2420] text-sm font-medium mb-1">Date</label>
              <DatePicker
                selected={selectedDate}
                onChange={(date: Date | null) => setSelectedDate(date)}
                minDate={new Date()}
                className="w-full px-3 py-2 border border-[#e8e2d9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#8b5d3b] bg-[#faf7f2]"
              />
            </div>

            <div>
              <label className="block text-[#2c2420] text-sm font-medium mb-1">Party Size</label>
              <select
                value={partySize}
                onChange={(e) => setPartySize(Number(e.target.value))}
                className="w-full px-3 py-2 border border-[#e8e2d9] rounded-md focus:outline-none focus:ring-2 focus:ring-[#8b5d3b] bg-[#faf7f2]"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((size) => (
                  <option key={size} value={size}>
                    {size} {size === 1 ? 'person' : 'people'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block text-[#2c2420] text-sm font-medium mb-1">Select Time Slot</label>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  type="button"
                  onClick={() => handleTimeSlotClick(time)}
                  className={`p-2 text-center rounded-md text-sm ${
                    selectedTime === time
                      ? 'bg-[#8b5d3b] text-white'
                      : 'bg-[#e8e2d9] text-[#2c2420] hover:bg-[#d4ccc2]'
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>

            <h2 className="text-lg font-semibold text-[#2c2420] mb-2">Available Tables</h2>
            {selectedTime && availableTables.length > 0 ? (
              availableTables.map((table: TableType) => (
                <motion.div
                  key={table._id}
                  className={`p-4 border rounded-md ${
                    selectedTable?._id === table._id ? 'border-[#8b5d3b] bg-[#faf7f2]' : 'border-[#e8e2d9]'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-medium text-[#2c2420]">{table.name}</h3>
                      <p className="text-[#8b5d3b] text-sm">Capacity: {table.capacity} people</p>
                      {table.price && <p className="text-[#8b5d3b] text-sm">Price: ₹{table.price}</p>}
                      {table.description && <p className="text-[#8b5d3b] text-sm">{table.description}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedTable(table)}
                      className="px-4 py-1.5 bg-[#8b5d3b] text-white rounded-full hover:bg-[#2c2420] transition-colors text-sm"
                    >
                      Select
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <p className="text-[#8b5d3b] text-sm">
                {selectedTime
                  ? 'No tables available for this time slot.'
                  : 'Please select a time slot to see available tables.'}
              </p>
            )}
          </div>

          <div className="mt-6">
            <button
              type="submit"
              disabled={!selectedTable || !selectedTime}
              className="w-full px-4 py-2 bg-gradient-to-r from-[#8b5d3b] to-[#2c2420] text-white rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 text-sm"
            >
              Confirm Reservation
            </button>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default BookingPage;