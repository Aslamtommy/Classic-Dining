import React, { useState } from "react";
import managerApi from "../../Axios/managerInstance";
import { useDispatch } from "react-redux";
import { setManager, setError, setLoading } from "../../redux/managerSlice";
import { useNavigate } from "react-router-dom";
import ForgotPasswordModal from "../CommonComponents/Modals/ForgotPasswordModal";

const ManagerLogin: React.FC = () => {
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
      const response: any = await managerApi.post("/login", {
        email,
        password,
      });

      const managerData = response.data.manager;
      dispatch(setManager(managerData));

      // Redirect to manager dashboard
      navigate('/manager/home')
     
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Something went wrong.";
      dispatch(setError(errorMsg));
      setErrorState(errorMsg);
    } finally {
      setLoadingState(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded shadow-md">
        <h2 className="text-2xl font-bold text-center mb-4">Manager Login</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
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
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
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
            className={`w-full py-2 px-4 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 ${loading ? "opacity-50" : ""}`}
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

      {/* Show ForgotPasswordModal with role="manager" */}
      <ForgotPasswordModal
        show={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        role="manager"
      />
    </div>
  );
};

export default ManagerLogin;
