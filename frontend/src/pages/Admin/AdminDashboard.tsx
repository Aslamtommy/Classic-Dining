import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { adminLogout } from "../../redux/adminSlice";
import { AdminSiderbar } from "../../components/Admin/Home/AdminSiderbar";
import adminApi from "../../Axios/adminInstance";

const AdminDashboard: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { email, loading, error } = useSelector((state: RootState) => state.admin);

  const handleLogout = async () => {
    console.log("Logging out admin...");
    try {
      await adminApi.post('/logout');
      await dispatch(adminLogout());
      console.log("Admin logged out successfully");
      window.location.href = "/admin/login";
    } catch (err) {
      console.error("Error during logout:", err);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-gray-900 antialiased">
      {/* Sidebar */}
      <AdminSiderbar />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto p-8">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-gray-600">
              Welcome back! Here's what's happening with your projects.
            </p>
          </header>

          {/* Dashboard Content */}
          <div className="text-center mt-8">
            <h1 className="text-3xl font-bold text-gray-800">Welcome to Admin Dashboard</h1>
            {email ? (
              <p className="mt-4 text-lg text-gray-700">
                Logged in as: <strong className="text-blue-600">{email}</strong>
              </p>
            ) : (
              <p className="mt-4 text-lg text-red-500">No admin email found.</p>
            )}
            {error && <p className="mt-4 text-red-500">{error}</p>}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="mt-6 px-6 py-2 bg-red-500 text-white rounded-lg shadow-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
              disabled={loading}
            >
              {loading ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;