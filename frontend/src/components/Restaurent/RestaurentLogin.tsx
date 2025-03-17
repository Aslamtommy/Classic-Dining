// src/components/RestaurentLogin.tsx
import React, { useState, useEffect } from "react";
import restaurentApi from "../../Axios/restaurentInstance";
import { useDispatch, useSelector } from "react-redux";
import {
  setRestaurent,
  setError,
  setLoading,
  clearLoading,
} from "../../redux/restaurentSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ForgotPasswordModal from "../CommonComponents/Modals/ForgotPasswordModal";
import { RootState } from "../../redux/store";
import { LoginFormData } from "../../types/restaurent";

interface LoginResponse {
  status: string;
  message: string;
  data: {
    restaurent: {
      id: string;
      name: string;
      email: string;
      phone?: string;
      certificate?: string;
      [key: string]: any;
    };
    status: string;
    role: string;
    accessToken: string;
    refreshToken: string;
  };
}

const RestaurentLogin: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setErrorState] = useState<string>("");
  const [loading, setLoadingState] = useState<boolean>(false);
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading: reduxLoading } = useSelector<RootState,any>(
    (state) => state.restaurent
  );

  useEffect(() => {
    setLoadingState(false);
    dispatch(clearLoading());
  }, [dispatch]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorState("");
    dispatch(setLoading());
    setLoadingState(true);

    const loginData: LoginFormData = { email, password };

    try {
      const response = await restaurentApi.post<LoginResponse>(
        "/login", // Adjusted to match your backend route
        loginData,
        { withCredentials: true }
      );
      console.log("Login response:", response);

      if (response.status === 200) {
        const { restaurent, role, accessToken, refreshToken } = response.data.data;
        dispatch(
          setRestaurent({
            restaurent,
            role,
            accessToken, // Store accessToken
            refreshToken, // Store refreshToken
          })
        );
        if (role === "branch") {
          navigate("/restaurent/home", { replace: true });
          toast.success("Branch login successful!");
        } else {
          navigate("/restaurent/home", { replace: true });
          toast.success("Login successful!");
        }
      } else if (response.status === 202) {
        // Handle pending approval
        const pendingStatus = response.data.data?.status;
        if (pendingStatus === "pending") {
          navigate("/restaurent/pending-approval", { state: { status: "pending" } });
        }
      }
    } catch (err: any) {
      console.log("Full error object:", err);
      console.log("Error response data:", err.response?.data);

      let errorMsg = "Something went wrong.";

      if (err.response?.status === 403) {
        const blockReason = err.response?.data?.data?.reason;
        navigate("/restaurent/pending-approval", {
          state: { status: "blocked", blockReason },
        });
        return;
      }

      if (err.response?.status === 401) {
        errorMsg = "Invalid email or password.";
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      }

      setErrorState(errorMsg);
      dispatch(setError(errorMsg));
      toast.error(errorMsg);
    } finally {
      setLoadingState(false);
      dispatch(clearLoading());
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded shadow-md">
        <h2 className="text-2xl font-bold text-center mb-4">Login</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Enter your email"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded focus:outline-none focus:ring focus:ring-blue-300"
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className={`w-full py-2 px-4 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 ${
              loading || reduxLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading || reduxLoading}
          >
            {loading || reduxLoading ? "Logging in..." : "Login"}
          </button>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowForgotPassword(true)}
            className="text-blue-500 text-sm underline"
          >
            Forgot Password?
          </button>
        </div>
      </div>
      <ForgotPasswordModal
        show={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        role="restaurent"
      />
    </div>
  );
};

export default RestaurentLogin;