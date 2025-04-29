"use client"

import type React from "react"
import { type FormEvent, useState } from "react"
import { useDispatch } from "react-redux"
import { setLoading, setUser, setError } from "../../redux/userslice"
import api from "../../Axios/userInstance"
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import App from "../../../Config/firebaseConfig"
import { useNavigate } from "react-router-dom"
import ForgotPasswordModal from "../CommonComponents/Modals/ForgotPasswordModal"
import { motion, AnimatePresence } from "framer-motion"
import toast from "react-hot-toast"
import type { LoginResponse, GoogleSignInResponse, AxiosError } from "../../types/auth"

interface LoginModalProps {
  show: boolean
  onClose: () => void
  onSignupClick: () => void
}

const LoginModal: React.FC<LoginModalProps> = ({ show, onClose, onSignupClick }) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false)

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error("Email and password are required.")
      return
    }

    dispatch(setLoading())
    try {
      const response = await api.post<LoginResponse>("/login", { email, password }, { withCredentials: true })

      const { user, accessToken, refreshToken }: any = response.data.data
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
    } catch (error: unknown) {
      const axiosError = error as AxiosError
      const errorMessage = axiosError.response?.data?.message || "Login failed. Please check your credentials."
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

      const response = await api.post<GoogleSignInResponse>("/google", { idToken }, { withCredentials: true })

      const { user, accessToken, refreshToken }: any = response.data.data
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
    } catch (error: unknown) {
      const axiosError = error as AxiosError
      const errorMessage = axiosError.response?.data?.message || "Google Sign-In failed."
      dispatch(setError(errorMessage))
      toast.error(errorMessage)
    }
  }

  if (!show) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 30, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 30, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 30,
            duration: 0.4,
          }}
          className="bg-sepia-50 rounded-xl shadow-premium border-2 border-sepia-200 w-full max-w-md p-8 relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-20 h-20 border-l-3 border-t-3 border-sepia-300 opacity-60"></div>
          <div className="absolute top-0 right-0 w-20 h-20 border-r-3 border-t-3 border-sepia-300 opacity-60"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 border-l-3 border-b-3 border-sepia-300 opacity-60"></div>
          <div className="absolute bottom-0 right-0 w-20 h-20 border-r-3 border-b-3 border-sepia-300 opacity-60"></div>

          {/* Gold accent */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br from-gold-300/20 to-gold-500/20 rounded-full blur-xl"></div>
          <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-gradient-to-br from-gold-300/20 to-gold-500/20 rounded-full blur-xl"></div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-sepia-700 hover:text-sepia-900 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <h2 className="text-3xl font-playfair text-sepia-900 mb-2 text-center">Welcome Back</h2>
            <div className="flex justify-center mb-6">
              <motion.div
                className="h-1 w-16 bg-gradient-to-r from-gold-400 to-gold-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: 64 }}
                transition={{ delay: 0.4, duration: 0.8 }}
              />
            </div>
          </motion.div>

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
                  className="w-full px-4 py-3 bg-white border-2 border-sepia-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent text-sepia-900 font-cormorant text-lg transition-all duration-300"
                  placeholder="your@email.com"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-sepia-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
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
                  className="w-full px-4 py-3 bg-white border-2 border-sepia-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent text-sepia-900 font-cormorant text-lg transition-all duration-300"
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-sepia-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
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
              whileHover={{ scale: 1.02, backgroundColor: "#B22222" }}
              whileTap={{ scale: 0.98 }}
              className="mt-4 bg-red-700 text-white py-3 px-6 rounded-lg hover:bg-red-800 transition-colors font-playfair flex items-center justify-center w-full shadow-elegant"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
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
              <button
                onClick={onSignupClick}
                className="text-gold-700 hover:text-gold-600 font-medium transition-colors"
              >
                Sign Up
              </button>
            </p>
          </motion.div>

          {showForgotPassword && (
            <ForgotPasswordModal show={showForgotPassword} onClose={() => setShowForgotPassword(false)} role="user" />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default LoginModal
