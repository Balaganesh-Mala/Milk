import API from "./axios";

/* ------------------------- AUTH ------------------------- */
export const registerUser = (data) => API.post("/auth/register", data);
export const loginUser = (data) => API.post("/auth/login", data);
export const fetchProfile = () => API.get("/auth/profile");
export const updateProfile = (data) => API.put("/users/update", data);

/* ------------------------- AVATAR ------------------------- */
export const updateAvatar = (file) =>
  API.put("/users/avatar", file, {
    headers: { "Content-Type": "multipart/form-data" },
  });

/* ------------------------- WISHLIST ------------------------- */
export const addWishlist = (productId) =>
  API.post("/users/wishlist/add", { productId });

export const removeWishlist = (productId) =>
  API.post("/users/wishlist/remove", { productId });

/* ------------------------- ADDRESS ------------------------- */
export const saveAddress = (data) => API.put("/users/address", data);

export const setDefaultAddress = (addressId) =>
  API.put("/users/address/default", { addressId });

/* ------------------------- WALLET ------------------------- */
export const addWalletBalance = (amount) =>
  API.post("/users/wallet/add", { amount });

export const deductWalletBalance = (amount) =>
  API.post("/users/wallet/deduct", { amount });

/* ---------- SUBSCRIPTION ---------- */
export const addSubscription = (data) =>
  API.post("/users/subscription/add", data, {
    headers: { "Content-Type": "application/json" },
  });

export const cancelSubscription = (data) =>
  API.post("/users/subscription/cancel", data, {
    headers: { "Content-Type": "application/json" },
  });

export const fetchMySubscriptions = () => API.get("/users/subscriptions");


/* ------------------------- CATEGORY ------------------------- */
export const getCategories = () => API.get("/categories");

/* ------------------------- BANNERS ------------------------- */
export const fetchBanners = () => API.get("/banners/home");

export const adminGetBanners = () => API.get("/banners");

export const adminCreateBanner = (data) =>
  API.post("/banners", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const adminUpdateBanner = (id, data) =>
  API.put(`/banners/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const adminDeleteBanner = (id) => API.delete(`/banners/${id}`);

/* ------------------------- PRODUCT ------------------------- */
export const fetchProducts = (params) =>
  API.get("/products", { params });

export const fetchProductById = (id) =>
  API.get(`/products/${id}`);

/* ------------------------- CART (FULLY FIXED) ------------------------- */

// Get user cart
export const fetchCart = () => API.get("/cart");

// Add item to cart
export const addToCart = (productId, quantity = 1, variant = null, isSubscription = false) =>
  API.post("/cart/add", {
    productId,
    quantity,
    variant, // { size: "1L" } or null
    isSubscription,
  });

// Update quantity
export const updateCartItem = (productId, quantity, variantSize = null) =>
  API.put("/cart/update", {
    productId,
    quantity,
    variantSize,
  });

// Remove item
export const removeCartItem = (productId, variantSize = null) =>
  API.delete("/cart/remove", {
    data: { productId, variantSize },
  });

// Create new order
export const createOrder = (data) => API.post("/orders", data);

// Get logged-in user's orders
export const getMyOrders = () => API.get("/orders/my-orders");

// ⭐ Get a single order by ID (needed for OrderDetails page)
export const getOrderById = (id) => API.get(`/orders/${id}`);
/* ------------------------- PAYMENT ------------------------- */
export const createPaymentOrder = (data) =>
  API.post("/payment/create-order", data);

export const verifyPayment = (data) =>
  API.post("/payment/verify", data);

export const failedPayment = (data) =>
  API.post("/payment/failed", data);

export const getMyPayments = () => API.get("/payment/my-payments");
