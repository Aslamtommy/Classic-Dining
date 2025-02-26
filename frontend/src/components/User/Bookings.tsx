// src/components/BookingsPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchUserReservations, cancelReservation } from '../../Api/userApi';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';

interface Reservation {
  _id: string;
  branch: { name: string };
  tableType: { name: string; price: number };
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadReservations = async () => {
      try {
        setLoading(true);
        const data = await fetchUserReservations();
        setReservations(data);
      } catch (error: any) {
        setError(error.message);
        toast.error(error.message, { duration: 4000, position: 'top-center' });
      } finally {
        setLoading(false);
      }
    };
    loadReservations();
  }, []);

  const handlePayNow = (reservationId: string) => {
    navigate(`/confirmation/${reservationId}`);
  };
  

  const handleCancel = async (reservationId: string) => {
    if (window.confirm('Are you sure you want to cancel this reservation?')) {
      try {
        await cancelReservation(reservationId);
        setReservations((prev) =>
          prev.map((res) =>
            res._id === reservationId ? { ...res, status: 'cancelled' } : res
          )
        );
        toast.success('Reservation cancelled successfully', {
          duration: 4000,
          position: 'top-center',
        });
      } catch (error: any) {
        toast.error(error.message, { duration: 4000, position: 'top-center' });
      }
    }
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

        {reservations.length === 0 ? (
          <p className="text-[#8b5d3b] text-center">No reservations found.</p>
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
                  <h2 className="text-lg font-semibold text-[#2c2420]">{res.branch.name}</h2>
                  <p className="text-[#8b5d3b] text-sm">
                    {new Date(res.reservationDate).toLocaleDateString()} at {res.timeSlot}
                  </p>
                  <p className="text-[#8b5d3b] text-sm">Table: {res.tableType.name}</p>
                  <p className="text-[#8b5d3b] text-sm">Party Size: {res.partySize}</p>
                  <div>
                    {res.couponCode ? (
                      <>
                        <p className="text-[#2c2420]/80 text-base">
                          Original Price: <span className="text-[#8b5d3b] font-medium">₹{res.tableType.price}</span>
                        </p>
                        <p className="text-[#2c2420]/80 text-base">
                          Coupon: <span className="text-[#8b5d3b] font-medium">{res.couponCode}</span> (-₹{res.discountApplied})
                        </p>
                        <p className="text-[#2c2420] text-lg font-bold">
                          Final Amount: <span className="text-[#8b5d3b]">₹{res.finalAmount}</span>
                        </p>
                      </>
                    ) : (
                      <p className="text-[#2c2420] text-lg font-bold">
                        Price: <span className="text-[#8b5d3b]">₹{res.tableType.price}</span>
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
      </div>
    </div>
  );
};

export default Bookings;