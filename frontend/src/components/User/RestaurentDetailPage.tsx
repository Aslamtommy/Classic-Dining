import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchBranchDetails, fetchBranchReviews } from "../../Api/userApi";
import { Branch } from "../../types/branch";
import { Review } from "../../types/reservation";
import { motion } from "framer-motion";
import { Button, IconButton, Tooltip } from "@mui/material";
import Carousel from "react-material-ui-carousel";
import axios from "axios";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import ShareIcon from "@mui/icons-material/Share";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import Header from "../../components/User/Home/Header";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const GOOGLE_MAPS_API_KEY = "AIzaSyCmtwdLj4ezHr_PmZunPte9-bb14e4OUNU";

const RestaurantDetailPage: React.FC = () => {
  const { branchId } = useParams<{ branchId: string }>();
  const navigate = useNavigate();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [allReviews, setAllReviews] = useState<Review[]>([]); // Store all reviews
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mapQuery, setMapQuery] = useState<string>("");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const reviewsPerPage = 5; // Number of reviews per page

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    const loadBranchAndReviews = async () => {
      try {
        if (!branchId) throw new Error("No branch ID provided");
        setLoading(true);

        const branchData = await fetchBranchDetails(branchId);
        setBranch(branchData);

        const reviewData = await fetchBranchReviews(branchId); // Fetch all reviews
        setAllReviews(reviewData); // Store all reviews

        let query = "";
        let coords: { lat: number; lng: number } | null = null;
        if (branchData.location?.coordinates) {
          query = `${branchData.location.coordinates[1]},${branchData.location.coordinates[0]}`;
          coords = { lat: branchData.location.coordinates[1], lng: branchData.location.coordinates[0] };
        } else if (branchData.address) {
          const geocodeResponse: any = await axios.get(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(branchData.address)}&key=${GOOGLE_MAPS_API_KEY}`
          );
          if (geocodeResponse.data.status === "OK" && geocodeResponse.data.results.length > 0) {
            const { lat, lng } = geocodeResponse.data.results[0].geometry.location;
            query = `${lat},${lng}`;
            coords = { lat, lng };
          } else {
            setMapError("Unable to geocode address.");
            query = encodeURIComponent(branchData.address || `${branchData.name}, Unknown Location`);
          }
        } else {
          setMapError("No address or coordinates provided.");
          query = encodeURIComponent(`${branchData.name}, Unknown Location`);
        }
        setMapQuery(query);
        setCoordinates(coords);
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : "Failed to load restaurant details");
      } finally {
        setLoading(false);
      }
    };
    loadBranchAndReviews();
  }, [branchId]);

  // Calculate paginated reviews
  const indexOfLastReview = currentPage * reviewsPerPage;
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage;
  const currentReviews = allReviews.slice(indexOfFirstReview, indexOfLastReview);
  const totalPages = Math.ceil(allReviews.length / reviewsPerPage);

  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-2xl font-serif text-gray-800">
          Loading...
        </motion.div>
      </div>
    );
  }

  if (error || !branch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600 text-lg font-sans">{error || "Restaurant not found"}</div>
      </div>
    );
  }

  const carouselImages = [branch.mainImage || "/placeholder-branch.jpg", ...(branch.interiorImages || [])];
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`;

  const handlePhotoClick = (imgSrc: string) => setSelectedPhoto(imgSrc);
  const handleCloseModal = () => setSelectedPhoto(null);
  const handleDownloadPhoto = (imgSrc: string) => {
    const link = document.createElement("a");
    link.href = imgSrc;
    link.download = `photo-${Date.now()}.jpg`;
    link.click();
  };
  const handleShare = async () => {
    const shareData = {
      title: branch.name,
      text: `Discover ${branch.name} at ${branch.address || "this location"}!`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      await navigator.clipboard.writeText(window.location.href);
      alert("Failed to share. Link copied to clipboard!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans antialiased">
      <Header />
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative h-[60vh] w-full"
      >
        <Carousel
          autoPlay={false}
          animation="fade"
          navButtonsAlwaysVisible={false}
          indicators={carouselImages.length > 1}
          className="h-full"
        >
          {carouselImages.map((imgSrc, index) => (
            <div key={index} className="relative h-full w-full">
              <img src={imgSrc} alt={`${branch.name} ${index + 1}`} className="w-full h-full object-cover brightness-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
              <div className="absolute inset-0 flex items-center justify-center text-center text-white px-4 md:px-8">
                <div className="max-w-4xl mx-auto">
                  <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-tight mb-4">{branch.name}</h1>
                  <p className="text-lg md:text-xl text-gray-200 mb-6">{branch.address || "Address not available"}</p>
                  <div className="flex justify-center gap-4">
                    <Button
                      variant="contained"
                      sx={{
                        bgcolor: "#c62828",
                        "&:hover": { bgcolor: "#b71c1c" },
                        padding: "10px 28px",
                        fontSize: "16px",
                        borderRadius: "9999px",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.2)",
                      }}
                      onClick={() => navigate(`/book/${branch._id}`)}
                    >
                      Reserve a Table
                    </Button>
                    <Tooltip title="Share this restaurant">
                      <IconButton
                        onClick={handleShare}
                        sx={{ bgcolor: "white", "&:hover": { bgcolor: "#f0f0f0" }, padding: "10px" }}
                      >
                        <ShareIcon sx={{ color: "#c62828" }} />
                      </IconButton>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-12">
        {/* Overview Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12 bg-white rounded-xl shadow-sm p-6"
        >
          <h2 className="text-2xl md:text-3xl font-serif text-gray-900 mb-4">About {branch.name}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-gray-700 text-base leading-relaxed mb-4">{branch.address || "N/A"}</p>
              <div className="space-y-2 text-gray-600 text-sm">
                <p><strong>Email:</strong> {branch.email}</p>
                <p><strong>Phone:</strong> {branch.phone || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-end justify-end">
              <Button
                variant="outlined"
                startIcon={<LocationOnIcon />}
                sx={{
                  borderColor: "#c62828",
                  color: "#c62828",
                  "&:hover": { borderColor: "#b71c1c", color: "#b71c1c" },
                  padding: "8px 20px",
                  borderRadius: "9999px",
                }}
                href={directionsUrl}
                target="_blank"
              >
                Get Directions
              </Button>
            </div>
          </div>
        </motion.section>

        {/* Gallery Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-serif text-gray-900 mb-6">Gallery</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {(branch.interiorImages || []).map((imgSrc, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                className="relative rounded-lg overflow-hidden shadow-sm cursor-pointer"
                onClick={() => handlePhotoClick(imgSrc)}
              >
                <img src={imgSrc} alt={`Photo ${index + 1}`} className="w-full h-40 object-cover" />
                <div className="absolute inset-0 bg-black/10 opacity-0 hover:opacity-100 transition-opacity duration-200" />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Location Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-serif text-gray-900 mb-6">Location</h2>
          {isLoaded && coordinates ? (
            <div className="rounded-lg overflow-hidden shadow-sm">
              <GoogleMap mapContainerStyle={mapContainerStyle} center={coordinates} zoom={14}>
                <Marker position={coordinates} title={branch.name} />
              </GoogleMap>
            </div>
          ) : (
            <div className="h-[400px] bg-gray-100 flex items-center justify-center rounded-lg">
              <p className="text-gray-600 text-base">Map unavailable</p>
            </div>
          )}
        </motion.section>

        {/* Reviews Section with Pagination */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-serif text-gray-900 mb-6">Customer Reviews</h2>
          {allReviews.length > 0 ? (
            <>
              <div className="space-y-6">
                {currentReviews.map((review, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white p-5 rounded-lg shadow-sm border border-gray-100"
                  >
                    <p className="text-gray-600 text-sm font-medium mb-1">{review.userName || "Anonymous"}</p>
                    <div className="flex items-center mb-2">
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <span key={i} className={`text-lg ${i < review.rating ? "text-amber-400" : "text-gray-300"}`}>
                            ★
                          </span>
                        ))}
                    </div>
                    {review.comment && (
                      <p className="text-gray-700 text-base leading-relaxed mb-2">{review.comment}</p>
                    )}
                    <p className="text-gray-500 text-sm">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </motion.div>
                ))}
              </div>
              {/* Pagination Controls */}
              <div className="flex justify-between items-center mt-6">
                <Button
                  variant="outlined"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  sx={{
                    borderColor: "#c62828",
                    color: "#c62828",
                    "&:hover": { borderColor: "#b71c1c", color: "#b71c1c" },
                    "&:disabled": { borderColor: "#cccccc", color: "#cccccc" },
                  }}
                >
                  Previous
                </Button>
                <span className="text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outlined"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  sx={{
                    borderColor: "#c62828",
                    color: "#c62828",
                    "&:hover": { borderColor: "#b71c1c", color: "#b71c1c" },
                    "&:disabled": { borderColor: "#cccccc", color: "#cccccc" },
                  }}
                >
                  Next
                </Button>
              </div>
            </>
          ) : (
            <p className="text-gray-600 text-base">No reviews available yet.</p>
          )}
        </motion.section>
      </div>

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
            bgcolor: "#c62828",
            "&:hover": { bgcolor: "#b71c1c" },
            padding: "10px 24px",
            fontSize: "14px",
            borderRadius: "9999px",
            boxShadow: "0 3px 10px rgba(0, 0, 0, 0.2)",
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
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <div className="relative bg-white p-4 rounded-lg max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <IconButton
              onClick={handleCloseModal}
              sx={{ position: "absolute", top: 8, right: 8, color: "#c62828" }}
            >
              <CloseIcon />
            </IconButton>
            <TransformWrapper>
              {({ zoomIn, zoomOut }) => (
                <>
                  <TransformComponent>
                    <img src={selectedPhoto} alt="Enlarged" className="max-h-[80vh] w-full object-contain rounded-md" />
                  </TransformComponent>
                  <div className="flex justify-center gap-4 mt-4">
                    <IconButton
                      onClick={() => zoomIn()}
                      sx={{ bgcolor: "#f5f5f5", "&:hover": { bgcolor: "#e0e0e0" } }}
                    >
                      <ZoomInIcon sx={{ color: "#c62828" }} />
                    </IconButton>
                    <IconButton
                      onClick={() => zoomOut()}
                      sx={{ bgcolor: "#f5f5f5", "&:hover": { bgcolor: "#e0e0e0" } }}
                    >
                      <ZoomOutIcon sx={{ color: "#c62828" }} />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDownloadPhoto(selectedPhoto)}
                      sx={{ bgcolor: "#f5f5f5", "&:hover": { bgcolor: "#e0e0e0" } }}
                    >
                      <DownloadIcon sx={{ color: "#c62828" }} />
                    </IconButton>
                  </div>
                </>
              )}
            </TransformWrapper>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RestaurantDetailPage;