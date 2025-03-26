import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchBranchDetails } from "../../Api/userApi";
import { Branch } from "../../types/branch";
import { motion } from "framer-motion";
import { Button, Modal, Box, IconButton, Tooltip } from "@mui/material";
import Carousel from "react-material-ui-carousel";
import axios from "axios";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"; // For zoom functionality
import ShareIcon from "@mui/icons-material/Share";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";

const mapContainerStyle = {
  width: "100%",
  height: "300px",
};

// Modal style for enlarging photos
const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "white",
  boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
  p: 3,
  borderRadius: "12px",
  outline: "none",
  maxWidth: "90vw",
  maxHeight: "90vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 2,
};

const RestaurantDetailPage: React.FC = () => {
  const { branchId } = useParams<{ branchId: string }>();
  const navigate = useNavigate();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mapQuery, setMapQuery] = useState<string>("");
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null); // For photo modal

  const GOOGLE_MAPS_API_KEY =   "AIzaSyCmtwdLj4ezHr_PmZunPte9-bb14e4OUNU";

  // Load Google Maps JavaScript API
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    const loadBranchAndLocation = async () => {
      try {
        if (!branchId) throw new Error("No branch ID provided");
        setLoading(true);

        // Fetch branch details
        const branchData = await fetchBranchDetails(branchId);
        setBranch(branchData);

        // Log the address for debugging
        console.log("Branch Address:", branchData.address);

        // Fetch coordinates if not provided, using address
        let query = "";
        let coords: { lat: number; lng: number } | null = null;
        if (branchData.location?.coordinates) {
          query = `${branchData.location.coordinates[1]},${branchData.location.coordinates[0]}`;
          coords = {
            lat: branchData.location.coordinates[1],
            lng: branchData.location.coordinates[0],
          };
        } else if (branchData.address) {
          try {
            const geocodeResponse: any = await axios.get(
              `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(branchData.address)}&key=${GOOGLE_MAPS_API_KEY}`
            );
            console.log("Geocode Response:", geocodeResponse.data);
            if (geocodeResponse.data.status === "OK" && geocodeResponse.data.results.length > 0) {
              const { lat, lng } = geocodeResponse.data.results[0].geometry.location;
              query = `${lat},${lng}`;
              coords = { lat, lng };
            } else {
              setMapError("Unable to geocode address. Map may not display correctly.");
              query = encodeURIComponent(branchData.address || `${branchData.name}, Unknown Location`);
            }
          } catch (geocodeError) {
            console.error("Geocoding failed:", geocodeError);
            setMapError("Geocoding failed. Map may not display correctly.");
            query = encodeURIComponent(branchData.address || `${branchData.name}, Unknown Location`);
          }
        } else {
          setMapError("No address or coordinates provided. Map may not display correctly.");
          query = encodeURIComponent(`${branchData.name}, Unknown Location`);
        }
        setMapQuery(query);
        setCoordinates(coords);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Failed to load restaurant details";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    loadBranchAndLocation();
  }, [branchId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
        <div className="text-[#2c2420] text-2xl font-playfair">Loading...</div>
      </div>
    );
  }

  if (error || !branch) {
    return (
      <div className="min-h-screen bg-[#faf7f2] flex items-center justify-center">
        <div className="text-[#8b5d3b] text-xl">{error || "Restaurant not found"}</div>
      </div>
    );
  }

  const carouselImages = [branch.mainImage || "/placeholder-branch.jpg", ...(branch.interiorImages || [])];
  const interiorImages = branch.interiorImages || [];
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${mapQuery}`;

  // Handle photo click to open modal
  const handlePhotoClick = (imgSrc: string) => {
    setSelectedPhoto(imgSrc);
    console.log("Photo clicked:", imgSrc); // For debugging
  };

  // Close modal
  const handleCloseModal = () => {
    setSelectedPhoto(null);
  };

  // Download photo
  const handleDownloadPhoto = (imgSrc: string) => {
    const link = document.createElement("a");
    link.href = imgSrc;
    link.download = `photo-${Date.now()}.jpg`;
    link.click();
    console.log("Photo downloaded:", imgSrc);
  };

  // Share restaurant page
  const handleShare = async () => {
    const shareData = {
      title: branch.name,
      text: `Check out ${branch.name} at ${branch.address || "this location"}!`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy URL to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Share failed:", err);
      alert("Failed to share. Link copied to clipboard!");
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf7f2] pt-16 pb-20">
      <div className="max-w-5xl mx-auto px-6">
        {/* Main Image Carousel */}
        <motion.div
          className="relative mb-10 rounded-xl shadow-xl overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Carousel autoPlay={false} navButtonsAlwaysVisible indicators={carouselImages.length > 1}>
            {carouselImages.map((imgSrc, index) => (
              <div key={index} className="relative">
                <img src={imgSrc} alt={`${branch.name} Image ${index + 1}`} className="w-full h-[500px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2c2420]/70 to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-full p-8 text-white">
                  <h1 className="text-5xl font-playfair font-bold tracking-tight drop-shadow-xl">{branch.name}</h1>
                  <p className="text-base font-medium opacity-90 drop-shadow-md mb-3">{branch.address || "Address not available"}</p>
                  <div className="flex gap-5 text-base opacity-90">
                    <p><strong>Email:</strong> {branch.email}</p>
                    <p><strong>Phone:</strong> {branch.phone || "N/A"}</p>
                  </div>
                </div>
              </div>
            ))}
          </Carousel>
          {/* Share Button */}
          <Tooltip title="Share this restaurant">
            <IconButton
              onClick={handleShare}
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                bgcolor: "white",
                "&:hover": { bgcolor: "#f0f0f0" },
              }}
            >
              <ShareIcon sx={{ color: "#2c2420" }} />
            </IconButton>
          </Tooltip>
        </motion.div>

        {/* Photos Section (Always Visible) */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h2 className="text-3xl font-playfair font-semibold text-[#2c2420] mb-6">Photos</h2>
          {interiorImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {interiorImages.map((imgSrc, index) => (
                <div
                  key={index}
                  className="relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                  onClick={() => handlePhotoClick(imgSrc)}
                >
                  <img
                    src={imgSrc}
                    alt={`${branch.name} Photo ${index + 1}`}
                    className="w-full h-56 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2c2420]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[#8b5d3b] text-lg font-medium">No photos available.</p>
          )}
        </motion.div>

        {/* About Section (Always Visible) */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="bg-white p-8 rounded-xl shadow-xl border border-[#e8e2d9]">
            <h2 className="text-3xl font-playfair font-semibold text-[#2c2420] mb-6">About {branch.name}</h2>

            {/* Map Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-3">
                <svg className="w-6 h-6 text-[#8b5d3b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-[#2c2420] text-lg font-medium">{branch.address || "Address not available"}</p>
              </div>
              {coordinates && (
                <p className="text-[#8b5d3b] text-sm mb-3">
                  {coordinates.lat.toFixed(6)}°N {coordinates.lng.toFixed(6)}°E
                </p>
              )}
              {mapError && <p className="text-red-500 text-sm mb-3">{mapError}</p>}
              {isLoaded && coordinates ? (
                <div className="relative rounded-xl overflow-hidden shadow-lg">
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={coordinates}
                    zoom={14}
                    options={{ mapTypeId: "roadmap" }}
                  >
                    <Marker position={coordinates} title={branch.name} />
                  </GoogleMap>
                </div>
              ) : (
                <div className="w-full h-[300px] bg-gray-200 flex items-center justify-center rounded-xl">
                  <p className="text-[#8b5d3b] text-lg">Map loading...</p>
                </div>
              )}
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-4 px-8 py-3 bg-[#ff6200] text-white rounded-full font-medium text-lg hover:bg-[#e55a00] transition-all duration-300 shadow-md"
              >
                Get Directions
              </a>
            </div>

            {/* Additional Details */}
            <div className="text-[#8b5d3b] grid grid-cols-1 md:grid-cols-2 gap-6 text-lg">
              <p><strong>Address:</strong> {branch.address || "N/A"}</p>
              <p><strong>Email:</strong> {branch.email}</p>
              <p><strong>Phone:</strong> {branch.phone || "N/A"}</p>
            </div>
          </div>
        </motion.div>

        {/* Book Now Button */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Button
            variant="contained"
            sx={{
              background: "linear-gradient(to right, #8b5d3b, #2c2420)",
              color: "white",
              padding: "14px 40px",
              borderRadius: "9999px",
              fontSize: "18px",
              fontWeight: "medium",
              textTransform: "none",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.2)",
              "&:hover": { background: "linear-gradient(to right, #d4a373, #8b5d3b)", boxShadow: "0 6px 20px rgba(0, 0, 0, 0.3)" },
            }}
            onClick={() => navigate(`/book/${branch._id}`)}
          >
            Book Now
          </Button>
        </motion.div>
      </div>

      {/* Modal for Enlarged Photo */}
      <Modal open={!!selectedPhoto} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <IconButton
            onClick={handleCloseModal}
            sx={{ position: "absolute", top: 8, right: 8, color: "#2c2420" }}
          >
            <CloseIcon />
          </IconButton>
          <TransformWrapper>
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <TransformComponent>
                  <img
                    src={selectedPhoto || ""}
                    alt="Enlarged Photo"
                    style={{
                      maxWidth: "80vw",
                      maxHeight: "70vh",
                      objectFit: "contain",
                      borderRadius: "8px",
                    }}
                  />
                </TransformComponent>
                <div className="flex gap-3 mt-3">
                  <Tooltip title="Zoom In">
                    <IconButton onClick={() => zoomIn()} sx={{ bgcolor: "#f0f0f0", "&:hover": { bgcolor: "#e0e0e0" } }}>
                      <ZoomInIcon sx={{ color: "#2c2420" }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Zoom Out">
                    <IconButton onClick={() => zoomOut()} sx={{ bgcolor: "#f0f0f0", "&:hover": { bgcolor: "#e0e0e0" } }}>
                      <ZoomOutIcon sx={{ color: "#2c2420" }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Download Photo">
                    <IconButton
                      onClick={() => handleDownloadPhoto(selectedPhoto || "")}
                      sx={{ bgcolor: "#f0f0f0", "&:hover": { bgcolor: "#e0e0e0" } }}
                    >
                      <DownloadIcon sx={{ color: "#2c2420" }} />
                    </IconButton>
                  </Tooltip>
                </div>
              </>
            )}
          </TransformWrapper>
        </Box>
      </Modal>
    </div>
  );
};

export default RestaurantDetailPage;