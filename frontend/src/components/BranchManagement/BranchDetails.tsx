import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TableManagement from "../Restaurent/TableManagement";
import restaurentApi from "../../Axios/restaurentInstance";
import toast from "react-hot-toast";
import { Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmationDialog from "../CommonComponents/ConfirmationDialog";

const BranchDetails = () => {
  const { branchId } = useParams();
  const [branch, setBranch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBranchDetails = async () => {
      try {
        const response: any = await restaurentApi.get(`/branches/${branchId}`);
        setBranch(response.data.data);
      } catch (error) {
        toast.error("Failed to load branch details");
        navigate("/restaurent/branches");
      } finally {
        setLoading(false);
      }
    };

    if (branchId) {
      fetchBranchDetails();
    }
  }, [branchId, navigate]);

  const handleDeleteBranch = async () => {
    try {
      await restaurentApi.delete(`/branches/${branchId}`);
      toast.success("Branch deleted successfully");
      navigate("/restaurent/branches");
    } catch (error) {
      toast.error("Failed to delete branch");
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-600">Loading branch details...</div>;
  }

  if (!branch) {
    return <div className="p-6 text-red-500">Branch not found</div>;
  }

  return (
    <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-800 mb-6 transition-colors duration-200"
        >
          ← Back to Branches
        </button>

        {/* Branch Details */}
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{branch.name}</h1>
              <p className="text-gray-600 mt-2">{branch.address}</p>

              <div className="mt-4 space-y-2 text-gray-700">
                <p>
                  <strong>Email:</strong> {branch.email}
                </p>
                <p>
                  <strong>Phone:</strong> {branch.phone}
                </p>
                <p>
                  <strong>Created At:</strong>{" "}
                  {new Date(branch.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                variant="contained"
                color="primary"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/restaurent/branches/edit/${branchId}`)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all"
              >
                Edit
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
                className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all"
              >
                Delete
              </Button>
            </div>
          </div>

          {/* Branch Image */}
          {branch.image && (
            <div className="mt-6">
              <img
                src={branch.image}
                alt={branch.name}
                className="rounded-lg w-full h-64 object-cover shadow-md"
              />
            </div>
          )}
        </div>

        {/* Table Management */}
        <div className="mt-8">
          <TableManagement branchId={branchId!} />
        </div>

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          open={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onConfirm={handleDeleteBranch}
          title="Delete Branch"
          message="Are you sure you want to delete this branch? This action cannot be undone."
        />
      </div>
    </div>
  );
};

export default BranchDetails;