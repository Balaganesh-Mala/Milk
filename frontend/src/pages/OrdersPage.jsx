import { useEffect, useState } from "react";
import { getMyOrders } from "../api/project.api";
import { Link } from "react-router-dom";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Load Orders
  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await getMyOrders();
      setOrders(res.data.orders || []);
    } catch (err) {
      console.log("Failed to fetch orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  if (loading)
    return (
      <div className="text-center py-20 text-gray-500">Loading orders...</div>
    );

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
      <h2 className="text-3xl font-bold text-blue-900">My Orders</h2>

      {/* Empty Orders */}
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <img src="/empty-orders.png" className="w-44 mx-auto" />
          <p className="text-gray-500 mt-4">No orders yet.</p>
        </div>
      ) : (
        <>
          {/* Order Table */}
          <div className="overflow-x-auto bg-white shadow rounded-xl p-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-50 border-b">
                  <th className="p-3 font-semibold">Order ID</th>
                  <th className="p-3 font-semibold">Date</th>
                  <th className="p-3 font-semibold">Total</th>
                  <th className="p-3 font-semibold">Status</th>
                  <th className="p-3 font-semibold text-center">Details</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order._id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-3">{order._id}</td>

                    <td className="p-3">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>

                    <td className="p-3 text-blue-600 font-semibold">
                      ₹{order.totalPrice}
                    </td>

                    <td className="p-3">
                      <span
                        className={`px-3 py-1 text-sm rounded-lg font-medium ${
                          order.orderStatus === "Delivered"
                            ? "bg-green-100 text-green-600"
                            : order.orderStatus === "Processing"
                            ? "bg-orange-100 text-orange-600"
                            : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      

                      <Link
                        to={`/order/${order._id}`}
                        className="text-blue-600 font-medium underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Expand Details (SINGLE PAGE MODE) */}
          {selectedOrder && (
            <div className="bg-white p-6 rounded-xl shadow border space-y-4">
              <h3 className="text-xl font-bold text-blue-900">Order Details</h3>

              {selectedOrder.orderItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 items-center border-b pb-4"
                >
                  <img
                    src={item.image}
                    className="w-16 h-16 object-cover rounded-lg"
                  />

                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-gray-500 text-sm">
                      Qty: {item.quantity} •{" "}
                      {item.variant?.size || // new structure: { size: "500ML" }
                        item.size || // some orders store size directly
                        item.variant || // fallback: if variant is a string
                        "-"}
                    </p>
                  </div>

                  <p className="font-semibold text-blue-600">
                    ₹{item.price * item.quantity}
                  </p>
                </div>
              ))}

              {/* Price Summary */}
              <div className="pt-4 border-t space-y-2 text-gray-700">
                {/* Items Price */}
                <p className="flex justify-between">
                  <span>Items Price</span>
                  <span>₹{selectedOrder.itemsPrice}</span>
                </p>

                {/* Payment Method */}
                <p className="flex justify-between">
                  <span>Payment Method</span>
                  <span className="font-medium text-blue-700">
                    {selectedOrder.paymentMethod === "COD"
                      ? "Cash on Delivery"
                      : "Online Payment"}
                  </span>
                </p>

                {/* Payment Status */}
                <p className="flex justify-between">
                  <span>Payment Status</span>
                  <span
                    className={`font-medium ${
                      selectedOrder.paymentStatus === "Paid"
                        ? "text-green-600"
                        : "text-red-500"
                    }`}
                  >
                    {selectedOrder.paymentStatus}
                  </span>
                </p>
                {selectedOrder.paymentInfo?.id && (
                  <p className="flex justify-between">
                    <span>Transaction ID</span>
                    <span className="text-sm text-gray-600">
                      {selectedOrder.paymentInfo.id}
                    </span>
                  </p>
                )}

                {/* Total Amount */}
                <p className="flex justify-between font-bold text-blue-800 text-lg">
                  <span>Total Amount</span>
                  <span>₹{selectedOrder.totalPrice}</span>
                </p>
              </div>

              <button
                className="bg-blue-600 text-white px-6 py-3 rounded-lg mt-4"
                onClick={() => setSelectedOrder(null)}
              >
                Close
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
