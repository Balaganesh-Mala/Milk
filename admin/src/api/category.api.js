import adminApi from "./adminAxios";
import userApi from "./axios";

// 👉 User: Get all categories
const categoryApi = () => userApi.get("/categories");
export default categoryApi;

// 👉 Admin: Get all categories
export const getAllCategoriesApi = () => adminApi.get("/categories");

// 👉 Admin: Create
export const createCategoryApi = (data) =>
  adminApi.post("/categories", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// 👉 Admin: Update
export const updateCategoryApi = (id, data) =>
  adminApi.put(`/categories/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// 👉 Admin: Delete
export const deleteCategoryApi = (id) =>
  adminApi.delete(`/categories/${id}`);
