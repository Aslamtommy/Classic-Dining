import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast, Toaster } from "react-hot-toast";
import restaurentApi from "../../Axios/restaurentInstance";

interface Branch {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  mainImage?: string;
  interiorImages?: string[];
  location: {
    type: string;
    coordinates: [number, number];
  };
  parentRestaurant: string;
  createdAt: string;
  updatedAt: string;
}

const BranchProfile: React.FC = () => {
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBranchProfile = async () => {
      try {
        const response: any = await restaurentApi.get("/branch/profile");
        setBranch(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || "Failed to load profile");
        toast.error(err.response?.data?.message || "Failed to load profile", {
          duration: 4000,
          position: "top-center",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBranchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#faf7f2] to-[#e8e2d9] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-[#2c2420] text-2xl font-serif"
        >
          Loading Your Profile...
        </motion.div>
      </div>
    );
  }

  if (error || !branch) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#faf7f2] to-[#e8e2d9] flex items-center justify-center">
        <div className="text-[#8b5d3b] text-xl font-sans">{error || "Profile not found"}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#faf7f2] to-[#e8e2d9] pt-16 pb-12">
      <Toaster />
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-playfair text-[#2c2420] font-bold tracking-tight">
            {branch.name}
          </h1>
          <p className="text-lg text-[#8b5d3b] mt-2 font-sans italic">
            A Taste of Elegance
          </p>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-8 flex flex-col md:flex-row gap-8"
        >
          {/* Left: Main Image */}
          {branch.mainImage && (
            <div className="md:w-1/2">
              <img
                src={branch.mainImage}
                alt={`${branch.name} Main`}
                className="w-full h-80 object-cover rounded-lg shadow-md transition-transform duration-300 hover:scale-105"
              />
            </div>
          )}

          {/* Right: Details */}
          <div className="md:w-1/2 space-y-6">
            <div className="border-b border-[#e8e2d9] pb-4">
              <h2 className="text-2xl font-serif text-[#2c2420] font-semibold">Branch Details</h2>
              <p className="text-[#8b5d3b] text-sm mt-2">
                Established:{" "}
                {new Date(branch.createdAt).toLocaleString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-[#2c2420] text-base">
                <span className="font-medium">Email:</span>{" "}
                <span className="text-[#8b5d3b]">{branch.email}</span>
              </p>
              <p className="text-[#2c2420] text-base">
                <span className="font-medium">Phone:</span>{" "}
                <span className="text-[#8b5d3b]">{branch.phone}</span>
              </p>
              <p className="text-[#2c2420] text-base">
                <span className="font-medium">Address:</span>{" "}
                <span className="text-[#8b5d3b]">{branch.address}</span>
              </p>
              <p className="text-[#2c2420] text-base">
                <span className="font-medium">Location:</span>{" "}
                <span className="text-[#8b5d3b]">
                  Lat: {branch.location.coordinates[1]}, Lng: {branch.location.coordinates[0]}
                </span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Interior Images */}
        {branch.interiorImages && branch.interiorImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12"
          >
            <h3 className="text-2xl font-serif text-[#2c2420] font-semibold mb-6 text-center">
              Our Ambiance
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {branch.interiorImages.map((img, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative group"
                >
                  <img
                    src={img}
                    alt={`Interior ${index + 1}`}
                    className="w-full h-56 object-cover rounded-lg shadow-md transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-300 rounded-lg" />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <button
            onClick={() => navigate("/branch/dashboard")}
            className="px-6 py-3 bg-[#8b5d3b] text-white rounded-full font-sans text-lg hover:bg-[#2c2420] transition-colors shadow-md"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default BranchProfile;