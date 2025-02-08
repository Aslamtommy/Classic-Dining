import axios from 'axios';
import { store } from '../redux/store';
import { adminLogout } from '../redux/adminSlice';

interface TokenResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// Set up Axios instance for admin
const adminApi = axios.create({
  baseURL: 'http://localhost:5000/admin', // Admin API base URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with each request
});

// Logout function
const logout = (): void => {
  console.log('Logging out the admin...');
  const dispatch = store.dispatch;
  dispatch(adminLogout());

 
  alert('Your session has expired. Please log in again.');

  // Redirect to login route
  window.location.href = '/admin/login';
}
 
adminApi.interceptors.response.use(
  (response) => {
    // Successful response
    console.log('Response received successfully:', response);
    return response;
  },
  async (error) => {
    console.log('Error received in interceptor:', error);

    const originalRequest = error.config;

    // If the error status is 401 (Unauthorized), indicating token expiration
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      console.log('Token expired. Attempting to refresh token...');

      originalRequest._retry = true; // Mark the request as retried to avoid an infinite loop

      try {
        console.log('Sending request to refresh token...');
        const refreshResponse = await axios.post<TokenResponse>(
          'http://localhost:5000/admin/refresh-token',
          {},
          { withCredentials: true } // Send cookies along with the request
        );

        // Check if the response has the expected structure
        if (refreshResponse.data && refreshResponse.data.tokens) {
          const { accessToken } = refreshResponse.data.tokens; // Retrieve the new access token
          console.log('New access token received:', accessToken);

          // Retry the original request with the new access token in the Authorization header
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          console.log('Retrying original request with new access token...');
          return adminApi(originalRequest);
        } else {
          console.error('Refresh token response does not contain expected tokens:', refreshResponse.data);
          throw new Error('Invalid refresh response');
        }
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);

     
        console.log('Refresh token failed. Logging out...');
        logout();
        return Promise.reject(refreshError);
      }
    }

     
    console.error('Unhandled error in interceptor:', error);
    return Promise.reject(error);
  }
);

export default adminApi;
