import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Branch } from '../../../types/branch';
import { TableType, Reservation, Coupon } from '../../../types/reservation';
import { fetchBranchDetails, fetchAvailableTables, createReservation, fetchAvailableCoupons } from '../../../Api/userApi';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';
import CouponModal from './CouponModal';
import FilterModal from './FilterModal';
import TableSelection from './TableSelection';

interface UserState {
  user: {
    name: string;
    email: string;
    mobile: string;
  } | null;
}

interface ExtendedBranch extends Branch {
  operatingHours?: {
    open: string; // e.g., "17:00"
    close: string; // e.g., "23:00"
  };
}

const BookingPage: React.FC = () => {
  const { branchId } = useParams<{ branchId: string }>();
  const navigate = useNavigate();
  const [branch, setBranch] = useState<ExtendedBranch | null>(null);
  const [availableTables, setAvailableTables] = useState<TableType[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [partySize, setPartySize] = useState<number | string>(2);
  const [selectedTable, setSelectedTable] = useState<TableType | null>(null);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState<string>('');
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [preferences, setPreferences] = useState<string[]>([]);

  const user = useSelector((state: { user: UserState }) => state.user.user);

  useEffect(() => {
    const loadBranchAndCoupons = async () => {
      try {
        if (!branchId) throw new Error('No branch ID provided');
        setLoading(true);
        const [branchData, couponData] = await Promise.all([
          fetchBranchDetails(branchId),
          fetchAvailableCoupons(),
        ]);
        setBranch(branchData);
        setAvailableCoupons(couponData || []);
        generateTimeSlots(branchData);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Failed to load data';
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };
    loadBranchAndCoupons();
  }, [branchId]);

  useEffect(() => {
    if (selectedDate && selectedTime && branchId && partySize !== 'moreThan20') {
      fetchAvailability();
    }
  }, [selectedDate, selectedTime, branchId, partySize]);

  const generateTimeSlots = (branchData: ExtendedBranch) => {
    const operatingHours = branchData.operatingHours || { open: '17:00', close: '23:00' };
    const [openHour, openMinute] = operatingHours.open.split(':').map(Number);
    const [closeHour, closeMinute] = operatingHours.close.split(':').map(Number);

    const slots: string[] = [];
    let currentTime = new Date();
    currentTime.setHours(openHour, openMinute, 0, 0);

    const closeTime = new Date();
    closeTime.setHours(closeHour, closeMinute, 0, 0);

    while (currentTime <= closeTime) {
      const timeString = currentTime.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      slots.push(timeString);
      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }
    setTimeSlots(slots);
    setSelectedTime('');
  };

  const fetchAvailability = async () => {
    try {
      const formattedDate = selectedDate!.toISOString().split('T')[0];
      const response = await fetchAvailableTables(branchId!, formattedDate, selectedTime);
      const tables = Array.isArray(response) ? response : [];
      setAvailableTables(tables);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch available tables';
      setError(message);
      setAvailableTables([]);
      toast.error(message);
    }
  };

  const filteredTables = (availableTables || [])
    .filter((table) => {
      const matchesPreferences =
        preferences.length === 0 ||
        preferences.every((pref) => table.features?.includes(pref));
      return matchesPreferences;
    })
    .sort((a, b) => (sortOrder === 'asc' ? (a.price || 0) - (b.price || 0) : (b.price || 0) - (a.price || 0)));

  const handleTimeSlotClick = (time: string) => setSelectedTime(time);

  const applyCoupon = (code: string) => {
    setCouponCode(code);
    setIsCouponModalOpen(false);
    toast.success(`Coupon "${code}" applied successfully`);
  };

  const cancelCoupon = () => {
    setCouponCode('');
    toast.success('Coupon removed');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable || !selectedTime || !selectedDate || !branchId || !branch || !user) {
      toast.error('Please complete all required fields and log in');
      return;
    }
    // Add a submitting state to prevent double submission
    if (loading) return; // Assuming `loading` can be reused here
    setLoading(true);
    try {
      const tableQuantity = Math.ceil(Number(partySize) / selectedTable.capacity);
      const reservationData: Partial<Reservation> = {
        branch: { _id: branchId, name: branch.name },
        tableType: selectedTable,
        reservationDate: selectedDate.toISOString(),
        timeSlot: selectedTime,
        partySize: Number(partySize),
        tableQuantity,
        preferences,
        user: { name: user.name, email: user.email, phone: user.mobile },
        couponCode,
      };
      const response = await createReservation(reservationData);
      toast.success(response.message || 'Reservation confirmed!');
      setTimeout(() => {
        navigate(`/confirmation/${response.data._id}`, {
          state: {
            reservation: {
              ...reservationData,
              reservationId: response.data._id,
              price: response.data.finalAmount || selectedTable.price * tableQuantity,
              discountApplied: response.data.discountApplied || 0,
              finalAmount: response.data.finalAmount || selectedTable.price * tableQuantity,
            },
          },
        });
        setLoading(false); // Reset after navigation
      }, 2000);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to create reservation';
      toast.error(message);
      setError(message);
      setSelectedTable(null);
      setLoading(false);
    }
  };

  const selectedCoupon = availableCoupons.find((coupon) => coupon.code === couponCode);
  const tableQuantity = selectedTable ? Math.ceil(Number(partySize) / selectedTable.capacity) : 1;
  const originalPrice = selectedTable ? selectedTable.price * tableQuantity : 0;
  const discount = selectedCoupon
    ? selectedCoupon.discountType === 'percentage'
      ? Math.min(originalPrice * (selectedCoupon.discount / 100), selectedCoupon.maxDiscountAmount || Infinity)
      : selectedCoupon.discount
    : 0;
  const finalPrice = Math.max(originalPrice - discount, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-[#2c2420] text-xl font-sans font-medium"
        >
          Loading reservation details...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2] font-sans antialiased">
      <Toaster position="top-right" />
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-serif text-[#2c2420] font-bold tracking-tight">
            {branch ? branch.name : 'Branch Not Found'}
          </h1>
          <p className="mt-2 text-sm text-[#8b5d3b] font-medium uppercase tracking-widest">
            Book Your Table
          </p>
        </motion.div>

        {/* Branch Image */}
        {branch && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="mb-12 rounded-xl overflow-hidden shadow-lg border border-[#e8e2d9]"
          >
            <img
              src={branch.mainImage || 'https://via.placeholder.com/1200x400'}
              alt={branch.name}
              className="w-full h-64 md:h-80 object-cover"
              onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/1200x400')}
            />
          </motion.div>
        )}

        {/* Booking Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white rounded-xl shadow-md border border-[#e8e2d9] p-6 md:p-8"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="mb-6 p-4 bg-[#faf7f2] border-l-4 border-[#8b5d3b] text-[#2c2420] rounded-r-lg text-sm"
            >
              {error}
            </motion.div>
          )}

          {/* Date & Party Size */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-[#2c2420] text-sm font-medium mb-2">Date</label>
              <DatePicker
                selected={selectedDate}
                onChange={(date: Date | null) => setSelectedDate(date)}
                minDate={new Date()}
                className="w-full px-4 py-3 bg-[#faf7f2] border border-[#e8e2d9] rounded-lg text-[#2c2420] text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5d3b] transition-all duration-200"
                placeholderText="Select a date"
              />
            </div>
            <div>
              <label className="block text-[#2c2420] text-sm font-medium mb-2">Party Size</label>
              <select
                value={partySize}
                onChange={(e) => setPartySize(e.target.value === 'moreThan20' ? 'moreThan20' : Number(e.target.value))}
                className="w-full px-4 py-3 bg-[#faf7f2] border border-[#e8e2d9] rounded-lg text-[#2c2420] text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5d3b] transition-all duration-200"
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map((size) => (
                  <option key={size} value={size}>
                    {size} {size === 1 ? 'Person' : 'People'}
                  </option>
                ))}
                <option value="moreThan20">More than 20</option>
              </select>
            </div>
          </div>

          {partySize !== 'moreThan20' ? (
            <>
              {/* Time Slots */}
              <div className="mb-8">
                <h2 className="text-lg font-medium text-[#2c2420] mb-4">Select a Time</h2>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {timeSlots.map((time) => (
                    <motion.button
                      key={time}
                      type="button"
                      onClick={() => handleTimeSlotClick(time)}
                      className={`py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedTime === time
                          ? 'bg-[#8b5d3b] text-white'
                          : 'bg-[#e8e2d9] text-[#2c2420] hover:bg-[#d4a373] hover:text-white'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {time}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Preferences */}
              <div className="mb-8">
                <h2 className="text-lg font-medium text-[#2c2420] mb-4">Preferences (Optional)</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {['windowView', 'outdoor', 'accessible', 'quiet', 'booth', 'private'].map((pref) => (
                    <label key={pref} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        value={pref}
                        checked={preferences.includes(pref)}
                        onChange={(e) =>
                          setPreferences(
                            e.target.checked
                              ? [...preferences, pref]
                              : preferences.filter((p) => p !== pref)
                          )
                        }
                        className="h-4 w-4 text-[#8b5d3b] border-[#e8e2d9] rounded focus:ring-[#8b5d3b]"
                      />
                      <span className="text-[#2c2420] text-sm capitalize">
                        {pref.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Coupon */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[#2c2420] text-sm font-medium">Promo Code</label>
                  <button
                    type="button"
                    onClick={() => setIsCouponModalOpen(true)}
                    className="text-[#8b5d3b] text-sm font-medium hover:text-[#d4a373] transition-colors"
                  >
                    View Available Offers
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={!!couponCode}
                    placeholder="Enter promo code"
                    className="w-full px-4 py-3 bg-[#faf7f2] border border-[#e8e2d9] rounded-lg text-[#2c2420] text-sm focus:outline-none focus:ring-2 focus:ring-[#8b5d3b] disabled:bg-[#e8e2d9] disabled:text-[#2c2420]/50 transition-all duration-200"
                  />
                  {couponCode && (
                    <motion.button
                      type="button"
                      onClick={cancelCoupon}
                      className="px-4 py-2 bg-[#2c2420] text-white rounded-lg text-sm font-medium hover:bg-[#8b5d3b] transition-all duration-200"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Remove
                    </motion.button>
                  )}
                </div>
                {couponCode && (
                  <p className="mt-2 text-sm text-[#8b5d3b]">Promo code "{couponCode}" applied</p>
                )}
              </div>

              {/* Table Selection */}
              {selectedTime ? (
                filteredTables.length > 0 ? (
                  <TableSelection
                    selectedTime={selectedTime}
                    filteredTables={filteredTables}
                    selectedTable={selectedTable}
                    setSelectedTable={setSelectedTable}
                    setIsFilterModalOpen={setIsFilterModalOpen}
                    partySize={Number(partySize)}
                    preferences={preferences}
                  />
                ) : (
                  <div className="mb-8 p-4 bg-[#faf7f2] rounded-lg text-[#8b5d3b] text-sm text-center">
                    No tables available for this time. Please select another slot.
                  </div>
                )
              ) : (
                <div className="mb-8 p-4 bg-[#faf7f2] rounded-lg text-[#2c2420] text-sm text-center">
                  Please select a time to view available tables.
                </div>
              )}

              {/* Confirmation */}
              <div className="border-t border-[#e8e2d9] pt-6">
                <h2 className="text-lg font-medium text-[#2c2420] mb-4">Reservation Summary</h2>
                {selectedTable && selectedTime && selectedDate ? (
                  <div className="mb-6 p-4 bg-[#faf7f2] rounded-lg text-sm text-[#2c2420]">
                    <div className="grid grid-cols-2 gap-2">
                      <span className="text-[#2c2420]/70">Table:</span>
                      <span>{selectedTable.name}</span>
                      <span className="text-[#2c2420]/70">Date:</span>
                      <span>{selectedDate.toLocaleDateString()}</span>
                      <span className="text-[#2c2420]/70">Time:</span>
                      <span>{selectedTime}</span>
                      <span className="text-[#2c2420]/70">Party Size:</span>
                      <span>{partySize} people</span>
                      <span className="text-[#2c2420]/70">Tables Needed:</span>
                      <span>{tableQuantity}</span>
                      <span className="text-[#2c2420]/70">Price:</span>
                      <span>₹{originalPrice.toFixed(2)}</span>
                      {couponCode && (
                        <>
                          <span className="text-[#2c2420]/70">Discount:</span>
                          <span className="text-[#8b5d3b]">-₹{discount.toFixed(2)}</span>
                          <span className="text-[#2c2420]/70">Final Price:</span>
                          <span className="text-[#8b5d3b] font-medium">₹{finalPrice.toFixed(2)}</span>
                        </>
                      )}
                      {preferences.length > 0 && (
                        <>
                          <span className="text-[#2c2420]/70">Preferences:</span>
                          <span>{preferences.map((p) => p.replace(/([A-Z])/g, ' $1').trim()).join(', ')}</span>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-[#8b5d3b] text-sm mb-4">Complete your selections to see summary</p>
                )}
                <motion.button
                  type="submit"
                  disabled={!selectedTable || !selectedTime}
                  className="w-full py-3 bg-[#8b5d3b] text-white rounded-lg text-sm font-medium hover:bg-[#2c2420] disabled:bg-[#e8e2d9] disabled:text-[#2c2420]/50 transition-all duration-200"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Confirm Reservation
                </motion.button>
              </div>
            </>
          ) : (
            <div className="p-6 bg-[#faf7f2] rounded-lg text-center">
              <h2 className="text-lg font-medium text-[#2c2420] mb-4">Large Party Booking</h2>
              <p className="text-[#2c2420] text-sm mb-4">
                For groups over 20, please contact us directly.
              </p>
              <div className="space-y-2 text-sm">
                <p>
                  Phone:{' '}
                  <a href="tel:1234567890" className="text-[#8b5d3b] hover:text-[#d4a373]">
                    (123) 456-7890
                  </a>
                </p>
                <p>
                  Email:{' '}
                  <a
                    href="mailto:reservations@restaurantname.com"
                    className="text-[#8b5d3b] hover:text-[#d4a373]"
                  >
                    reservations@restaurantname.com
                  </a>
                </p>
              </div>
            </div>
          )}
        </motion.form>
      </div>

      <CouponModal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        availableCoupons={availableCoupons}
        applyCoupon={applyCoupon}
      />
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
      />
    </div>
  );
};

export default BookingPage;