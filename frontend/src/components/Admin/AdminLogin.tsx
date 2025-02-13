import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../redux/store';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../redux/adminSlice';
import adminApi from '../../Axios/adminInstance';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      const response:any = await adminApi.post('/login', { email, password });
      console.log('Admin response received successfully:', response);

      dispatch(adminLogin({ email: response.data.data.email })); // Dispatch the login action
      navigate('/admin/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);

      // Extract the error response message from the backend
      const errorMessage =
        error.response?.data?.message || "Invalid email or password. Please try again.";
      
      setLocalError(errorMessage);
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