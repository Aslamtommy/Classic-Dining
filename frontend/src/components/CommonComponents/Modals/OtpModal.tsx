import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import api from '../../../Axios/userInstance';
import {
  setLoading,
  setError,
  setOtpSent,
  setOtpVerified,
  setOtpExpired,
} from '../../../redux/otpslice';

interface OtpModalProps {
  show: boolean;
  email: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

const OtpModal: React.FC<OtpModalProps> = ({ email, show, onClose, onSuccess }) => {
  const dispatch = useDispatch();

  console.log('email', email);

  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState<number>(60);

  // Countdown timer effect
  useEffect(() => {
    if (countdown === 0) return;
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setLoading());

    try {
      await api.post('/otp/verify', { email, otp });
      dispatch(setOtpVerified());
      onSuccess('OTP verified successfully!');
      onClose();
    } catch (error: any) {
      console.error(error);
      if (error.response?.data?.message === 'OTP expired') {
        dispatch(setOtpExpired());
        setMessage('Your OTP has expired. Please resend the OTP.');
      } else {
        dispatch(setError('Error verifying OTP.'));
        setMessage('Error verifying OTP. Please try again.');
      }
    }
  };

  const handleResendOtp = async () => {
    setMessage('');
    dispatch(setLoading());
    setCountdown(60);

    try {
      await api.post('/otp/send', { email });
      dispatch(setOtpSent(email));
      setMessage('A new OTP has been sent to your email.');
    } catch (error: any) {
      console.error(error);
      dispatch(setError('Error resending OTP.'));
      setMessage('Error resending OTP. Please try again.');
    }
  };

  // If the modal should not be shown, return null
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h3 className="text-xl font-bold text-center mb-4">Verify OTP</h3>
        <form onSubmit={handleVerifyOtp}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              OTP
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-3 py-2 border border-gray-400 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-600"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-gray-800 text-white font-semibold rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
          >
            Verify OTP
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm font-medium text-gray-700">
            OTP will expire in {countdown} seconds.
          </p>

          {countdown === 0 && (
            <button
              type="button"
              onClick={handleResendOtp}
              className="w-full mt-3 py-2 px-4 bg-blue-600 text-white font-semibold rounded hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Resend OTP
            </button>
          )}
        </div>

        {message && (
          <p className="mt-4 text-center text-sm font-medium text-gray-700">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default OtpModal;