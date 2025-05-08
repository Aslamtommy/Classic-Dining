"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import { toast } from "react-hot-toast"
import { Loader2 } from "lucide-react"
import api from "../../../Axios/userInstance"
import restaurentApi from "../../../Axios/restaurentInstance"
import { setLoading, setError, setOtpSent, setOtpVerified, setOtpExpired } from "../../../redux/otpslice"
import ModalWrapper from "../../User/modal-wrapper"

interface OtpModalProps {
  show: boolean
  email: string
  onClose: () => void
  onSuccess: (message: string) => void
  role?: string
  initialSending?: boolean
}

const OtpModal: React.FC<OtpModalProps> = ({
  email,
  show,
  onClose,
  onSuccess,
  role = "user",
  initialSending = false,
}) => {
  const dispatch = useDispatch()
  const [otp, setOtp] = useState("")
  const [message, setMessage] = useState("")
  const [countdown, setCountdown] = useState<number>(60)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""])

  const apiInstance = role === "restaurent" ? restaurentApi : api

  // Countdown timer effect
  useEffect(() => {
    if (countdown === 0) return
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => prevCountdown - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [countdown])

  // Handle OTP input change
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.charAt(0)
    }

    if (value && !/^\d+$/.test(value)) {
      return
    }

    const newOtpDigits = [...otpDigits]
    newOtpDigits[index] = value
    setOtpDigits(newOtpDigits)
    setOtp(newOtpDigits.join(""))

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`)
      if (nextInput) {
        nextInput.focus()
      }
    }
  }

  // Handle backspace key
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`)
      if (prevInput) {
        prevInput.focus()
      }
    }
  }

  // Handle paste event
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").trim()
    if (pastedData.length <= 6 && /^\d+$/.test(pastedData)) {
      const newOtpDigits = [...otpDigits]
      for (let i = 0; i < Math.min(pastedData.length, 6); i++) {
        newOtpDigits[i] = pastedData[i]
      }
      setOtpDigits(newOtpDigits)
      setOtp(newOtpDigits.join(""))
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP")
      return
    }

    setIsVerifying(true)
    dispatch(setLoading())

    try {
      await apiInstance.post("/otp/verify", { email, otp })
      dispatch(setOtpVerified())
      toast.success("OTP verified successfully!")
      onSuccess("OTP verified successfully!")
      onClose()
    } catch (error: any) {
      console.error(error)
      if (error.response?.data?.message === "OTP expired") {
        dispatch(setOtpExpired())
        setMessage("Your OTP has expired. Please resend the OTP.")
        toast.error("Your OTP has expired. Please resend the OTP.")
      } else {
        dispatch(setError("Error verifying OTP."))
        setMessage("Error verifying OTP. Please try again.")
        toast.error("Error verifying OTP. Please try again.")
      }
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResendOtp = async () => {
    setMessage("")
    setIsResending(true)
    dispatch(setLoading())
    setCountdown(60)

    try {
      await apiInstance.post("/otp/send", { email })
      dispatch(setOtpSent(email))
      setMessage("A new OTP has been sent to your email.")
      toast.success("A new OTP has been sent to your email.")
    } catch (error: any) {
      console.error(error)
      dispatch(setError("Error resending OTP."))
      setMessage("Error resending OTP. Please try again.")
      toast.error("Error resending OTP. Please try again.")
    } finally {
      setIsResending(false)
    }
  }

  // If the modal should not be shown, return null
  if (!show) return null

  return (
    <ModalWrapper show={show} onClose={onClose} title="Verify OTP">
      {initialSending ? (
        <div className="p-8 flex flex-col items-center justify-center">
          <Loader2 className="w-12 h-12 text-sepia-600 animate-spin mb-4" />
          <p className="text-center text-sepia-700 font-playfair">Sending OTP to your email...</p>
        </div>
      ) : (
        <div className="p-2">
          <p className="text-center text-sepia-700 mb-6 font-playfair">
            We've sent a verification code to <span className="font-semibold">{email}</span>
          </p>

          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div className="flex justify-center space-x-2 sm:space-x-4">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-10 h-14 sm:w-12 sm:h-16 text-center text-xl font-bold text-sepia-900 border-2 border-sepia-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent bg-white transition-all duration-300"
                  maxLength={1}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={isVerifying || otp.length !== 6}
              className="w-full py-3 px-4 bg-sepia-700 text-white rounded-lg font-playfair font-medium hover:bg-sepia-800 transition-colors shadow-elegant disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Verifying...
                </div>
              ) : (
                "Verify OTP"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm font-medium text-sepia-700 mb-2">
              OTP will expire in <span className="font-bold">{countdown}</span> seconds
            </p>

            {countdown === 0 && (
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResending}
                className="mt-2 py-2 px-4 bg-white border-2 border-gold-500 text-gold-700 font-playfair font-medium rounded-lg hover:bg-gold-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gold-400 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </div>
                ) : (
                  "Resend OTP"
                )}
              </button>
            )}
          </div>

          {message && <p className="mt-4 text-center text-sm font-medium text-sepia-700">{message}</p>}
        </div>
      )}
    </ModalWrapper>
  )
}

export default OtpModal
