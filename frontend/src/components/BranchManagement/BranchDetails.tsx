import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TableManagement from "../Restaurent/TableManagement";
import restaurentApi from "../../Axios/restaurentInstance";
import toast from "react-hot-toast";
import { Button, CircularProgress } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ConfirmationDialog from "../CommonComponents/ConfirmationDialog";
import { Branch } from "../../types/branch";
import { BranchResponse } from "../../types/branch";
import Carousel from "react-material-ui-carousel";

const BranchDetails: React.FC = () => {
  const { branchId } = useParams<{ branchId: string }>();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBranchDetails = async () => {
      if (!branchId) {
        toast.error("Branch ID is missing");
        return;
      }
      setLoading(true);
      try {
        const response = await restaurentApi.get<BranchResponse>(`/branches/${branchId}`);
        setBranch(response.data.data);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to load branch details");
        navigate("/restaurent/branches");
      } finally {
        setLoading(false);
      }
    };
    fetchBranchDetails();
  }, [branchId, navigate]);

  const handleDeleteBranch = async () => {
    try {
      await restaurentApi.delete(`/branches/${branchId}`);
      toast.success("Branch deleted successfully");
      navigate("/restaurent/branches");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete branch");
    }
  };

  if (loading) return (
    <div className="p-6 flex justify-center items-center">
      <CircularProgress />
    </div>
  );
  if (!branch) return <div className="p-6 text-red-500">Branch not found</div>;

  const images = [
    branch.mainImage || "/placeholder-branch.jpg",
    ...(branch.interiorImages || []),
  ];

  return (
    <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-800 mb-6 transition-colors duration-200"
        >
          ← Back to Branches
        </button>
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="flex flex-col md:flex-row justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{branch.name}</h1>
              <p className="text-gray-600 mt-2">{branch.address}</p>
              <div className="mt-4 space-y-2 text-gray-700">
                <p><strong>Email:</strong> {branch.email}</p>
                <p><strong>Phone:</strong> {branch.phone || "Not provided"}</p>
                <p><strong>Created At:</strong> {new Date(branch.createdAt!).toLocaleDateString()}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button
                variant="contained"
                color="primary"
                startIcon={<EditIcon />}
                onClick={() => navigate(`/restaurent/branches/edit/${branchId}`)}
              >
                Edit
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete
              </Button>
            </div>
          </div>
          {images.length > 0 && (
            <div className="mt-6">
              <Carousel
                autoPlay={false}
                navButtonsAlwaysVisible
                indicators={images.length > 1}
                className="rounded-lg shadow-md"
              >
                {images.map((imgSrc, index) => (
                  <img
                    key={index}
                    src={imgSrc}
                    alt={`${branch.name} Image ${index + 1}`}
                    className="w-full max-h-96 object-cover rounded-lg"
                  />
                ))}
              </Carousel>
            </div>
          )}
        </div>
        <div className="mt-8">
          <TableManagement branchId={branchId!} />
        </div>
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