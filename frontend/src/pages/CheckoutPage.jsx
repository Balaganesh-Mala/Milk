// src/pages/CheckoutPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Swal from "sweetalert2";

import {
  fetchCart,
  fetchProfile,
  createOrder,
  createPaymentOrder,
  verifyPayment,
} from "../api/project.api";
import API from "../api/axios";

export default function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const buyNowData = location.state?.buyNow ? location.state.product : null;

  const [user, setUser] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);

  // Address modal
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editAddress, setEditAddress] = useState({
    name: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  useEffect(() => {
    loadCheckout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCheckout = async () => {
    try {
      setLoading(true);

      if (buyNowData) {
        const item = {
          product: {
            _id: buyNowData._id,
            name: buyNowData.name || buyNowData.title,
            images: [{ url: buyNowData.image || buyNowData.images?.[0]?.url }],
            price: buyNowData.price ?? (buyNowData.variants?.[0]?.price ?? 0),
          },
          productName: buyNowData.name || buyNowData.title,
          productImage: buyNowData.image || buyNowData.images?.[0]?.url,
          quantity: buyNowData.qty ?? 1,
          price: buyNowData.price ?? (buyNowData.variants?.[0]?.price ?? 0),
          total:
            (buyNowData.price ?? (buyNowData.variants?.[0]?.price ?? 0)) *
            (buyNowData.qty ?? 1),
          variant:
            buyNowData.variant ||
            (buyNowData.variantSize ? { size: buyNowData.variantSize } : null),
        };

        try {
          const profileRes = await fetchProfile();
          setUser(profileRes.data.user || null);
        } catch {
          setUser(null);
        }

        setCartItems([item]);
        return;
      }

      const [profileRes, cartRes] = await Promise.all([fetchProfile(), fetchCart()]);
      setUser(profileRes.data.user || null);
      setCartItems(cartRes.data.cart?.items || []);
    } catch (err) {
      console.error("Checkout load failed:", err);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  // totals
  const subtotal = cartItems.reduce((sum, i) => {
    const itemTotal = i.total ?? ((i.product?.price ?? i.price ?? 0) * (i.quantity ?? 0));
    return sum + itemTotal;
  }, 0);

  const deliveryCharge = subtotal > 499 || subtotal === 0 ? 0 : 0;
  const total = subtotal + deliveryCharge;

  // build order items
  const buildOrderItems = () =>
    cartItems.map((i) => {
      let variant = null;
      if (i.variant) {
        if (typeof i.variant === "string") variant = { size: i.variant };
        else if (i.variant.size) variant = { size: i.variant.size };
        else variant = i.variant;
      }

      return {
        productId: i.product?._id ?? i.productId ?? i.product,
        quantity: i.quantity ?? 1,
        variant,
        isSubscription: i.isSubscription ?? false,
      };
    });

  // try clear cart (best-effort)
  const tryClearCart = async () => {
    try {
      await API.delete("/cart/clear");
    } catch (err) {
      console.warn("Clear cart failed (optional):", err?.response?.data || err?.message);
    }
  };

  // Razorpay loader
  const loadRazorpay = (src) =>
    new Promise((resolve) => {
      const s = document.createElement("script");
      s.src = src;
      s.onload = () => resolve(true);
      s.onerror = () => resolve(false);
      document.body.appendChild(s);
    });

  // place COD
  const placeOrderCOD = async () => {
    try {
      await createOrder({
        orderItems: buildOrderItems(),
        shippingAddress: user.addresses?.[0] ?? editAddress,
        paymentMethod: "COD",
      });

      await tryClearCart();

      Swal.fire("Order Placed!", "Your COD order is successful.", "success");
      navigate("/orders");
    } catch (err) {
      console.error("COD place error:", err);
      Swal.fire("Error", err.response?.data?.message || err.message || "Failed to place order", "error");
    } finally {
      setPlacing(false);
    }
  };

  // place online
  const placeOrderOnline = async () => {
    try {
      const paymentOrderRes = await createPaymentOrder({ amount: Math.round(total) });
      const { razorpayOrderId, amount, currency, orderId } = paymentOrderRes.data || paymentOrderRes;

      const sdkLoaded = await loadRazorpay("https://checkout.razorpay.com/v1/checkout.js");
      if (!sdkLoaded) {
        Swal.fire("Error", "Failed to load payment SDK", "error");
        setPlacing(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || import.meta.env.VITE_RAZORPAY_KEY || "",
        amount: amount || Math.round(total * 100),
        currency: currency || "INR",
        name: "Milk Store",
        description: "Order Payment",
        order_id: razorpayOrderId || orderId || undefined,
        handler: async (response) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              amount: amount || Math.round(total * 100),
              orderId: orderId || undefined,
            });

            await createOrder({
              orderItems: buildOrderItems(),
              shippingAddress: user.addresses?.[0] ?? editAddress,
              paymentMethod: "online",
            });

            await tryClearCart();

            Swal.fire("Success", "Payment completed & order placed!", "success");
            navigate("/orders");
          } catch (err) {
            console.error("Payment verify/createOrder failed", err);
            Swal.fire("Error", err.response?.data?.message || err.message || "Payment verification failed", "error");
          } finally {
            setPlacing(false);
          }
        },
        prefill: {
          name: user?.name || (editAddress && editAddress.name) || "",
          contact: user?.phone || editAddress?.phone || "",
          email: user?.email || "",
        },
        theme: { color: "#8ECDF2" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("createPaymentOrder error", err);
      Swal.fire("Error", err.response?.data?.message || err.message || "Failed to initiate payment", "error");
      setPlacing(false);
    }
  };

  // save address
  const saveAddress = () => {
    setUser({
      ...user,
      addresses: [editAddress],
    });
    setShowAddressModal(false);
  };

  // handle place order
  const handlePlaceOrder = async () => {
    if (placing) return;

    if (!user?.addresses?.length && !editAddress?.name) {
      Swal.fire("Address required", "Please add a delivery address.", "warning");
      return;
    }

    setPlacing(true);

    if (paymentMethod === "COD") {
      await placeOrderCOD();
    } else {
      await placeOrderOnline();
    }
  };

  // Loading / empty states
  if (loading) {
    return (
      <div className="text-center py-28">
        <p className="text-[#8ECDF2] font-medium animate-pulse">Loading checkout…</p>
      </div>
    );
  }

  if (!cartItems.length && !buyNowData) {
    return (
      <div className="text-center py-28">
        <p className="text-gray-600">Your cart is empty.</p>
        <Link to="/products" className="mt-3 inline-block text-[#4CAF50] font-medium underline">
          Browse products
        </Link>
      </div>
    );
  }

  // ====== RENDER ======
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: main content (span 2 cols on lg) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl lg:text-3xl font-semibold text-[#2E2E2E]">Checkout</h1>
            <p className="text-sm text-gray-500">{cartItems.length} item{cartItems.length !== 1 ? "s" : ""}</p>
          </div>

          {/* Order Summary Card */}
          <div className="bg-white border border-[#E6F3FA] rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-[#2E2E2E] mb-4">Order Summary</h2>

            <div className="space-y-4">
              {cartItems.map((item, idx) => {
                const name = item.productName ?? item.product?.name ?? "Product";
                const img = item.productImage ?? item.product?.images?.[0]?.url;
                const qty = item.quantity ?? 1;
                const price = item.total ?? (item.product?.price ?? item.price ?? 0) * qty;
                const variant =
                  item.variant?.size ?? (typeof item.variant === "string" ? item.variant : null);

                return (
                  <div key={idx} className="flex gap-4 items-center">
                    <img
                      src={img || "https://via.placeholder.com/120"}
                      alt={name}
                      className="w-20 h-20 rounded-lg object-cover border border-[#F0F6FB]"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-[#2E2E2E] truncate">{name}</p>
                      <p className="text-gray-500 text-sm">
                        Qty: {qty}{variant ? ` • ${variant}` : ""}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[#4CAF50]">₹{price}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white border border-[#E6F3FA] rounded-2xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-[#2E2E2E] mb-3">Payment Method</h2>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "COD"}
                  onChange={() => setPaymentMethod("COD")}
                />
                <div>
                  <div className="font-medium text-[#2E2E2E]">Cash on Delivery</div>
                  <div className="text-sm text-gray-500">Pay when the product arrives</div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "online"}
                  onChange={() => setPaymentMethod("online")}
                />
                <div>
                  <div className="font-medium text-[#2E2E2E]">Online Payment</div>
                  <div className="text-sm text-gray-500">Secure payment via Razorpay</div>
                </div>
              </label>
            </div>
          </div>

          {/* Mobile CTA (when sidebar collapses) */}
          <div className="lg:hidden">
            <div className="bg-white border border-[#E6F3FA] rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-lg font-bold text-[#4CAF50]">₹{total}</p>
              </div>
              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className={`ml-4 px-4 py-3 rounded-lg font-semibold transition ${
                  placing ? "bg-gray-400 text-white cursor-not-allowed" : "bg-[#4CAF50] text-white hover:bg-green-600"
                }`}
              >
                {placing ? "Placing..." : paymentMethod === "COD" ? "Place COD" : "Pay & Place"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: sticky sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-20 space-y-6">
            {/* Address Card */}
            <div className="bg-[#F9FDFF] border border-[#E6F3FA] rounded-2xl p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[#2E2E2E]">Delivery Address</h3>
                  {user?.addresses?.length ? (
                    <div className="mt-2 text-sm text-gray-700">
                      <p className="font-medium">{user.addresses[0].name}</p>
                      <p className="truncate">{user.addresses[0].street}</p>
                      <p className="text-gray-500">{user.addresses[0].city}, {user.addresses[0].state} - {user.addresses[0].pincode}</p>
                      <p className="text-gray-500 mt-1">Phone: +91 {user.addresses[0].phone}</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-red-500">No address found.</p>
                  )}
                </div>

                <button
                  onClick={() => {
                    setShowAddressModal(true);
                    setEditAddress(user?.addresses?.[0] || editAddress);
                  }}
                  className="text-sm text-[#8ECDF2] font-medium underline"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Price Details Card */}
            <div className="bg-white border border-[#E6F3FA] rounded-2xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#2E2E2E] mb-3">Price Details</h3>

              <div className="text-sm text-gray-700 space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>

                <div className="flex justify-between">
                  <span>Delivery</span>
                  <span>{deliveryCharge === 0 ? "FREE" : `₹${deliveryCharge}`}</span>
                </div>

                <hr className="my-3" />

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Total</p>
                    <p className="text-lg font-bold text-[#4CAF50]">₹{total}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Place order CTA */}
            <div className="bg-white border border-[#E6F3FA] rounded-2xl p-4 shadow-sm">
              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className={`w-full py-3 rounded-lg text-lg font-semibold transition ${
                  placing ? "bg-gray-400 text-white cursor-not-allowed" : "bg-[#4CAF50] text-white hover:bg-green-600"
                }`}
              >
                {placing ? "Placing Order..." : paymentMethod === "COD" ? "Place COD Order" : "Pay & Place Order"}
              </button>

              <p className="text-xs text-gray-500 mt-3">You will get order notifications on your registered number.</p>
            </div>
          </div>
        </aside>
      </div>

      {/* Address modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#E6F3FA] p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-[#2E2E2E] mb-3">Edit Delivery Address</h3>

            <div className="space-y-3">
              {["name", "street", "city", "state", "pincode", "phone"].map((field) => (
                <input
                  key={field}
                  type="text"
                  placeholder={field.toUpperCase()}
                  value={editAddress[field] || ""}
                  onChange={(e) => setEditAddress({ ...editAddress, [field]: e.target.value })}
                  className="w-full p-3 border border-[#E6F3FA] rounded-lg outline-none focus:ring-2 focus:ring-[#8ECDF2]"
                />
              ))}
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={saveAddress}
                className="flex-1 bg-[#4CAF50] text-white py-2 rounded-lg font-medium"
              >
                Save Address
              </button>

              <button
                onClick={() => setShowAddressModal(false)}
                className="flex-1 border border-gray-300 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
