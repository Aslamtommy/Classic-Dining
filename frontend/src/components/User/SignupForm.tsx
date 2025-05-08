"use client"

import { useState } from "react"
import { useDispatch } from "react-redux"
import api from "../../Axios/userInstance"
import { setLoading, setError, setUser } from "../../redux/userslice"
import OtpModal from "../../components/CommonComponents/Modals/OtpModal"
import { useNavigate } from "react-router-dom"
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth"
import App from "../../../Config/firebaseConfig"
import sendOtp from "../../utils/sentotp"
import { useForm, Controller } from "react-hook-form"
import * as yup from "yup"
import { yupResolver } from "@hookform/resolvers/yup"
import { motion } from "framer-motion"
import { toast } from "react-hot-toast"
import { User, Mail, Lock, Phone } from "lucide-react"
import ModalWrapper from "./modal-wrapper"

// Yup validation schema
const validationSchema = yup
  .object({
    name: yup
      .string()
      .matches(/^[A-Za-z ]+$/, "Only alphabets and spaces are allowed")
      .min(3, "Name must be at least 3 characters")
      .required("Name is required"),
    email: yup.string().email("Invalid email format").required("Email is required"),
    password: yup
      .string()
      .min(8, "Password must be at least 8 characters")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[a-z]/, "Password must contain at least one lowercase letter")
      .matches(/[0-9]/, "Password must contain at least one number")
      .matches(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character")
      .required("Password is required"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], "Passwords do not match")
      .required("Confirm Password is required"),
    mobile: yup
      .string()
      .matches(/^\d{10}$/, "Mobile number must be 10 digits")
      .required("Mobile number is required"),
  })
  .required()

interface SignupModalProps {
  show: boolean
  onClose: () => void
  onLoginClick: () => void
}

const SignupModal = ({ show, onClose, onLoginClick }: SignupModalProps) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [message, setMessage] = useState("")
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [isSendingOtp, setIsSendingOtp] = useState(false)

  const {
    control,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  })

  const onSubmit = async (data: any) => {
    setMessage("")
    setIsSendingOtp(true) // Set loading to true before sending OTP

    try {
      const { success, message: otpMessage } = await sendOtp(data.email, dispatch)
      setMessage(otpMessage)
      toast.success(otpMessage)

      if (success) {
        setShowOtpModal(true)
      }
    } catch (error) {
      console.error("Error sending OTP:", error)
      toast.error("Failed to send OTP. Please try again.")
    } finally {
      setIsSendingOtp(false) // Set loading to false after OTP is sent
    }
  }

  const handleOtpSuccess = async (successMessage: string) => {
    setMessage(successMessage)
    setShowOtpModal(false)
    toast.success(successMessage)

    const data = getValues()

    try {
      dispatch(setLoading())
      const response: any = await api.post("/register", {
        name: data.name,
        email: data.email,
        password: data.password,
        mobile: data.mobile,
      })

      const { user } = response.data.data
      dispatch(
        setUser({
          name: user.name,
          email: user.email,
          mobile: user.mobile || "",
        }),
      )
      setMessage("User registered successfully!")
      toast.success("User registered successfully!")
      onClose()
      onLoginClick() // Open login modal after signup
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Error registering user."
      if (errorMessage === "User with this email already exists") {
        setMessage("This email is already registered. Please use a different email.")
        toast.error("This email is already registered. Please use a different email.")
      } else {
        dispatch(setError(errorMessage))
        setMessage("Error registering user. Please try again.")
        toast.error("Error registering user. Please try again.")
      }
    }
  }

  const handleGoogleSignIn = async () => {
    const auth = getAuth(App)
    const provider = new GoogleAuthProvider()

    try {
      dispatch(setLoading())
      const result = await signInWithPopup(auth, provider)
      const idToken = await result.user.getIdToken()

      const response: any = await api.post("/google", {
        idToken,
      })

      const user = response.data.data
      dispatch(
        setUser({
          name: user.name,
          email: user.email,
          mobile: user.mobile || "",
        }),
      )
      setMessage("Google Sign-In successful!")
      toast.success("Google Sign-In successful!")
      onClose()
      navigate("/")
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Google Sign-In failed."
      setMessage(`Google Sign-In failed: ${errorMessage}`)
      dispatch(setError(errorMessage))
      toast.error(errorMessage)
    }
  }

  return (
    <ModalWrapper show={show} onClose={onClose} title="Create an Account">
      <div className="max-h-[70vh] overflow-auto custom-scrollbar pr-2">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <label className="block text-sm font-playfair text-sepia-700 mb-1">Name</label>
            <div className="relative">
              <Controller
                name="name"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter your name"
                    className="w-full pl-10 pr-4 py-3 bg-white border-2 border-sepia-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent text-sepia-900 font-medium transition-all duration-300"
                  />
                )}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="w-5 h-5 text-sepia-400" />
              </div>
            </div>
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <label className="block text-sm font-playfair text-sepia-700 mb-1">Email</label>
            <div className="relative">
              <Controller
                name="email"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="email"
                    placeholder="Enter your email"
                    className="w-full pl-10 pr-4 py-3 bg-white border-2 border-sepia-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent text-sepia-900 font-medium transition-all duration-300"
                  />
                )}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-sepia-400" />
              </div>
            </div>
            {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <label className="block text-sm font-playfair text-sepia-700 mb-1">Password</label>
            <div className="relative">
              <Controller
                name="password"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="password"
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-4 py-3 bg-white border-2 border-sepia-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent text-sepia-900 font-medium transition-all duration-300"
                  />
                )}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-sepia-400" />
              </div>
            </div>
            {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <label className="block text-sm font-playfair text-sepia-700 mb-1">Confirm Password</label>
            <div className="relative">
              <Controller
                name="confirmPassword"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="password"
                    placeholder="Confirm your password"
                    className="w-full pl-10 pr-4 py-3 bg-white border-2 border-sepia-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent text-sepia-900 font-medium transition-all duration-300"
                  />
                )}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-sepia-400" />
              </div>
            </div>
            {errors.confirmPassword && <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <label className="block text-sm font-playfair text-sepia-700 mb-1">Mobile No</label>
            <div className="relative">
              <Controller
                name="mobile"
                control={control}
                defaultValue=""
                render={({ field }) => (
                  <input
                    {...field}
                    type="text"
                    placeholder="Enter your mobile number"
                    className="w-full pl-10 pr-4 py-3 bg-white border-2 border-sepia-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent text-sepia-900 font-medium transition-all duration-300"
                  />
                )}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="w-5 h-5 text-sepia-400" />
              </div>
            </div>
            {errors.mobile && <p className="text-red-600 text-sm mt-1">{errors.mobile.message}</p>}
          </motion.div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02, backgroundColor: "#9C7732" }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.8,
              duration: 0.5,
              backgroundColor: { duration: 0.2 },
            }}
            disabled={isSendingOtp}
            className="w-full py-3 px-4 bg-sepia-700 text-white rounded-lg font-playfair font-medium hover:bg-sepia-800 transition-colors shadow-elegant mt-4 disabled:opacity-70"
          >
            {isSendingOtp ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Sending OTP...
              </div>
            ) : (
              "Send OTP"
            )}
          </motion.button>
        </form>

        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <div className="relative flex items-center justify-center">
            <div className="border-t border-sepia-200 absolute w-full"></div>
            <div className="bg-sepia-50 px-4 relative z-10">
              <span className="text-sm font-playfair text-sepia-600">Or sign up with</span>
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
            Sign up with Google
          </motion.button>
        </motion.div>

        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
        >
          <p className="text-sm font-playfair text-sepia-700">
            Already have an account?{" "}
            <button onClick={onLoginClick} className="text-gold-700 hover:text-gold-600 font-medium transition-colors">
              Log In
            </button>
          </p>
        </motion.div>
      </div>

      {message && <p className="mt-4 text-center text-sm font-playfair text-sepia-700">{message}</p>}

      {showOtpModal && (
        <OtpModal
          email={getValues("email")}
          onClose={() => setShowOtpModal(false)}
          onSuccess={handleOtpSuccess}
          show={showOtpModal}
          initialSending={isSendingOtp}
        />
      )}
    </ModalWrapper>
  )
}

export default SignupModal
