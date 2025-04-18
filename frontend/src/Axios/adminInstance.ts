import axios from 'axios';
import { store } from '../redux/store';
import { adminLogout } from '../redux/adminSlice';
import toast from 'react-hot-toast'; 
import { BaseUrl } from '../../Config/BaseUrl';
interface TokenResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// Set up Axios instance for admin
const adminApi = axios.create({
  baseURL: `${BaseUrl}/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});

// Logout function
const logout = (): void => {
  console.log('Logging out the admin...');
  const dispatch = store.dispatch;
  dispatch(adminLogout());

  // Replace alert with toast notification
  toast.error('Your session has expired. Please log in again.');

  // Redirect to login route
  window.location.href = '/admin/login';
}

adminApi.interceptors.response.use(
  (response) => {
    
    console.log('Response received successfully:', response);
    return response;
  },
  async (error) => {
    console.log('Error received in interceptor:', error);

    const originalRequest = error.config;

    // If the error status is 401 (Unauthorized), check if it's due to invalid credentials or an expired token
    if (error.response && error.response.status === 401) {
      // Check if the error is due to invalid credentials (e.g., fake email)
      if (error.response.data.message === 'Login failed. Please check your credentials.') {
        console.log('Invalid credentials. Do not attempt token refresh.');
        toast.error('Login failed. Please check your credentials.'); 
        return Promise.reject(error);  
      }

      // If the error is not due to invalid credentials, attempt token refresh
      if (!originalRequest._retry) {
        console.log('Token expired. Attempting to refresh token...');

        originalRequest._retry = true; // Mark the request as retried to avoid an infinite loop

        try {
          console.log('Sending request to refresh token...');
          const refreshResponse = await axios.post<TokenResponse>(
            `${BaseUrl}/admin/refresh-token`,
            {},
            { withCredentials: true } // Send cookies along with the request
          );

          // Check if the response has the expected structure
          if (refreshResponse.data && refreshResponse.data.tokens) {
            const { accessToken } = refreshResponse.data.tokens; 
            console.log('New access token received:', accessToken);

            // Retry the original request with the new access token in the Authorization header
            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
            console.log('Retrying original request with new access token...');
            return adminApi(originalRequest);
          } else {
            console.error('Refresh token response does not contain expected tokens:', refreshResponse.data);
            toast.error('Failed to refresh token. Please log in again.'); // Display error toast
            throw new Error('Invalid refresh response');
          }
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);

          // If token refresh fails, log out the user
          console.log('Refresh token failed. Logging out...');
          logout();
          return Promise.reject(refreshError);
        }
      }
    }

    // For all other errors, reject the promise
    console.error('Unhandled error in interceptor:', error);
    // toast.error('An unexpected error occurred. Please try again.');  
    return Promise.reject(error);
  }
);

export default adminApi;