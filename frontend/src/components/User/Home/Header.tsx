"use client"

import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, User, Wallet, Calendar, MapPin, Menu, X } from "lucide-react"
import type { RootState } from "../../../redux/store"
import { logoutUser } from "../../../redux/userslice"
import { setLocation, clearLocation } from "../../../redux/locationSlice"
import api from "../../../Axios/userInstance"
import axios from "axios"
import toast from "react-hot-toast"
import SignupModal from "../SignupForm"
import LoginModal from "../LoginForm"

const GOOGLE_MAPS_API_KEY = "AIzaSyCmtwdLj4ezHr_PmZunPte9-bb14e4OUNU"

interface GeocodeResponse {
  status: string
  results: Array<{
    address_components: Array<{
      long_name: string
      types: string[]
    }>
    formatted_address: string
  }>
}

const Header = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.user.user)
  const location = useSelector((state: RootState) => state.location)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Check scroll position for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = async () => {
    try {
      await api.post("/logout")
      dispatch(logoutUser())
      dispatch(clearLocation())
      navigate("/")
      toast.success("Logged out successfully")
    } catch (error) {
      toast.error("Failed to log out")
    }
  }

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen)
  const toggleLocationDropdown = () => setIsLocationDropdownOpen(!isLocationDropdownOpen)
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  const getLocationName = async (lat: number, lng: number): Promise<string | undefined> => {
    try {
      const response = await axios.get<GeocodeResponse>(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`,
      )
      if (response.data.status === "OK" && response.data.results.length > 0) {
        const result = response.data.results[0]
        const addressComponents = result.address_components
        const locality = addressComponents.find((comp) => comp.types.includes("locality"))?.long_name
        const adminArea = addressComponents.find((comp) =>
          comp.types.includes("administrative_area_level_1"),
        )?.long_name
        const neighborhood = addressComponents.find((comp) => comp.types.includes("neighborhood"))?.long_name
        const placeName = locality || neighborhood || adminArea || result.formatted_address.split(",")[0]
        if (placeName.includes("+")) {
          return adminArea || "Current Location"
        }
        return placeName
      }
      return undefined // Changed from null to undefined
    } catch (error) {
      toast.error("Error fetching location name")
      return undefined // Changed from null to undefined
    }
  }

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          const locationName = await getLocationName(latitude, longitude)
          dispatch(setLocation({ lat: latitude, lng: longitude, locationName }))
          setIsLocationDropdownOpen(false)
          toast.success(`Location set to ${locationName || "your current position"}.`)
        },
        () => {
          toast.error("Failed to get your location")
        },
      )
    } else {
      toast.error("Geolocation not supported")
    }
  }

  const handleNearMeClick = () => {
    navigate("/search?nearMe=true")
  }

  const isAuthenticated = user && user.name && user.email
  const hasValidLocation = location.lat && location.lng && location.locationName

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.95,
      transition: { duration: 0.2 },
    },
  }

  const mobileMenuVariants = {
    hidden: { opacity: 0, x: "100%" },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        staggerChildren: 0.07,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      x: "100%",
      transition: { duration: 0.3 },
    },
  }

  const menuItemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 20 },
    },
  }

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "bg-white shadow-sm"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex justify-between items-center h-16 md:h-20">
          <motion.button
            onClick={() => navigate("/")}
            className="flex items-center space-x-2 text-2xl font-semibold tracking-wide text-sepia-900 hover:text-sepia-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-sepia-700 to-sepia-900 rounded-full flex items-center justify-center shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-white"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-playfair hidden sm:block">CLASSIC DINING</span>
          </motion.button>

          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => navigate("/")}
              className="text-sm text-sepia-900 hover:text-sepia-700 transition-colors font-medium"
            >
              Home
            </button>
            <button
              onClick={() => navigate("/menu")}
              className="text-sm text-sepia-900 hover:text-sepia-700 transition-colors font-medium"
            >
              Menu
            </button>
            <button
              onClick={() => navigate("/restaurentList")}
              className="text-sm text-sepia-900 hover:text-sepia-700 transition-colors font-medium"
            >
              Restaurants
            </button>

            <button
              onClick={handleNearMeClick}
              className="flex items-center space-x-2 text-sm text-sepia-900 hover:text-sepia-700 transition-colors focus:outline-none font-medium"
            >
              <MapPin className="w-4 h-4" />
              <span>Near Me</span>
            </button>

            <div className="relative">
              <button
                onClick={toggleLocationDropdown}
                className="flex items-center space-x-2 text-sm text-sepia-900 hover:text-sepia-700 transition-colors focus:outline-none font-medium"
              >
                <MapPin className="w-4 h-4" />
                <span className="max-w-[120px] truncate">
                  {hasValidLocation ? location.locationName : "Set Location"}
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-300 ${isLocationDropdownOpen ? "rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {isLocationDropdownOpen && (
                  <motion.div
                    className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden"
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <div className="p-4">
                      <button
                        onClick={handleUseCurrentLocation}
                        className="w-full bg-gradient-to-r from-gold-600 to-gold-700 text-white p-2 rounded-md hover:from-gold-700 hover:to-gold-800 transition-all duration-300 flex items-center justify-center"
                      >
                        <MapPin className="w-4 h-4 mr-2" /> Set My Location
                      </button>
                      {hasValidLocation && (
                        <button
                          onClick={() => dispatch(clearLocation())}
                          className="mt-2 w-full bg-white text-gray-700 p-2 rounded-md hover:bg-gray-50 transition-colors border border-gray-300"
                        >
                          Clear Location
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              onClick={() => navigate("/join-us")}
              className="text-sm bg-gradient-to-r from-gold-600 to-gold-700 text-white py-2 px-4 rounded-md hover:from-gold-700 hover:to-gold-800 transition-all duration-300 shadow-md"
            >
              Join Us
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className="flex items-center space-x-2 text-sm text-gray-800 hover:text-gray-600 transition-colors focus:outline-none font-medium"
                >
                  <span>Hello, {user.name}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                    >
                      <div className="py-2">
                        <button
                          onClick={() => {
                            navigate("/profile")
                            setIsDropdownOpen(false)
                          }}
                          className="w-full text-left flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                          <User className="w-4 h-4 mr-3 text-gold-600" />
                          Profile
                        </button>
                        <button
                          onClick={() => {
                            navigate("/wallet")
                            setIsDropdownOpen(false)
                          }}
                          className="w-full text-left flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                          <Wallet className="w-4 h-4 mr-3 text-gold-600" />
                          Wallet
                        </button>
                        <button
                          onClick={() => {
                            navigate("/bookings")
                            setIsDropdownOpen(false)
                          }}
                          className="w-full text-left flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        >
                          <Calendar className="w-4 h-4 mr-3 text-gold-600" />
                          Bookings
                        </button>
                        <div className="border-t border-gray-200 my-1"></div>
                        <button
                          onClick={() => {
                            handleLogout()
                            setIsDropdownOpen(false)
                          }}
                          className="w-full text-left flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                            />
                          </svg>
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <motion.button
                  onClick={() => setIsSignupModalOpen(true)}
                  className="text-sm bg-gradient-to-r from-sepia-700 to-sepia-900 text-white py-2 px-6 rounded-md hover:from-sepia-800 hover:to-sepia-950 transition-all duration-300 shadow-md"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign Up
                </motion.button>
                <motion.button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-sm bg-white text-gray-800 py-2 px-6 rounded-md border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Log In
                </motion.button>
              </div>
            )}
          </div>

          <div className="md:hidden flex items-center space-x-4">
            <button
              onClick={() => navigate("/join-us")}
              className="text-sm bg-gradient-to-r from-gold-600 to-gold-700 text-white py-2 px-4 rounded-md hover:from-gold-700 hover:to-gold-800 transition-all duration-300 shadow-md"
            >
              Join Us
            </button>
            <button
              onClick={toggleMobileMenu}
              className="text-gray-800 p-2 rounded-md hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 bg-white z-40 pt-16 md:hidden"
            variants={mobileMenuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="p-4 h-full overflow-y-auto">
              <div className="space-y-4">
                {isAuthenticated && (
                  <motion.div
                    className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200"
                    variants={menuItemVariants}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={user?.profilePicture || "/default-profile.jpg"}
                        alt="Profile"
                        className="w-12 h-12 rounded-full border-2 border-gray-300 object-cover"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                <motion.button
                  onClick={() => {
                    navigate("/")
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full text-left p-4 rounded-lg hover:bg-gray-50 text-gray-800 transition-colors"
                  variants={menuItemVariants}
                >
                  Home
                </motion.button>

                <motion.button
                  onClick={() => {
                    navigate("/menu")
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full text-left p-4 rounded-lg hover:bg-gray-50 text-gray-800 transition-colors"
                  variants={menuItemVariants}
                >
                  Menu
                </motion.button>

                <motion.button
                  onClick={() => {
                    navigate("/restaurentList")
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full text-left p-4 rounded-lg hover:bg-gray-50 text-gray-800 transition-colors"
                  variants={menuItemVariants}
                >
                  Restaurants
                </motion.button>

                <motion.button
                  onClick={() => {
                    handleNearMeClick()
                    setIsMobileMenuOpen(false)
                  }}
                  className="w-full text-left p-4 rounded-lg hover:bg-gray-50 text-gray-800 transition-colors flex items-center"
                  variants={menuItemVariants}
                >
                  <MapPin className="w-5 h-5 mr-2" /> Near Me
                </motion.button>

                <motion.div className="border-t border-gray-200 my-4" variants={menuItemVariants} />

                {isAuthenticated ? (
                  <>
                    <motion.button
                      onClick={() => {
                        navigate("/profile")
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full text-left p-4 rounded-lg hover:bg-gray-50 text-gray-800 transition-colors flex items-center"
                      variants={menuItemVariants}
                    >
                      <User className="w-5 h-5 mr-2 text-gold-600" /> Profile
                    </motion.button>

                    <motion.button
                      onClick={() => {
                        navigate("/wallet")
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full text-left p-4 rounded-lg hover:bg-gray-50 text-gray-800 transition-colors flex items-center"
                      variants={menuItemVariants}
                    >
                      <Wallet className="w-5 h-5 mr-2 text-gold-600" /> Wallet
                    </motion.button>

                    <motion.button
                      onClick={() => {
                        navigate("/bookings")
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full text-left p-4 rounded-lg hover:bg-gray-50 text-gray-800 transition-colors flex items-center"
                      variants={menuItemVariants}
                    >
                      <Calendar className="w-5 h-5 mr-2 text-gold-600" /> Bookings
                    </motion.button>

                    <motion.button
                      onClick={() => {
                        handleLogout()
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full text-left p-4 rounded-lg hover:bg-red-50 text-red-600 transition-colors flex items-center mt-4"
                      variants={menuItemVariants}
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Logout
                    </motion.button>
                  </>
                ) : (
                  <div className="space-y-3">
                    <motion.button
                      onClick={() => {
                        setIsLoginModalOpen(true)
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full p-4 bg-gradient-to-r from-sepia-700 to-sepia-900 text-white rounded-lg shadow-md"
                      variants={menuItemVariants}
                    >
                      Log In
                    </motion.button>

                    <motion.button
                      onClick={() => {
                        setIsSignupModalOpen(true)
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full p-4 bg-white border border-gray-300 text-gray-800 rounded-lg shadow-sm"
                      variants={menuItemVariants}
                    >
                      Sign Up
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSignupModalOpen && (
          <SignupModal
            show={isSignupModalOpen}
            onClose={() => setIsSignupModalOpen(false)}
            onLoginClick={() => {
              setIsSignupModalOpen(false)
              setIsLoginModalOpen(true)
            }}
          />
        )}
        {isLoginModalOpen && (
          <LoginModal
            show={isLoginModalOpen}
            onClose={() => setIsLoginModalOpen(false)}
            onSignupClick={() => {
              setIsLoginModalOpen(false)
              setIsSignupModalOpen(true)
            }}
          />
        )}
      </AnimatePresence>
    </header>
  )
}

export default Header
