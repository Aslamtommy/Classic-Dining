"use client"

import type React from "react"

import { useState } from "react"
import { useDispatch } from "react-redux"
import { setLoading, setUser, setError } from "../../redux/userslice"
import api from "../../Axios/userInstance"
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import App from "../../../Config/firebaseConfig"
import { useNavigate } from "react-router-dom"
import ForgotPasswordModal from "../CommonComponents/Modals/ForgotPasswordModal"
import { motion } from "framer-motion"
import toast from "react-hot-toast"
import { Mail, Lock } from "lucide-react"
import ModalWrapper from "./modal-wrapper"

interface LoginModalProps {
  show: boolean
  onClose: () => void
  onSignupClick: () => void
}

const LoginModal = ({ show, onClose, onSignupClick }: LoginModalProps) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showForgotPassword, setShowForgotPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error("Email and password are required.")
      return
    }

    dispatch(setLoading())
    try {
      const response: any = await api.post("/login", { email, password }, { withCredentials: true })

      const { user, accessToken, refreshToken } = response.data.data
      dispatch(
        setUser({
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile || "",
          accessToken,
          refreshToken,
        }),
      )
      toast.success("Login successful")
      onClose()
      navigate("/")
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Login failed. Please check your credentials."
      dispatch(setError(errorMessage))
      toast.error(errorMessage)
    }
  }

  const handleGoogleSignIn = async () => {
    const auth = getAuth(App)
    const provider = new GoogleAuthProvider()

    try {
      dispatch(setLoading())
      const result = await signInWithPopup(auth, provider)
      const idToken = await result.user.getIdToken()

      const response: any = await api.post("/google", { idToken }, { withCredentials: true })

      const { user, accessToken, refreshToken } = response.data.data
      dispatch(
        setUser({
          id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile || "",
          accessToken,
          refreshToken,
        }),
      )
      toast.success("Google Sign-In successful!")
      onClose()
      navigate("/")
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Google Sign-In failed."
      dispatch(setError(errorMessage))
      toast.error(errorMessage)
    }
  }

  return (
    <ModalWrapper show={show} onClose={onClose} title="Welcome Back">
      <div className="h-[400px] overflow-hidden">
        <form onSubmit={handleLogin} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <label className="block text-sm font-playfair text-sepia-700 mb-1">Email</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-sepia-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent text-sepia-900 font-medium text-lg transition-all duration-300"
                placeholder="your@email.com"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-sepia-400" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <label className="block text-sm font-playfair text-sepia-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-sepia-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent text-sepia-900 font-medium text-lg transition-all duration-300"
                placeholder="••••••••"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-sepia-400" />
              </div>
            </div>
          </motion.div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02, backgroundColor: "#9C7732" }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.5,
              duration: 0.5,
              backgroundColor: { duration: 0.2 },
            }}
            className="w-full py-3 px-4 bg-sepia-700 text-white rounded-lg font-playfair font-medium hover:bg-sepia-800 transition-colors shadow-elegant"
          >
            Sign In
          </motion.button>
        </form>

        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <div className="relative flex items-center justify-center">
            <div className="border-t border-sepia-200 absolute w-full"></div>
            <div className="bg-sepia-50 px-4 relative z-10">
              <span className="text-sm font-playfair text-sepia-600">Or continue with</span>
            </div>
          </div>

          <motion.button
            onClick={handleGoogleSignIn}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="mt-4 bg-white text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-playfair flex items-center justify-center w-full shadow-elegant border border-gray-300"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Sign in with Google
          </motion.button>
        </motion.div>

        <motion.div
          className="mt-6 text-center space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <button
            onClick={() => setShowForgotPassword(true)}
            className="text-sepia-700 text-sm font-playfair hover:text-gold-700 transition-colors"
          >
            Forgot Password?
          </button>
          <p className="text-sm font-playfair text-sepia-700">
            Don't have an account?{" "}
            <button onClick={onSignupClick} className="text-gold-700 hover:text-gold-600 font-medium transition-colors">
              Sign Up
            </button>
          </p>
        </motion.div>
      </div>

      {showForgotPassword && (
        <ForgotPasswordModal show={showForgotPassword} onClose={() => setShowForgotPassword(false)} role="user" />
      )}
    </ModalWrapper>
  )
}

export default LoginModal
