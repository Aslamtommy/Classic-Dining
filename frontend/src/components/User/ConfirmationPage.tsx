import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import api from '../../Axios/userInstance';
import { confirmReservation, failReservation, fetchReservation, fetchWalletData } from '../../Api/userApi';

interface ReservationDetails {
  reservationId: string;
  branch: string | { name: string };
  tableType: string | { name: string; price: number };
  reservationDate: Date | string;
  timeSlot: string;
  partySize: number;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  price: number;
  specialRequests?: string;
  status?: string;
}

interface PaymentResponse {
  success: boolean;
  message: string;
  data: {
    amount: number;
    currency: string;
    id: string;
    amount_due?: number;
    amount_paid?: number;
    attempts?: number;
    created_at?: number;
    entity?: string;
    notes?: any[];
    offer_id?: string | null;
    receipt?: string;
    status?: string;
  };
}

const ConfirmationPage: React.FC = () => {
  const { reservationId } = useParams<{ reservationId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<ReservationDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  // Load reservation details
  useEffect(() => {
    const loadReservation = async () => {
      try {
        setLoading(true);
        if (reservationId) {
          const data = await fetchReservation(reservationId);
          setReservation({
            reservationId: data._id,
            branch: data.branch.name,
            tableType: { name: data.tableType.name, price: data.tableType.price },
            reservationDate: data.reservationDate,
            timeSlot: data.timeSlot,
            partySize: data.partySize,
            user: data.user,
            price: data.tableType.price,
            specialRequests: data.specialRequests,
            status: data.status,
          });
        } else if (location.state?.reservation) {
          setReservation(location.state.reservation);
        } else {
          navigate('/');
        }
      } catch (error: any) {
        toast.error(error.message, { duration: 4000, position: 'top-center' });
        navigate('/booking');
      } finally {
        setLoading(false);
      }
    };
    loadReservation();
  }, [reservationId, location, navigate]);

  // Fetch wallet balance when reservation is loaded
  useEffect(() => {
    if (reservation) {
      const loadWalletData = async () => {
        try {
          const walletData = await fetchWalletData();
          setWalletBalance(walletData.balance);
        } catch (error: any) {
          toast.error(error.message, { duration: 4000, position: 'top-center' });
        }
      };
      loadWalletData();
    }
  }, [reservation]);

  // Handle Razorpay payment (renamed from handlePayment)
  const handleRazorpayPayment = async () => {
    if (!reservation || isProcessing || reservation.status === 'confirmed') return;

    setIsProcessing(true);

    try {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);

      await new Promise<void>((resolve) => {
        script.onload = () => resolve();
      });

      const response = await api.post<PaymentResponse>('/payments/create-order', {
        amount: reservation.price * 100,
        currency: 'INR',
      });

      const orderData = response.data.data;

      const options = {
        key: 'rzp_test_ihsNz6lracNIu3',
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.id,
        name: 'ReserveBites',
        description: 'Table Reservation Payment',
        image: 'https://your-logo-url.com/logo.png',
        handler: async function (response: any) {
          try {
            await confirmReservation(reservation.reservationId, response.razorpay_payment_id);
            setPaymentSuccess(true);
            toast.success('Payment successful! Reservation confirmed.', {
              duration: 4000,
              position: 'top-center',
            });
            navigate('/success', {
              state: {
                paymentId: response.razorpay_payment_id,
                amount: reservation.price,
                paymentMethod: 'razorpay',
              },
            });
          } catch (error: any) {
            toast.error('Failed to confirm reservation. Please contact support.', {
              duration: 4000,
              position: 'top-center',
            });
          } finally {
            setIsProcessing(false);
          }
        },
        modal: {
          ondismiss: async function () {
            if (paymentSuccess) return;
            try {
              await failReservation(reservation.reservationId, '');
              toast.error('Payment cancelled. Reservation marked as payment failed.', {
                duration: 4000,
                position: 'top-center',
              });
              navigate('/booking');
            } catch (error: any) {
              toast.error(error.message, { duration: 4000, position: 'top-center' });
            } finally {
              setIsProcessing(false);
            }
          },
        },
        prefill: {
          name: reservation.user.name,
          email: reservation.user.email,
          contact: reservation.user.phone,
        },
        theme: {
          color: '#8b5d3b',
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.on('payment.failed', async function (response: any) {
        try {
          await failReservation(
            reservation.reservationId,
            response.error.metadata.payment_id || ''
          );
          toast.error('Payment failed. Reservation marked as payment failed.', {
            duration: 4000,
            position: 'top-center',
          });
          navigate('/booking');
        } catch (error: any) {
          toast.error(error.message, { duration: 4000, position: 'top-center' });
        } finally {
          setIsProcessing(false);
        }
      });

      razorpay.open();
    } catch (error: any) {
      toast.error('Payment initialization failed. Please try again.', {
        duration: 4000,
        position: 'top-center',
      });
      setIsProcessing(false);
    }
  };

  // Handle wallet payment
  const handleWalletPayment = async () => {
    if (!reservation || isProcessing) return;

    setIsProcessing(true);

    try {
      await api.post(`/reservations/${reservation.reservationId}/confirm-wallet`);
      setPaymentSuccess(true);
      toast.success('Payment successful! Reservation confirmed.', {
        duration: 4000,
        position: 'top-center',
      });
      navigate('/success', {
        state: {
          paymentMethod: 'wallet',
          amount: reservation.price,
        },
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to confirm reservation with wallet.', {
        duration: 4000,
        position: 'top-center',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading || !reservation) {
    return (
      <div className="bg-[#faf7f2] min-h-screen flex items-center justify-center">
        <div className="text-[#2c2420] text-xl">Loading reservation details...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#faf7f2] min-h-screen pt-16">
      <Toaster />
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          className="bg-white rounded-lg shadow-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-playfair text-3xl text-[#2c2420] font-bold mb-6">
            Confirm Your Reservation
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-[#2c2420]">Branch</h3>
                <p className="text-[#8b5d3b]">
                  {typeof reservation.branch === 'string' ? reservation.branch : reservation.branch.name}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#2c2420]">Date & Time</h3>
                <p className="text-[#8b5d3b]">
                  {new Date(reservation.reservationDate).toLocaleDateString()} at {reservation.timeSlot}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#2c2420]">Party Size</h3>
                <p className="text-[#8b5d3b]">{reservation.partySize} people</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-[#2c2420]">Selected Table</h3>
                <p className="text-[#8b5d3b]">
                  {typeof reservation.tableType === 'string'
                    ? reservation.tableType
                    : reservation.tableType.name}
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#2c2420]">Special Requests</h3>
                <p className="text-[#8b5d3b]">{reservation.specialRequests || 'No special requests'}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#2c2420]">Total Amount</h3>
                <p className="text-2xl text-[#8b5d3b] font-bold">₹{reservation.price}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#2c2420]">Wallet Balance</h3>
                <p className="text-2xl text-[#8b5d3b] font-bold">
                  {walletBalance !== null ? `₹${walletBalance}` : 'Loading...'}
                </p>
              </div>
            </div>
          </div>
          {reservation.status === 'confirmed' ? (
            <p className="text-green-600 font-medium">This reservation is already confirmed.</p>
          ) : (
            <div className="mt-6 space-y-4">
              <button
                onClick={handleWalletPayment}
                disabled={isProcessing || walletBalance === null || walletBalance < reservation.price}
                className={`w-full px-6 py-3 bg-gradient-to-r from-[#8b5d3b] to-[#2c2420] text-white rounded-full hover:opacity-90 transition-opacity text-lg font-medium ${
                  isProcessing || walletBalance === null || walletBalance < reservation.price
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                {isProcessing ? 'Processing...' : 'Pay with Wallet'}
              </button>
              {walletBalance !== null && walletBalance < reservation.price && (
                <p className="text-red-600 text-sm">
                  Insufficient wallet balance. Please add money or use another payment method.
                </p>
              )}
              <button
                onClick={handleRazorpayPayment}
                disabled={isProcessing || reservation.status === 'cancelled'}
                className={`w-full px-6 py-3 bg-gradient-to-r from-[#8b5d3b] to-[#2c2420] text-white rounded-full hover:opacity-90 transition-opacity text-lg font-medium ${
                  isProcessing || reservation.status === 'cancelled' ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isProcessing ? 'Processing...' : 'Pay with Razorpay'}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ConfirmationPage;