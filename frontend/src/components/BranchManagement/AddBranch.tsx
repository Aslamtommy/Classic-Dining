"use client"

import type React from "react"
import { useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import restaurentApi from "../../Axios/restaurentInstance"
import { useSelector } from "react-redux"
import type { RootState } from "../../redux/store"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import axios from "axios"
import { motion } from "framer-motion"
import { MapPin, Mail, Phone, Lock, Store, ImageIcon, Upload } from "lucide-react"

const GOOGLE_MAPS_API_KEY = "AIzaSyCmtwdLj4ezHr_PmZunPte9-bb14e4OUNU"

const AddBranch = () => {
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null)
  const [interiorImagesPreview, setInteriorImagesPreview] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const { restaurent } = useSelector((state: RootState) => state.restaurent)
  const navigate = useNavigate()

  const validationSchema = Yup.object({
    name: Yup.string().required("Name is required").min(4, "Name must be at least 4 characters"),
    email: Yup.string().email("Invalid email address").required("Email is required"),
    phone: Yup.string()
      .matches(/^\d{10}$/, "Phone number must be 10 digits")
      .required("Phone is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
    address: Yup.string().required("Address is required"),
    longitude: Yup.number().required("Longitude is required").min(-180).max(180),
    latitude: Yup.number().required("Latitude is required").min(-90).max(90),
    mainImage: Yup.mixed()
      .required("Main image is required")
      .test("fileSize", "File size must be less than 5MB", (value) => {
        if (value) {
          const file = value as File
          return file.size <= 5 * 1024 * 1024
        }
        return false
      }),
    interiorImages: Yup.array()
      .of(
        Yup.mixed().test("fileSize", "Each file must be less than 5MB", (value) => {
          if (value) {
            const file = value as File
            return file.size <= 5 * 1024 * 1024
          }
          return true
        }),
      )
      .max(3, "You can upload up to 3 interior images"),
  })

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      address: "",
      longitude: "",
      latitude: "",
      mainImage: null as File | null,
      interiorImages: [] as File[],
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true)
      const formData = new FormData()
      formData.append("name", values.name)
      formData.append("email", values.email)
      formData.append("phone", values.phone)
      formData.append("password", values.password)
      formData.append("address", values.address)
      formData.append("longitude", values.longitude.toString())
      formData.append("latitude", values.latitude.toString())
      formData.append("parentRestaurant", restaurent?._id || "")
      if (values.mainImage) {
        formData.append("mainImage", values.mainImage)
      }
      values.interiorImages.forEach((image) => {
        formData.append("interiorImages", image)
      })

      try {
        const response = await restaurentApi.post("/branches", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        toast.success("Branch successfully added!")
        setLoading(false)
        navigate("/restaurent/branches")
      } catch (error: any) {
        setLoading(false)
        toast.error(error.response?.data?.message || "Failed to create branch")
      }
    },
  })

  const handleMainImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    if (file) {
      setMainImagePreview(URL.createObjectURL(file))
      formik.setFieldValue("mainImage", file)
    }
  }

  const handleInteriorImagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length + formik.values.interiorImages.length > 3) {
      toast.error("You can upload up to 3 interior images.")
      return
    }
    const newPreviews = files.map((file) => URL.createObjectURL(file))
    setInteriorImagesPreview((prev) => [...prev, ...newPreviews])
    formik.setFieldValue("interiorImages", [...formik.values.interiorImages, ...files])
  }

  const removeInteriorImage = (index: number) => {
    const updatedImages = formik.values.interiorImages.filter((_, i) => i !== index)
    const updatedPreviews = interiorImagesPreview.filter((_, i) => i !== index)
    setInteriorImagesPreview(updatedPreviews)
    formik.setFieldValue("interiorImages", updatedImages)
  }

  const handleAddressBlur = async () => {
    const address = formik.values.address.trim()
    if (!address) return

    try {
      const response: any = await axios.get(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`,
      )
      const results = response.data.results
      if (results.length > 0) {
        const { lat, lng } = results[0].geometry.location
        formik.setFieldValue("latitude", lat)
        formik.setFieldValue("longitude", lng)
      } else {
        toast.error("Could not find coordinates for this address.")
      }
    } catch (error) {
      toast.error("Failed to geocode address.")
      console.error(error)
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className="text-3xl font-bold text-black mb-8">Add New Branch</h2>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Store className="w-4 h-4 mr-2 text-amber-600" />
              Branch Name
            </label>
            <input
              type="text"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter branch name"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-black transition-all"
              disabled={loading}
            />
            {formik.touched.name && formik.errors.name && (
              <div className="text-red-600 text-sm mt-1">{formik.errors.name}</div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4 mr-2 text-amber-600" />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter branch email"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-black transition-all"
              disabled={loading}
            />
            {formik.touched.email && formik.errors.email && (
              <div className="text-red-600 text-sm mt-1">{formik.errors.email}</div>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4 mr-2 text-amber-600" />
              Phone
            </label>
            <input
              type="text"
              name="phone"
              value={formik.values.phone}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter 10-digit phone number"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-black transition-all"
              disabled={loading}
            />
            {formik.touched.phone && formik.errors.phone && (
              <div className="text-red-600 text-sm mt-1">{formik.errors.phone}</div>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Lock className="w-4 h-4 mr-2 text-amber-600" />
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter branch password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-black transition-all"
              disabled={loading}
            />
            {formik.touched.password && formik.errors.password && (
              <div className="text-red-600 text-sm mt-1">{formik.errors.password}</div>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 mr-2 text-amber-600" />
              Address
            </label>
            <input
              type="text"
              name="address"
              value={formik.values.address}
              onChange={formik.handleChange}
              onBlur={(e) => {
                formik.handleBlur(e)
                handleAddressBlur()
              }}
              placeholder="Enter branch address"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white text-black transition-all"
              disabled={loading}
            />
            {formik.touched.address && formik.errors.address && (
              <div className="text-red-600 text-sm mt-1">{formik.errors.address}</div>
            )}
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
              <input
                type="number"
                name="longitude"
                value={formik.values.longitude}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Auto-filled from address"
                readOnly
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
              />
              {formik.touched.longitude && formik.errors.longitude && (
                <div className="text-red-600 text-sm mt-1">{formik.errors.longitude}</div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
              <input
                type="number"
                name="latitude"
                value={formik.values.latitude}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                placeholder="Auto-filled from address"
                readOnly
                className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
              />
              {formik.touched.latitude && formik.errors.latitude && (
                <div className="text-red-600 text-sm mt-1">{formik.errors.latitude}</div>
              )}
            </div>
          </div>

          {/* Main Image */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <ImageIcon className="w-4 h-4 mr-2 text-amber-600" />
              Main Image
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-amber-500 transition-all bg-white">
                {mainImagePreview ? (
                  <img
                    src={mainImagePreview || "/placeholder.svg"}
                    alt="Main Preview"
                    className="h-full w-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="w-8 h-8 text-gray-500 mb-2" />
                    <span className="text-sm text-gray-500">Upload main image</span>
                  </div>
                )}
                <input
                  type="file"
                  name="mainImage"
                  onChange={handleMainImageChange}
                  className="hidden"
                  accept="image/*"
                  disabled={loading}
                />
              </label>
            </div>
            {formik.touched.mainImage && formik.errors.mainImage && (
              <div className="text-red-600 text-sm mt-1">{formik.errors.mainImage}</div>
            )}
          </div>

          {/* Interior Images */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <ImageIcon className="w-4 h-4 mr-2 text-amber-600" />
              Interior Images (up to 3)
            </label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-amber-500 transition-all bg-white">
                <div className="flex flex-col items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-500 mb-2" />
                  <span className="text-sm text-gray-500">Upload interior images</span>
                </div>
                <input
                  type="file"
                  multiple
                  name="interiorImages"
                  onChange={handleInteriorImagesChange}
                  className="hidden"
                  accept="image/*"
                  disabled={loading}
                />
              </label>
            </div>
            {interiorImagesPreview.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {interiorImagesPreview.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview || "/placeholder.svg"}
                      alt={`Interior ${index + 1}`}
                      className="h-24 w-full object-cover rounded-lg shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeInteriorImage(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-700 transition-all"
                      disabled={loading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
            {formik.touched.interiorImages && formik.errors.interiorImages && (
              <div className="text-red-600 text-sm mt-1">
                {Array.isArray(formik.errors.interiorImages)
                  ? formik.errors.interiorImages.filter(Boolean).join(", ")
                  : formik.errors.interiorImages}
              </div>
            )}
          </div>

          {/* Submit Button with Loading State */}
          <div>
            <motion.button
              type="submit"
              disabled={loading}
              className={`w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-md ${
                loading ? "opacity-50 cursor-not-allowed" : "hover:from-amber-700 hover:to-amber-800"
              }`}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
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
                  Adding Branch...
                </span>
              ) : (
                "Add Branch"
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default AddBranch
