import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import adminApi from "../../api/adminAxios";
import Swal from "sweetalert2";

const OrderDetails = () => {
  const { id } = useParams();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);

  const statusOptions = ["Processing", "Shipped", "Delivered", "Cancelled"];

  const colors = {
    Processing: "bg-orange-100 text-orange-600",
    Shipped: "bg-blue-100 text-blue-600",
    Delivered: "bg-green-100 text-green-600",
    Cancelled: "bg-red-100 text-red-600",
  };

  // Load selected order details
  const loadOrder = async () => {
    try {
      setLoading(true);

      const res = await adminApi.get("/admin/orders");
      const found = (res.data.orders || []).find((o) => o._id === id);

      setOrder(found || null);
    } catch (err) {
      Swal.fire("Error", "Failed to load order details", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, []);

  // Update order status
  const updateStatus = async (status) => {
    setStatusLoading(true);
    try {
      await adminApi.put(`/admin/order/${id}/status`, { status });

      Swal.fire("Updated", "Order status changed!", "success");
      loadOrder();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Status update failed", "error");
    }
    setStatusLoading(false);
  };

  if (loading) return <p className="p-6">Loading...</p>;
  if (!order) return <p className="p-6 text-red-500">Order Not Found</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      <h2 className="text-2xl font-bold">Order Details</h2>

      {/* Order Info */}
      <div className="bg-white shadow rounded-xl p-6">
        <p className="font-semibold text-lg">Order #{order._id}</p>

        <div className="grid md:grid-cols-3 gap-6 mt-4 text-sm">

          {/* Customer */}
          <div>
            <p className="text-gray-500">Customer</p>
            <p>{order.user?.name}</p>
            <p className="text-xs text-gray-500">{order.user?.email}</p>
          </div>

          {/* Payment */}
          <div>
            <p className="text-gray-500">Payment</p>
            <span
              className={`px-3 py-1 rounded-full text-xs ${
                order.paymentStatus === "paid"
                  ? "bg-green-100 text-green-600"
                  : "bg-yellow-100 text-yellow-600"
              }`}
            >
              {order.paymentStatus || "Pending"}
            </span>
            <p className="text-xs text-gray-500">Method: {order.paymentMethod}</p>
          </div>

          {/* Order Status */}
          <div>
            <p className="text-gray-500">Order Status</p>
            <span
              className={`px-3 py-1 rounded-full text-xs ${
                colors[order.orderStatus]
              }`}
            >
              {order.orderStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Update Status */}
      <div className="bg-white shadow rounded-xl p-6">
        <p className="font-semibold text-lg mb-4">Update Status</p>

        <select
          className="border p-2 rounded-lg"
          value={order.orderStatus}
          onChange={(e) => updateStatus(e.target.value)}
          disabled={statusLoading}
        >
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Shipping Address */}
      <div className="bg-white shadow rounded-xl p-6">
        <p className="font-semibold text-lg mb-4">Shipping Address</p>
        <p>
          <b>{order.shippingAddress?.name}</b>
        </p>
        <p>{order.shippingAddress?.street}</p>
        <p>
          {order.shippingAddress?.city}, {order.shippingAddress?.state}
        </p>
        <p>Pincode: {order.shippingAddress?.pincode}</p>
        <p>Phone: {order.shippingAddress?.phone}</p>
      </div>

      {/* Items */}
      <div className="bg-white shadow rounded-xl p-6">
        <p className="font-semibold text-lg mb-4">Order Items</p>

        {order.orderItems?.map((it, index) => (
          <div key={index} className="flex border-b py-3 gap-4">
            <img
              className="w-16 h-16 rounded-lg object-cover"
              src={it.productId?.images?.[0]?.url || "/placeholder.png"}
              alt=""
            />

            <div className="flex-1">
              <p>{it.productId?.name || it.name}</p>
              <p className="text-sm text-gray-600">Qty: {it.quantity}</p>
            </div>

            <p className="font-semibold text-orange-600">₹{it.price}</p>
          </div>
        ))}

        <div className="text-right mt-4 text-lg font-bold">
          Total: ₹{order.totalPrice}
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
