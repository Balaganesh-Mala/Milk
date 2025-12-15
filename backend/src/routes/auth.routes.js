import express from "express";
import {
  registerUser,
  loginUser,
  getProfile,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();



// Register (email or phone allowed)
router.post("/register", registerUser);

// Login (email or phone allowed)
router.post("/login", loginUser);

// Get logged-in profile
router.get("/profile", protect, getProfile);

export default router;
