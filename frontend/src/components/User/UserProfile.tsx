"use client"

import type React from "react"
import { useEffect, useState, type ChangeEvent } from "react"
import { useDispatch, useSelector } from "react-redux"
import { updateProfilePicture, setUser, type UserState } from "../../redux/userslice"
import api from "../../Axios/userInstance"
import toast from "react-hot-toast"
import OtpModal from "../CommonComponents/Modals/OtpModal"
import sendOtp from "../../utils/sentotp"
import NewPasswordModal from "../CommonComponents/Modals/NewPaawordModal"
import { motion, AnimatePresence } from "framer-motion"
import type { ProfileResponse, UpdateProfileResponse, ProfilePictureResponse, AxiosError } from "../../types/auth"
import { User, Mail, Phone, Camera, Save, X, Lock, Edit } from "lucide-react"

const UserProfile: React.FC = () => {
  const dispatch = useDispatch()
  const profile = useSelector((state: { user: UserState }) => state.user.user)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState<boolean>(false)
  const [editedName, setEditedName] = useState<string>("")
  const [editedEmail, setEditedEmail] = useState<string>("")
  const [editedMobile, setEditedMobile] = useState<string>("")
  const [showOtpModal, setShowOtpModal] = useState<boolean>(false)
  const [tempEmail, setTempEmail] = useState<string>("")
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false)
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)

  useEffect(() => {
    fetchProfile()
  }, [dispatch])

  useEffect(() => {
    if (profile) {
      setEditedName(profile.name)
      setEditedEmail(profile.email)
      setEditedMobile(profile.mobile || "")
    }
  }, [profile])

  const fetchProfile = async () => {
    try {
      const response = await api.get<ProfileResponse>("/profile")
      dispatch(setUser(response.data.data))
    } catch (error: unknown) {
      console.error("Error fetching profile:", error)
      toast.error("Failed to load profile data")
    }
  }

  const handleSave = async () => {
    if (editedEmail !== profile?.email) {
      setTempEmail(editedEmail)
      const { success, message: otpMessage } = await sendOtp(editedEmail, dispatch)
      if (!success) {
        toast.error(otpMessage)
        return
      }
      setShowOtpModal(true)
    } else {
      saveProfile()
    }
  }

  const saveProfile = async () => {
    try {
      setIsSaving(true)
      const updatedData = {
        name: editedName,
        email: editedEmail,
        mobile: editedMobile,
      }

      const response = await api.put<UpdateProfileResponse>("/updateProfile", updatedData)
      dispatch(setUser(response.data.data))
      setIsEditing(false)
      toast.success("Profile updated successfully", {
        style: {
          background: "#faf7f2",
          color: "#2c2420",
          border: "1px solid #e8e2d9",
        },
        iconTheme: {
          primary: "#8b5d3b",
          secondary: "#fff",
        },
      })
    } catch (error: unknown) {
      const axiosError = error as AxiosError
      const errorMessage = axiosError.response?.data?.message || "Failed to update profile"
      toast.error(errorMessage)
      console.error("Update error:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleOtpSuccess = async () => {
    await saveProfile()
    setShowOtpModal(false)
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setSelectedFile(file)
    if (file) {
      const previewURL = URL.createObjectURL(file)
      setPreview(previewURL)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error("Please select a file to upload.")
      return
    }

    const formData = new FormData()
    formData.append("profilePicture", selectedFile)

    try {
      setIsUploading(true)
      const response = await api.post<ProfilePictureResponse>("/uploadProfilePicture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      const uploadedImageUrl = response.data.data.profilePicture
      toast.success("Profile picture uploaded successfully", {
        style: {
          background: "#faf7f2",
          color: "#2c2420",
          border: "1px solid #e8e2d9",
        },
        iconTheme: {
          primary: "#8b5d3b",
          secondary: "#fff",
        },
      })
      dispatch(updateProfilePicture(uploadedImageUrl))
      setSelectedFile(null)
      setPreview(null)
    } catch (error: unknown) {
      console.error("Error uploading profile picture:", error)
      toast.error("Failed to upload profile picture.")
    } finally {
      setIsUploading(false)
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
      },
    },
  }

  return (
    <div className="bg-gradient-to-b from-sepia-50 to-white min-h-screen  ">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="font-playfair text-4xl md:text-5xl text-sepia-900 font-bold mb-4">Your Profile</h1>
          <div className="flex items-center justify-center">
            <div className="h-px w-16 bg-sepia-600"></div>
            <p className="mx-4 text-lg text-sepia-700">Personal Details</p>
            <div className="h-px w-16 bg-sepia-600"></div>
          </div>
        </motion.div>

        {/* Profile Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Profile Picture Section */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-elegant p-8 border border-sepia-200">
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-sepia-300 to-sepia-600 rounded-full opacity-75 blur-sm group-hover:opacity-100 transition-opacity duration-300"></div>
                  {profile?.profilePicture || preview ? (
                    <div className="relative">
                      <img
                        src={preview || profile?.profilePicture || ""}
                        alt="Profile"
                        className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-md relative"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-full transition-colors duration-300"></div>
                    </div>
                  ) : (
                    <div className="w-48 h-48 rounded-full bg-gradient-to-r from-sepia-100 to-sepia-200 flex items-center justify-center border-4 border-white shadow-md relative">
                      <User className="w-24 h-24 text-sepia-400" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-full transition-colors duration-300"></div>
                    </div>
                  )}
                </div>

                <div className="mt-8 space-y-4 w-full">
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer bg-white text-sepia-900 border border-sepia-300 px-6 py-3 rounded-lg hover:bg-sepia-50 transition-colors text-sm uppercase tracking-wide inline-flex items-center justify-center w-full shadow-sm"
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Change Picture
                  </label>
                  <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

                  {selectedFile && (
                    <motion.button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="bg-gradient-to-r from-sepia-700 to-sepia-900 text-white px-6 py-3 rounded-lg hover:from-sepia-800 hover:to-sepia-950 transition-all duration-300 text-sm uppercase tracking-wide flex items-center justify-center w-full shadow-md disabled:opacity-70"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isUploading ? (
                        <div className="flex items-center">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                          Uploading...
                        </div>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                            />
                          </svg>
                          Upload Picture
                        </>
                      )}
                    </motion.button>
                  )}
                </div>

                <div className="mt-8 w-full pt-6 border-t border-sepia-200">
                  <div className="text-center">
                    <h3 className="font-playfair text-xl text-sepia-900 font-semibold">{profile?.name || "User"}</h3>
                    <p className="text-bronze-700 mt-1">{profile?.email || "email@example.com"}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Profile Details Section */}
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-elegant p-8 border border-sepia-200 h-full">
              <div className="flex justify-between items-center mb-8">
                <h2 className="font-playfair text-2xl text-sepia-900 font-semibold">Personal Information</h2>
                {!isEditing ? (
                  <motion.button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-4 py-2 bg-white border border-sepia-300 text-sepia-900 rounded-lg hover:bg-sepia-50 transition-colors shadow-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </motion.button>
                ) : (
                  <div className="flex space-x-2">
                    <motion.button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex items-center px-4 py-2 bg-gradient-to-r from-sepia-700 to-sepia-900 text-white rounded-lg hover:from-sepia-800 hover:to-sepia-950 transition-colors shadow-md disabled:opacity-70"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isSaving ? (
                        <div className="flex items-center">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"
                          />
                          Saving...
                        </div>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        setIsEditing(false)
                        setEditedName(profile?.name || "")
                        setEditedEmail(profile?.email || "")
                        setEditedMobile(profile?.mobile || "")
                      }}
                      className="flex items-center px-4 py-2 bg-white border border-sepia-300 text-sepia-900 rounded-lg hover:bg-sepia-50 transition-colors shadow-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </motion.button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="relative">
                  <label className="block text-bronze-700 text-sm font-medium mb-2" htmlFor="name">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="w-5 h-5 text-bronze-500" />
                    </div>
                    <input
                      className={`w-full pl-10 pr-4 py-3 border ${isEditing ? "border-sepia-300 focus:ring-2 focus:ring-sepia-500 focus:border-transparent" : "border-sepia-200 bg-sepia-50"} rounded-lg transition-colors duration-300`}
                      id="name"
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      readOnly={!isEditing}
                      placeholder="Your full name"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-bronze-700 text-sm font-medium mb-2" htmlFor="email">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="w-5 h-5 text-bronze-500" />
                    </div>
                    <input
                      className={`w-full pl-10 pr-4 py-3 border ${isEditing ? "border-sepia-300 focus:ring-2 focus:ring-gold-500 focus:border-transparent" : "border-sepia-200 bg-sepia-50"} rounded-lg transition-colors duration-300`}
                      id="email"
                      type="email"
                      value={editedEmail}
                      onChange={(e) => setEditedEmail(e.target.value)}
                      readOnly={!isEditing}
                      placeholder="Your email address"
                    />
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-bronze-700 text-sm font-medium mb-2" htmlFor="phone">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="w-5 h-5 text-bronze-500" />
                    </div>
                    <input
                      className={`w-full pl-10 pr-4 py-3 border ${isEditing ? "border-sepia-300 focus:ring-2 focus:ring-gold-500 focus:border-transparent" : "border-sepia-200 bg-sepia-50"} rounded-lg transition-colors duration-300`}
                      id="phone"
                      type="tel"
                      value={editedMobile}
                      onChange={(e) => setEditedMobile(e.target.value)}
                      readOnly={!isEditing}
                      placeholder="Your phone number"
                    />
                  </div>
                </div>

                {/* Change Password Button */}
                <div className="pt-8 mt-8 border-t border-sepia-200">
                  <motion.button
                    onClick={() => setShowPasswordModal(true)}
                    className="flex items-center justify-center w-full px-6 py-3 bg-white border border-sepia-300 text-sepia-900 rounded-lg hover:bg-sepia-50 transition-colors shadow-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Lock className="w-5 h-5 mr-2" />
                    Change Password
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* OTP Modal */}
        <AnimatePresence>
          {showOtpModal && (
            <OtpModal
              show={showOtpModal}
              email={tempEmail}
              onClose={() => setShowOtpModal(false)}
              onSuccess={handleOtpSuccess}
            />
          )}
        </AnimatePresence>

        {/* Change Password Modal */}
        <AnimatePresence>
          {showPasswordModal && (
            <NewPasswordModal
              show={showPasswordModal}
              email={profile?.email || ""}
              onClose={() => setShowPasswordModal(false)}
              role="user"
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default UserProfile
