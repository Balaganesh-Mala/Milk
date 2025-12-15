import asyncHandler from "express-async-handler";
import Category from "../models/category.model.js";
import Product from "../models/product.model.js";
import { uploadToCloudinary } from "../middleware/upload.middleware.js";

//
// ➕ Create Category (Admin Only)
//
export const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!name) {
    res.status(400);
    throw new Error("Category name is required");
  }

  // image upload
  let imageData = {};
  if (req.file) {
    const uploaded = await uploadToCloudinary(req.file.buffer, "categories");
    imageData = {
      public_id: uploaded.public_id,
      url: uploaded.secure_url,
    };
  }

  const category = await Category.create({
    name,
    description,
    image: imageData,
  });

  res.status(201).json({
    success: true,
    message: "Category created successfully",
    category,
  });
});


//
// 📦 Get Categories (public)
//
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, categories });
});


//
// 📄 Get Category by ID (public)
//
export const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }
  res.status(200).json({ success: true, category });
});


//
// ✏ Update Category (Admin)
//
export const updateCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  let category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  let imageData = category.image;

  if (req.file) {
    const uploaded = await uploadToCloudinary(req.file.buffer, "categories");
    imageData = {
      public_id: uploaded.public_id,
      url: uploaded.secure_url,
    };
  }

  category.name = name ?? category.name;
  category.description = description ?? category.description;
  category.image = imageData;

  await category.save();

  res.status(200).json({
    success: true,
    message: "Category updated successfully",
    category,
  });
});


//
// ❌ Delete Category (Admin)
//
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error("Category not found");
  }

  // 🚫 Prevent deletion if products exist under this category
  const linkedProducts = await Product.countDocuments({
    category: req.params.id,
  });

  if (linkedProducts > 0) {
    res.status(400);
    throw new Error("Category cannot be deleted — products exist under this category");
  }

  await category.deleteOne();
  res.status(200).json({ success: true, message: "Category deleted successfully" });
});
