import React, { createContext, useState, useEffect } from "react";
import adminApi from "../api/adminAxios";
import { saveAdminToken, getAdminToken, clearAdminToken } from "../utils/token";

export const AdminAuthContext = createContext();

const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto-load admin session
  useEffect(() => {
    const token = getAdminToken();
    if (!token) return setLoading(false);

    adminApi
      .get("/admin/dashboard")
      .then((res) => {
        // No explicit admin profile returned — build from stored token info
        setAdmin({
          role: "admin",
          name: "Administrator",
        });
      })
      .catch(() => {
        clearAdminToken();
        setAdmin(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Login request
  const login = async (email, password) => {
    const res = await adminApi.post("/admin/login", { email, password });

    const { admin, token } = res.data;

    saveAdminToken(token);
    setAdmin(admin);

    return res.data;
  };

  const logout = () => {
    clearAdminToken();
    setAdmin(null);
  };

  return (
    <AdminAuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
};

export default AdminAuthProvider;
