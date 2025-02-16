import { RootState } from "../../redux/store";
import { useSelector } from "react-redux";
import { Navigate,Outlet } from "react-router-dom";


const RestaurentProtected:React.FC=()=>{
    const {restaurent}=useSelector((state:RootState)=>state.restaurent)
    return restaurent?. _id ?<Outlet /> : <Navigate to={"/restaurent/login"} />
}

export default RestaurentProtected