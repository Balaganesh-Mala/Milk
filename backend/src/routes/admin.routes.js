import express from "express";
import {
  registerAdmin,
  adminLogin,
  getDashboardStats,
  getMonthlyRevenue,
  getTopProducts,
  getAllOrders,
  getAllUsers,
  updateOrderStatus,
  getAllActiveSubscriptions,
} from "../controllers/admin.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

// Register admin (requires secret key in body)
router.post("/register", registerAdmin);

// Admin login
router.post("/login", adminLogin);

// Main stats tiles (users, products, orders, revenue)
router.get("/dashboard", protect, isAdmin, getDashboardStats);

// Monthly sales graph
router.get("/revenue", protect, isAdmin, getMonthlyRevenue);

// Best products list for leaderboard
router.get("/top-products", protect, isAdmin, getTopProducts);

// All orders with user and product info
router.get("/orders", protect, isAdmin, getAllOrders);

// Change order status (Processing → Shipped → Delivered etc.)
router.put("/order/:id/status", protect, isAdmin, updateOrderStatus);

// Fetch all customer accounts
router.get("/users", protect, isAdmin, getAllUsers);

router.get("/subscriptions/active", protect, isAdmin, getAllActiveSubscriptions);

export default router;
