"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import restaurentApi from "../../Axios/restaurentInstance"
import { motion } from "framer-motion"
import { Search, Plus, X, ChevronLeft, ChevronRight, Store } from "lucide-react"
import { debounce } from "../../utils/CustomDebounce"

const Branches = () => {
  const [branches, setBranches] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const limit = 6
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const getBranches = async () => {
      try {
        setLoading(true)
        const response: any = await restaurentApi.get("/allbranches")
        if (response.data.success) {
          setBranches(response.data.data)
        }
      } catch (error: any) {
        if (error.response?.status === 403) {
          toast.error(error.response.data.message)
        } else {
          toast.error(error.response?.data?.message || "Failed to fetch branches")
        }
      } finally {
        setLoading(false)
      }
    }
    getBranches()
  }, [])

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value)
      setPage(1)
    }, 500),
    [],
  )

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value)
  }

  const filteredBranches = branches.filter(
    (branch: any) =>
      branch.name.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
      branch.email.toLowerCase().includes(searchTerm.trim().toLowerCase()),
  )

  const totalPages = Math.ceil(filteredBranches.length / limit)
  const currentBranches = filteredBranches.slice((page - 1) * limit, page * limit)

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleDeleteClick = (branchId: string) => {
    setSelectedBranchId(branchId)
    setOpenDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (selectedBranchId) {
      try {
        await restaurentApi.delete(`/branches/${selectedBranchId}`)
        toast.success("Branch deleted successfully")
        setBranches((prev) => prev.filter((b: any) => b._id !== selectedBranchId))
        if (currentBranches.length === 1 && page > 1) setPage(page - 1)
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Deletion failed")
      }
    }
    setOpenDialog(false)
    setSelectedBranchId(null)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Your Branches</h2>
          <motion.button
            onClick={() => navigate("/restaurent/addbranch")}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-600 to-gold-700 text-white rounded-lg shadow-md hover:from-gold-700 hover:to-gold-800 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus size={18} />
            Add New Branch
          </motion.button>
        </div>

        <div className="mb-8">
          <div className="relative w-full max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search branches by name or email..."
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:border-gold-500 transition-all"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-gold-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : currentBranches.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Store className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No branches found</h3>
            <p className="text-gray-500 mb-6">You haven't added any branches yet or none match your search.</p>
            <button
              onClick={() => navigate("/restaurent/addbranch")}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-gold-600 to-gold-700 text-white rounded-lg shadow-md hover:from-gold-700 hover:to-gold-800 transition-all duration-300"
            >
              <Plus size={18} className="mr-2" />
              Add Your First Branch
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentBranches.map((branch: any) => (
                <motion.div
                  key={branch._id}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="relative h-48">
                    <img
                      src={branch.mainImage || "/placeholder.svg?height=400&width=600"}
                      alt={branch.name}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteClick(branch._id)
                      }}
                      className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="p-6 cursor-pointer" onClick={() => navigate(`/restaurent/branches/${branch._id}`)}>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{branch.name}</h3>
                    <div className="space-y-2 text-sm text-gray-500">
                      <p>{branch.email}</p>
                      <p>{branch.phone}</p>
                      <p className="line-clamp-2">{branch.address}</p>
                    </div>
                    <div className="mt-4 flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/restaurent/branches/${branch._id}`)
                        }}
                        className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
                      >
                        View Details
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/restaurent/branches/edit/${branch._id}`)
                        }}
                        className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/restaurent/branches/${branch._id}/tables`)
                        }}
                        className="text-sm px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md transition-colors"
                      >
                        Tables
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center items-center gap-6">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    page === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                  }`}
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>
                <span className="text-gray-700 font-medium">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    page === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                  }`}
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}

        {/* Confirmation Dialog */}
        {openDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Delete Branch</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this branch? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setOpenDialog(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Branches
