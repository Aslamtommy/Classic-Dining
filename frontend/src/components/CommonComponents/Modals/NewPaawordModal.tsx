"use client"

import type React from "react"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react"
import api from "../../../Axios/userInstance"
import restaurentApi from "../../../Axios/restaurentInstance"
import ModalWrapper from "../../User/modal-wrapper"

interface NewPasswordModalProps {
  show: boolean
  email: string
  onClose: () => void
  role: string
}

const NewPasswordModal: React.FC<NewPasswordModalProps> = ({ show, email, onClose, role }) => {
  const [newPassword, setNewPassword] = useState<string>("")
  const [confirmPassword, setConfirmPassword] = useState<string>("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const apiInstance = role === "restaurent" ? restaurentApi : api

  const handleNewPasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    // Validation for empty fields
    if (!newPassword || !confirmPassword) {
      toast.error("Both fields are required.")
      setLoading(false)
      return
    }

    // Validation for matching passwords
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.")
      setLoading(false)
      return
    }

    try {
      // API call to reset the password
      const response = await apiInstance.post<{ success: boolean; message?: string }>("/reset-password", {
        email,
        password: newPassword,
      })

      if (response.data.success) {
        toast.success("Password reset successfully! You can now log in.")
        setTimeout(() => {
          onClose() // Close the modal after a short delay
        }, 2000)
      } else {
        toast.error(response.data.message || "Failed to reset password.")
      }
    } catch (error: any) {
      // Capture custom backend errors (like same password issue)
      toast.error(error.response?.data?.message || "Invalid request.")
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <ModalWrapper show={show} onClose={onClose} title="Set New Password">
      <div className="p-2">
        <p className="text-center text-sepia-700 mb-6 font-playfair">Create a new password for your account</p>

        <form onSubmit={handleNewPasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-playfair text-sepia-700 mb-1">New Password</label>
            <div className="relative">
              <input
                id="new-password"
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-white border-2 border-sepia-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent text-sepia-900 font-medium transition-all duration-300"
                placeholder="Enter new password"
                required
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-sepia-400" />
              </div>
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowNewPassword(!showNewPassword)}
              >
                {showNewPassword ? (
                  <EyeOff className="w-5 h-5 text-sepia-400" />
                ) : (
                  <Eye className="w-5 h-5 text-sepia-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-playfair text-sepia-700 mb-1">Confirm Password</label>
            <div className="relative">
              <input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-white border-2 border-sepia-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent text-sepia-900 font-medium transition-all duration-300"
                placeholder="Confirm new password"
                required
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="w-5 h-5 text-sepia-400" />
              </div>
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-5 h-5 text-sepia-400" />
                ) : (
                  <Eye className="w-5 h-5 text-sepia-400" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-sepia-700 text-white rounded-lg font-playfair font-medium hover:bg-sepia-800 transition-colors shadow-elegant mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Resetting Password...
              </div>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      </div>
    </ModalWrapper>
  )
}

export default NewPasswordModal
