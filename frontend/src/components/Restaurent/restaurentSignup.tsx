"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "../../redux/store"
import { useNavigate } from "react-router-dom"
import { setLoading, setRestaurent, setError } from "../../redux/restaurentSlice"
import restaurentApi from "../../Axios/restaurentInstance"
import OtpModal from "../CommonComponents/Modals/OtpModal"
import sendOtp from "../../utils/sentotp"
import { motion } from "framer-motion"
import type { SignupFormData, RestaurentResponse, RestaurentState } from "../../types/restaurent"

// Validation Schema
const validationSchema = yup.object().shape({
  name: yup.string().required("Name is required").min(2, "Name must be at least 2 characters"),
  email: yup.string().email("Invalid email format").required("Email is required"),
  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      "Password must include at least one uppercase, one lowercase, one number, and one special character",
    ),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
  phone: yup
    .string()
    .matches(/^\d{10}$/, "Phone must be a valid 10-digit number")
    .required("Phone is required"),
  certificate: yup
    .mixed<File>()
    .required("Certificate is required")
    .test("fileFormat", "Unsupported file format. Only PDF, PNG, and JPG are allowed.", (value: File | undefined) => {
      if (value) {
        const supportedFormats = ["application/pdf", "image/png", "image/jpeg"]
        return supportedFormats.includes(value.type)
      }
      return false
    }),
})

const RestaurentSignup: React.FC = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: yupResolver(validationSchema),
  })

  const [showOtpModal, setShowOtpModal] = useState<boolean>(false)
  const dispatch = useDispatch()
  const { loading, error } = useSelector<RootState, RestaurentState>((state) => state.restaurent)
  const navigate = useNavigate()
  const [formData, setFormData] = useState<SignupFormData | null>(null)

  useEffect(() => {
    return () => {
      dispatch(setError(""))
    }
  }, [dispatch])

  const onSubmit = async (data: SignupFormData) => {
    setFormData(data)
    const result = await sendOtp(data.email, dispatch)
    if (result.success) {
      setShowOtpModal(true)
    }
  }

  const completeRegistration = async () => {
    if (!formData) return

    const formDataToSend = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "confirmPassword") {
        if (value instanceof File) {
          formDataToSend.append(key, value)
        } else {
          formDataToSend.append(key, value.toString())
        }
      }
    })

    try {
      dispatch(setLoading())
      const response = await restaurentApi.post<RestaurentResponse>("/signup", formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      // Correctly access the Restaurent object from response.data.data
      dispatch(setRestaurent(response.data.data))
      setShowOtpModal(false)
      navigate("/restaurent/login")
    } catch (err) {
      const errorMessage =
        err instanceof Error && "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
          : "Signup failed"
      dispatch(setError(errorMessage || "Signup failed"))
    }
  }

  return (
    <motion.div
      className="max-w-lg mx-auto p-8 bg-white shadow-lg rounded-xl border border-gray-200"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h2 className="text-2xl font-bold mb-6 text-center text-black">Restaurant Signup</h2>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error.split(", ").map((msg, i) => (
            <p key={i} className="text-sm">
              • {msg}
            </p>
          ))}
        </div>
      )}

      {!showOtpModal && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Restaurant Name
            </label>
            <input
              type="text"
              id="name"
              {...register("name")}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              placeholder="Enter your restaurant name"
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              {...register("email")}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              placeholder="Enter your email"
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              {...register("password")}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              placeholder="Create a strong password"
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              {...register("confirmPassword")}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="text"
              id="phone"
              {...register("phone")}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              placeholder="Enter 10-digit phone number"
            />
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="certificate" className="block text-sm font-medium text-gray-700">
              Restaurant Certificate (PDF, PNG, JPG)
            </label>
            <Controller
              name="certificate"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <input
                    type="file"
                    id="certificate"
                    onChange={(e) => field.onChange(e.target.files?.[0])}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                    accept=".pdf,.png,.jpg,.jpeg"
                  />
                  <p className="mt-1 text-xs text-gray-500">Upload your restaurant's certification document</p>
                </div>
              )}
            />
            {errors.certificate && <p className="text-red-500 text-sm">{errors.certificate.message}</p>}
          </div>

          <motion.button
            type="submit"
            className={`w-full py-3 px-4 rounded-lg text-white font-medium shadow-md ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
            }`}
            disabled={loading}
            whileHover={!loading ? { scale: 1.02 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                Processing...
              </div>
            ) : (
              "Create Account"
            )}
          </motion.button>
        </form>
      )}

      {showOtpModal && formData && (
        <OtpModal
          email={formData.email}
          show={showOtpModal}
          onClose={() => setShowOtpModal(false)}
          onSuccess={completeRegistration}
        />
      )}
    </motion.div>
  )
}

export default RestaurentSignup
