
import Sidebar from "../Siderbar";
import { Outlet } from "react-router-dom";
import Header from  '../../User/Home/Header';
const UserLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header fixed at the top */}
      <Header />

      {/* Container for Sidebar and Content */}
      <div className="flex flex-1">
        {/* Sidebar fixed on the left, below Header */}
        <Sidebar />

        {/* Main content area */}
        <main className="flex-1 ml-72 pt-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Outlet /> {/* Renders nested routes */}
          </div>
        </main>
      </div>
    </div>
  );
  };

  export default  UserLayout