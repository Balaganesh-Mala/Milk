import asyncHandler from "express-async-handler";
import Settings from "../models/settings.model.js";
import { uploadToCloudinary } from "../middleware/upload.middleware.js";

// Get settings
export const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  res.json({ success: true, settings });
});

// Update settings
export const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }

  // Update text fields
  const { storeName, supportEmail, supportPhone, address } = req.body;
  if (storeName) settings.storeName = storeName;
  if (supportEmail) settings.supportEmail = supportEmail;
  if (supportPhone) settings.supportPhone = supportPhone;
  if (address) settings.address = address;

  // If logo uploaded
  if (req.file) {
    const uploaded = await uploadToCloudinary(req.file.buffer, "hungerbites/settings");

    settings.logo = [
      {
        public_id: uploaded.public_id,
        url: uploaded.secure_url,
      },
    ];
  }

  await settings.save();

  res.json({
    success: true,
    message: "Settings updated successfully",
    settings,
  });
});
