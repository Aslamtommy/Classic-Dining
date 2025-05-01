"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { Eye, EyeOff, LogIn } from "lucide-react"
import restaurentApi from "../../Axios/restaurentInstance"
import { setRestaurent, setError, setLoading, clearLoading } from "../../redux/restaurentSlice"
import type { RootState } from "../../redux/store"
import toast from "react-hot-toast"
import ForgotPasswordModal from "../CommonComponents/Modals/ForgotPasswordModal"
import type { LoginFormData } from "../../types/restaurent"

interface LoginResponse {
  status: string
  message: string
  data: {
    restaurent: {
      id: string
      name: string
      email: string
      phone?: string
      certificate?: string
      [key: string]: any
    }
    status: string
    role: string
    accessToken: string
    refreshToken: string
  }
}

const RestaurentLogin: React.FC = () => {
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false)

  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { loading, error } = useSelector<RootState, any>((state) => state.restaurent)

  useEffect(() => {
    dispatch(clearLoading())
  }, [dispatch])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(setLoading())

    const loginData: LoginFormData = { email, password }

    try {
      const response = await restaurentApi.post<LoginResponse>("/login", loginData, { withCredentials: true })

      if (response.status === 200) {
        const { restaurent, role, accessToken, refreshToken } = response.data.data
        dispatch(
          setRestaurent({
            restaurent,
            role,
            accessToken,
            refreshToken,
          }),
        )

        if (role === "branch") {
          navigate("/restaurent/home", { replace: true })
          toast.success("Branch login successful!")
        } else {
          navigate("/restaurent/home", { replace: true })
          toast.success("Login successful!")
        }
      } else if (response.status === 202) {
        // Handle pending approval
        const pendingStatus = response.data.data?.status
        if (pendingStatus === "pending") {
          navigate("/restaurent/pending-approval", { state: { status: "pending" } })
        }
      }
    } catch (err: any) {
      let errorMsg = "Something went wrong."

      if (err.response?.status === 403) {
        const blockReason = err.response?.data?.data?.reason
        navigate("/restaurent/pending-approval", {
          state: { status: "blocked", blockReason },
        })
        return
      }

      if (err.response?.status === 401) {
        errorMsg = "Invalid email or password."
      } else if (err.response?.data?.message) {
        errorMsg = err.response.data.message
      }

      dispatch(setError(errorMsg))
      toast.error(errorMsg)
    } finally {
      dispatch(clearLoading())
    }
  }

  const togglePasswordVisibility = () => setShowPassword(!showPassword)

  return (
    <div className="w-full">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-sepia-800">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-sepia-200 focus:outline-none focus:ring-2 focus:ring-sepia-500 focus:border-sepia-500 transition-colors"
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-sepia-800">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-sepia-200 focus:outline-none focus:ring-2 focus:ring-sepia-500 focus:border-sepia-500 transition-colors"
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sepia-500 hover:text-sepia-700 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div className="text-right">
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-sm text-sepia-700 hover:text-sepia-900 hover:underline transition-colors"
          >
            Forgot Password?
          </button>
        </div>

        <motion.button
          type="submit"
          className="w-full py-3 px-4 bg-gradient-to-r from-sepia-700 to-sepia-900 text-white rounded-lg font-medium flex items-center justify-center hover:from-sepia-800 hover:to-sepia-950 transition-all duration-300 shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
          disabled={loading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          ) : (
            <LogIn className="mr-2 h-5 w-5" />
          )}
          {loading ? "Logging in..." : "Login"}
        </motion.button>
      </form>

      <ForgotPasswordModal show={showForgotPassword} onClose={() => setShowForgotPassword(false)} role="restaurent" />
    </div>
  )
}

export default RestaurentLogin
