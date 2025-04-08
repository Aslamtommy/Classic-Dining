import React, { useEffect, useState } from "react";
import { fetchBranches } from "../../../Api/userApi";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

export const Gallery: React.FC = () => {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadBranches = async () => {
      try {
        setLoading(true);
        const response: any = await fetchBranches(); // Default call without search
        setBranches(response.branches); // Access nested 'branches' array
      } catch (error: any) {
        console.error("Error loading branches:", error);
        setError("Failed to load restaurants. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    loadBranches();
  }, []);

  const handleCardClick = (branchId: string) => {
    navigate(`/book/${branchId}`);
  };

  const handleNameClick = (branchId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click from triggering
    navigate(`/restaurant/${branchId}`);
  };

  return (
    <section className="px-6 py-24 bg-[#faf7f2]">
      <div className="max-w-6xl mx-auto">
        <h2 className="font-playfair text-5xl text-center mb-16 text-[#2c2420] font-bold">
          Discover Our Restaurants
        </h2>

        {loading ? (
          <p className="text-center text-[#8b5d3b]">Loading restaurants...</p>
        ) : error ? (
          <p className="text-center text-[#8b5d3b]">{error}</p>
        ) : branches.length === 0 ? (
          <p className="text-center text-[#8b5d3b]">No restaurants available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {branches.map((branch: any, index: number) => (
              <motion.div
                key={branch._id}
                className="group"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                onClick={() => handleCardClick(branch._id)} // Card click for booking
              >
                <div className="aspect-[4/5] relative overflow-hidden bg-[#e8e2d9] rounded-lg shadow-lg">
                  <img
                    src={branch.mainImage || "/placeholder-branch.jpg"}
                    alt={branch.name}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-6 bg-white rounded-b-lg shadow-lg transform -translate-y-8 transition-transform duration-300 group-hover:-translate-y-12">
                  <h3
                    className="text-2xl font-playfair font-semibold text-[#2c2420] mb-2 cursor-pointer hover:underline"
                    onClick={(e) => handleNameClick(branch._id, e)} // Name click for restaurant details
                  >
                    {branch.parentRestaurant?.name} - {branch.name}
                  </h3>
                  <p className="text-[#8b5d3b] mb-1">{branch.email}</p>
                  <p className="text-[#8b5d3b]">{branch.phone}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Gallery;