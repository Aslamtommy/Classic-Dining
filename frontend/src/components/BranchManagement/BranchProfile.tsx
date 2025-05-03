"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import { toast, Toaster } from "react-hot-toast"
import restaurentApi from "../../Axios/restaurentInstance"
import { MapPin, Mail, Phone, Calendar, ArrowLeft } from 'lucide-react'

interface Branch {
  _id: string
  name: string
  email: string
  phone: string
  address: string
  mainImage?: string
  interiorImages?: string[]
  location: {
    type: string
    coordinates: [number, number]
  }
  parentRestaurant: string
  createdAt: string
  updatedAt: string
}

const BranchProfile: React.FC = () => {
  const [branch, setBranch] = useState<Branch | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchBranchProfile = async () => {
      try {
        const response: any = await restaurentApi.get("/branch/profile")
        setBranch(response.data.data)
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || "Failed to load profile")
        toast.error(err.response?.data?.message || "Failed to load profile", {
          duration: 4000,
          position: "top-center",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchBranchProfile()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-amber-800 text-2xl font-serif"
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            Loading Your Profile...
          </div>
        </motion.div>
      </div>
    )
  }

  if (error || !branch) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-red-600 text-xl font-sans max-w-md text-center p-8 bg-red-50 rounded-lg shadow-md">
          {error || "Profile not found"}
          <button
            onClick={() => navigate("/branch/dashboard")}
            className="mt-4 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pt-8 pb-12">
      <Toaster />
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate("/branch/dashboard")}
              className="mr-4 p-2 rounded-full bg-amber-100 hover:bg-amber-200 transition-colors"
            >
              <ArrowLeft size={20} className="text-amber-700" />
            </button>
            <h1 className="text-4xl md:text-5xl font-playfair text-gray-900 font-bold">
              {branch.name}
            </h1>
          </div>
          <p className="text-lg text-amber-700 font-serif italic">
            A Taste of Elegance
          </p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-8 flex flex-col md:flex-row gap-8 border border-amber-100"
        >
          {/* Left: Main Image */}
          {branch.mainImage && (
            <div className="md:w-1/2">
              <img
                src={branch.mainImage || "/placeholder.svg"}
                alt={`${branch.name} Main`}
                className="w-full h-80 object-cover rounded-lg shadow-md transition-transform duration-300 hover:scale-105"
              />
            </div>
          )}

          {/* Right: Details */}
          <div className="md:w-1/2 space-y-6">
            <div className="border-b border-amber-100 pb-4">
              <h2 className="text-2xl font-serif text-gray-900 font-semibold">Branch Details</h2>
              <p className="text-amber-700 text-sm mt-2">
                Established:{" "}
                {new Date(branch.createdAt).toLocaleString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-gray-900">{branch.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="text-gray-900">{branch.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="text-gray-900">{branch.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Location</p>
                  <p className="text-gray-900">
                    Lat: {branch.location.coordinates[1]}, Lng: {branch.location.coordinates[0]}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Interior Images */}
        {branch.interiorImages && branch.interiorImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12"
          >
            <h3 className="text-2xl font-serif text-gray-900 font-semibold mb-6 text-center">
              Our Ambiance
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {branch.interiorImages.map((img, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative group"
                >
                  <img
                    src={img || "/placeholder.svg"}
                    alt={`Interior ${index + 1}`}
                    className="w-full h-56 object-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 rounded-lg" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <button
            onClick={() => navigate("/branch/dashboard")}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-800 text-white rounded-full font-sans text-lg hover:from-amber-700 hover:to-amber-900 transition-colors shadow-md"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    </div>
  )
}

export default BranchProfile
