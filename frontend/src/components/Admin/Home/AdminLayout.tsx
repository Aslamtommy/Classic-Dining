import { Outlet } from "react-router-dom";
import { AdminSiderbar } from "./AdminSiderbar";

export function AdminLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar (fixed) */}
      <div className="fixed left-0 top-0 h-screen">
        <AdminSiderbar />
      </div>

      {/* Main content area with padding to account for sidebar */}
      <main className="flex-1 ml-[280px] p-4 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
