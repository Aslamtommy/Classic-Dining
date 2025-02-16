// src/components/BranchManagement/Branches.tsx
import   { useEffect, useState } from "react";
 import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { fetchBranches } from "../../Api/restaurentApi";

const Branches = () => {
  const [branches, setBranches] = useState([]);
  const { restaurent } = useSelector((state: RootState) => state.restaurent);
  const navigate = useNavigate();

  useEffect(() => {
    const getBranches = async () => {
      try {
        const response :any= await fetchBranches();
        setBranches(response.data);
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to fetch branches");
      }
    };

    getBranches();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Branches</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map((branch: any) => (
          <div key={branch._id} className="bg-white p-4 rounded shadow-md">
            <h3 className="text-xl font-semibold">{branch.name}</h3>
            <p className="text-gray-600">{branch.email}</p>
            <p className="text-gray-600">{branch.phone}</p>
            {branch.image && (
              <img
                src={branch.image}
                alt={branch.name}
                className="mt-2 rounded"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Branches;