import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Payment from "../models/payment.model.js"; // make sure this exists
import dotenv from "dotenv";

dotenv.config();

/**
 * ===================================
 * 🔐 ADMIN LOGIN
 * ===================================
 */
export const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password required");
  }

  const admin = await User.findOne({ email, role: "admin" }).select("+password");

  if (!admin) {
    res.status(401);
    throw new Error("Admin not found");
  }

  const matched = await admin.matchPassword(password);
  if (!matched) {
    res.status(401);
    throw new Error("Invalid admin credentials");
  }

  const token = admin.generateAuthToken();

  res.status(200).json({
    success: true,
    message: "Admin login successful",
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    },
    token
  });
});



/**
 * ===================================
 * 📌 REGISTER ADMIN (Protected by SECRET KEY)
 * ===================================
 */
export const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, secretKey } = req.body;

  if (!name || !email || !password || !secretKey) {
    res.status(400);
    throw new Error("All fields are required");
  }

  if (secretKey !== process.env.ADMIN_SECRET_KEY) {
    res.status(403);
    throw new Error("Unauthorized admin creation");
  }

  const existing = await User.findOne({ email });
  if (existing) {
    res.status(400);
    throw new Error("Admin already exists");
  }

  const admin = await User.create({
    name,
    email,
    password,
    role: "admin",
  });

  res.status(201).json({
    success: true,
    message: "Admin registered successfully",
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
    token: admin.generateAuthToken(),
  });
});



/**
 * ===================================
 * 📊 DASHBOARD STATS
 * ===================================
 */
export const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments({ role: "user" });
  const totalOrders = await Order.countDocuments();
  const totalProducts = await Product.countDocuments();

  const totalRevenue = await Payment.aggregate([
    { $match: { status: "paid" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue: totalRevenue[0]?.total || 0,
    },
  });
});



/**
 * ===================================
 * 📅 MONTHLY REVENUE
 * ===================================
 */
export const getMonthlyRevenue = asyncHandler(async (req, res) => {
  const result = await Payment.aggregate([
    { $match: { status: "paid" } },
    {
      $group: {
        _id: {
          month: { $month: "$createdAt" },
          year: { $year: "$createdAt" },
        },
        total: { $sum: "$amount" },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  const formatted = result.map((d) => ({
    month: `${d._id.month}-${d._id.year}`,
    total: d.total,
  }));

  res.status(200).json({ success: true, monthlyRevenue: formatted });
});



/**
 * ===================================
 * ⭐ TOP SELLING PRODUCTS
 * ===================================
 */
export const getTopProducts = asyncHandler(async (req, res) => {
  const data = await Order.aggregate([
    { $unwind: "$orderItems" },
    {
      $group: {
        _id: "$orderItems.productId",
        totalSold: { $sum: "$orderItems.quantity" },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $project: {
        name: "$product.name",
        images: "$product.images",
        totalSold: 1,
      },
    },
  ]);

  res.status(200).json({ success: true, topProducts: data });
});



/**
 * ===================================
 * 📦 GET ALL ORDERS
 * ===================================
 */
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .populate("orderItems.productId", "name price images")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, orders });
});



/**
 * ===================================
 * 👥 GET ALL USERS
 * ===================================
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ role: "user" }).select("-password");
  res.status(200).json({ success: true, users });
});



/**
 * ===================================
 * 🚚 UPDATE ORDER STATUS
 * ===================================
 */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const { id } = req.params;

  const order = await Order.findById(id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.orderStatus = status;
  await order.save();

  res.status(200).json({
    success: true,
    message: "Order status updated successfully",
    order,
  });
});


export const getAllActiveSubscriptions = asyncHandler(async (req, res) => {
  const users = await User.find(
    { "subscriptions.status": "active" },
    {
      name: 1,
      email: 1,
      phone: 1,
      subscriptions: 1
    }
  )
    .populate("subscriptions.product", "name images price variants")
    .lean();

  // Flatten response for admin UI
  let activeSubs = [];

  users.forEach((user) => {
    user.subscriptions.forEach((sub) => {
      if (sub.status === "active") {
        activeSubs.push({
          userId: user._id,
          userName: user.name,
          userPhone: user.phone,
          userEmail: user.email,

          subscriptionId: sub._id,
          product: sub.product,
          plan: sub.plan,
          variantSize: sub.variantSize,
          nextDeliveryDate: sub.nextDeliveryDate,
          createdAt: sub.createdAt,
        });
      }
    });
  });

  res.status(200).json({
    success: true,
    total: activeSubs.length,
    activeSubscriptions: activeSubs,
  });
});