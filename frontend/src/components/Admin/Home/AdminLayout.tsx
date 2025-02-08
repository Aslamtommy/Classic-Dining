import { Outlet } from "react-router-dom";
import { AdminSiderbar } from "./AdminSiderbar";

export function AdminLayout() {
  return (
    <div className="flex">
      {/* Sidebar (always visible) */}
      <AdminSiderbar />

      {/* Main content area that changes with navigation */}
      <main className="flex-1 p-4">
        <Outlet />
      </main>
    </div>
  );
}
