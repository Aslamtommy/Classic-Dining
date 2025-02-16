import React, { useState } from "react";
import restaurentApi from "../../Axios/restaurentInstance";
import { useDispatch } from "react-redux";
import { setRestaurent, setError, setLoading } from "../../redux/restaurentSlice";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ForgotPasswordModal from "../CommonComponents/Modals/ForgotPasswordModal";

const RestaurentLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setErrorState] = useState("");
  const [loading, setLoadingState] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorState("");
    dispatch(setLoading());
    setLoadingState(true);
  
    try {
      const response:any = await  restaurentApi.post("/login", { email, password });
  
      console.log("Restaurent login response:", response);
  
      if (response.data.success) {
        dispatch(setRestaurent(response.data.data));  
        console.log("Login successful. Redirecting to /restaurent/home");
        navigate("/restaurent/home", { replace: true });
      } else {
        const errorMsg = response.data.message || "Login failed. Please try again.";
    setErrorState(errorMsg);
    toast.error(errorMsg);
      }
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMsg = err.response?.data?.message || "Something went wrong.";
      setErrorState(errorMsg);
      dispatch(setError(errorMsg));
    } finally {
      setLoadingState(false);
    }
  };
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded shadow-md">
        <h2 className="text-2xl font-bold text-center mb-4">Restaurent Login</h2>
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
              loading ? "opacity-50" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
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

      {/* Show ForgotPasswordModal with role="restaurent" */}
      <ForgotPasswordModal
        show={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        role="restaurent"
      />
    </div>
  );
};

export default RestaurentLogin;