"use client"

import type React from "react"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { Mail, Loader2 } from "lucide-react"
import api from "../../../Axios/userInstance"
import restaurentApi from "../../../Axios/restaurentInstance"
import OtpModal from "./OtpModal"
import NewPasswordModal from "./NewPaawordModal"
import ModalWrapper from "../../User/modal-wrapper"

interface ForgotPasswordProps {
  show: boolean
  onClose: () => void
  role: string
}

interface ForgotPasswordResponse {
  success: boolean
  message?: string
}

const ForgotPasswordModal: React.FC<ForgotPasswordProps> = ({ show, onClose, role }) => {
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotMessage, setForgotMessage] = useState("")
  const [showOtpModal, setShowOtpModal] = useState(false)
  const [showNewPasswordModal, setShowNewPasswordModal] = useState(false)
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const apiInstance = role === "restaurent" ? restaurentApi : api

  // Handle forgot password submission
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setForgotMessage("")
    setLoading(true)

    if (!forgotEmail) {
      setForgotMessage("Email is required.")
      toast.error("Email is required.")
      setLoading(false)
      return
    }

    try {
      const response = await apiInstance.post<ForgotPasswordResponse>("/forgot-password", { email: forgotEmail })

      if (response.data.success) {
        setForgotMessage("OTP sent successfully to your email.")
        toast.success("OTP sent successfully to your email.")
        setEmail(forgotEmail) // Store the email for future use
        setShowOtpModal(true) // Show the OTP Modal for verification
      } else {
        setForgotMessage(response.data.message || "Failed to send OTP.")
        toast.error(response.data.message || "Failed to send OTP.")
      }
    } catch (error: any) {
      setForgotMessage("An error occurred. Please try again.")
      toast.error("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleOtpVerificationSuccess = () => {
    setShowOtpModal(false) // Close OTP modal
    setShowNewPasswordModal(true) // Open New Password Modal after OTP verification
  }

  if (!show) return null

  return (
    <ModalWrapper show={show} onClose={onClose} title="Forgot Password">
      <div className="p-2">
        <p className="text-center text-sepia-700 mb-6 font-playfair">
          Enter your email address and we'll send you an OTP to reset your password
        </p>

        <form onSubmit={handleForgotPassword} className="space-y-4">
          <div className="relative">
            <label className="block text-sm font-playfair text-sepia-700 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border-2 border-sepia-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent text-sepia-900 font-medium transition-all duration-300"
                placeholder="Enter your email"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="w-5 h-5 text-sepia-400" />
              </div>
            </div>
          </div>

          {forgotMessage && (
            <p className={`text-sm ${forgotMessage.includes("success") ? "text-green-600" : "text-red-600"}`}>
              {forgotMessage}
            </p>
          )}

          <div className="flex justify-between gap-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 bg-white border-2 border-sepia-300 text-sepia-700 rounded-lg font-playfair font-medium hover:bg-sepia-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-sepia-700 text-white rounded-lg font-playfair font-medium hover:bg-sepia-800 transition-colors shadow-elegant disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Sending...
                </div>
              ) : (
                "Send OTP"
              )}
            </button>
          </div>
        </form>
      </div>

      {showOtpModal && (
        <OtpModal
          show={showOtpModal}
          onClose={() => setShowOtpModal(false)}
          onSuccess={handleOtpVerificationSuccess}
          email={email}
          role={role}
        />
      )}

      {showNewPasswordModal && (
        <NewPasswordModal
          show={showNewPasswordModal}
          onClose={() => {
            setShowNewPasswordModal(false)
            onClose()
          }}
          email={email}
          role={role}
        />
      )}
    </ModalWrapper>
  )
}

export default ForgotPasswordModal
