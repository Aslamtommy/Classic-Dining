import React, { useState, useEffect, ChangeEvent } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { FaSearch, FaSortAlphaDown, FaSortAlphaUp, FaComments } from "react-icons/fa";
import { fetchBranches } from "../../Api/userApi";
import { Branch } from "../../types/branch";
import ChatWidget from "../CommonComponents/ChatWidget";
import { RootState } from "../../redux/store";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

const RestaurantListPage: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  const limit = 6;
  const navigate = useNavigate();
  const userId = useSelector((state: RootState) => state.user.user?.id);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const loadBranches = async (search: string, pageNum: number) => {
    try {
      setLoading(true);
      const response = await fetchBranches(search, pageNum, limit);
      let filteredBranches = [...response.branches];

      if (locationFilter) {
        filteredBranches = filteredBranches.filter((branch) => {
          const addressMatch = branch.address?.toLowerCase().includes(locationFilter.toLowerCase());
          const locationMatch = branch.location
            ? `${branch.location.coordinates[1]}, ${branch.location.coordinates[0]}`.toLowerCase().includes(locationFilter.toLowerCase())
            : false;
          return addressMatch || locationMatch;
        });
      }

      const sortedBranches = filteredBranches.sort((a, b) =>
        sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
      );

      setBranches(sortedBranches);
      setTotalPages(Math.ceil(filteredBranches.length / limit) || response.pages);
    } catch (error) {
      console.error("Error loading branches:", error);
      setBranches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleLocationFilterChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLocationFilter(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    loadBranches(debouncedSearchTerm.trim(), newPage);
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleChatClick = (branchId: string) => {
    setSelectedBranchId(branchId);
  };

  const handleCloseChat = () => {
    setSelectedBranchId(null);
  };

  useEffect(() => {
    loadBranches(debouncedSearchTerm.trim(), page);
  }, [debouncedSearchTerm, locationFilter, sortOrder, page]);

  useEffect(() => {
    loadBranches("", 1);
  }, []);

  return (
    <section className="min-h-screen bg-[#faf7f2] pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl md:text-5xl font-serif text-[#2c2420] font-bold text-center mb-12 relative"
        >
          Our Restaurants
          <span className="block w-16 h-1 bg-[#d4a373] mt-2 mx-auto" />
        </motion.h1>

        {/* Search, Filter, and Sort */}
        <div className="mb-12 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <div className="relative w-full max-w-md">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#8b5d3b]" />
              <input
                type="text"
                placeholder="Search by name or email"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-3 border border-[#e8e2d9] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#d4a373] text-[#2c2420] placeholder-[#8b5d3b] bg-white transition-all duration-200"
                aria-label="Search restaurants"
              />
            </div>
            <button
              onClick={toggleSortOrder}
              className="flex items-center gap-2 px-4 py-2 bg-[#8b5d3b] text-white rounded-md hover:bg-[#d4a373] transition-all duration-200 shadow-sm"
              aria-label={`Sort by name ${sortOrder === "asc" ? "descending" : "ascending"}`}
            >
              {sortOrder === "asc" ? <FaSortAlphaDown /> : <FaSortAlphaUp />}
              <span className="text-sm font-medium">Sort by Name</span>
            </button>
          </div>

          <div className="flex justify-center items-center gap-4">
            <label className="text-[#2c2420] text-sm font-medium">Location:</label>
            <input
              type="text"
              placeholder="e.g., New York"
              value={locationFilter}
              onChange={handleLocationFilterChange}
              className="px-4 py-2 border border-[#e8e2d9] rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#d4a373] text-[#2c2420] placeholder-[#8b5d3b] bg-white w-64 transition-all duration-200"
              aria-label="Filter by location"
            />
          </div>
        </div>

        {/* Branches Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-[#8b5d3b] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : branches.length === 0 ? (
          <p className="text-center text-[#8b5d3b] text-lg font-medium">No restaurants found.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {branches.map((branch, index) => (
                <motion.div
                  key={branch._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden border border-[#e8e2d9] hover:shadow-xl hover:border-[#d4a373] transition-all duration-300"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <div className="relative h-48">
                    <img
                      src={branch.mainImage || "/placeholder-branch.jpg"}
                      alt={branch.name}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2c2420]/60 to-transparent" />
                  </div>
                  <div className="p-5">
                    <h3
                      className="text-xl font-serif text-[#2c2420] font-semibold mb-2 cursor-pointer hover:text-[#8b5d3b] transition-colors duration-200"
                      onClick={() => navigate(`/restaurant/${branch._id}`)}
                    >
                      {branch.name}
                    </h3>
                    <p className="text-[#8b5d3b] text-sm mb-1">{branch.email}</p>
                    <p className="text-[#8b5d3b] text-sm mb-1">{branch.phone || "N/A"}</p>
                    <p className="text-[#8b5d3b] text-sm mb-1">{branch.address || "N/A"}</p>
                    {branch.location && (
                      <p className="text-[#8b5d3b] text-sm mb-3">
                        Lat: {branch.location.coordinates[1]}, Long: {branch.location.coordinates[0]}
                      </p>
                    )}
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => navigate(`/book/${branch._id}`)}
                        className="px-4 py-2 bg-[#8b5d3b] text-white rounded-md hover:bg-[#d4a373] transition-all duration-200 text-sm font-medium shadow-sm"
                        aria-label={`Book at ${branch.name}`}
                      >
                        Book Now
                      </button>
                      <button
                        onClick={() => handleChatClick(branch._id)}
                        className="px-4 py-2 bg-[#2c2420] text-white rounded-md hover:bg-[#d4a373] transition-all duration-200 text-sm font-medium flex items-center gap-1 shadow-sm"
                        aria-label={`Chat with ${branch.name}`}
                      >
                        <FaComments /> Chat
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-10 flex justify-center items-center gap-4">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 bg-[#8b5d3b] text-white rounded-md hover:bg-[#d4a373] disabled:bg-[#e8e2d9] disabled:text-[#2c2420] transition-all duration-200"
                aria-label="Previous page"
              >
                Previous
              </button>
              <span className="text-[#2c2420] font-medium">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 bg-[#8b5d3b] text-white rounded-md hover:bg-[#d4a373] disabled:bg-[#e8e2d9] disabled:text-[#2c2420] transition-all duration-200"
                aria-label="Next page"
              >
                Next
              </button>
            </div>
          </>
        )}

        {selectedBranchId && userId && (
          <ChatWidget userId={userId} branchId={selectedBranchId} onClose={handleCloseChat} />
        )}
      </div>
    </section>
  );
};

export default RestaurantListPage;