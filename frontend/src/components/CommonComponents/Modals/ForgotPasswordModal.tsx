import React, { useState } from 'react';
import api from '../../../Axios/userInstance';
import OtpModal from './OtpModal';  
import NewPasswordModal from './NewPaawordModal';
import restaurentApi from '../../../Axios/restaurentInstance';
import { toast } from 'react-hot-toast';

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
  const [loading, setLoading] = useState(false);

  const apiInstance = role === 'restaurent' ?  restaurentApi : api;
  // Handle forgot password submission
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMessage('');
    setLoading(true);

    if (!forgotEmail) {
      setForgotMessage('Email is required.');
      toast.error('Email is required.');
      setLoading(false);
      return;
    }

    try {
      const response = await apiInstance.post<ForgotPasswordResponse>('/forgot-password', { email: forgotEmail });

      if (response.data.success) {
        setForgotMessage('OTP sent successfully to your email.');
        toast.success('OTP sent successfully to your email.');
        setEmail(forgotEmail); // Store the email for future use
        setShowOtpModal(true); // Show the OTP Modal for verification
      } else {
        setForgotMessage(response.data.message || 'Failed to send OTP.');
        toast.error(response.data.message || 'Failed to send OTP.');
      }
    } catch (error: any) {
      setForgotMessage('An error occurred. Please try again.');
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerificationSuccess = () => {
    setShowOtpModal(false); // Close OTP modal
    setShowNewPasswordModal(true); // Open New Password Modal after OTP verification
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
        <form onSubmit={handleForgotPassword}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>
          {forgotMessage && (
            <p className={`text-sm mb-4 ${response.data?.success ? 'text-green-500' : 'text-red-500'}`}>
              {forgotMessage}
            </p>
          )}
          <div className="flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </div>
              ) : (
                'Send OTP'
              )}
            </button>
          </div>
        </form>
      </div>
      {showOtpModal && (
        <OtpModal
          show={showOtpModal}
          onClose={() => setShowOtpModal(false)}
          onSuccess={handleOtpVerificationSuccess}
          email={email}
          role={role}
        />
      )}
      {showNewPasswordModal && (
        <NewPasswordModal
          show={showNewPasswordModal}
          onClose={() => {
            setShowNewPasswordModal(false);
            onClose();
          }}
          email={email}
          role={role}
        />
      )}
    </div>
  );
};

export default ForgotPasswordModal;
