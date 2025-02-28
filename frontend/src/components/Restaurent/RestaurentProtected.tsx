import { RootState } from "../../redux/store";
import { useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useEffect } from "react";

const RestaurentProtected: React.FC = () => {
  const { restaurent } = useSelector((state: RootState) => state.restaurent);
  const navigate = useNavigate();

  const isRestaurant = restaurent?.role === "restaurent";

  useEffect(() => {
    if (!restaurent) {
      
      return 
    }
    if (!isRestaurant) {
      toast.error("You don't have permission to access this page.", {
 
      });
      navigate(-1 as any, { replace: true });
    }
  }, [isRestaurant, navigate, restaurent]);

  return isRestaurant ? <Outlet /> : null;
};

export default RestaurentProtected;