"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useFormik } from "formik"
import * as Yup from "yup"
import restaurentApi from "../../Axios/restaurentInstance"
import toast from "react-hot-toast"
import { motion } from "framer-motion"
import { ArrowLeft, Save } from "lucide-react"

const EditBranch = () => {
  const { branchId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required").min(4, "Name must be at least 4 characters"),
    email: Yup.string().email("Invalid email address").required("Email is required"),
    phone: Yup.string()
      .matches(/^\d{10}$/, "Phone number must be 10 digits")
      .required("Phone is required"),
    address: Yup.string().required("Address is required"),
    longitude: Yup.number().required("Longitude is required").min(-180).max(180),
    latitude: Yup.number().required("Latitude is required").min(-90).max(90),
    password: Yup.string().min(6, "Password must be at least 6 characters").optional(),
    image: Yup.mixed()
      .nullable()
      .test("fileSize", "File size must be less than 5MB", (value) => {
        if (value) {
          const file = value as File
          return file.size <= 5 * 1024 * 1024
        }
        return true
      }),
  })

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      longitude: "",
      latitude: "",
      password: "",
      image: null as File | null,
      currentImage: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true)
      const formDataToSend = new FormData()
      formDataToSend.append("name", values.name)
      formDataToSend.append("email", values.email)
      formDataToSend.append("phone", values.phone)
      formDataToSend.append("address", values.address)
      formDataToSend.append("longitude", values.longitude.toString())
      formDataToSend.append("latitude", values.latitude.toString())
      if (values.password) formDataToSend.append("password", values.password)
      if (values.image) formDataToSend.append("image", values.image)

      try {
        await restaurentApi.put(`/branches/${branchId}`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        toast.success("Branch updated successfully!")
        navigate("/restaurent/branches")
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Update failed")
      } finally {
        setLoading(false)
      }
    },
  })

  useEffect(() => {
    const fetchBranch = async () => {
      try {
        setInitialLoading(true)
        const response: any = await restaurentApi.get(`/branches/${branchId}`)
        const { name, email, phone, address, location, image } = response.data.data
        formik.setValues({
          name,
          email,
          phone,
          address: address || "",
          longitude: location?.coordinates[0] || "",
          latitude: location?.coordinates[1] || "",
          password: "",
          image: null,
          currentImage: image,
        })
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to fetch branch")
      } finally {
        setInitialLoading(false)
      }
    }
    fetchBranch()
  }, [branchId])

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    formik.setFieldValue("image", file)
  }

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate("/restaurent/branches")}
            className="mr-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
          <h2 className="text-3xl font-bold text-gray-900">Edit Branch</h2>
        </div>

        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {formik.values.currentImage && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Image</label>
              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <img
                  src={formik.values.currentImage || "/placeholder.svg"}
                  alt="Current Branch"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                placeholder="Enter branch name"
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all"
              />
              {formik.touched.name && formik.errors.name && (
                <div className="text-red-500 text-sm mt-1">{formik.errors.name}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                placeholder="Enter branch email"
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all"
              />
              {formik.touched.email && formik.errors.email && (
                <div className="text-red-500 text-sm mt-1">{formik.errors.email}</div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="text"
                placeholder="Enter branch phone"
                name="phone"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all"
              />
              {formik.touched.phone && formik.errors.phone && (
                <div className="text-red-500 text-sm mt-1">{formik.errors.phone}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                placeholder="Leave empty to keep current password"
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all"
              />
              {formik.touched.password && formik.errors.password && (
                <div className="text-red-500 text-sm mt-1">{formik.errors.password}</div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
            <input
              type="text"
              placeholder="Enter branch address"
              name="address"
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all"
            />
            {formik.touched.address && formik.errors.address && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.address}</div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
              <input
                type="number"
                placeholder="Enter longitude (e.g., -73.935242)"
                name="longitude"
                value={formik.values.longitude}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all"
              />
              {formik.touched.longitude && formik.errors.longitude && (
                <div className="text-red-500 text-sm mt-1">{formik.errors.longitude}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
              <input
                type="number"
                placeholder="Enter latitude (e.g., 40.730610)"
                name="latitude"
                value={formik.values.latitude}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all"
              />
              {formik.touched.latitude && formik.errors.latitude && (
                <div className="text-red-500 text-sm mt-1">{formik.errors.latitude}</div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Branch Image</label>
            <input
              type="file"
              name="image"
              onChange={handleImageChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all"
            />
            {formik.touched.image && formik.errors.image && (
              <div className="text-red-500 text-sm mt-1">{formik.errors.image}</div>
            )}
          </div>

          <div className="flex gap-4 pt-4">
            <motion.button
              type="submit"
              className="flex-1 bg-gradient-to-r from-gold-600 to-gold-700 text-white p-3 rounded-lg hover:from-gold-700 hover:to-gold-800 focus:outline-none focus:ring-2 focus:ring-gold-500 transition-all flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Updating...
                </span>
              ) : (
                <>
                  <Save size={18} />
                  Update Branch
                </>
              )}
            </motion.button>
            <motion.button
              type="button"
              onClick={() => navigate("/restaurent/branches")}
              className="flex-1 bg-gray-100 text-gray-800 p-3 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditBranch
