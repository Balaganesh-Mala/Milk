import asyncHandler from "express-async-handler";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import cloudinary from "../config/cloudinary.js";
import { uploadMultipleToCloudinary } from "../middleware/upload.middleware.js";

/* ============================
   SKU Generator
============================ */
const generateSKU = () =>
  `MILK-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

/* ============================
   CREATE PRODUCT
============================ */
export const createProduct = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,          // ✔ Correct field name
      mrp,
      weight,
      flavor,
      category,
      brand,
      isFeatured,
      isBestSeller,
      variants,
      isSubscriptionAvailable,
      expiryDate,
    } = req.body;

    if (!name || !description || !price || !category) {
      res.status(400);
      throw new Error("Required fields missing");
    }

    // Parse variants
    let parsedVariants = [];
    if (variants) {
      parsedVariants =
        typeof variants === "string" ? JSON.parse(variants) : variants;

      parsedVariants = parsedVariants.filter(
        (v) => v.size && v.price !== undefined
      );
    }

    // Upload Images
    let imageData = [];
    if (req.files && req.files.length > 0) {
      imageData = await uploadMultipleToCloudinary(req.files, "products");
    }

    const sku = generateSKU();

    const product = await Product.create({
      name,
      description,
      price,
      stock,                 // ✔ correct field
      mrp,
      weight,
      flavor,
      category,
      brand,
      isFeatured,
      isBestSeller,
      variants: parsedVariants,
      sku,
      expiryDate,
      isSubscriptionAvailable,
      images: imageData,
    });

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (err) {
    res.status(500);
    throw new Error(err.message);
  }
});

/* ============================
   GET ALL PRODUCTS
============================ */
export const getAllProducts = asyncHandler(async (req, res) => {
  const { search, category, featured, bestseller, flavor, subscription, sort } =
    req.query;

  let query = {};

  if (search) query.name = { $regex: search, $options: "i" };
  if (category) query.category = category;
  if (featured) query.isFeatured = featured === "true";
  if (bestseller) query.isBestSeller = bestseller === "true";
  if (flavor) query.flavor = { $regex: flavor, $options: "i" };
  if (subscription)
    query.isSubscriptionAvailable = subscription === "true";

  let dbQuery = Product.find(query).populate("category", "name");

  if (sort === "low-high") dbQuery.sort({ price: 1 });
  if (sort === "high-low") dbQuery.sort({ price: -1 });
  if (!sort) dbQuery.sort({ createdAt: -1 });

  const products = await dbQuery;
  res.status(200).json({ success: true, products });
});

/* ============================
   GET PRODUCT BY ID
============================ */
export const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  res.status(200).json({ success: true, product });
});

/* ============================
   UPDATE PRODUCT
============================ */
export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Handle image replacement
  if (req.files?.length > 0) {
    // Delete old images
    for (const img of product.images) {
      if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
    }

    // Upload new
    const newImages = await uploadMultipleToCloudinary(req.files, "products");
    product.images = newImages;
  }

  // Update fields
  const fields = [
    "name",
    "description",
    "price",
    "stock",     // ✔ fixed
    "mrp",
    "category",
    "flavor",
    "weight",
    "brand",
    "isFeatured",
    "isBestSeller",
    "expiryDate",
    "isSubscriptionAvailable",
  ];

  fields.forEach((field) => {
    if (req.body[field] !== undefined) product[field] = req.body[field];
  });

  // Update variants
  if (req.body.variants) {
    const updatedVariants =
      typeof req.body.variants === "string"
        ? JSON.parse(req.body.variants)
        : req.body.variants;

    product.variants = updatedVariants.filter(
      (v) => v.size && v.price !== undefined
    );
  }

  await product.save();

  res.status(200).json({
    success: true,
    message: "Product updated successfully",
    product,
  });
});

/* ============================
   DELETE PRODUCT
============================ */
export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) throw new Error("Product not found");

  for (const img of product.images) {
    if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
  }

  await product.deleteOne();

  res.status(200).json({
    success: true,
    message: "Product deleted",
  });
});

/* ============================
   ADD REVIEW
============================ */
export const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.id;

  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found");

  const deliveredOrder = await Order.findOne({
    user: req.user._id,
    "orderItems.productId": productId,
    orderStatus: "Delivered",
  });

  if (!deliveredOrder)
    throw new Error("You can review only after delivery");

  const already = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (already) throw new Error("You already reviewed this product");

  product.reviews.push({
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  });

  product.numOfReviews = product.reviews.length;
  product.ratings =
    product.reviews.reduce((sum, r) => sum + r.rating, 0) /
    product.numOfReviews;

  await product.save();

  res.status(200).json({
    success: true,
    message: "Review added successfully",
    product,
  });
});

/* ============================
   DELETE REVIEW
============================ */
export const deleteReview = asyncHandler(async (req, res) => {
  const { productId, reviewId } = req.params;

  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found");

  product.reviews = product.reviews.filter(
    (r) => r._id.toString() !== reviewId
  );

  product.numOfReviews = product.reviews.length;
  product.ratings =
    product.numOfReviews
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) /
        product.numOfReviews
      : 0;

  await product.save();

  res.status(200).json({
    success: true,
    message: "Review deleted",
    reviews: product.reviews,
  });
});
