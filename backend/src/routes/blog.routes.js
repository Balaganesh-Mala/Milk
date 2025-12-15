import express from "express";
import {
  createBlog,
  getBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
} from "../controllers/blog.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

// Public routes
router.get("/", getBlogs);
router.get("/:id", getBlogById);

// Admin routes
router.post("/", protect, isAdmin, upload.single("image"), createBlog);
router.put("/:id", protect, isAdmin, upload.single("image"), updateBlog);
router.delete("/:id", protect, isAdmin, deleteBlog);

export default router;
