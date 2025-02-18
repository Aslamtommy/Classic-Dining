// src/components/BranchManagement/Branches.tsx
import { useEffect, useState } from "react";
 
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchBranches } from "../../Api/userApi";
import { Button } from "@mui/material";

const Branches = () => {
  const [branches, setBranches] = useState([]);
 
  const navigate = useNavigate();

  useEffect(() => {
    const getBranches = async () => {
      try {
        const response: any = await fetchBranches();
        setBranches(response.data);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to fetch branches");
      }
    };
    getBranches();
  }, []);

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
            className="bg-white p-4 rounded shadow-md cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate(`/restaurent/branches/${branch._id}`)}
          >
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
        ))}
      </div>
    </div>
  );
};

export default Branches;