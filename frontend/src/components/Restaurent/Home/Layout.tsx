import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";  

const Layout = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 p-6 ml-72 bg-[#f8f1ea] overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;