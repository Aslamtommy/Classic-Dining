import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserReservations, cancelReservation } from '../../Api/userApi';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

interface Reservation {
  _id: string;
  branch: { name: string } | null;
  tableType: { name: string; price: number } | null;
  reservationDate: string;
  timeSlot: string;
  partySize: number;
  status: string;
  paymentId?: string;
  couponCode?: string;
  discountApplied?: number;
  finalAmount?: number;
}

const Bookings: React.FC = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10); // Fixed limit, can be made configurable
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadReservations = async () => {
      try {
        setLoading(true);
        const data = await fetchUserReservations(page, limit, status);
        setReservations(data.reservations);
        setTotal(data.total);
      } catch (error: any) {
        setError(error.message);
        toast.error(error.message, { duration: 4000, position: 'top-center' });
      } finally {
        setLoading(false);
      }
    };
    loadReservations();
  }, [page, status]);

  const handlePayNow = (reservationId: string) => {
    navigate(`/confirmation/${reservationId}`);
  };

  const handleCancel = (reservationId: string) => {
    // Show a toast with confirmation buttons
    toast(
      (t) => (
        <div className="flex flex-col items-center">
          <p className="mb-2 text-[#2c2420]">
            Are you sure you want to cancel this reservation?
          </p>
          <div className="space-x-2">
            <button
              onClick={async () => {
                try {
                  await cancelReservation(reservationId);
                  const data = await fetchUserReservations(page, limit, status);
                  setReservations(data.reservations);
                  setTotal(data.total);
                  toast.dismiss(t.id); // Dismiss the confirmation toast
                  toast.success('Reservation cancelled successfully', {
                    duration: 4000,
                    position: 'top-center',
                  });
                } catch (error: any) {
                  toast.dismiss(t.id);
                  toast.error(error.message, { duration: 4000, position: 'top-center' });
                }
              }}
              className="px-4 py-1 bg-[#8b5d3b] text-white rounded hover:bg-[#2c2420]"
            >
              Yes
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-4 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              No
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity, // Keeps the toast open until dismissed
        position: 'top-center',
      }
    );
  };

  if (loading) {
    return (
      <div className="bg-[#faf7f2] min-h-screen flex items-center justify-center">
        <div className="text-[#2c2420] text-xl">Loading your reservations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#faf7f2] min-h-screen flex items-center justify-center">
        <div className="text-[#2c2420] text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-[#faf7f2] min-h-screen pt-16">
      <Toaster />
      <div className="max-w-5xl mx-auto px-4">
        <motion.h1
          className="font-playfair text-3xl text-[#2c2420] font-bold mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Your Reservations
        </motion.h1>

        {/* Status Filter Dropdown */}
        <div className="mb-4">
          <label htmlFor="status-filter" className="mr-2 text-[#2c2420]">
            Filter by Status:
          </label>
          <select
            id="status-filter"
            value={status || 'all'}
            onChange={(e) => {
              const newStatus = e.target.value === 'all' ? undefined : e.target.value;
              setStatus(newStatus);
              setPage(1); // Reset to page 1 when status changes
            }}
            className="p-2 border rounded text-[#8b5d3b]"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
            <option value="payment_failed">Payment Failed</option>
            {/* Add more statuses if defined in ReservationStatus */}
          </select>
        </div>

        {/* Reservations List */}
        {reservations.length === 0 ? (
          <p className="text-[#8b5d3b] text-center">
            No reservations found for the selected status.
          </p>
        ) : (
          <div className="space-y-4">
            {reservations.map((res) => (
              <motion.div
                key={res._id}
                className="bg-white rounded-lg shadow-md p-4 flex justify-between items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div>
                  <h2 className="text-lg font-semibold text-[#2c2420]">
                    {res.branch?.name || 'Branch Name Not Available'}
                  </h2>
                  <p className="text-[#8b5d3b] text-sm">
                    {new Date(res.reservationDate).toLocaleDateString()} at {res.timeSlot}
                  </p>
                  <p className="text-[#8b5d3b] text-sm">
                    Table: {res.tableType?.name || 'Table Type Not Available'}
                  </p>
                  <p className="text-[#8b5d3b] text-sm">Party Size: {res.partySize}</p>
                  <div>
                    {res.couponCode ? (
                      <>
                        <p className="text-[#2c2420]/80 text-base">
                          Original Price:{' '}
                          <span className="text-[#8b5d3b] font-medium">
                            ₹{res.tableType?.price || 'N/A'}
                          </span>
                        </p>
                        <p className="text-[#2c2420]/80 text-base">
                          Coupon:{' '}
                          <span className="text-[#8b5d3b] font-medium">{res.couponCode}</span> (-₹
                          {res.discountApplied})
                        </p>
                        <p className="text-[#2c2420] text-lg font-bold">
                          Final Amount:{' '}
                          <span className="text-[#8b5d3b]">₹{res.finalAmount || 'N/A'}</span>
                        </p>
                      </>
                    ) : (
                      <p className="text-[#2c2420] text-lg font-bold">
                        Price:{' '}
                        <span className="text-[#8b5d3b]">₹{res.tableType?.price || 'N/A'}</span>
                      </p>
                    )}
                  </div>
                  <p
                    className={`text-sm font-medium ${
                      res.status === 'confirmed'
                        ? 'text-green-600'
                        : res.status === 'cancelled' || res.status === 'expired'
                        ? 'text-red-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    Status: {res.status.toUpperCase()}
                  </p>
                </div>
                <div className="space-x-2">
                  {(res.status === 'pending' || res.status === 'payment_failed') && (
                    <button
                      onClick={() => handlePayNow(res._id)}
                      className="px-4 py-2 bg-[#8b5d3b] text-white rounded-full hover:bg-[#2c2420] transition-colors text-sm"
                    >
                      Pay Now
                    </button>
                  )}
                  {res.status === 'confirmed' && (
                    <button
                      onClick={() => handleCancel(res._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {reservations.length > 0 && (
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-[#2c2420]">
              Page {page} of {Math.ceil(total / limit)}
            </span>
            <button
              onClick={() => setPage((prev) => (total > page * limit ? prev + 1 : prev))}
              disabled={page * limit >= total}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookings;