import express from "express";
import {
  createPaymentOrder,
  verifyPayment,
  recordFailedPayment,
  getUserPayments,
  getAllPayments,
} from "../controllers/payment.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";

const router = express.Router();

// User
router.post("/create-order", protect, createPaymentOrder);
router.post("/verify", protect, verifyPayment);
router.post("/failed", protect, recordFailedPayment);
router.get("/my-payments", protect, getUserPayments);

// Admin
router.get("/", protect, isAdmin, getAllPayments);

export default router;
