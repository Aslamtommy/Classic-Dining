import {Navigate, Outlet} from "react-router-dom";
import {useSelector} from "react-redux";
import { RootState } from "../../redux/store";

const AdminProtected: React.FC = () => {
     const admin = useSelector((state: RootState) => state.admin);

     return admin.email ? <Outlet /> : <Navigate to={"/admin/login"} />;
};
export default AdminProtected;