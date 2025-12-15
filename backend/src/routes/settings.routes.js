import express from "express";
import { getSettings, updateSettings } from "../controllers/settings.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/admin.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = express.Router();

router.get("/public", getSettings); 

// GET settings
router.get("/", protect, isAdmin, getSettings);

// UPDATE settings + logo upload
router.put("/", protect, isAdmin, upload.single("logo"), updateSettings);

export default router;
