import express from "express";

import {
  getAllUsers,
  getMyProfile,
  updateUserProfile,
  updateAvatar,
  addToWishlist,
  removeFromWishlist,
  saveAddress,
  setDefaultAddress,
  addWalletBalance,
  deductWalletBalance,
  getMySubscriptions, addSubscription, cancelSubscription
} from "../controllers/user.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import { upload } from "../middleware/upload.middleware.js"; // avatar upload

const router = express.Router();

/* ===============================
      ADMIN ROUTES
================================ */
router.get("/", protect, isAdmin, getAllUsers);

/* ===============================
      USER PROFILE ROUTES
================================ */

// Get Profile
router.get("/me", protect, getMyProfile);

// Update Profile
router.put("/update", protect, updateUserProfile);

// Update Avatar (single image upload)
router.put(
  "/avatar",
  protect,
  upload.single("avatar"),
  updateAvatar
);

/* ===============================
      WISHLIST ROUTES
================================ */
router.post("/wishlist/add", protect, addToWishlist);
router.post("/wishlist/remove", protect, removeFromWishlist);

/* ===============================
      ADDRESS ROUTES
================================ */

// Save or update first address
router.put("/address", protect, saveAddress);

// Change default address
router.put("/address/default", protect, setDefaultAddress);

/* ===============================
      WALLET ROUTES
================================ */
router.post("/wallet/add", protect, addWalletBalance);
router.post("/wallet/deduct", protect, deductWalletBalance);

/* ===============================
      SUBSCRIPTION ROUTES
================================ */
router.get("/subscriptions", protect, getMySubscriptions);
router.post("/subscription/add", protect, addSubscription);
router.post("/subscription/cancel", protect, cancelSubscription);

export default router;
