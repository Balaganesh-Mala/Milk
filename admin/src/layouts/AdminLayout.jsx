import { Outlet } from "react-router-dom";
import { useState } from "react";
import AdminSidebar from "../components/admin/AdminSidebar";
import AdminNavbar from "../components/admin/AdminNavbar";

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex bg-gray-100 min-h-screen">

      {/* SIDEBAR */}
      <AdminSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      {/* NAVBAR */}
      <AdminNavbar toggleSidebar={toggleSidebar} />

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-0 md:ml-64 mt-16 p-6 overflow-auto h-[calc(100vh-64px)]">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;

