import express from "express";
import {
  createBanner,
  getActiveBanners,
  getAllBanners,
  updateBanner,
  deleteBanner,
} from "../controllers/banner.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import { upload } from "../middleware/upload.middleware.js";


const router = express.Router();

// Public
router.get("/home", getActiveBanners);

// Admin
router.get("/", protect, isAdmin, getAllBanners);
router.post(
  "/",
  protect,
  isAdmin,
  upload.array("image", 1), // handle one file
  createBanner
);
router.put(
  "/:id",
  protect,
  isAdmin,
  upload.array("image", 1),
  updateBanner
);
router.delete("/:id", protect, isAdmin, deleteBanner);

export default router;
