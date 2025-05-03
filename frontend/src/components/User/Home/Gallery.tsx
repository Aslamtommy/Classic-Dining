"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { fetchBranches } from "../../../Api/userApi"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "../../../redux/store"
import toast from "react-hot-toast"

export const Gallery: React.FC = () => {
  const [branches, setBranches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.user.user)

  useEffect(() => {
    const loadBranches = async () => {
      try {
        setLoading(true)
        const response: any = await fetchBranches()
        setBranches(response.branches)
      } catch (error: any) {
        console.error("Error loading branches:", error)
        setError("Failed to load restaurants. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    loadBranches()
  }, [])

  const handleCardClick = (branchId: string) => {
    if (!user) {
      toast.error("Please log in to book a restaurant.")
      return
    }
    navigate(`/book/${branchId}`)
  }

  const handleNameClick = (branchId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) {
      toast.error("Please log in to view restaurant details.")
      return
    }
    navigate(`/restaurant/${branchId}`)
  }

  // Container animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  // Item animation variants
  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
      },
    },
    hover: {
      y: -10,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
      },
    },
  }

  return (
    <section className="px-6 py-24 bg-gradient-to-b from-sepia-50 to-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-20"
        >
          <h2 className="font-playfair text-5xl md:text-6xl text-black font-bold mb-4 relative inline-block">
            Discover Our Restaurants
            <motion.div
              className="absolute -bottom-3 left-1/2 h-1 bg-gold-600"
              initial={{ width: 0, x: "-50%" }}
              animate={{ width: "80%", x: "-50%" }}
              transition={{ delay: 0.5, duration: 0.8 }}
            />
          </h2>
          <p className="text-black text-lg max-w-2xl mx-auto mt-6">
            Experience the finest dining atmospheres with our carefully curated selection of premium restaurants.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="w-16 h-16 border-4 border-sepia-200 border-t-sepia-700 rounded-full"
            />
          </div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-md"
          >
            <p className="text-center text-red-700 font-medium">{error}</p>
          </motion.div>
        ) : branches.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-sepia-50 border border-sepia-200 p-6 rounded-lg shadow-md"
          >
            <p className="text-center text-black font-medium">No restaurants available at the moment.</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12"
          >
            {branches.map((branch: any) => (
              <motion.div
                key={branch._id}
                variants={itemVariants}
                whileHover="hover"
                className="group cursor-pointer"
                onClick={() => handleCardClick(branch._id)}
              >
                <div className="relative overflow-hidden rounded-xl shadow-elegant">
                  <div className="aspect-[4/5] bg-sepia-200">
                    <img
                      src={branch.mainImage || "/placeholder-branch.jpg"}
                      alt={branch.name}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Decorative corner elements */}
                    <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" />
                    <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" />
                    <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" />
                    <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-white/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" />
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <p className="text-sm font-medium uppercase tracking-wider mb-2 text-gold-300">Premium Dining</p>
                    <button
                      className="mt-4 px-4 py-2 bg-white/20 backdrop-blur-sm text-white border border-white/40 rounded-full text-sm hover:bg-white/30 transition-colors duration-300"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleCardClick(branch._id)
                      }}
                    >
                      Book Now
                    </button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-b-xl shadow-elegant transform -translate-y-8 group-hover:-translate-y-4 transition-transform duration-500 ease-out">
                  <h3
                    className="text-2xl font-playfair font-semibold text-black mb-3 group-hover:text-gold-700 transition-colors duration-300 cursor-pointer"
                    onClick={(e) => handleNameClick(branch._id, e)}
                  >
                    {branch.parentRestaurant?.name} - {branch.name}
                  </h3>
                  <div className="space-y-2 text-black">
                    <p className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      {branch.email}
                    </p>
                    <p className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      {branch.phone}
                    </p>
                    <p className="flex items-center">
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {branch.address}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default Gallery
