import React, { useState, useEffect, ChangeEvent } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaSearch, FaSortAlphaDown, FaSortAlphaUp, FaComments } from "react-icons/fa";
import { fetchBranches } from "../../Api/userApi";
import { Branch } from "../../types/branch";
import ChatWidget from "../CommonComponents/ChatWidget";
import { RootState } from "../../redux/store";

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Define props for better type safety (optional since it's a page component)
interface RestaurantListPageProps {}

const RestaurantListPage: React.FC<RestaurantListPageProps> = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  const limit = 10;
  const navigate = useNavigate();
  const userId = useSelector((state: RootState) => state.user.user?.id);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Log userId on mount
  useEffect(() => {
    console.log("RestaurantListPage mounted - userId from Redux:", userId);
  }, [userId]);

  // Load branches with error handling
  const loadBranches = async (search: string, pageNum: number) => {
    try {
      setLoading(true);
      const response = await fetchBranches(search, pageNum, limit);
      const sortedBranches = [...response.branches].sort((a, b) =>
        sortOrder === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name)
      );
      setBranches(sortedBranches);
      setTotalPages(response.pages);
    } catch (error: unknown) {
      console.error("Error loading branches:", error);
      setBranches([]); // Reset branches on error
    } finally {
      setLoading(false);
    }
  };

  // Handle search input change
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadBranches(debouncedSearchTerm.trim(), newPage);
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    loadBranches(debouncedSearchTerm.trim(), page);
  };

  // Load branches on search or page change
  useEffect(() => {
    loadBranches(debouncedSearchTerm.trim(), page);
  }, [debouncedSearchTerm, page]);

  // Initial load
  useEffect(() => {
    loadBranches("", 1);
  }, []);

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

  // Log ChatWidget props
  useEffect(() => {
    if (selectedBranchId && userId) {
      console.log("ChatWidget will render with:", { userId, branchId: selectedBranchId });
    }
  }, [selectedBranchId, userId]);

  return (
    <section className="min-h-screen bg-[#faf7f2] pt-16 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-playfair text-5xl md:text-6xl text-[#2c2420] font-extrabold tracking-tight text-center mb-12"
        >
          Discover Our Restaurants
        </motion.h1>

        {/* Search and Sort */}
        <div className="mb-12 flex flex-col sm:flex-row justify-center items-center gap-6">
          <div className="relative w-full max-w-lg">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8b5d3b] text-lg" />
            <input
              type="text"
              placeholder="Search branches by name or email..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-[#e8e2d9] focus:outline-none focus:ring-2 focus:ring-[#8b5d3b] text-[#2c2420] placeholder-[#8b5d3b] shadow-md transition-all duration-300"
            />
          </div>
          <button
            onClick={toggleSortOrder}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#8b5d3b] to-[#2c2420] text-white rounded-2xl hover:opacity-90 transition-all duration-300 shadow-md"
          >
            {sortOrder === "asc" ? <FaSortAlphaDown /> : <FaSortAlphaUp />}
            <span className="text-sm uppercase tracking-wide">Sort by Name</span>
          </button>
        </div>

        {/* Branches Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-[#8b5d3b] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : branches.length === 0 ? (
          <p className="text-center text-[#8b5d3b] text-lg font-medium">No branches found.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {branches.map((branch, index) => (
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
                    <p className="text-[#8b5d3b] mb-2 text-sm">{branch.email}</p>
                    <p className="text-[#8b5d3b] mb-4 text-sm">{branch.phone || "N/A"}</p>
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

            {/* Pagination */}
            <div className="mt-12 flex justify-center items-center gap-6">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-6 py-2 bg-gradient-to-r from-[#8b5d3b] to-[#2c2420] text-white rounded-full hover:opacity-90 disabled:bg-[#e8e2d9] disabled:text-[#8b5d3b] transition-all duration-300 shadow-md"
              >
                Previous
              </button>
              <span className="text-[#2c2420] font-medium text-lg">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-6 py-2 bg-gradient-to-r from-[#8b5d3b] to-[#2c2420] text-white rounded-full hover:opacity-90 disabled:bg-[#e8e2d9] disabled:text-[#8b5d3b] transition-all duration-300 shadow-md"
              >
                Next
              </button>
            </div>
          </>
        )}

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

export default RestaurantListPage;