import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Button } from "@mui/material";
import restaurentApi from "../../Axios/restaurentInstance";
import ConfirmationDialog from "../CommonComponents/ConfirmationDialog";

const Branches = () => {
  const [branches, setBranches] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
  const navigate = useNavigate();

// src/components/Restaurent/Branches.tsx
useEffect(() => {
  const getBranches = async () => {
    try {
      const response :any= await restaurentApi.get('/allbranches');
      if (response.data.success) {
        setBranches(response.data.data);
      }
    } catch (error: any) {
      // Handle 403 error specifically
      if (error.response?.status === 403) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.response?.data?.message || "Failed to fetch branches");
      }
    }
  };
  getBranches();
}, []);

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
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Deletion failed");
      }
    }
    setOpenDialog(false);
    setSelectedBranchId(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Branches</h2>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/restaurent/addbranch")}
        >
          Add New Branch
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map((branch: any) => (
          <div
            key={branch._id}
            className="bg-white p-4 rounded shadow-md relative hover:shadow-lg transition-shadow"
          >
            {/* Delete Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(branch._id);
              }}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700"
            >
              ✕
            </button>

            <div onClick={() => navigate(`/restaurent/branches/${branch._id}`)}>
              <h3 className="text-xl font-semibold">{branch.name}</h3>
              <p className="text-gray-600">{branch.email}</p>
              <p className="text-gray-600">{branch.phone}</p>
              {branch.image && (
                <img
                  src={branch.image}
                  alt={branch.name}
                  className="mt-2 rounded h-32 w-full object-cover"
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Branch"
        message="Are you sure you want to delete this branch? This action cannot be undone."
      />
    </div>
  );
};

export default Branches;