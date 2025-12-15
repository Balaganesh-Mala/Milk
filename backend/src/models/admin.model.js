import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Admin name is required"],
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      required: [true, "Admin email is required"],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },

    password: {
      type: String,
      required: [true, "Password required"],
      minlength: 6,
      select: false, // prevent auto returning
    },

    role: {
      type: String,
      enum: ["admin", "superadmin"],
      default: "admin",
    },

    avatar: {
      public_id: String,
      url: String,
    },
  },
  { timestamps: true }
);


//
// 🔐 Hash password before save
//
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});


//
// 🔍 Compare password
//
adminSchema.methods.matchPassword = async function (enteredPass) {
  return await bcrypt.compare(enteredPass, this.password);
};


//
// 🔑 Generate Admin Auth Token
//
adminSchema.methods.generateAdminToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET_ADMIN || process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );
};

const Admin = mongoose.model("Admin", adminSchema);
export default Admin;
