import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    orderItems: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        name: String,
        image: String, // snapshot for UI
        quantity: Number,
        price: Number,

        variant: {
          size: String,
          price: Number,
        },

        isSubscription: { type: Boolean, default: false },
      },
    ],

    shippingAddress: {
      name: String,
      street: String,
      city: String,
      state: String,
      pincode: String,
      phone: String,
    },

    deliverySlot: { type: String }, // 6AM-8AM etc.
    
    subscriptionConfig: {
      frequency: String, // Daily / Weekly
      startDate: Date,
      endDate: Date,
    },

    paymentInfo: {
      id: String, // Razorpay payment ID
      status: String,
      method: String,
    },

    itemsPrice: { type: Number, required: true },
    shippingPrice: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed"],
      default: "Pending",
    },

    paymentMethod: {
      type: String,
      enum: ["COD", "online"],
      default: "COD",
    },

    trackingId: { type: String, default: "" },
    shipmentId: { type: String, default: "" },
    courierName: { type: String, default: "" },

    shipmentStatus: {
      type: String,
      enum: [
        "Pending",
        "Booked",
        "Shipped",
        "In Transit",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    trackingHistory: { type: Array, default: [] },

    orderStatus: {
      type: String,
      enum: ["Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Processing",
    },

    deliveredAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
