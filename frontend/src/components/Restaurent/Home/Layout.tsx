import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar" 

const Layout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6">
        <Outlet />  
      </main>
    </div>
  );
};

export default Layout;
