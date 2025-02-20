
import Sidebar from "../Siderbar";
import { Outlet } from "react-router-dom";
const UserLayout = () => {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 flex-1">
          <Outlet /> {/* This will render the nested routes */}
        </div>
      </div>
    );
  };

  export default  UserLayout