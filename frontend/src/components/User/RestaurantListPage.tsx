"use client"

import type React from "react"
import { useState, useEffect, type ChangeEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { fetchBranches } from "../../Api/userApi"
import type { Branch } from "../../types/branch"
import ChatWidget from "../CommonComponents/ChatWidget"
import type { RootState } from "../../redux/store"
import {
  Search,
  MapPin,
  Star,
  DollarSign,
  SlidersHorizontal,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowDownUp,
} from "lucide-react"

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

const RestaurantListPage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([])
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [locationFilter, setLocationFilter] = useState<string>("")
  const [priceFilter, setPriceFilter] = useState<string>("any")
  const [ratingFilter, setRatingFilter] = useState<string>("any")
  const [sortBy, setSortBy] = useState<string>("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [loading, setLoading] = useState<boolean>(false)
  const [page, setPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null)
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(false)

  const limit = 6
  const navigate = useNavigate()
  const userId = useSelector((state: RootState) => state.user.user?.id)
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  const loadBranches = async (
    search: string,
    pageNum: number,
    minPrice?: number,
    maxPrice?: number,
    minRating?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
  ) => {
    try {
      setLoading(true)
      const response = await fetchBranches(search, pageNum, limit, minPrice, maxPrice, minRating, sortBy, sortOrder)
      let filteredBranches = [...response.branches]

      if (locationFilter) {
        filteredBranches = filteredBranches.filter((branch) => {
          const addressMatch = branch.address?.toLowerCase().includes(locationFilter.toLowerCase())
          const locationMatch = branch.location
            ? `${branch.location.coordinates[1]}, ${branch.location.coordinates[0]}`
                .toLowerCase()
                .includes(locationFilter.toLowerCase())
            : false
          return addressMatch || locationMatch
        })
      }

      setBranches(filteredBranches)
      setTotalPages(response.pages)
    } catch (error) {
      console.error("Error loading branches:", error)
      setBranches([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setPage(1)
  }

  const handleLocationFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocationFilter(e.target.value)
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handleChatClick = (branchId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedBranchId(branchId)
  }

  const handleCloseChat = () => {
    setSelectedBranchId(null)
  }

  const toggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen)
  }

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc")
  }

  useEffect(() => {
    let minPrice: number | undefined, maxPrice: number | undefined
    switch (priceFilter) {
      case "under500":
        minPrice = 0
        maxPrice = 500
        break
      case "500to1000":
        minPrice = 500
        maxPrice = 1000
        break
      case "1000to2000":
        minPrice = 1000
        maxPrice = 2000
        break
      case "over2000":
        minPrice = 2000
        maxPrice = undefined
        break
      default:
        minPrice = undefined
        maxPrice = undefined
    }

    let minRating: number | undefined
    switch (ratingFilter) {
      case "3":
        minRating = 3
        break
      case "4":
        minRating = 4
        break
      case "5":
        minRating = 5
        break
      default:
        minRating = undefined
    }

    loadBranches(debouncedSearchTerm.trim(), page, minPrice, maxPrice, minRating, sortBy, sortOrder)
  }, [debouncedSearchTerm, page, locationFilter, priceFilter, ratingFilter, sortBy, sortOrder])

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

  const filterVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: {
      height: "auto",
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-sepia-50 to-white pt-8 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="font-playfair text-4xl md:text-5xl text-sepia-900 font-bold mb-4">Our Restaurants</h1>
          <div className="h-1 w-24 bg-sepia-600 mx-auto"></div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          {/* Search Bar */}
          <div className="relative max-w-2xl mx-auto mb-6">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-bronze-500" />
            </div>
            <input
              type="text"
              placeholder="Search restaurants by name or email..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-4 border border-sepia-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent text-sepia-900 placeholder-bronze-400 bg-white"
            />
          </div>

          {/* Filter Toggle Button */}
          <div className="flex justify-center mb-6">
            <motion.button
              onClick={toggleFilters}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-sepia-300 rounded-lg shadow-sm hover:bg-sepia-50 transition-colors text-sepia-900"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <SlidersHorizontal className="w-5 h-5 text-sepia-700" />
              <span className="font-medium">Filters</span>
              {isFiltersOpen ? (
                <ChevronUp className="w-4 h-4 text-sepia-700" />
              ) : (
                <ChevronDown className="w-4 h-4 text-sepia-700" />
              )}
            </motion.button>
          </div>

          {/* Filters Panel */}
          <AnimatePresence>
            {isFiltersOpen && (
              <motion.div
                variants={filterVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="bg-white rounded-xl shadow-elegant border border-sepia-200 p-6 mb-8 overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Location Filter */}
                  <div>
                    <label className="block text-sm font-medium text-sepia-900 mb-2">Location</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-bronze-500" />
                      </div>
                      <input
                        type="text"
                        placeholder="Filter by location"
                        value={locationFilter}
                        onChange={handleLocationFilterChange}
                        className="w-full pl-10 pr-4 py-2.5 border border-sepia-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent text-sepia-900 placeholder-bronze-400 bg-white"
                      />
                    </div>
                  </div>

                  {/* Price Filter */}
                  <div>
                    <label className="block text-sm font-medium text-sepia-900 mb-2">Price Range</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-5 w-5 text-bronze-500" />
                      </div>
                      <select
                        value={priceFilter}
                        onChange={(e) => setPriceFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-sepia-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent text-sepia-900 bg-white appearance-none"
                      >
                        <option value="any">Any Price</option>
                        <option value="under500">Under ₹500</option>
                        <option value="500to1000">₹500 - ₹1000</option>
                        <option value="1000to2000">₹1000 - ₹2000</option>
                        <option value="over2000">Over ₹2000</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ChevronDown className="h-4 w-4 text-bronze-500" />
                      </div>
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <label className="block text-sm font-medium text-sepia-900 mb-2">Rating</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Star className="h-5 w-5 text-bronze-500" />
                      </div>
                      <select
                        value={ratingFilter}
                        onChange={(e) => setRatingFilter(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-sepia-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent text-sepia-900 bg-white appearance-none"
                      >
                        <option value="any">Any Rating</option>
                        <option value="3">3+ Stars</option>
                        <option value="4">4+ Stars</option>
                        <option value="5">5 Stars</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <ChevronDown className="h-4 w-4 text-bronze-500" />
                      </div>
                    </div>
                  </div>

                  {/* Sort Options */}
                  <div>
                    <label className="block text-sm font-medium text-sepia-900 mb-2">Sort By</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value)}
                          className="w-full px-4 py-2.5 border border-sepia-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent text-sepia-900 bg-white appearance-none"
                        >
                          <option value="name">Name</option>
                          <option value="price">Price</option>
                          <option value="rating">Rating</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <ChevronDown className="h-4 w-4 text-bronze-500" />
                        </div>
                      </div>
                      <button
                        onClick={toggleSortOrder}
                        className="px-3 py-2.5 bg-white border border-sepia-200 rounded-lg hover:bg-sepia-50 transition-colors"
                        title={sortOrder === "asc" ? "Ascending" : "Descending"}
                      >
                        {sortOrder === "asc" ? (
                          <ArrowUpDown className="h-5 w-5 text-bronze-700" />
                        ) : (
                          <ArrowDownUp className="h-5 w-5 text-bronze-700" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Branches Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="w-16 h-16 border-4 border-sepia-200 border-t-sepia-700 rounded-full"
            />
          </div>
        ) : branches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white p-8 rounded-xl shadow-elegant border border-sepia-200 text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 text-bronze-400">
              <Search className="w-full h-full" />
            </div>
            <h3 className="text-xl font-playfair text-sepia-900 mb-2">No restaurants found</h3>
            <p className="text-bronze-700 mb-6">Try adjusting your search or filters</p>
            <button
              onClick={() => {
                setSearchTerm("")
                setLocationFilter("")
                setPriceFilter("any")
                setRatingFilter("any")
                setSortBy("name")
                setSortOrder("asc")
                setPage(1)
              }}
              className="px-6 py-2 bg-gradient-to-r from-sepia-700 to-sepia-900 text-white rounded-lg hover:from-sepia-800 hover:to-sepia-950 transition-colors shadow-md"
            >
              Reset Filters
            </button>
          </motion.div>
        ) : (
          <>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {branches.map((branch) => (
                <motion.div
                  key={branch._id}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-xl shadow-elegant border border-sepia-200 overflow-hidden hover:shadow-premium transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/restaurant/${branch._id}`)}
                >
                  <div className="relative h-56">
                    <img
                      src={branch.mainImage || "/placeholder-branch.jpg"}
                      alt={branch.name}
                      className="object-cover w-full h-full transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="text-xl font-playfair font-bold mb-1 truncate">{branch.name}</h3>
                      <p className="text-sm text-white/90 truncate">{branch.address || "N/A"}</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-sepia-700 mr-1" />
                        <span className="text-sepia-900 font-medium">
                          {branch.averagePrice && branch.averagePrice > 0
                            ? `₹${branch.averagePrice.toFixed(2)}`
                            : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-amber-500 mr-1" />
                        <span className="text-sepia-900 font-medium">
                          {branch.averageRating && branch.averageRating > 0
                            ? `${branch.averageRating.toFixed(1)}`
                            : "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation()
                          navigate(`/book/${branch._id}`)
                        }}
                        className="flex-1 py-2.5 bg-gradient-to-r from-sepia-700 to-sepia-900 text-white rounded-lg hover:from-sepia-800 hover:to-sepia-950 transition-colors shadow-md text-sm font-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Book Now
                      </motion.button>
                      <motion.button
                        onClick={(e) => handleChatClick(branch._id, e)}
                        className="px-3 py-2.5 bg-white border border-sepia-300 text-sepia-900 rounded-lg hover:bg-sepia-50 transition-colors shadow-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <MessageCircle className="w-5 h-5 text-sepia-700" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Pagination */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex justify-center items-center mt-12"
            >
              <div className="flex items-center gap-2">
                <motion.button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    page === 1
                      ? "bg-sepia-100 text-sepia-400 cursor-not-allowed"
                      : "bg-white text-sepia-900 border border-sepia-300 hover:bg-sepia-50 shadow-sm"
                  }`}
                  whileHover={page !== 1 ? { scale: 1.05 } : {}}
                  whileTap={page !== 1 ? { scale: 0.95 } : {}}
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Previous
                </motion.button>

                <span className="px-4 py-2 bg-white rounded-lg border border-sepia-200 text-sepia-900 font-medium shadow-sm">
                  Page {page} of {totalPages}
                </span>

                <motion.button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                    page === totalPages
                      ? "bg-sepia-100 text-sepia-400 cursor-not-allowed"
                      : "bg-white text-sepia-900 border border-sepia-300 hover:bg-sepia-50 shadow-sm"
                  }`}
                  whileHover={page !== totalPages ? { scale: 1.05 } : {}}
                  whileTap={page !== totalPages ? { scale: 0.95 } : {}}
                >
                  Next
                  <ChevronRight className="w-5 h-5 ml-1" />
                </motion.button>
              </div>
            </motion.div>
          </>
        )}

        {/* Chat Widget */}
        {selectedBranchId && userId && (
          <ChatWidget userId={userId} branchId={selectedBranchId} onClose={handleCloseChat} />
        )}
      </div>
    </section>
  )
}

export default RestaurantListPage
