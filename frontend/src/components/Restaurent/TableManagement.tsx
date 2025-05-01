"use client"

import { useState, useEffect } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { useParams } from "react-router-dom"
import { tableTypeApi } from "../../Api/restaurentApi"
import { motion } from "framer-motion"
import { Plus, Minus, Trash2, Tag, Users, DollarSign, Check } from "lucide-react"
import toast from "react-hot-toast"

interface TableType {
  _id: string
  name: string
  capacity: number
  quantity: number
  price: number
  description?: string
  features: string[]
}

const TableManagement = () => {
  const { branchId } = useParams<{ branchId: string }>()
  const [tableTypes, setTableTypes] = useState<TableType[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Validation Schema
  const validationSchema = Yup.object({
    name: Yup.string().required("Table name is required"),
    capacity: Yup.number().min(1, "Capacity must be at least 1").required("Capacity is required"),
    quantity: Yup.number().min(1, "Quantity must be at least 1").required("Quantity is required"),
    price: Yup.number().min(0, "Price must be at least 0").required("Price is required"),
    description: Yup.string().optional(),
    features: Yup.array().of(Yup.string()).optional(),
  })

  // Formik Initialization
  const formik = useFormik({
    initialValues: {
      name: "",
      capacity: 2,
      quantity: 1,
      price: 0,
      description: "",
      features: [] as string[],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setLoading(true)
        const response = await tableTypeApi.createTableType(branchId!, values)
        setTableTypes([...tableTypes, response])
        toast.success("Table type created successfully!")
        formik.resetForm()
      } catch (err) {
        toast.error("Failed to create table type")
        setError("Failed to create table type")
      } finally {
        setLoading(false)
      }
    },
  })

  useEffect(() => {
    const loadTableTypes = async () => {
      try {
        setLoading(true)
        const response = await tableTypeApi.getTableTypes(branchId!)
        setTableTypes(response)
      } catch (err) {
        toast.error("Failed to fetch table types")
        setError("Failed to fetch table types")
      } finally {
        setLoading(false)
      }
    }
    if (branchId) {
      loadTableTypes()
    }
  }, [branchId])

  const handleUpdateQuantity = async (tableTypeId: string, quantity: number) => {
    try {
      setLoading(true)
      const updatedTable = await tableTypeApi.updateTableTypeQuantity(tableTypeId, quantity)
      setTableTypes((prev) =>
        prev.map((table) => (table._id === tableTypeId ? { ...table, quantity: updatedTable.quantity } : table)),
      )
      toast.success("Table quantity updated")
    } catch (err) {
      toast.error("Failed to update table quantity")
      setError("Failed to update table quantity")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTable = async (tableTypeId: string) => {
    try {
      setLoading(true)
      await tableTypeApi.deleteTableType(tableTypeId)
      setTableTypes((prev) => prev.filter((table) => table._id !== tableTypeId))
      toast.success("Table type deleted")
    } catch (err) {
      toast.error("Failed to delete table type")
      setError("Failed to delete table type")
    } finally {
      setLoading(false)
    }
  }

  // Predefined feature options
  const featureOptions = [
    { value: "windowView", label: "Window View" },
    { value: "outdoor", label: "Outdoor" },
    { value: "accessible", label: "Accessible" },
    { value: "quiet", label: "Quiet Area" },
    { value: "booth", label: "Booth" },
    { value: "private", label: "Private" },
  ]

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-black mb-8">Table Management</h2>

        {/* Error Message */}
        {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg">{error}</div>}

        {/* Add New Table Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 p-6 bg-white rounded-xl shadow-md border border-gray-200"
        >
          <h3 className="text-xl font-bold text-black mb-6">Add New Table Type</h3>
          <form onSubmit={formik.handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Table Name */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Table Name</label>
                <input
                  type="text"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  placeholder="e.g., VIP Table, Window Seat"
                />
                {formik.touched.name && formik.errors.name ? (
                  <div className="text-red-500 text-sm">{formik.errors.name}</div>
                ) : null}
              </div>

              {/* Capacity */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  min="1"
                  value={formik.values.capacity}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
                {formik.touched.capacity && formik.errors.capacity ? (
                  <div className="text-red-500 text-sm">{formik.errors.capacity}</div>
                ) : null}
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  min="1"
                  value={formik.values.quantity}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
                {formik.touched.quantity && formik.errors.quantity ? (
                  <div className="text-red-500 text-sm">{formik.errors.quantity}</div>
                ) : null}
              </div>

              {/* Price */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Price</label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  value={formik.values.price}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                />
                {formik.touched.price && formik.errors.price ? (
                  <div className="text-red-500 text-sm">{formik.errors.price}</div>
                ) : null}
              </div>

              {/* Features */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Features</label>
                <select
                  multiple
                  name="features"
                  value={formik.values.features}
                  onChange={(e) => {
                    const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value)
                    formik.setFieldValue("features", selectedOptions)
                  }}
                  onBlur={formik.handleBlur}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                >
                  {featureOptions.map((feature) => (
                    <option key={feature.value} value={feature.value}>
                      {feature.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500">Hold Ctrl (or Cmd) to select multiple features</p>
                {formik.touched.features && formik.errors.features ? (
                  <div className="text-red-500 text-sm">{formik.errors.features}</div>
                ) : null}
              </div>
            </div>

            {/* Description */}
            <div className="mt-6 space-y-2">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                rows={3}
                placeholder="Optional description of the table type"
              />
            </div>

            {/* Submit Button */}
            <div className="mt-6">
              <motion.button
                type="submit"
                disabled={loading || !formik.isValid}
                className={`w-full bg-gradient-to-r from-amber-600 to-amber-700 text-white p-3 rounded-lg hover:from-amber-700 hover:to-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all flex items-center justify-center gap-2 ${
                  loading || !formik.isValid ? "opacity-50 cursor-not-allowed" : ""
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
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
                    Adding...
                  </span>
                ) : (
                  <>
                    <Plus size={18} />
                    Add Table Type
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Table List */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-black mb-6">Existing Table Types</h3>
          {loading && tableTypes.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading table types...</p>
            </div>
          ) : tableTypes.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
              <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No table types found.</p>
              <p className="text-sm text-gray-500">Add your first table type using the form above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tableTypes.map((table) => (
                <motion.div
                  key={table._id}
                  className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow border border-gray-200"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="text-lg font-bold text-black">{table.name}</h4>
                      <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                        ${table.price}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">Capacity: {table.capacity}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">Quantity: {table.quantity}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-700">Price: ${table.price}</span>
                      </div>
                    </div>

                    {table.features.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {table.features.map((feature) => (
                          <span
                            key={feature}
                            className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            {feature.charAt(0).toUpperCase() + feature.slice(1).replace(/([A-Z])/g, " $1")}
                          </span>
                        ))}
                      </div>
                    )}

                    {table.description && <p className="text-gray-600 text-sm mt-2">{table.description}</p>}

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handleUpdateQuantity(table._id, table.quantity + 1)}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <Plus size={16} />
                        Add
                      </button>
                      <button
                        onClick={() => handleUpdateQuantity(table._id, Math.max(0, table.quantity - 1))}
                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                        disabled={table.quantity <= 0}
                      >
                        <Minus size={16} />
                        Remove
                      </button>
                      <button
                        onClick={() => handleDeleteTable(table._id)}
                        className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TableManagement
