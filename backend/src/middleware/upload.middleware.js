import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

const storage = multer.memoryStorage();
export const upload = multer({ storage, limits: { files: 6 } });

// Upload single image
export const uploadToCloudinary = (buffer, folder = "products") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });

    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// Upload multiple images
export const uploadMultipleToCloudinary = async (files, folder = "products") => {
  const uploadedImages = [];

  for (const file of files) {
    const uploaded = await uploadToCloudinary(file.buffer, folder);
    uploadedImages.push({
      public_id: uploaded.public_id,
      url: uploaded.secure_url,
    });
  }

  return uploadedImages;
};
