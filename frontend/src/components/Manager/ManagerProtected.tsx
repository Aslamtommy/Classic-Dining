import { RootState } from "../../redux/store";
import { useSelector } from "react-redux";
import { Navigate,Outlet } from "react-router-dom";


const ManagerProtected:React.FC=()=>{
    const {manager}=useSelector((state:RootState)=>state.manager)
    return manager?. _id ?<Outlet /> : <Navigate to={"/manager/login"} />
}

export default ManagerProtected