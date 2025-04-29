import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

const UserProtected: React.FC = () => {
    const user = useSelector((state: RootState) => state.user.user);

    return user ? <Outlet /> : <Navigate to="/" replace />;
};

export default UserProtected;
