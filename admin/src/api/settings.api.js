import api from "./axios";

export const getPublicSettings = () => api.get("/settings/public");
