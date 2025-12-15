// src/api/order.api.js
import api from "./axios";

// 🟧 CREATE ORDER (COD or Online - Step 1)
export const createOrderApi = async (orderData) => {
  return await api.post("/orders", orderData);
};

// 🟧 VERIFY PAYMENT (Online - Step 2)
export const verifyPaymentApi = async (data) => {
  return await api.post("/orders/verify", data);
};

// 🟩 GET USER ORDERS
export const getMyOrdersApi = async () => {
  return await api.get("/orders/my-orders");
};

// 🟥 ADMIN: GET ALL ORDERS
export const getAllOrdersApi = async () => {
  return await api.get("/orders");
};

// 🟨 ADMIN: UPDATE ORDER STATUS
export const updateOrderStatusApi = async (id, status) => {
  return await api.put(`/orders/${id}/status`, { status });
};

// 🟧 ADMIN: DELETE ORDER
export const deleteOrderApi = async (id) => {
  return await api.delete(`/orders/${id}`);
};
