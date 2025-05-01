"use client"

import type React from "react"
import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"
import restaurentApi from "../../Axios/restaurentInstance"
import type { RootState } from "../../redux/store"
import { setProfile, setError, setLoading } from "../../redux/restaurentSlice"
import type { RestaurentResponse } from "../../types/restaurent"
import { User, Mail, Phone, FileText, MapPin, Calendar } from "lucide-react"

const RestaurentProfile: React.FC = () => {
  const dispatch = useDispatch()
  const { restaurent, profile, loading, error } = useSelector((state: RootState) => state.restaurent)

  useEffect(() => {
    if (!restaurent) {
      dispatch(setError("Restaurant not logged in."))
      return
    }

    const fetchProfile = async () => {
      try {
        dispatch(setLoading())
        const response = await restaurentApi.get<RestaurentResponse>(`/profile/${restaurent._id}`)
        dispatch(setProfile(response.data.data))
      } catch (err) {
        dispatch(setError("Failed to fetch profile."))
      }
    }

    fetchProfile()
  }, [dispatch, restaurent])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <p className="text-red-600 font-medium text-lg">Error: {error}</p>
      </div>
    )
  }

  return (
    <motion.div
      className="py-8 px-4 md:px-6 max-w-4xl mx-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Restaurant Profile</h1>
        <p className="text-gray-600">View and manage your restaurant information</p>
      </div>

      {profile ? (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header with background image */}
          <div className="relative h-48 bg-gradient-to-r from-amber-600 to-amber-800">
            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/60 to-transparent">
              <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
            </div>
          </div>

          {/* Profile content */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center p-4 bg-amber-50 rounded-lg">
                  <Mail className="text-amber-700 w-5 h-5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Email Address</p>
                    <p className="text-black font-medium">{profile.email}</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-amber-50 rounded-lg">
                  <Phone className="text-amber-700 w-5 h-5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Phone Number</p>
                    <p className="text-black font-medium">{profile.phone}</p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-amber-50 rounded-lg">
                  <MapPin className="text-amber-700 w-5 h-5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Location</p>
                    <p className="text-black font-medium">{profile.address || "Not specified"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center p-4 bg-amber-50 rounded-lg">
                  <Calendar className="text-amber-700 w-5 h-5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Joined On</p>
                    <p className="text-black font-medium">
                      {profile.createdAt
                        ? new Date(profile.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Not available"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center p-4 bg-amber-50 rounded-lg">
                  <FileText className="text-amber-700 w-5 h-5 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Certificate</p>
                    <motion.a
                      href={profile.certificate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-2 px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors duration-300 font-medium text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View Certificate
                    </motion.a>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-bold text-black mb-4">Restaurant Details</h3>
              <p className="text-gray-700">
                {profile.description ||
                  "Welcome to Classic Dining! We're dedicated to providing exceptional dining experiences for our customers. Manage your restaurant details, branches, and reservations all in one place."}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <User className="w-16 h-16 text-amber-300 mx-auto mb-4" />
          <p className="text-gray-700 font-medium">No profile data available.</p>
        </div>
      )}
    </motion.div>
  )
}

export default RestaurentProfile
