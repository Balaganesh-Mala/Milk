import api from "./axios";

// GET MY PROFILE
export const getMyProfileApi = () => api.get("/auth/profile");
export const updateProfileApi = (data) => api.put("/auth/update", data);
export const updateAddressApi = (data) => api.put("/auth/address", data);


// ADD TO WISHLIST
export const addToWishlistApi = (productId) =>
  api.post("/auth/wishlist/add", { productId });

// REMOVE FROM WISHLIST
export const removeFromWishlistApi = (productId) =>
  api.post("/auth/wishlist/remove", { productId });
