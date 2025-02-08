import axios from 'axios';
import { store } from '../redux/store';
import { logoutUser } from '../redux/userslice';

interface TokenResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// Set up Axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/users', // Backend API URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with each request
});

// Logout function
const logout = (): void => {
  console.log('Logging out the user...');
  const dispatch = store.dispatch;

  // Dispatch the logout action to clear user state
  dispatch(logoutUser());

  // Redirect to login route
  window.location.href = '/login';
};

 
api.interceptors.response.use(
  (response) => {
    // If the response is successful, just return it
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      const { status } = error.response;

      if (status === 403) {
        // Handle 403 Forbidden - User might be blocked
        alert('You have been blocked by the admin.');
        logout();
        return Promise.reject(error);
      }

      if (status === 401 && !originalRequest._retry) {
      
        originalRequest._retry = true; // Mark the request as retried to avoid an infinite loop

        try {
          const refreshResponse = await axios.post<TokenResponse>(
            'http://localhost:5000/users/refresh-token',
            {},
            { withCredentials: true } // Send cookies along with the request
          );

          const { accessToken } = refreshResponse.data.tokens; // Retrieve the new access token

          // Retry the original request with the new access token in the Authorization header
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
          return axios(originalRequest);
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError);
          logout();
          return Promise.reject(refreshError);
        }
      }
    }

    // For other errors, reject the promise
    return Promise.reject(error);
  }
);

export default api;
