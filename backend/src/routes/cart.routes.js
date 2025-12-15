import express from "express";
import {
  addToCart,
  getUserCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cart.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * 🛒 User Cart Routes (Protected)
 * --------------------------------
 */

router.post("/add", protect, addToCart);          // add item
router.get("/", protect, getUserCart);            // fetch cart
router.put("/update", protect, updateCartItem);   // update qty
router.delete("/remove", protect, removeFromCart);// remove item
router.delete("/clear", protect, clearCart);      // clear all

export default router;
