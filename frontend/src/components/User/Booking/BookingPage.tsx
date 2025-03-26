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

const BookingPage: React.FC = () => {
  const { branchId } = useParams<{ branchId: string }>();
  const navigate = useNavigate();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [availableTables, setAvailableTables] = useState<TableType[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [partySize, setPartySize] = useState<number | string>(2);
  const [selectedTable, setSelectedTable] = useState<TableType | null>(null);
  const [timeSlots] = useState<string[]>(['18:00', '19:00', '20:00', '21:00']);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState<string>('');
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // Default to ascending
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
      // Filter by preferences only (price range removed)
      const matchesPreferences =
        preferences.length === 0 ||
        preferences.every((pref) => table.features?.includes(pref));
      return matchesPreferences;
    })
    .sort((a, b) => {
      // Sort by price: 'asc' for low to high, 'desc' for high to low
      return sortOrder === 'asc' ? (a.price || 0) - (b.price || 0) : (b.price || 0) - (a.price || 0);
    });

  const handleTimeSlotClick = (time: string) => setSelectedTime(time);

  const applyCoupon = (code: string) => {
    setCouponCode(code);
    setIsCouponModalOpen(false);
    toast.success(`Coupon "${code}" Applied!`);
  };

  const cancelCoupon = () => {
    setCouponCode('');
    toast.success('Coupon Removed!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable || !selectedTime || !selectedDate || !branchId || !branch || !user) {
      toast.error('Please complete all selections and ensure you are logged in');
      return;
    }
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
      toast.success(response.message || 'Reservation Created!');
      setTimeout(() =>
        navigate(`/confirmation/${response.data._id}`, {
          state: {
            reservation: {
              ...reservationData,
              reservationId: response.data._id,
              price: response.data.finalAmount || selectedTable.price * tableQuantity,
              discountApplied: response.data.discountApplied || 0,
              finalAmount: response.data.finalAmount || (selectedTable.price * tableQuantity),
            },
          },
        }), 2000);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Reservation Failed';
      toast.error(message);
      setError(message);
      setSelectedTable(null);
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
      <div className="min-h-screen bg-gradient-to-br from-[#faf7f2] to-[#e8e2d9] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="text-[#2c2420] text-2xl font-playfair font-semibold"
        >
          Loading Your Experience...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#faf7f2] to-[#e8e2d9] pt-16">
      <Toaster />
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="font-playfair text-4xl md:text-5xl text-[#2c2420] font-bold mb-3 tracking-tight">
            {branch ? branch.name : 'Branch Not Found'}
          </h1>
          <div className="flex items-center justify-center gap-4">
            <div className="w-16 h-[2px] bg-[#d4a373]"></div>
            <p className="text-sm text-[#2c2420]/70 font-medium uppercase tracking-wider">
              Reserve Your Table
            </p>
            <div className="w-16 h-[2px] bg-[#d4a373]"></div>
          </div>
        </motion.div>

        {/* Branch Picture */}
        {branch && (
          <motion.div
            className="mb-10 relative overflow-hidden rounded-2xl shadow-2xl border border-[#e8e2d9]/50"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          >
            <div className="relative w-full h-72 md:h-96">
              <img
                src={branch.mainImage || 'https://via.placeholder.com/150'}
                alt={branch.name}
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150')}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2c2420]/60 via-[#2c2420]/20 to-transparent pointer-events-none"></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4a373] to-transparent"></div>
              <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#d4a373] to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h2 className="font-playfair text-2xl md:text-3xl font-bold tracking-tight drop-shadow-lg">
                  {branch.name}
                </h2>
                <p className="text-sm md:text-base font-medium opacity-80 drop-shadow-md">
                  A Culinary Haven Awaits
                </p>
              </div>
              <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-[#d4a373]/20 border border-[#d4a373]/40"></div>
            </div>
          </motion.div>
        )}

        {/* Booking Form */}
        <motion.form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-2xl p-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {error && (
            <motion.div
              className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {error}
            </motion.div>
          )}

          {/* Date & Party Size */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-[#2c2420] text-sm font-semibold mb-2 tracking-wide">
                Reservation Date
              </label>
              <DatePicker
                selected={selectedDate}
                onChange={(date: Date | null) => setSelectedDate(date)}
                minDate={new Date()}
                className="w-full px-4 py-3 bg-[#faf7f2] border border-[#e8e2d9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4a373] text-[#2c2420] shadow-sm transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-[#2c2420] text-sm font-semibold mb-2 tracking-wide">
                Party Size
              </label>
              <select
                value={partySize}
                onChange={(e) => setPartySize(e.target.value === 'moreThan20' ? 'moreThan20' : Number(e.target.value))}
                className="w-full px-4 py-3 bg-[#faf7f2] border border-[#e8e2d9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4a373] text-[#2c2420] shadow-sm transition-all duration-300"
              >
                {Array.from({ length: 20 }, (_, i) => i + 1).map((size) => (
                  <option key={size} value={size}>
                    {size} {size === 1 ? 'Person' : 'People'}
                  </option>
                ))}
                <option value="moreThan20">Need more than 20?</option>
              </select>
            </div>
          </div>

          {/* Conditional Rendering Based on Party Size */}
          {partySize !== 'moreThan20' ? (
            <>
              {/* Time Slots */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-[#2c2420] mb-4 tracking-tight">
                  Select Time Slot
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {timeSlots.map((time) => (
                    <motion.button
                      key={time}
                      type="button"
                      onClick={() => handleTimeSlotClick(time)}
                      className={`p-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                        selectedTime === time
                          ? 'bg-[#8b5d3b] text-white shadow-lg'
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
                <h2 className="text-lg font-semibold text-[#2c2420] mb-4 tracking-tight">
                  Preferences
                </h2>
                <div className="flex flex-wrap gap-4">
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
                        className="h-4 w-4 text-[#8b5d3b] border-[#e8e2d9] rounded focus:ring-[#d4a373]"
                      />
                      <span className="text-[#2c2420] text-sm capitalize">
                        {pref.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Coupon Input */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-[#2c2420] text-sm font-semibold tracking-wide">
                    Coupon Code
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsCouponModalOpen(true)}
                    className="text-[#d4a373] text-sm font-medium hover:text-[#8b5d3b] transition-colors"
                  >
                    View Offers
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="w-full px-4 py-3 bg-[#faf7f2] border border-[#e8e2d9] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#d4a373] text-[#2c2420] shadow-sm disabled:bg-[#e8e2d9] disabled:text-[#2c2420]/50 transition-all duration-300"
                    placeholder="Enter or select a coupon"
                    disabled={!!couponCode}
                  />
                  {couponCode && (
                    <motion.button
                      type="button"
                      onClick={cancelCoupon}
                      className="px-4 py-2 bg-[#2c2420] text-white rounded-full text-sm font-medium hover:bg-[#8b5d3b] transition-all duration-300"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </motion.button>
                  )}
                </div>
                {couponCode && (
                  <motion.div
                    className="mt-2 p-2 bg-[#d4a373]/10 border border-[#d4a373] text-[#8b5d3b] rounded-md text-sm font-medium"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    Applied: "{couponCode}"
                  </motion.div>
                )}
              </div>

              {/* Table Selection with No Tables Message */}
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
                  <motion.div
                    className="mb-8 p-4 bg-[#faf7f2] border border-[#e8e2d9] rounded-lg text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <p className="text-[#8b5d3b] text-sm font-medium">
                      No tables currently available for these preferences.
                    </p>
                  </motion.div>
                )
              ) : (
                <motion.div
                  className="mb-8 p-4 bg-[#faf7f2] border border-[#e8e2d9] rounded-lg text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="text-[#2c2420] text-sm font-medium">
                    Please select a time slot to view available tables.
                  </p>
                </motion.div>
              )}

              {/* Confirmation Section */}
              <motion.div
                className="mt-8 bg-[#faf7f2] p-6 rounded-xl shadow-inner border border-[#e8e2d9]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <h2 className="text-xl font-semibold text-[#2c2420] mb-4 tracking-tight flex items-center">
                  <span className="mr-2 text-[#d4a373]">✓</span> Confirm Your Reservation
                </h2>
                {selectedTable && selectedTime && selectedDate ? (
                  <motion.div
                    className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-[#e8e2d9]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-[#2c2420]/70">Table:</span>
                      <span className="text-[#2c2420] font-medium">{selectedTable.name}</span>
                      <span className="text-[#2c2420]/70">Date:</span>
                      <span className="text-[#2c2420] font-medium">{selectedDate.toLocaleDateString()}</span>
                      <span className="text-[#2c2420]/70">Time:</span>
                      <span className="text-[#2c2420] font-medium">{selectedTime}</span>
                      <span className="text-[#2c2420]/70">Party Size:</span>
                      <span className="text-[#2c2420] font-medium">{partySize} people</span>
                      <span className="text-[#2c2420]/70">Tables Required:</span>
                      <span className="text-[#2c2420] font-medium">{tableQuantity}</span>
                      <span className="text-[#2c2420]/70">Original Price:</span>
                      <span className="text-[#2c2420] font-medium">₹{originalPrice.toFixed(2)}</span>
                      {couponCode && (
                        <>
                          <span className="text-[#2c2420]/70">Discount:</span>
                          <span className="text-[#8b5d3b] font-medium">-₹{discount.toFixed(2)}</span>
                          <span className="text-[#2c2420]/70">Final Price:</span>
                          <span className="text-[#8b5d3b] font-medium">₹{finalPrice.toFixed(2)}</span>
                        </>
                      )}
                      {preferences.length > 0 && (
                        <>
                          <span className="text-[#2c2420]/70">Preferences:</span>
                          <span className="text-[#2c2420] font-medium">
                            {preferences.map((p) => p.replace(/([A-Z])/g, ' $1').trim()).join(', ')}
                          </span>
                        </>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <p className="text-[#8b5d3b] text-sm mb-4">Please complete your selections</p>
                )}
                <motion.button
                  type="submit"
                  disabled={!selectedTable || !selectedTime}
                  className="w-full px-6 py-4 bg-gradient-to-r from-[#8b5d3b] to-[#2c2420] text-white rounded-full text-base font-semibold hover:from-[#d4a373] hover:to-[#8b5d3b] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>Confirm Reservation</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </motion.button>
              </motion.div>
            </>
          ) : (
            <motion.div
              className="mb-8 p-6 bg-[#faf7f2] rounded-lg shadow-inner border border-[#e8e2d9] text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-lg font-semibold text-[#2c2420] mb-4 tracking-tight">
                Large Party Booking
              </h2>
              <p className="text-[#2c2420] text-sm mb-4">
                For parties larger than 20, please contact our customer service team to make arrangements.
              </p>
              <div className="space-y-2">
                <p className="text-[#2c2420] font-medium">
                  Call us at:{' '}
                  <a href="tel:1234567890" className="text-[#d4a373] hover:text-[#8b5d3b] transition-colors">
                    (123) 456-7890
                  </a>
                </p>
                <p className="text-[#2c2420] font-medium">
                  Email us at:{' '}
                  <a href="mailto:reservations@restaurantname.com" className="text-[#d4a373] hover:text-[#8b5d3b] transition-colors">
                    reservations@restaurantname.com
                  </a>
                </p>
              </div>
            </motion.div>
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