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

  useEffect(() => {
    const getBranches = async () => {
      try {
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
    <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Branches</h2>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/restaurent/addbranch")}
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all"
          >
            Add New Branch
          </Button>
        </div>

        {/* Branch Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map((branch: any) => (
            <div
              key={branch._id}
              className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer relative"
            >
              {/* Delete Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(branch._id);
                }}
                className="absolute top-4 right-4 text-red-500 hover:text-red-700 transition-colors"
              >
                ✕
              </button>

              {/* Branch Details */}
              <div onClick={() => navigate(`/restaurent/branches/${branch._id}`)}>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{branch.name}</h3>
                <p className="text-gray-600 mb-1">{branch.email}</p>
                <p className="text-gray-600 mb-4">{branch.phone}</p>
                {branch.image && (
                  <img
                    src={branch.image}
                    alt={branch.name}
                    className="mt-2 rounded-lg h-40 w-full object-cover"
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
    </div>
  );
};

export default Branches;