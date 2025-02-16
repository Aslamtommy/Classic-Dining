import axios from "axios";
import { store } from "../redux/store";
import { logoutRestaurent } from "../redux/restaurentSlice";
import toast from "react-hot-toast";

interface TokenResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// Set up Axios instance for restaurent
const restaurentApi = axios.create({
  baseURL: "http://localhost:5000/restaurent",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Send cookies with each request
});

// Logout function
const logout = (): void => {
  console.log("Logging out the Restaurent...");
  const dispatch = store.dispatch;
  dispatch(logoutRestaurent());

  toast.error("Your session has expired. Please log in again.", {
    duration: 5000, // Display toast for 5 seconds
  });

  setTimeout(() => {
    window.location.href = "/restaurent/login";
  }, 5000);
};

// Add a response interceptor to handle token expiration and auto-refresh
restaurentApi.interceptors.response.use(
  (response) => {
    return response; // Successful response
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response) {
      const { status } = error.response;

      if (status === 403) {
        // Handle 403 Forbidden - Restaurent might be blocked
        toast.error("Your account has been blocked by the admin.");
        setTimeout(() => logout(), 5000);
        return Promise.reject(error);
      }

      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true; // Mark the request as retried to avoid an infinite loop

        try {
          const refreshResponse = await axios.post<TokenResponse>(
            "http://localhost:5000/restaurent/refresh-token",
            {},
            { withCredentials: true }
          );

          const { accessToken } = refreshResponse.data.tokens;

          // Retry the original request with the new access token
          originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
          return restaurentApi(originalRequest);
        } catch (refreshError) {
          console.error("Failed to refresh token:", refreshError);
          toast.error("Session expired. Please log in again.");
          setTimeout(() => logout(), 5000);
          return Promise.reject(refreshError);
        }
      }
    }

    return Promise.reject(error);
  }
);

export default restaurentApi;
