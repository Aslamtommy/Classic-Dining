import axios from "axios";
import { store } from "../redux/store";
import { logoutRestaurent } from "../redux/restaurentSlice";
import toast from "react-hot-toast";
import { BaseUrl } from "../../Config/BaseUrl";
interface TokenResponse {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

// Set up Axios instance for restaurent
const restaurentApi = axios.create({
  baseURL:  `${BaseUrl}/restaurent`,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,  
});

// Logout function
const logout = (): void => {
  console.log("Logging out the Restaurent...");
  const {dispatch} = store 
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
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip interceptor logic for login requests
    if (originalRequest.url === "/login") {
      return Promise.reject(error);
    }

    if (error.response) {
      const { status } = error.response;

       

      // Handle token expiration
      if (status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshResponse = await axios.post<TokenResponse>(
            "http://localhost:5000/restaurent/refresh-token",
            {},
            { withCredentials: true }
          );

          const { accessToken } = refreshResponse.data.tokens;
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
