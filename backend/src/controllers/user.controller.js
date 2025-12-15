import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import cloudinary from "../config/cloudinary.js";
import { uploadToCloudinary } from "../middleware/upload.middleware.js";
import Product from "../models/product.model.js"; // for wishlist validation


export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password");
  res.status(200).json({ success: true, users });
});


export const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) throw new Error("User not found");

  res.status(200).json({ success: true, user });
});


export const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) throw new Error("User not found");

  const { name, phone } = req.body;

  // Prevent duplicate phone
  if (phone && phone !== user.phone) {
    const exists = await User.findOne({ phone });
    if (exists) throw new Error("Phone already in use");
  }

  user.name = name || user.name;
  user.phone = phone || user.phone;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user,
  });
});


export const updateAvatar = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new Error("User not found");

  if (!req.file) {
    throw new Error("Avatar file required");
  }

  // Upload new image
  const upload = await uploadToCloudinary(req.file, "avatars");

  // Delete old one (optional)
  if (user.avatar?.public_id) {
    await cloudinary.uploader.destroy(user.avatar.public_id);
  }

  user.avatar = upload;
  await user.save();

  res.status(200).json({
    success: true,
    avatar: user.avatar,
  });
});

// =======================================
// 💖 Add to Wishlist
// =======================================
export const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) throw new Error("User not found");

  const productExists = await Product.findById(productId);
  if (!productExists) throw new Error("Product not found");

  if (user.wishlist.includes(productId)) {
    throw new Error("Product already in wishlist");
  }

  user.wishlist.push(productId);
  await user.save();

  res.status(200).json({
    success: true,
    message: "Added to wishlist",
    wishlist: user.wishlist,
  });
});

// =======================================
// 💔 Remove From Wishlist
// =======================================
export const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) throw new Error("User not found");

  user.wishlist = user.wishlist.filter(
    (id) => id.toString() !== productId
  );

  await user.save();

  res.status(200).json({
    success: true,
    message: "Removed from wishlist",
    wishlist: user.wishlist,
  });
});

// =======================================
// 🏠 Add New Address / Update Existing
// =======================================
export const saveAddress = asyncHandler(async (req, res) => {
  const { street, city, state, pincode, phone, isDefault } = req.body;

  let user = await User.findById(req.user.id);

  if (!user) throw new Error("User not found");

  // If no address exists --> push first as default
  if (user.addresses.length === 0) {
    user.addresses.push({
      street,
      city,
      state,
      pincode,
      phone,
      isDefault: true,
    });
  } else {
    // Update first address (simple logic)
    const addr = user.addresses[0];

    addr.street = street || addr.street;
    addr.city = city || addr.city;
    addr.state = state || addr.state;
    addr.pincode = pincode || addr.pincode;
    addr.phone = phone || addr.phone;

    // allow user to switch default
    if (isDefault !== undefined) {
      user.addresses.forEach((a) => (a.isDefault = false));
      addr.isDefault = true;
    }
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: "Address saved successfully",
    addresses: user.addresses,
  });
});

// =======================================
// 🔄 Set Address as Default
// =======================================
export const setDefaultAddress = asyncHandler(async (req, res) => {
  const { addressIndex } = req.body;

  const user = await User.findById(req.user.id);

  if (!user) throw new Error("User not found");

  if (addressIndex < 0 || addressIndex >= user.addresses.length) {
    throw new Error("Invalid address index");
  }

  user.addresses.forEach((a, i) => {
    a.isDefault = i === addressIndex;
  });

  await user.save();

  res.status(200).json({
    success: true,
    message: "Default address updated",
    addresses: user.addresses,
  });
});

// =======================================
// 💳 Wallet Management
// =======================================
export const addWalletBalance = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    throw new Error("Invalid amount");
  }

  const user = await User.findById(req.user.id);
  if (!user) throw new Error("User not found");

  user.wallet += Number(amount);

  await user.save();

  res.status(200).json({
    success: true,
    message: `₹${amount} added to wallet`,
    wallet: user.wallet,
  });
});

export const deductWalletBalance = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) throw new Error("User not found");

  if (amount > user.wallet) {
    throw new Error("Insufficient wallet balance");
  }

  user.wallet -= Number(amount);
  await user.save();

  res.status(200).json({
    success: true,
    message: `₹${amount} deducted successfully`,
    wallet: user.wallet,
  });
});

// ------------------- Get user's subscriptions -------------------
export const getMySubscriptions = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate({
    path: "subscriptions.product",
    select: "name images variants price stock",
  });
  if (!user) throw new Error("User not found");

  res.status(200).json({
    success: true,
    subscriptions: user.subscriptions || [],
  });
});

// ------------------- Add subscription (basic) -------------------
export const addSubscription = asyncHandler(async (req, res) => {
  const { productId, variantSize, plan, nextDeliveryDate } = req.body;

  if (!productId || !plan) {
    res.status(400);
    throw new Error("productId and plan are required");
  }

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const user = await User.findById(req.user.id);
  if (!user) throw new Error("User not found");

  // Prevent duplicate active subscription for same product+variant+plan
  const exists = user.subscriptions.find(
    (s) =>
      s.product.toString() === productId.toString() &&
      (s.variantSize || "") === (variantSize || "") &&
      s.plan === plan &&
      s.status === "active"
  );

  if (exists) {
    res.status(400);
    throw new Error("You already have an active subscription for this product/plan");
  }

  const subscription = {
    product: productId,
    variantSize: variantSize || null,
    plan,
  };

  if (nextDeliveryDate) {
    const nd = new Date(nextDeliveryDate);
    if (!isNaN(nd)) subscription.nextDeliveryDate = nd;
  }

  user.subscriptions.push(subscription);
  await user.save();

  // populate the newly added subscription product for response
  await user.populate({
    path: "subscriptions.product",
    select: "name images variants price",
  });

  res.status(200).json({
    success: true,
    message: "Subscription added (basic)",
    subscriptions: user.subscriptions,
  });
});

// ------------------- Cancel subscription -------------------
export const cancelSubscription = asyncHandler(async (req, res) => {
  const { subId } = req.body;
  if (!subId) {
    res.status(400);
    throw new Error("subId is required");
  }

  const user = await User.findById(req.user.id);
  if (!user) throw new Error("User not found");

  const sub = user.subscriptions.id(subId);
  if (!sub) {
    res.status(404);
    throw new Error("Subscription not found");
  }

  // either remove or set status to cancelled
  sub.status = "cancelled";
  await user.save();

  res.status(200).json({
    success: true,
    message: "Subscription cancelled",
    subscriptions: user.subscriptions,
  });
});
