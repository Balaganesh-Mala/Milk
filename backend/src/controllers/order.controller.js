import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import Cart from "../models/cart.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import { razorpay } from "../config/razorpay.js";

/* ---------------------------------------------------------
   Helper: Load Products Fast
--------------------------------------------------------- */
const loadProductsMap = async (orderItems) => {
  const ids = orderItems.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: ids } }).lean();

  const map = new Map();
  products.forEach((p) => map.set(String(p._id), p));
  return map;
};

/* ---------------------------------------------------------
   Helper: Validate Stock + Build Final Items
--------------------------------------------------------- */
const buildFinalOrderItems = async (orderItems) => {
  const productMap = await loadProductsMap(orderItems);

  let finalItems = [];
  let itemsPrice = 0;

  for (const item of orderItems) {
    const product = productMap.get(String(item.productId));

    if (!product) throw new Error(`Product not found: ${item.productId}`);

    // Detect correct stock (variant or base)
    let availableStock = product.stock;
    let finalPrice = product.price;

    if (item.variant?.size && product.variants?.length > 0) {
      const variant = product.variants.find(
        (v) => v.size === item.variant.size
      );

      if (!variant) {
        throw new Error(`Variant "${item.variant.size}" not found for ${product.name}`);
      }

      availableStock = variant.stock;
      finalPrice = variant.price;
    }

    // Stock validation
    if (availableStock < item.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    finalItems.push({
      productId: product._id,
      name: product.name,
      image: product.images?.[0]?.url || "",
      quantity: item.quantity,
      price: finalPrice,
      variant: item.variant ?? null,
      isSubscription: item.isSubscription ?? false,
    });

    itemsPrice += finalPrice * item.quantity;
  }

  return { finalItems, itemsPrice };
};

/* ---------------------------------------------------------
   CREATE ORDER (COD / Online)
--------------------------------------------------------- */
export const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (!orderItems || !orderItems.length) {
    res.status(400);
    throw new Error("Order items required");
  }
  if (!shippingAddress) {
    res.status(400);
    throw new Error("Shipping address required");
  }

  // Build items + validate stock + calculate price
  const { finalItems, itemsPrice } = await buildFinalOrderItems(orderItems);

  /* ---------------------------------------------------------
     CASH ON DELIVERY FLOW
  --------------------------------------------------------- */
  if (paymentMethod === "COD") {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const [newOrder] = await Order.create(
        [
          {
            user: req.user._id,
            orderItems: finalItems,
            itemsPrice,
            totalPrice: itemsPrice,
            shippingAddress,
            paymentMethod: "COD",
            paymentStatus: "Pending",
            orderStatus: "Processing",
          },
        ],
        { session }
      );

      /* ------------ DECREASE STOCK (normal + variants) ------------ */
      const stockOps = finalItems.map((item) => {
        if (item.variant?.size) {
          // variant stock decrease
          return {
            updateOne: {
              filter: {
                _id: item.productId,
                "variants.size": item.variant.size,
              },
              update: {
                $inc: { "variants.$.stock": -item.quantity },
              },
            },
          };
        } else {
          // base stock decrease
          return {
            updateOne: {
              filter: { _id: item.productId },
              update: { $inc: { stock: -item.quantity } },
            },
          };
        }
      });

      await Product.bulkWrite(stockOps, { session });

      // Clear user cart
      await Cart.findOneAndUpdate(
        { user: req.user._id },
        { $set: { items: [], subtotal: 0, grandTotal: 0 } }
      );

      await session.commitTransaction();
      session.endSession();

      return res.status(201).json({
        success: true,
        message: "COD order placed successfully",
        order: newOrder,
      });
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  /* ---------------------------------------------------------
     ONLINE PAYMENT — Create Razorpay order
  --------------------------------------------------------- */
  const options = {
    amount: Math.round(itemsPrice * 100), // in paise
    currency: "INR",
    receipt: `rcpt_${Date.now()}`,
  };

  const rzpOrder = await razorpay.orders.create(options);

  // Save order as "Pending Payment"
  const order = await Order.create({
    user: req.user._id,
    orderItems: finalItems,
    itemsPrice,
    totalPrice: itemsPrice,
    shippingAddress,
    paymentMethod: "online",
    paymentStatus: "Pending",
    orderStatus: "Processing",
    razorpayOrderId: rzpOrder.id,
  });

  return res.status(200).json({
    success: true,
    razorpayOrderId: rzpOrder.id,
    orderId: order._id,
    amount: rzpOrder.amount,
    currency: "INR",
  });
});

/* ---------------------------------------------------------
   GET USER ORDERS
--------------------------------------------------------- */
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, orders });
});

/* ---------------------------------------------------------
   ADMIN — GET ALL ORDERS
--------------------------------------------------------- */
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, orders });
});


export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findOne({
    _id: req.params.id,
    user: req.user.id, // security
  });

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  res.status(200).json({ success: true, order });
});
/* ---------------------------------------------------------
   ADMIN — UPDATE ORDER STATUS
--------------------------------------------------------- */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  order.orderStatus = status;

  if (status === "Delivered") {
    order.paymentStatus = "Paid";
    order.deliveredAt = new Date();
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: "Order status updated",
    order,
  });
});

/* ---------------------------------------------------------
   ADMIN — DELETE ORDER
--------------------------------------------------------- */
export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  await order.deleteOne();

  res.status(200).json({ success: true, message: "Order deleted" });
});
