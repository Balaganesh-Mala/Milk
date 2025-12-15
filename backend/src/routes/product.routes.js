import express from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addReview,
  deleteReview,
} from "../controllers/product.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

/**
 * =====================
 * PUBLIC / USER ROUTES
 * =====================
 */
router.get("/", getAllProducts);
router.get("/:id", getProductById);

// only logged in users can review
router.post("/:id/review", protect, addReview);

/**
 * =====================
 * ADMIN ROUTES
 * =====================
 */

// Create product (supports images & variants)
router.post(
  "/",
  protect,
  isAdmin,
  upload.array("images", 6),  // ✔ Cloudinary image upload
  createProduct
);

// Update product (images optional, subscription fields allowed)
router.put(
  "/:id",
  protect,
  isAdmin,
  upload.array("images", 6),
  updateProduct
);

// Delete product
router.delete("/:id", protect, isAdmin, deleteProduct);

// Delete review
router.delete(
  "/:productId/review/:reviewId",
  protect,
  isAdmin,
  deleteReview
);

export default router;
