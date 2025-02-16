import React, { useState } from 'react';
import api from '../../../Axios/userInstance';
import OtpModal from './OtpModal';  
 import NewPasswordModal from './NewPaawordModal';
 import  restaurentApi from '../../../Axios/restaurentInstance';
interface ForgotPasswordProps {
  show: boolean;
  onClose: () => void;
  role:string
}

interface ForgotPasswordResponse {
  success: boolean;
  message?: string;
}

const ForgotPasswordModal: React.FC<ForgotPasswordProps> = ({ show, onClose,role }) => {
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showNewPasswordModal, setShowNewPasswordModal] = useState(false);
  const [email, setEmail] = useState('');


  const apiInstance = role === 'restaurent' ?  restaurentApi : api;
  // Handle forgot password submission
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMessage('');

    if (!forgotEmail) {
      setForgotMessage('Email is required.');
      return;
    }

    try {
      const response = await apiInstance .post<ForgotPasswordResponse>('/forgot-password', { email: forgotEmail });

      if (response.data.success) {
        setForgotMessage('OTP sent successfully to your email.');
        setEmail(forgotEmail); // Store the email for future use
        setShowOtpModal(true); // Show the OTP Modal for verification
      } else {
        setForgotMessage(response.data.message || 'Failed to send OTP.');
      }
    } catch (error: any) {
      setForgotMessage('An error occurred. Please try again.');
    }
  };

  const handleOtpVerificationSuccess = () => {
    setShowOtpModal(false); // Close OTP modal
    setShowNewPasswordModal(true); // Open New Password Modal after OTP verification
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg w-80">
        <h3 className="text-xl mb-4">Forgot Password</h3>
        <form onSubmit={handleForgotPassword}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter your email to receive the OTP
            </label>
            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-400 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-600"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-gray-800 text-white font-semibold rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
          >
            Send OTP
          </button>
        </form>
        {forgotMessage && (
          <p className="mt-4 text-center text-sm font-medium text-gray-700">{forgotMessage}</p>
        )}
        <button
          onClick={onClose}
          className="mt-4 text-center text-blue-500"
        >
          Close
        </button>
      </div>

      {/* OTP Modal */}
      {showOtpModal && (
        <OtpModal
          show={showOtpModal} // Ensure `OtpModal` accepts `show`
          email={email}
          onClose={() => setShowOtpModal(false)}
          onSuccess={handleOtpVerificationSuccess} // Pass success handler to show NewPasswordModal
        />
      )}

      {/* New Password Modal */}
      {showNewPasswordModal && (
        <NewPasswordModal
          show={showNewPasswordModal} 
          email={email}  
          onClose={() => setShowNewPasswordModal(false)} // Close modal after reset
        role={role}
        />
      )}
    </div>
  );
};

export default ForgotPasswordModal;
