import type React from "react";

import Sidebar from "../../components/Restaurent/Home/Sidebar";
 
import { Outlet } from "react-router-dom";

const RestaurentDashboard: React.FC = () => {
    return (
      <div className="flex h-screen bg-sepia-100">
        <Sidebar  />
        <div className="flex flex-col flex-1 overflow-hidden">
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-sepia-50 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    )
  }
  
  export default RestaurentDashboard