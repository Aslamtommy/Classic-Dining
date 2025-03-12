import { RootState } from "../../redux/store";
import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useEffect } from "react";

const RestaurentProtected: React.FC = () => {
  const { restaurent, role } = useSelector((state: RootState) => state.restaurent); // Add role here
  const navigate = useNavigate();

  console.log("Role from state:", role); // Debug role
  console.log("Restaurent object:", restaurent); // Debug restaurent

  const isRestaurant = role === "restaurent"; // Use role directly

  useEffect(() => {
    if (!restaurent) {
      return;
    }
    if (!isRestaurant) {
      toast.error("You don't have permission to access this page.");
      
       navigate("/restaurent/login");
    }
  }, [isRestaurant, navigate, restaurent]);

  return isRestaurant ? <Outlet /> : null;
};

export default RestaurentProtected;