import { RootState } from "../../redux/store";
import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useEffect } from "react";

const BranchProtected: React.FC = () => {
  const { restaurent } = useSelector((state: RootState) => state.restaurent);
  const navigate = useNavigate();

  // Check if the user is a branch
  const isBranch = restaurent?.role === "branch";

  useEffect(() => {
     if (!restaurent) return; 
    if (!isBranch) {
      toast.error("You don't have permission to access this page.", {
 
      });
      // Redirect to the previous page
      navigate(-1 as any, { replace: true });  
    }
  }, [isBranch, navigate]);

 
  return isBranch ? <Outlet /> : null;
};

export default BranchProtected;