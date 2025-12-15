import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchCart,
  updateCartItem,
  removeCartItem,
} from "../api/project.api";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load Cart
  const loadCart = async () => {
    try {
      const res = await fetchCart();
      const cart = res.data.cart;

      setCartItems(cart.items || []);
      setSubtotal(cart.subtotal || 0);
      setGrandTotal(cart.grandTotal || 0);
    } catch (err) {
      console.error("Cart load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, []);

  // Update Qty
  const handleQtyUpdate = async (item, newQty) => {
    if (newQty < 1) return;

    const productId = item.product?._id;
    const variantSize = item.variant?.size || null;

    try {
      await updateCartItem(productId, newQty, variantSize);
      loadCart();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update quantity");
    }
  };

  // Remove Item
  const handleRemove = async (item) => {
    const productId = item.product?._id;
    const variantSize = item.variant?.size || null;

    try {
      await removeCartItem(productId, variantSize);
      loadCart();
    } catch (err) {
      alert(err.response?.data?.message || "Remove failed");
    }
  };

  if (loading)
    return (
      <p className="py-20 text-center text-[#3A8DFF] animate-pulse">
        Loading your cart…
      </p>
    );

  return (
    <div className="bg-[#F4FAFF] min-h-screen pb-20">
      {/* Header */}
      <div className="max-w-6xl mx-auto px-6 py-8 flex justify-between">
        <h1 className="text-3xl font-bold text-[#1F2D3D]">Your Cart</h1>
        <Link
          to="/products"
          className="text-[#3A8DFF] font-medium hover:underline"
        >
          Continue Shopping →
        </Link>
      </div>

      {/* Empty Cart */}
      {cartItems.length === 0 && (
        <div className="text-center mt-20">
          <img
            src="https://cdn-icons-png.flaticon.com/512/11329/11329060.png"
            className="w-40 mx-auto opacity-80"
          />
          <h2 className="text-xl mt-4 text-[#1F2D3D] font-semibold">
            Your cart is empty
          </h2>

          <Link
            to="/products"
            className="bg-[#3A8DFF] text-white px-6 py-3 rounded-lg mt-6 inline-block shadow hover:bg-[#3377D6] transition"
          >
            Browse Products
          </Link>
        </div>
      )}

      {/* Cart with Items */}
      {cartItems.length > 0 && (
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-10">
          {/* LEFT — Cart Items */}
          <div className="md:col-span-2 space-y-6">
            {cartItems.map((item) => {
              const product = item.product;
              const price = item.price ?? product?.price ?? 0;

              return (
                <div
                  key={item._id}
                  className="bg-white p-5 rounded-2xl shadow-md border border-[#E0ECF7] flex gap-5 items-start"
                >
                  {/* Product Image */}
                  <img
                    src={
                      product?.images?.[0]?.url ||
                      "https://via.placeholder.com/100"
                    }
                    className="w-28 h-28 object-cover rounded-xl border border-[#D6E8F5]"
                  />

                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-[#1F2D3D]">
                      {product?.name || "Product removed"}
                    </h3>

                    {item.variant?.size && (
                      <p className="text-sm text-[#5A6A7A] mt-1">
                        Size: {item.variant.size}
                      </p>
                    )}

                    <p className="text-[#3A8DFF] font-bold mt-2">₹{price}</p>

                    {/* Quantity Controls */}
                    {product ? (
                      <div className="flex items-center gap-4 mt-3">
                        <button
                          onClick={() =>
                            handleQtyUpdate(item, item.quantity - 1)
                          }
                          className="w-8 h-8 bg-[#E3EEF7] rounded-lg flex items-center justify-center text-lg hover:bg-[#D4E4F2]"
                        >
                          −
                        </button>

                        <span className="text-lg font-medium">
                          {item.quantity}
                        </span>

                        <button
                          onClick={() =>
                            handleQtyUpdate(item, item.quantity + 1)
                          }
                          className="w-8 h-8 bg-[#3A8DFF] text-white rounded-lg flex items-center justify-center hover:bg-[#3377D6]"
                        >
                          +
                        </button>
                      </div>
                    ) : (
                      <p className="text-red-500 text-sm mt-2">
                        This product is no longer available.
                      </p>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(item)}
                    className="text-red-500 text-2xl font-bold hover:text-red-600"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>

          {/* RIGHT — Summary */}
          <div className="bg-white p-6 rounded-2xl shadow-md border border-[#E0ECF7] h-fit">
            <h3 className="text-xl font-bold text-[#1F2D3D]">
              Order Summary
            </h3>

            <div className="flex justify-between mt-4 text-[#4A4A4A]">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

            <div className="flex justify-between mt-3">
              <span>Delivery</span>
              <span className="text-[#4CAF50] font-medium">Free</span>
            </div>

            <div className="border-t my-4" />

            <div className="flex justify-between text-lg font-bold text-[#1F2D3D]">
              <span>Total</span>
              <span>₹{grandTotal}</span>
            </div>

            <Link
              to="/checkout"
              className="block mt-6 text-center bg-[#3A8DFF] text-white py-3 rounded-xl font-semibold shadow hover:bg-[#3377D6] transition"
            >
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
