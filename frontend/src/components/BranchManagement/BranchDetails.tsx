// src/components/BranchManagement/BranchDetails.tsx
import   { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
 
import TableManagement from '../Restaurent/TableManagement';
import restaurentApi from '../../Axios/restaurentInstance';
import toast from 'react-hot-toast';

const BranchDetails = () => {
  const { branchId } = useParams();
  const [branch, setBranch] = useState<any>(null);
 
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBranchDetails = async () => {
      try {
        const response = await restaurentApi.get(`/branches/${branchId}`);
        setBranch(response.data);
      } catch (error) {
        toast.error('Failed to load branch details');
        navigate('/restaurent/branches');
      }
    };
    
    if (branchId) {
      fetchBranchDetails();
    }
  }, [branchId, navigate]);

  if (!branch) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-800 mb-4"
        >
          ← Back to Branches
        </button>
        <h1 className="text-3xl font-bold">{branch.name}</h1>
        <p className="text-gray-600 mt-2">{branch.address}</p>
      </div>
      
      <TableManagement branchId={branchId!} />
    </div>
  );
};

export default BranchDetails;