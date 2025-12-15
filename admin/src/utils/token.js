export const saveAdminToken = (token) => {
  localStorage.setItem("admin_token", token);
};

export const getAdminToken = () => localStorage.getItem("admin_token");

export const clearAdminToken = () => localStorage.removeItem("admin_token");
