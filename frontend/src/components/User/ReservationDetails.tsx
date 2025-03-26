import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchReservation } from '../../Api/userApi'; // Use existing function
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Reservation } from '../../types/reservation';

const ReservationDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadReservation = async () => {
      try {
        if (!id) throw new Error('Reservation ID is missing');
        setLoading(true);
        const data = await fetchReservation(id);
        setReservation(data);
      } catch (error: any) {
        setError(error.message);
        toast.error(error.message, { duration: 4000, position: 'top-center' });
      } finally {
        setLoading(false);
      }
    };
    loadReservation();
  }, [id]);

  const handlePayNow = () => {
    if (reservation?._id) {
      navigate(`/confirmation/${reservation._id}`);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#faf7f2] min-h-screen flex items-center justify-center">
        <div className="text-[#2c2420] text-xl">Loading reservation details...</div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="bg-[#faf7f2] min-h-screen flex items-center justify-center">
        <div className="text-[#2c2420] text-xl">{error || 'Reservation not found'}</div>
      </div>
    );
  }

  return (
    <div className="bg-[#faf7f2] min-h-screen pt-16">
      <Toaster />
      <div className="max-w-3xl mx-auto px-4">
        <motion.h1
          className="font-playfair text-3xl text-[#2c2420] font-bold mb-8 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Reservation Details
        </motion.h1>

        <motion.div
          className="bg-white rounded-lg shadow-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-[#2c2420]">
                {reservation.branch?.name || 'Branch Name Not Available'}
              </h2>
              <p className="text-[#8b5d3b] text-sm">
                Date: {new Date(reservation.reservationDate).toLocaleDateString()}
              </p>
              <p className="text-[#8b5d3b] text-sm">Time: {reservation.timeSlot}</p>
            </div>

            <div>
              <p className="text-[#8b5d3b] text-sm">
                Table Type: {reservation.tableType?.name || 'Not Available'}
              </p>
              <p className="text-[#8b5d3b] text-sm">Party Size: {reservation.partySize}</p>
              <p className="text-[#8b5d3b] text-sm">Table Quantity: {reservation.tableQuantity}</p>
            </div>

            <div>
              <p className="text-[#8b5d3b] text-sm">
                User: {reservation.user.name} ({reservation.user.email})
              </p>
              <p className="text-[#8b5d3b] text-sm">Phone: {reservation.user.phone}</p>
            </div>

            {(reservation.preferences && reservation.preferences.length > 0) && (
  <div>
    <p className="text-[#2c2420] font-medium">Preferences:</p>
    <ul className="list-disc list-inside text-[#8b5d3b] text-sm">
      {reservation.preferences.map((pref, index) => (
        <li key={index}>{pref}</li>
      ))}
    </ul>
  </div>
)}

            {reservation.specialRequests && (
              <div>
                <p className="text-[#2c2420] font-medium">Special Requests:</p>
                <p className="text-[#8b5d3b] text-sm">{reservation.specialRequests}</p>
              </div>
            )}

            <div>
              {reservation.couponCode ? (
                <>
                  <p className="text-[#2c2420]/80 text-base">
                    Original Price:{' '}
                    <span className="text-[#8b5d3b] font-medium">
                      ₹{reservation.tableType?.price || 'N/A'}
                    </span>
                  </p>
                  <p className="text-[#2c2420]/80 text-base">
                    Coupon:{' '}
                    <span className="text-[#8b5d3b] font-medium">{reservation.couponCode}</span> (-₹
                    {reservation.discountApplied})
                  </p>
                  <p className="text-[#2c2420] text-lg font-bold">
                    Final Amount:{' '}
                    <span className="text-[#8b5d3b]">₹{reservation.finalAmount || 'N/A'}</span>
                  </p>
                </>
              ) : (
                <p className="text-[#2c2420] text-lg font-bold">
                  Price:{' '}
                  <span className="text-[#8b5d3b]">₹{reservation.tableType?.price || 'N/A'}</span>
                </p>
              )}
            </div>

            <p
              className={`text-sm font-medium ${
                reservation.status === 'confirmed'
                  ? 'text-green-600'
                  : reservation.status === 'cancelled' || reservation.status === 'expired'
                  ? 'text-red-600'
                  : 'text-yellow-600'
              }`}
            >
              Status: {reservation.status.toUpperCase()}
            </p>

            {(reservation.status === 'pending' || reservation.status === 'payment_failed') && (
              <button
                onClick={handlePayNow}
                className="px-4 py-2 bg-[#8b5d3b] text-white rounded-full hover:bg-[#2c2420] transition-colors"
              >
                Pay Now
              </button>
            )}
          </div>
        </motion.div>

        <button
          onClick={() => navigate('/bookings')}
          className="mt-4 px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
          Back to Bookings
        </button>
      </div>
    </div>
  );
};

export default ReservationDetails;