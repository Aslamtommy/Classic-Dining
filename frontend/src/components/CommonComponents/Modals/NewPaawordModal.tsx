import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import api from '../../../Axios/userInstance';
import restaurentApi from '../../../Axios/restaurentInstance';

interface NewPasswordModalProps {
  show: boolean;
  email: string;
  onClose: () => void;
  role: string;
}

const NewPasswordModal: React.FC<NewPasswordModalProps> = ({ show, email, onClose, role }) => {
  const [newPassword, setNewPassword] = useState<string>('');  
  const [confirmPassword, setConfirmPassword] = useState<string>('');  
  const apiInstance = role === 'restaurent' ? restaurentApi : api;

  const handleNewPasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation for empty fields
    if (!newPassword || !confirmPassword) {
      toast.error('Both fields are required.');
      return;
    }

    // Validation for matching passwords
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      // API call to reset the password
      const response = await apiInstance.post<{ success: boolean; message?: string }>('/reset-password', {
        email,
        password: newPassword,
      });

      if (response.data.success) {
        toast.success('Password reset successfully! You can now log in.');
        setTimeout(() => {
          onClose(); // Close the modal after a short delay
        }, 2000);
      } else {
        toast.error(response.data.message || 'Failed to reset password.');
      }
    } catch (error: any) {
      
        // Capture custom backend errors (like same password issue)
        toast.error(error.response.data.message || 'Invalid request.');
      
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-xl w-96 p-6 relative">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Set New Password</h3>
        <form onSubmit={handleNewPasswordSubmit}>
          <div className="mb-4">
            <label
              htmlFor="new-password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              New Password
            </label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="confirm-password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Reset Password
          </button>
        </form>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
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
      </div>
    </div>
  );
};

export default NewPasswordModal;
