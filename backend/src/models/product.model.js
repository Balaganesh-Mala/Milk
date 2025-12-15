import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    description: { type: String, required: true },

    price: { type: Number, required: true }, // base price

    mrp: { type: Number, default: 0 },

    stock: { type: Number, default: 0 },

    // 👇 Grocery/Milk custom improvement
    variants: [
      {
        size: { type: String, required: true },
        price: { type: Number, required: true },
        stock: { type: Number, default: 0 },
      },
    ],

    sku: { type: String, unique: true },

    weight: { type: String },

    expiryDate: { type: Date }, // dairy specific

    flavor: { type: String }, // chocolate milk / vanilla milk etc.

    brand: { type: String, default: "MilkFresh" },

    isFeatured: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },

    images: [
      {
        public_id: String,
        url: String,
      },
    ],

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    ratings: { type: Number, default: 0 },
    numOfReviews: { type: Number, default: 0 },

    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        name: String,
        rating: Number,
        comment: String,
      },
    ],

    // New for grocery subscriptions
    isSubscriptionAvailable: { type: Boolean, default: false },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);
