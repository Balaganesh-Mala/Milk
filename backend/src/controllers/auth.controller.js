import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;

  if (!name || !password || (!email && !phone)) {
    res.status(400);
    throw new Error("Name, password and either email or phone required");
  }

  // Check duplicate email or phone
  const exists = await User.findOne({
    $or: [{ email }, { phone }],
  });

  if (exists) {
    res.status(400);
    throw new Error("Account already exists");
  }

  const user = await User.create({ name, email, phone, password });

  res.status(201).json({
    success: true,
    message: "Registration successful",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    token: user.generateAuthToken(),
  });
});


export const loginUser = asyncHandler(async (req, res) => {
  const { email, phone, password } = req.body;

  if ((!email && !phone) || !password) {
    res.status(400);
    throw new Error("Email/Phone and password required");
  }

  // Find user by email or phone
  const user = await User.findOne({
    $or: [{ email }, { phone }],
  }).select("+password");

  if (!user) {
    res.status(400);
    throw new Error("Account not found");
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    res.status(401);
    throw new Error("Invalid Credentials");
  }

  res.status(200).json({
    success: true,
    message: "Login Successful",
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    token: user.generateAuthToken(),
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) throw new Error("User not found");

  res.status(200).json({ success: true, user });
});
