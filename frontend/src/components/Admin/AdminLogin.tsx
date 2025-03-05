import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../redux/adminSlice';
import adminApi from '../../Axios/adminInstance';
import toast from 'react-hot-toast';
import { AdminLoginResponse } from '../../types/admin';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  // Global loading and error state from Redux store
  const { loading, error } = useSelector((state: RootState) => state.admin);
  const [localError, setLocalError] = useState<string | null>(null);

  // Handle form submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Logging in with:', { email, password });

    setLocalError(null); // Reset error before new request

    try {
      const response = await adminApi.post<AdminLoginResponse>('/login', { email, password });
      console.log('Admin response received successfully:', response);

      // Dispatch the login action with the email from response
      dispatch(adminLogin({ email: response.data.data.email }));
      navigate('/admin/dashboard');
      toast.success('Login success');
    } catch (error: unknown) {
      console.error('Login error:', error);

      // Type-safe error handling
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        const errorMessage =
          axiosError.response?.data?.message || 'Invalid email or password. Please try again.';
        setLocalError(errorMessage);
      } else {
        setLocalError('An unexpected error occurred.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Admin Login</h2>

        {/* Show error messages */}
        {localError && <p className="mb-4 text-center text-red-500">{localError}</p>}
        {error && !localError && <p className="mb-4 text-center text-red-500">{error}</p>}

        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-200"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-200"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;