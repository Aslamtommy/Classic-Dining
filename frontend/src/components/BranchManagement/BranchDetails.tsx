// src/components/BranchManagement/BranchDetails.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TableManagement from '../Restaurent/TableManagement';
import restaurentApi from '../../Axios/restaurentInstance';
import toast from 'react-hot-toast';
import { Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ConfirmationDialog from '../CommonComponents/ConfirmationDialog';
const BranchDetails = () => {
  const { branchId } = useParams();
  const [branch, setBranch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBranchDetails = async () => {
      try {
        const response :any= await restaurentApi.get(`/branches/${branchId}`);
        setBranch(response.data.data);
      } catch (error) {
        toast.error('Failed to load branch details');
        navigate('/restaurent/branches');
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
      toast.success('Branch deleted successfully');
      navigate('/restaurent/branches');
    } catch (error) {
      toast.error('Failed to delete branch');
    }
  };

  if (loading) {
    return <div className="p-6">Loading branch details...</div>;
  }

  if (!branch) {
    return <div className="p-6">Branch not found</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Branches
        </button>
        
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{branch.name}</h1>
            <p className="text-gray-600 mt-2">{branch.address}</p>
            
            <div className="mt-4 space-y-2">
              <p><strong>Email:</strong> {branch.email}</p>
              <p><strong>Phone:</strong> {branch.phone}</p>
              <p><strong>Created At:</strong> {new Date(branch.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex gap-2">
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

        {branch.image && (
          <div className="mt-6">
            <img
              src={branch.image}
              alt={branch.name}
              className="rounded-lg max-w-full h-64 object-cover"
            />
          </div>
        )}
      </div>
      
      <TableManagement branchId={branchId!} />

      <ConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteBranch}
        title="Delete Branch"
        message="Are you sure you want to delete this branch? This action cannot be undone."
      />
    </div>
  );
};

export default BranchDetails;