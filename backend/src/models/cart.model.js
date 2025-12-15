import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },

        productName: String,
        productImage: String,

        quantity: { type: Number, default: 1 },

        price: { type: Number }, // price of selected variant

        total: { type: Number }, // price * quantity

        variant: {
          size: String, // 500ml, 1L etc.
          price: Number,
        },

        isSubscription: { type: Boolean, default: false },
      },
    ],

    subtotal: { type: Number, default: 0 },

    deliveryCharge: { type: Number, default: 0 },

    grandTotal: { type: Number, default: 0 }, // subtotal + delivery
  },
  { timestamps: true }
);

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
