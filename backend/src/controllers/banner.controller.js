import asyncHandler from "express-async-handler";
import Banner from "../models/banner.model.js";
import cloudinary from "../config/cloudinary.js";
import { uploadMultipleToCloudinary } from "../middleware/upload.middleware.js";

//
// 📌 Create Banner (Admin)
//
export const createBanner = asyncHandler(async (req, res) => {
  const { title, subtitle, buttonText, link } = req.body;

  if (!title) {
    res.status(400);
    throw new Error("Title required");
  }

  let imageData = null;

  if (req.files && req.files.length > 0) {
    const uploaded = await uploadMultipleToCloudinary(req.files, "banners");
    imageData = uploaded[0]; // only one banner image
  }

  const banner = await Banner.create({
    title,
    subtitle,
    buttonText,
    link,
    image: imageData,
  });

  res.status(201).json({
    success: true,
    message: "Banner created successfully",
    banner,
  });
});

//
// 📌 Get banners for users (only active)
//
export const getActiveBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find({ isActive: true }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    banners,
  });
});

//
// 📌 Get all banners (Admin dashboard)
//
export const getAllBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find().sort({ createdAt: -1 });
  res.status(200).json({ success: true, banners });
});

//
// ✏ Update banner
//
export const updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    res.status(404);
    throw new Error("Banner not found");
  }

  const fields = ["title", "subtitle", "buttonText", "link", "isActive"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) banner[f] = req.body[f];
  });

  // Handle image replacement
  if (req.files && req.files.length > 0) {
    if (banner.image?.public_id) {
      await cloudinary.uploader.destroy(banner.image.public_id);
    }
    const uploaded = await uploadMultipleToCloudinary(req.files, "banners");
    banner.image = uploaded[0];
  }

  await banner.save();

  res.status(200).json({ success: true, message: "Banner updated", banner });
});

//
// ❌ Delete Banner
//
export const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);

  if (!banner) {
    res.status(404);
    throw new Error("Banner not found");
  }

  if (banner.image?.public_id) {
    await cloudinary.uploader.destroy(banner.image.public_id);
  }

  await banner.deleteOne();

  res.status(200).json({ success: true, message: "Banner deleted" });
});
