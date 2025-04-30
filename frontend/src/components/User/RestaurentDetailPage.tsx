"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { fetchBranchDetails, fetchBranchReviews } from "../../Api/userApi"
import { motion } from "framer-motion"
import { Button, IconButton, Tooltip } from "@mui/material"
import axios from "axios"
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api"
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"
import { Share, Download, X, ZoomIn, ZoomOut, MapPin, Star, Clock, Phone, Calendar, Wine, Users } from "lucide-react"
import Header from "../../components/User/Home/Header"

const mapContainerStyle = {
  width: "100%",
  height: "400px",
}

const GOOGLE_MAPS_API_KEY = "AIzaSyCmtwdLj4ezHr_PmZunPte9-bb14e4OUNU"

const RestaurantDetailPage = () => {
  const { branchId } = useParams<{ branchId: string }>()
  const navigate = useNavigate()
  const [branch, setBranch] = useState<any>(null)
  const [allReviews, setAllReviews] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [mapQuery, setMapQuery] = useState<string>("")
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null)
  const [mapError, setMapError] = useState<string | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [activeTab, setActiveTab] = useState<string>("overview")
  const reviewsPerPage = 5

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  })

  useEffect(() => {
    const loadBranchAndReviews = async () => {
      try {
        if (!branchId) throw new Error("No branch ID provided")
        setLoading(true)

        const branchData = await fetchBranchDetails(branchId)
        setBranch(branchData)

        const reviewData = await fetchBranchReviews(branchId)
        setAllReviews(reviewData)

        let query = ""
        let coords: { lat: number; lng: number } | null = null
        if (branchData.location?.coordinates) {
          query = `${branchData.location.coordinates[1]},${branchData.location.coordinates[0]}`
          coords = { lat: branchData.location.coordinates[1], lng: branchData.location.coordinates[0] }
        } else if (branchData.address) {
          const geocodeResponse: any = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(branchData.address)}&key=${GOOGLE_MAPS_API_KEY}`,
          )
          if (geocodeResponse.data.status === "OK" && geocodeResponse.data.results.length > 0) {
            const { lat, lng } = geocodeResponse.data.results[0].geometry.location
            query = `${lat},${lng}`
            coords = { lat, lng }
          } else {
            setMapError("Unable to geocode address.")
            query = encodeURIComponent(branchData.address || `${branchData.name}, Unknown Location`)
          }
        } else {
          setMapError("No address or coordinates provided.")
          query = encodeURIComponent(`${branchData.name}, Unknown Location`)
        }
        setMapQuery(query)
        setCoordinates(coords)
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : "Failed to load restaurant details")
      } finally {
        setLoading(false)
      }
    }
    loadBranchAndReviews()
  }, [branchId])

  // Calculate paginated reviews
  const indexOfLastReview = currentPage * reviewsPerPage
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage
  const currentReviews = allReviews.slice(indexOfFirstReview, indexOfLastReview)
  const totalPages = Math.ceil(allReviews.length / reviewsPerPage)

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sepia-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.5, 1, 0.5],
            scale: [0.98, 1, 0.98],
          }}
          transition={{
            repeat: Number.POSITIVE_INFINITY,
            duration: 1.5,
          }}
          className="flex flex-col items-center"
        >
          <div className="w-16 h-16 border-4 border-sepia-200 border-t-sepia-700 rounded-full animate-spin mb-4"></div>
          <p className="text-xl font-playfair text-sepia-800">Loading exquisite details...</p>
        </motion.div>
      </div>
    )
  }

  if (error || !branch) {
    return (
      <div className="min-h-screen bg-sepia-50 flex items-center justify-center">
        <div className="text-red-600 text-lg font-sans">{error || "Restaurant not found"}</div>
      </div>
    )
  }

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`

  const handlePhotoClick = (imgSrc: string) => setSelectedPhoto(imgSrc)
  const handleCloseModal = () => setSelectedPhoto(null)
  const handleDownloadPhoto = (imgSrc: string) => {
    const link = document.createElement("a")
    link.href = imgSrc
    link.download = `photo-${Date.now()}.jpg`
    link.click()
  }
  const handleShare = async () => {
    const shareData = {
      title: branch.name,
      text: `Discover ${branch.name} at ${branch.address || "this location"}!`,
      url: window.location.href,
    }
    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert("Link copied to clipboard!")
      }
    } catch (err) {
      await navigator.clipboard.writeText(window.location.href)
      alert("Failed to share. Link copied to clipboard!")
    }
  }

  // Calculate average rating
  const averageRating =
    allReviews.length > 0
      ? (allReviews.reduce((acc, review) => acc + review.rating, 0) / allReviews.length).toFixed(1)
      : "N/A"

  return (
    <div className="min-h-screen bg-sepia-50 font-sans antialiased">
      <Header />

      {/* Hero Section */}
      <div className="relative h-[600px] w-full overflow-hidden">
        <div className="absolute inset-0">
          <img src={branch.mainImage || "/placeholder.svg"} alt={branch.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
        </div>

        {/* Decorative elements */}
        <div className="absolute top-8 left-8 w-24 h-24 border-l-2 border-t-2 border-gold-300/60"></div>
        <div className="absolute top-8 right-8 w-24 h-24 border-t-2 border-r-2 border-gold-300/60"></div>
        <div className="absolute bottom-8 left-8 w-24 h-24 border-b-2 border-l-2 border-gold-300/60"></div>
        <div className="absolute bottom-8 right-8 w-24 h-24 border-b-2 border-r-2 border-gold-300/60"></div>

        <div className="absolute inset-0 flex items-center justify-center text-center text-white px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <h1 className="text-5xl md:text-7xl font-playfair font-bold tracking-tight mb-6">{branch.name}</h1>
              <div className="flex justify-center items-center mb-6">
                <div className="h-px w-20 bg-gold-400"></div>
                <p className="mx-4 text-xl text-gold-300 font-medium italic">Est. 1940</p>
                <div className="h-px w-20 bg-gold-400"></div>
              </div>
              <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-2xl mx-auto font-light">
                {branch.address || "Address not available"}
              </p>
              <div className="flex flex-wrap justify-center gap-6">
                <Button
                  variant="contained"
                  sx={{
                    bgcolor: "#8F6E2E",
                    "&:hover": { bgcolor: "#6B5222" },
                    padding: "14px 36px",
                    fontSize: "18px",
                    borderRadius: "9999px",
                    boxShadow: "0 4px 14px rgba(0, 0, 0, 0.3)",
                    textTransform: "none",
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 500,
                  }}
                  onClick={() => navigate(`/book/${branch._id}`)}
                >
                  Reserve a Table
                </Button>
                <Tooltip title="Share this restaurant">
                  <IconButton
                    onClick={handleShare}
                    sx={{
                      bgcolor: "rgba(255, 255, 255, 0.2)",
                      backdropFilter: "blur(4px)",
                      "&:hover": { bgcolor: "rgba(255, 255, 255, 0.3)" },
                      padding: "14px",
                    }}
                  >
                    <Share className="text-white w-6 h-6" />
                  </IconButton>
                </Tooltip>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="sticky top-0 bg-white shadow-md z-30 border-b border-sepia-200">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide">
            {["overview", "gallery", "location", "reviews"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? "text-sepia-900 border-b-2 border-gold-600"
                    : "text-sepia-600 hover:text-sepia-800"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-12">
        {/* Overview Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: activeTab === "overview" ? 1 : 0, y: activeTab === "overview" ? 0 : 20 }}
          transition={{ delay: 0.2 }}
          className={`mb-12 ${activeTab !== "overview" ? "hidden" : ""}`}
        >
          <div className="bg-white rounded-xl shadow-premium p-8 border border-sepia-100">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="md:w-2/3">
                <h2 className="text-3xl font-playfair text-sepia-900 mb-6 relative inline-block">
                  About {branch.name}
                  <div className="absolute -bottom-2 left-0 h-0.5 w-24 bg-gradient-to-r from-gold-500 to-gold-600"></div>
                </h2>

                <div className="prose prose-sepia max-w-none mb-6">
                  <p className="text-sepia-800 leading-relaxed">
                    Experience the epitome of fine dining at {branch.name}, where culinary artistry meets elegant
                    ambiance. Our restaurant offers a sophisticated setting for memorable dining experiences, whether
                    you're celebrating a special occasion or enjoying an intimate dinner.
                  </p>
                  <p className="text-sepia-800 leading-relaxed">
                    Our expert chefs craft exquisite dishes using the finest ingredients, creating a menu that balances
                    traditional flavors with innovative techniques. Each dish is meticulously prepared and beautifully
                    presented, offering a feast for both the eyes and the palate.
                  </p>
                  <p className="text-sepia-800 leading-relaxed">
                    The restaurant's interior reflects our commitment to excellence, with elegant décor, soft lighting,
                    and comfortable seating that creates an atmosphere of refined luxury. Our attentive staff ensures
                    that every aspect of your dining experience exceeds expectations.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
                  <div className="flex items-start bg-sepia-50 p-4 rounded-lg border border-sepia-100">
                    <Clock className="w-5 h-5 text-gold-600 mt-1 mr-3" />
                    <div>
                      <h3 className="font-medium text-sepia-900 mb-1">Opening Hours</h3>
                      <p className="text-sm text-sepia-700">
                        Monday - Friday: 11:00 AM - 10:00 PM
                        <br />
                        Saturday - Sunday: 10:00 AM - 11:00 PM
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start bg-sepia-50 p-4 rounded-lg border border-sepia-100">
                    <Phone className="w-5 h-5 text-gold-600 mt-1 mr-3" />
                    <div>
                      <h3 className="font-medium text-sepia-900 mb-1">Contact</h3>
                      <p className="text-sm text-sepia-700">
                        {branch.phone || "Phone not available"}
                        <br />
                        {branch.email || "Email not available"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="md:w-1/3 flex flex-col justify-between">
                <div className="bg-sepia-50 p-6 rounded-lg border border-sepia-100 shadow-elegant">
                  <div className="flex items-center mb-4">
                    <Star className="w-5 h-5 text-amber-500 mr-2" />
                    <span className="text-2xl font-playfair font-bold text-sepia-900">{averageRating}</span>
                    <span className="text-sm text-sepia-600 ml-2">
                      ({allReviews.length} {allReviews.length === 1 ? "review" : "reviews"})
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-sepia-700">Ambiance</span>
                      <div className="w-32 h-2 bg-sepia-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-gold-500 to-gold-600 rounded-full"
                          style={{ width: "90%" }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-sepia-700">Service</span>
                      <div className="w-32 h-2 bg-sepia-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-gold-500 to-gold-600 rounded-full"
                          style={{ width: "85%" }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-sepia-700">Food</span>
                      <div className="w-32 h-2 bg-sepia-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-gold-500 to-gold-600 rounded-full"
                          style={{ width: "95%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outlined"
                  startIcon={<Calendar />}
                  sx={{
                    borderColor: "#8F6E2E",
                    color: "#8F6E2E",
                    "&:hover": {
                      borderColor: "#6B5222",
                      color: "#6B5222",
                      backgroundColor: "rgba(143, 110, 46, 0.04)",
                    },
                    padding: "10px 24px",
                    borderRadius: "8px",
                    marginTop: "16px",
                    textTransform: "none",
                    fontFamily: "'Playfair Display', serif",
                  }}
                  onClick={() => navigate(`/book/${branch._id}`)}
                >
                  Make a Reservation
                </Button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Gallery Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: activeTab === "gallery" ? 1 : 0, y: activeTab === "gallery" ? 0 : 20 }}
          transition={{ delay: 0.2 }}
          className={`mb-12 ${activeTab !== "gallery" ? "hidden" : ""}`}
        >
          <div className="bg-white rounded-xl shadow-premium p-8 border border-sepia-100">
            <h2 className="text-3xl font-playfair text-sepia-900 mb-6 relative inline-block">
              Gallery
              <div className="absolute -bottom-2 left-0 h-0.5 w-24 bg-gradient-to-r from-gold-500 to-gold-600"></div>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {(branch.interiorImages || []).map((imgSrc: string, index: number) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.03 }}
                  className="group relative rounded-lg overflow-hidden shadow-elegant cursor-pointer aspect-square"
                  onClick={() => handlePhotoClick(imgSrc)}
                >
                  <img
                    src={imgSrc || "/placeholder.svg"}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-sepia-900/60 via-sepia-900/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-3">
                    <p className="text-white text-sm font-medium truncate">View Photo</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Location Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: activeTab === "location" ? 1 : 0, y: activeTab === "location" ? 0 : 20 }}
          transition={{ delay: 0.2 }}
          className={`mb-12 ${activeTab !== "location" ? "hidden" : ""}`}
        >
          <div className="bg-white rounded-xl shadow-premium p-8 border border-sepia-100">
            <h2 className="text-3xl font-playfair text-sepia-900 mb-6 relative inline-block">
              Location
              <div className="absolute -bottom-2 left-0 h-0.5 w-24 bg-gradient-to-r from-gold-500 to-gold-600"></div>
            </h2>

            <div className="mb-6">
              <div className="flex items-start mb-4">
                <MapPin className="w-5 h-5 text-gold-600 mt-1 mr-3" />
                <p className="text-sepia-800">{branch.address || "Address not available"}</p>
              </div>

              <Button
                variant="outlined"
                startIcon={<MapPin />}
                sx={{
                  borderColor: "#8F6E2E",
                  color: "#8F6E2E",
                  "&:hover": { borderColor: "#6B5222", color: "#6B5222", backgroundColor: "rgba(143, 110, 46, 0.04)" },
                  padding: "8px 20px",
                  borderRadius: "8px",
                  textTransform: "none",
                  fontFamily: "'Playfair Display', serif",
                }}
                onClick={() => window.open(directionsUrl, "_blank")}
              >
                Get Directions
              </Button>
            </div>

            <div className="rounded-lg overflow-hidden shadow-elegant border border-sepia-200">
              {isLoaded && coordinates ? (
                <GoogleMap mapContainerStyle={mapContainerStyle} center={coordinates} zoom={15}>
                  <Marker position={coordinates} title={branch.name} />
                </GoogleMap>
              ) : (
                <div className="h-[400px] bg-sepia-100 flex items-center justify-center rounded-lg">
                  <p className="text-sepia-600 text-base">Map unavailable</p>
                </div>
              )}
            </div>
          </div>
        </motion.section>

        {/* Reviews Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: activeTab === "reviews" ? 1 : 0, y: activeTab === "reviews" ? 0 : 20 }}
          transition={{ delay: 0.2 }}
          className={`mb-12 ${activeTab !== "reviews" ? "hidden" : ""}`}
        >
          <div className="bg-white rounded-xl shadow-premium p-8 border border-sepia-100">
            <h2 className="text-3xl font-playfair text-sepia-900 mb-6 relative inline-block">
              Customer Reviews
              <div className="absolute -bottom-2 left-0 h-0.5 w-24 bg-gradient-to-r from-gold-500 to-gold-600"></div>
            </h2>

            <div className="flex items-center mb-8">
              <div className="bg-sepia-50 px-6 py-4 rounded-lg border border-sepia-100 flex items-center shadow-elegant">
                <div className="text-4xl font-playfair font-bold text-sepia-900 mr-4">{averageRating}</div>
                <div>
                  <div className="flex mb-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-5 h-5 ${
                          Number.parseFloat(averageRating) >= star
                            ? "text-amber-500"
                            : Number.parseFloat(averageRating) >= star - 0.5
                              ? "text-amber-500/70"
                              : "text-gray-300"
                        }`}
                        fill={Number.parseFloat(averageRating) >= star ? "currentColor" : "none"}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-sepia-600">
                    Based on {allReviews.length} {allReviews.length === 1 ? "review" : "reviews"}
                  </p>
                </div>
              </div>
            </div>

            {allReviews.length > 0 ? (
              <>
                <div className="space-y-6">
                  {currentReviews.map((review: any, index: number) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-sepia-50 p-6 rounded-lg shadow-elegant border border-sepia-100"
                    >
                      <div className="flex justify-between mb-3">
                        <div>
                          <p className="text-sepia-900 font-medium">{review.userName || "Anonymous"}</p>
                          <p className="text-sepia-500 text-sm">
                            {new Date(review.createdAt).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <div className="flex">
                          {Array(5)
                            .fill(0)
                            .map((_, i) => (
                              <Star
                                key={i}
                                className={`w-5 h-5 ${i < review.rating ? "text-amber-500" : "text-gray-300"}`}
                                fill={i < review.rating ? "currentColor" : "none"}
                              />
                            ))}
                        </div>
                      </div>

                      {review.comment && (
                        <div className="mt-3 text-sepia-800 leading-relaxed">
                          <p>{review.comment}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Pagination Controls */}
                <div className="flex justify-between items-center mt-8">
                  <Button
                    variant="outlined"
                    onClick={handlePrevPage}
                    disabled={currentPage === 1}
                    sx={{
                      borderColor: "#8F6E2E",
                      color: "#8F6E2E",
                      "&:hover": { borderColor: "#6B5222", color: "#6B5222" },
                      "&:disabled": { borderColor: "#cccccc", color: "#cccccc" },
                      textTransform: "none",
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    Previous
                  </Button>
                  <span className="text-sepia-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outlined"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    sx={{
                      borderColor: "#8F6E2E",
                      color: "#8F6E2E",
                      "&:hover": { borderColor: "#6B5222", color: "#6B5222" },
                      "&:disabled": { borderColor: "#cccccc", color: "#cccccc" },
                      textTransform: "none",
                      fontFamily: "'Playfair Display', serif",
                    }}
                  >
                    Next
                  </Button>
                </div>
              </>
            ) : (
              <div className="bg-sepia-50 p-8 rounded-lg text-center border border-sepia-100">
                <p className="text-sepia-700 text-lg font-playfair mb-2">No reviews available yet</p>
                <p className="text-sepia-600">Be the first to share your experience at this restaurant.</p>
              </div>
            )}
          </div>
        </motion.section>
      </div>

      {/* Amenities Section */}
      <section className="bg-sepia-50 py-16">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <h2 className="text-3xl font-playfair text-sepia-900 mb-10 text-center">Restaurant Amenities</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-elegant mb-4">
                <Wine className="w-8 h-8 text-gold-600" />
              </div>
              <h3 className="font-medium text-sepia-900 mb-1">Premium Bar</h3>
              <p className="text-sm text-sepia-700">Extensive selection of fine wines and spirits</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-elegant mb-4">
                <Users className="w-8 h-8 text-gold-600" />
              </div>
              <h3 className="font-medium text-sepia-900 mb-1">Private Dining</h3>
              <p className="text-sm text-sepia-700">Exclusive spaces for special occasions</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-elegant mb-4">
                <svg
                  className="w-8 h-8 text-gold-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-medium text-sepia-900 mb-1">Valet Parking</h3>
              <p className="text-sm text-sepia-700">Convenient parking service for guests</p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-elegant mb-4">
                <svg
                  className="w-8 h-8 text-gold-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="font-medium text-sepia-900 mb-1">Live Music</h3>
              <p className="text-sm text-sepia-700">Elegant entertainment on select evenings</p>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Book Now Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Button
          variant="contained"
          sx={{
            bgcolor: "#8F6E2E",
            "&:hover": { bgcolor: "#6B5222" },
            padding: "12px 28px",
            fontSize: "15px",
            borderRadius: "9999px",
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.2)",
            textTransform: "none",
            fontFamily: "'Playfair Display', serif",
          }}
          onClick={() => navigate(`/book/${branch._id}`)}
        >
          Reserve Now
        </Button>
      </motion.div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <div
            className="relative bg-white p-4 rounded-lg max-w-4xl w-full max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <IconButton
              onClick={handleCloseModal}
              sx={{ position: "absolute", top: 8, right: 8, color: "#8F6E2E", zIndex: 10 }}
            >
              <X />
            </IconButton>
            <TransformWrapper>
              {({ zoomIn, zoomOut }) => (
                <>
                  <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full">
                    <img
                      src={selectedPhoto || "/placeholder.svg"}
                      alt="Enlarged"
                      className="max-h-[70vh] w-full object-contain rounded-md"
                    />
                  </TransformComponent>
                  <div className="flex justify-center gap-4 mt-4">
                    <IconButton onClick={() => zoomIn()} sx={{ bgcolor: "#f5f5f5", "&:hover": { bgcolor: "#e0e0e0" } }}>
                      <ZoomIn className="text-sepia-700" />
                    </IconButton>
                    <IconButton
                      onClick={() => zoomOut()}
                      sx={{ bgcolor: "#f5f5f5", "&:hover": { bgcolor: "#e0e0e0" } }}
                    >
                      <ZoomOut className="text-sepia-700" />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDownloadPhoto(selectedPhoto)}
                      sx={{ bgcolor: "#f5f5f5", "&:hover": { bgcolor: "#e0e0e0" } }}
                    >
                      <Download className="text-sepia-700" />
                    </IconButton>
                  </div>
                </>
              )}
            </TransformWrapper>
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default RestaurantDetailPage
