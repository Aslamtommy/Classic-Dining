"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import restaurentApi from "../../Axios/restaurentInstance"
import { motion } from "framer-motion"
import { ArrowLeft, MapPin, Mail, Phone, Calendar, Tag, Edit, Trash2 } from "lucide-react"
import toast from "react-hot-toast"

interface Branch {
  _id: string
  name: string
  email: string
  phone: string
  address: string
  location: {
    coordinates: [number, number]
  }
  mainImage: string
  interiorImages: string[]
  createdAt: string
  updatedAt: string
}

const BranchDetails = () => {
  const { branchId } = useParams<{ branchId: string }>()
  const navigate = useNavigate()
  const [branch, setBranch] = useState<Branch | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeImage, setActiveImage] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  useEffect(() => {
    const fetchBranchDetails = async () => {
      try {
        setLoading(true)
        const response: any = await restaurentApi.get(`/branches/${branchId}`)
        setBranch(response.data.data)
        setActiveImage(response.data.data.mainImage)
      } catch (error: any) {
        setError(error.response?.data?.message || "Failed to fetch branch details")
        toast.error("Failed to fetch branch details")
      } finally {
        setLoading(false)
      }
    }

    if (branchId) {
      fetchBranchDetails()
    }
  }, [branchId])

  const handleDeleteBranch = async () => {
    try {
      setLoading(true)
      await restaurentApi.delete(`/branches/${branchId}`)
      toast.success("Branch deleted successfully")
      navigate("/restaurent/branches")
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to delete branch")
      toast.error("Failed to delete branch")
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (error || !branch) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Branch</h3>
          <p className="text-gray-600 mb-6">{error || "Branch not found"}</p>
          <button
            onClick={() => navigate("/restaurent/branches")}
            className="px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors"
          >
            Back to Branches
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="p-8 border-b border-gray-200">
          <div className="flex items-center mb-6">
            <button
              onClick={() => navigate("/restaurent/branches")}
              className="mr-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-700" />
            </button>
            <h2 className="text-3xl font-bold text-gray-900">{branch.name}</h2>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <motion.button
              onClick={() => navigate(`/restaurent/branches/edit/${branchId}`)}
              className="flex items-center gap-2 px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Edit size={16} />
              Edit Branch
            </motion.button>

            <motion.button
              onClick={() => navigate(`/restaurent/branches/${branchId}/tables`)}
              className="flex items-center gap-2 px-4 py-2 bg-gold-600 text-white rounded-lg hover:bg-gold-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Tag size={16} />
              Manage Tables
            </motion.button>

            <motion.button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Trash2 size={16} />
              Delete Branch
            </motion.button>
          </div>
        </div>

        {/* Branch Details */}
        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Images */}
            <div>
              <div className="mb-6">
                <div className="relative w-full h-80 rounded-lg overflow-hidden">
                  <img
                    src={activeImage || branch.mainImage || "/placeholder.svg"}
                    alt={branch.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {branch.interiorImages && branch.interiorImages.length > 0 && (
                <div className="grid grid-cols-4 gap-4">
                  <div
                    className={`relative cursor-pointer rounded-lg overflow-hidden h-20 ${
                      activeImage === branch.mainImage ? "ring-2 ring-gold-500" : ""
                    }`}
                    onClick={() => setActiveImage(branch.mainImage)}
                  >
                    <img
                      src={branch.mainImage || "/placeholder.svg"}
                      alt="Main"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {branch.interiorImages.map((img, index) => (
                    <div
                      key={index}
                      className={`relative cursor-pointer rounded-lg overflow-hidden h-20 ${
                        activeImage === img ? "ring-2 ring-gold-500" : ""
                      }`}
                      onClick={() => setActiveImage(img)}
                    >
                      <img
                        src={img || "/placeholder.svg"}
                        alt={`Interior ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Branch Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Mail className="w-5 h-5 text-gold-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="text-gray-900">{branch.email}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gold-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-gray-900">{branch.phone}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gold-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="text-gray-900">{branch.address}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-gold-600 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-500">Created</p>
                        <p className="text-gray-900">{new Date(branch.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Location</h3>
                  <div className="bg-gray-100 rounded-lg p-4">
                    <p className="text-sm text-gray-700 mb-2">Coordinates:</p>
                    <div className="flex gap-4">
                      <div>
                        <p className="text-xs text-gray-500">Longitude</p>
                        <p className="text-gray-900">{branch.location.coordinates[0]}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Latitude</p>
                        <p className="text-gray-900">{branch.location.coordinates[1]}</p>
                      </div>
                    </div>
                  </div>

                  {/* Map placeholder - in a real app, you'd integrate Google Maps here */}
                  <div className="mt-4 bg-gray-200 rounded-lg h-48 flex items-center justify-center">
                    <p className="text-gray-500">Map View</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Branch</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this branch? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBranch}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default BranchDetails
