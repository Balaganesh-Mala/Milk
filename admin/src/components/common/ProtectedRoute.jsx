import React, { useContext } from "react";
import { AdminAuthContext } from "../../context/AdminAuthContext.jsx";
import { Navigate, useLocation } from "react-router-dom";
import Loader from "../../components/common/Loader";

const AdminProtectedRoute = ({ children }) => {
  const { admin, loading } = useContext(AdminAuthContext);
  const location = useLocation();

  if (loading) return <Loader />;

  if (!admin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // authorization: ensure role is admin
  if (admin?.role !== "admin") {
    return <div className="p-6">Access denied. Admins only.</div>;
  }

  return children;
};

export default AdminProtectedRoute;
