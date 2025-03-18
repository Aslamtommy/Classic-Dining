import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaComments } from "react-icons/fa";
import api from "../../Axios/userInstance";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api"; // Fallback to Marker
import ChatWidget from "../CommonComponents/ChatWidget";
import { RootState } from "../../redux/store"; // Adjust path to your store

const GOOGLE_MAPS_API_KEY = "AIzaSyCmtwdLj4ezHr_PmZunPte9-bb14e4OUNU";

const mapContainerStyle = {
  width: "100%", // Full width within its container
  height: "500px", // Professional height
};

const RestaurantSearch = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [allBranches, setAllBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  const navigate = useNavigate();
  const userId = useSelector((state: RootState) => state.user.user?.id);

  // Fetch all branches on component mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response: any = await api.get("/branches");
        console.log("Branches Response:", response.data);
        const branches = Array.isArray(response.data.data?.branches) ? response.data.data.branches : [];
        setAllBranches(branches);
      } catch (error: any) {
        toast.error("Failed to load branches.");
        console.error("Error:", error.response?.data || error);
        setAllBranches([]);
      }
    };
    fetchBranches();
  }, []);

  // Calculate distance between two lat/lng points (in kilometers)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          searchByLocation(latitude, longitude);
        },
        (error) => {
          toast.error("Failed to get your location. Please enable permissions.");
          console.error(error);
          setLoading(false);
        }
      );
    } else {
      toast.error("Geolocation is not supported by your browser.");
    }
  };

  // Search branches by user's location
  const searchByLocation = (lat: number, lng: number) => {
    if (!Array.isArray(allBranches)) {
      toast.error("Branch data is invalid.");
      setRestaurants([]);
      setLoading(false);
      return;
    }

    const nearby = allBranches
      .map((branch) => ({
        ...branch,
        distance: calculateDistance(lat, lng, branch.location.coordinates[1], branch.location.coordinates[0]),
      }))
      .filter((branch) => branch.distance <= 5)
      .sort((a, b) => a.distance - b.distance);
    setRestaurants(nearby);
    setMapCenter({ lat, lng });
    setLoading(false);
    if (nearby.length === 0) {
      toast.error("No branches found near your location.");
    }
  };

  // Search branches by address (string match with geocode fallback)
  const handleAddressSearch = async () => {
    if (!searchQuery.trim()) {
      setRestaurants([]);
      return;
    }

    setLoading(true);
    console.log("allBranches before filter:", allBranches);
    if (!Array.isArray(allBranches)) {
      toast.error("Branch data is invalid.");
      setRestaurants([]);
      setLoading(false);
      return;
    }

    const filtered = allBranches.filter((branch) =>
      branch.address.toLowerCase().includes(searchQuery.toLowerCase())
    );
    console.log("Filtered branches:", filtered);

    if (filtered.length > 0) {
      setRestaurants(filtered);
      setMapCenter({
        lat: filtered[0].location.coordinates[1],
        lng: filtered[0].location.coordinates[0],
      });
    } else {
      try {
        const geocodeResponse: any = await axios.get(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(searchQuery)}&key=${GOOGLE_MAPS_API_KEY}`
        );
        console.log("Geocode Response:", geocodeResponse.data);

        if (geocodeResponse.data.status === "OK" && geocodeResponse.data.results.length > 0) {
          const { lat, lng } = geocodeResponse.data.results[0].geometry.location;
          const nearby = allBranches
            .map((branch) => ({
              ...branch,
              distance: calculateDistance(lat, lng, branch.location.coordinates[1], branch.location.coordinates[0]),
            }))
            .filter((branch) => branch.distance <= 5)
            .sort((a, b) => a.distance - b.distance);
          setRestaurants(nearby);
          setMapCenter({ lat, lng });
          if (nearby.length === 0) {
            toast.error("No branches found near this address.");
          }
        } else {
          toast.error("Could not find this address.");
          setRestaurants([]);
        }
      } catch (error: any) {
        toast.error("Failed to search address.");
        console.error("Error:", error.response?.data || error);
        setRestaurants([]);
      }
    }
    setLoading(false);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleAddressSearch();
  };

  // Handle chat button click
  const handleChatClick = (branchId: string) => {
    console.log("Chat button clicked - Selected branchId:", branchId, "userId:", userId);
    setSelectedBranchId(branchId);
  };

  // Handle closing the chat widget
  const handleCloseChat = () => {
    console.log("Closing ChatWidget for branchId:", selectedBranchId);
    setSelectedBranchId(null);
  };

  return (
    <section className="min-h-screen bg-[#faf7f2] pt-16 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-playfair text-5xl md:text-6xl text-[#2c2420] font-extrabold tracking-tight text-center mb-12"
        >
          Find Our Branches
        </motion.h1>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="mb-12 flex flex-col sm:flex-row justify-center items-center gap-6">
          <div className="relative w-full max-w-lg">
            <input
              type="text"
              placeholder="Enter an address (e.g., new york)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-4 py-3 rounded-2xl bg-white border border-[#e8e2d9] focus:outline-none focus:ring-2 focus:ring-[#8b5d3b] text-[#2c2420] placeholder-[#8b5d3b] shadow-md transition-all duration-300"
            />
          </div>
          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading || allBranches.length === 0}
              className="px-6 py-2 bg-gradient-to-r from-[#8b5d3b] to-[#2c2420] text-white rounded-full hover:opacity-90 transition-all duration-300 shadow-md disabled:bg-[#e8e2d9] disabled:text-[#8b5d3b]"
            >
              {loading ? "Searching..." : "Search by Address"}
            </button>
            <button
              type="button"
              onClick={getUserLocation}
              disabled={loading || allBranches.length === 0}
              className="px-6 py-2 bg-gradient-to-r from-[#8b5d3b] to-[#2c2420] text-white rounded-full hover:opacity-90 transition-all duration-300 shadow-md disabled:bg-[#e8e2d9] disabled:text-[#8b5d3b]"
            >
              {loading ? "Locating..." : "Use My Location"}
            </button>
          </div>
        </form>

        {/* Main Content: Branches and Map */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Branch List */}
          <div className="lg:w-3/5">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-12 h-12 border-4 border-[#8b5d3b] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : restaurants.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {restaurants.map((branch, index) => (
                  <motion.div
                    key={branch._id}
                    className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer border border-[#e8e2d9]"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div className="relative h-64">
                      <img
                        src={branch.image || "/placeholder-branch.jpg"}
                        alt={branch.name}
                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#2c2420]/60 to-transparent opacity-75 group-hover:opacity-90 transition-opacity duration-300" />
                    </div>
                    <div className="p-6 text-center">
                      <h3 className="text-2xl font-playfair text-[#2c2420] mb-3 font-semibold tracking-tight">
                        {branch.name}
                      </h3>
                      <p className="text-[#8b5d3b] mb-2 text-sm">{branch.address}</p>
                      {branch.distance !== undefined && (
                        <p className="text-[#8b5d3b] mb-4 text-sm">Distance: {branch.distance.toFixed(2)} km</p>
                      )}
                      <div className="flex justify-center gap-4">
                        <button
                          onClick={() => navigate(`/book/${branch._id}`)}
                          className="px-6 py-2 bg-gradient-to-r from-[#8b5d3b] to-[#2c2420] text-white rounded-full font-medium hover:opacity-90 transition-all duration-300 shadow-md"
                        >
                          Book Now
                        </button>
                        <button
                          onClick={() => handleChatClick(branch._id)}
                          className="px-6 py-2 bg-gradient-to-r from-[#8b5d3b] to-[#2c2420] text-white rounded-full font-medium hover:opacity-90 transition-all duration-300 shadow-md"
                        >
                          <FaComments className="inline-block mr-2" /> Chat
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : searchQuery && !loading ? (
              <p className="text-center text-[#8b5d3b] text-lg font-medium">No branches found for this address.</p>
            ) : !loading && (
              <p className="text-center text-[#8b5d3b] text-lg font-medium">No branches available yet.</p>
            )}
          </div>

          {/* Map Display */}
          {restaurants.length > 0 && mapCenter && (
            <div className="lg:w-2/5">
              <div className="bg-white rounded-2xl shadow-lg border border-[#e8e2d9] p-4">
                <h3 className="text-xl font-semibold text-[#2c2420] mb-4 text-center">Location Map</h3>
                <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
                  <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={mapCenter}
                    zoom={12}
                  >
                    {restaurants.map((branch) => (
                      <Marker
                        key={branch._id}
                        position={{
                          lat: branch.location.coordinates[1],
                          lng: branch.location.coordinates[0],
                        }}
                        title={branch.name}
                      />
                    ))}
                    {userLocation && (
                      <Marker
                        position={userLocation}
                        title="Your Location"
                        icon={{
                          url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                        }}
                      />
                    )}
                  </GoogleMap>
                </LoadScript>
              </div>
            </div>
          )}
        </div>

        {/* Chat Widget */}
        {selectedBranchId && userId && (
          <ChatWidget
            userId={userId}
            branchId={selectedBranchId}
            onClose={handleCloseChat}
          />
        )}
      </div>
    </section>
  );
};

export default RestaurantSearch;