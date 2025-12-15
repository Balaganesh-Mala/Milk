import api from "./axios";

// ADD ITEM TO CART
export const addToCartApi = async (productId, qty = 1) => {
  return await api.post("/cart/add", {
    productId,
    quantity: qty,
  });
};

// GET USER CART
export const getCartApi = async () => {
  return await api.get("/cart");
};

// UPDATE CART ITEM QUANTITY
export const updateCartItemApi = async (productId, quantity) => {
  return await api.put("/cart/update", {
    productId,
    quantity,
  });
};

// REMOVE ITEM FROM CART (correct format)
export const removeFromCartApi = async (productId) => {
  return await api.delete(`/cart/remove/${productId}`);
};

// CLEAR CART
export const clearCartApi = async () => {
  return await api.delete("/cart/clear");
};
