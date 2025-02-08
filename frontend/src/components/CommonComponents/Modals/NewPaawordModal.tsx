import React, { useState } from 'react';
import api from '../../../Axios/userInstance';
import managerApi from '../../../Axios/managerInstance';
interface NewPasswordModalProps {
  show: boolean; // Whether the modal is visible
  email: string; // Email of the user resetting the password
  onClose: () => void; // Callback to close the modal
  role:string
}

const NewPasswordModal: React.FC<NewPasswordModalProps> = ({ show, email, onClose,role }) => {
  const [newPassword, setNewPassword] = useState<string>('');  
  const [confirmPassword, setConfirmPassword] = useState<string>('');  
  const [message, setMessage] = useState<string>('');  
  const apiInstance = role === 'manager' ? managerApi : api;

  const handleNewPasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); 
    setMessage('');  

    // Validation for empty fields
    if (!newPassword || !confirmPassword) {
      setMessage('Both fields are required.');
      return;
    }

    // Validation for matching passwords
    if (newPassword !== confirmPassword) {
      
      return;
    }
          

     

    try {
      // API call to reset the password

      
      const response = await apiInstance.post<{ success: boolean; message?: string }>('/reset-password', {
        email,
        password: newPassword,
      });

      if (response.data.success) {
        setMessage('Password reset successfully! You can now log in.');
        setTimeout(() => {
          onClose(); // Close the modal after a short delay
        }, 2000);
      } else {
        setMessage(response.data.message || 'Failed to reset password.');
      }
    } catch (error) {
      setMessage('An error occurred. Please try again.');
    }
  };

  // Don't render the modal if `show` is false
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
        {message && (
          <p
            className={`mt-4 text-sm font-medium text-center ${
              message.toLowerCase().includes('success')
                ? 'text-green-600'
                : 'text-red-600'
            }`}
          >
            {message}
          </p>
        )}
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
