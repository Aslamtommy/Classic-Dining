import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "@mui/material";
import restaurentApi from "../../Axios/restaurentInstance";
import ConfirmationDialog from "../CommonComponents/ConfirmationDialog";
import { FaSearch } from "react-icons/fa";
import { motion } from "framer-motion";
import { debounce } from "../../utils/CustomDebounce";

const Branches = () => {
  const [branches, setBranches] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 6;
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const getBranches = async () => {
      try {
        setLoading(true);
        const response: any = await restaurentApi.get("/allbranches");
        if (response.data.success) {
          setBranches(response.data.data);
        }
      } catch (error: any) {
        if (error.response?.status === 403) {
          toast.error(error.response.data.message);
        } else {
          toast.error(error.response?.data?.message || "Failed to fetch branches");
        }
      } finally {
        setLoading(false);
      }
    };
    getBranches();
  }, []);

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearchTerm(value);
      setPage(1);
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const filteredBranches = branches.filter(
    (branch: any) =>
      branch.name.toLowerCase().includes(searchTerm.trim().toLowerCase()) ||
      branch.email.toLowerCase().includes(searchTerm.trim().toLowerCase())
  );

  const totalPages = Math.ceil(filteredBranches.length / limit);
  const currentBranches = filteredBranches.slice((page - 1) * limit, page * limit);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleDeleteClick = (branchId: string) => {
    setSelectedBranchId(branchId);
    setOpenDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (selectedBranchId) {
      try {
        await restaurentApi.delete(`/branches/${selectedBranchId}`);
        toast.success("Branch deleted successfully");
        setBranches((prev) => prev.filter((b: any) => b._id !== selectedBranchId));
        if (currentBranches.length === 1 && page > 1) setPage(page - 1);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Deletion failed");
      }
    }
    setOpenDialog(false);
    setSelectedBranchId(null);
  };

  return (
    <section className="min-h-screen bg-[#faf7f2] pt-16 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-playfair text-5xl text-[#2c2420] font-extrabold tracking-tight text-center mb-12"
        >
          Your Branches
        </motion.h2>

        <div className="mb-12 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="relative w-full max-w-lg">
            <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8b5d3b] text-lg" />
            <input
              type="text"
              placeholder="Search branches by name or email..."
              onChange={handleSearchChange}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-[#e8e2d9] focus:outline-none focus:ring-2 focus:ring-[#8b5d3b] text-[#2c2420] placeholder-[#8b5d3b] shadow-md transition-all duration-300"
            />
          </div>
          <Button
            variant="contained"
            onClick={() => navigate("/restaurent/addbranch")}
            sx={{
              background: "linear-gradient(to right, #8b5d3b, #2c2420)",
              color: "#fff",
              borderRadius: "16px",
              padding: "8px 20px",
              textTransform: "uppercase",
              fontWeight: "bold",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              "&:hover": { background: "linear-gradient(to right, #2c2420, #8b5d3b)", opacity: 0.9 },
            }}
          >
            Add New Branch
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-[#8b5d3b] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : currentBranches.length === 0 ? (
          <p className="text-center text-[#8b5d3b] text-lg font-medium">No branches found.</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentBranches.map((branch: any) => (
                <motion.div
                  key={branch._id}
                  className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-500 border border-[#e8e2d9]"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="relative h-64">
                    <img
                      src={branch.mainImage || "/placeholder-branch.jpg"}
                      alt={branch.name}
                      className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2c2420]/60 to-transparent opacity-75 group-hover:opacity-90 transition-opacity duration-300" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(branch._id);
                      }}
                      className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition-colors text-xl font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  <div
                    className="p-6 text-center cursor-pointer"
                    onClick={() => navigate(`/restaurent/branches/${branch._id}`)}
                  >
                    <h3 className="text-2xl font-playfair text-[#2c2420] mb-3 font-semibold tracking-tight">
                      {branch.name}
                    </h3>
                    <p className="text-[#8b5d3b] mb-2 text-sm">{branch.email}</p>
                    <p className="text-[#8b5d3b] mb-2 text-sm">{branch.phone}</p>
                    <p className="text-[#8b5d3b] mb-4 text-sm">{branch.address}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="mt-12 flex justify-center items-center gap-6">
              <Button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                variant="contained"
                sx={{
                  background: "linear-gradient(to right, #8b5d3b, #2c2420)",
                  color: "#fff",
                  borderRadius: "16px",
                  padding: "8px 20px",
                  textTransform: "uppercase",
                  fontWeight: "bold",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  "&:hover": { background: "linear-gradient(to right, #2c2420, #8b5d3b)", opacity: 0.9 },
                  "&.Mui-disabled": { background: "#e8e2d9", color: "#8b5d3b" },
                }}
              >
                Previous
              </Button>
              <span className="text-[#2c2420] font-medium text-lg">
                Page {page} of {totalPages}
              </span>
              <Button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                variant="contained"
                sx={{
                  background: "linear-gradient(to right, #8b5d3b, #2c2420)",
                  color: "#fff",
                  borderRadius: "16px",
                  padding: "8px 20px",
                  textTransform: "uppercase",
                  fontWeight: "bold",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  "&:hover": { background: "linear-gradient(to right, #2c2420, #8b5d3b)", opacity: 0.9 },
                  "&.Mui-disabled": { background: "#e8e2d9", color: "#8b5d3b" },
                }}
              >
                Next
              </Button>
            </div>
          </>
        )}

        <ConfirmationDialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Branch"
          message="Are you sure you want to delete this branch? This action cannot be undone."
        />
      </div>
    </section>
  );
};

export default Branches;