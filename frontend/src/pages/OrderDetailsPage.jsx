import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { getOrderById } from "../api/project.api"; // <-- YOU MUST CREATE THIS API

export default function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // ------------------------------
  // FETCH ORDER DETAILS
  // ------------------------------
  const loadOrder = async () => {
    try {
      setLoading(true);
      const res = await getOrderById(id);
      setOrder(res.data.order);
    } catch (err) {
      console.error("Order fetch failed:", err);
      navigate("/orders"); // redirect back
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  // ------------------------------
  // DOWNLOAD INVOICE (PDF)
  // ------------------------------
  const downloadInvoice = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text("INVOICE", 14, 20);

    // Order Info
    doc.setFontSize(12);
    doc.text(`Order ID: ${order._id}`, 14, 30);
    doc.text(
      `Order Date: ${new Date(order.createdAt).toLocaleDateString()}`,
      14,
      37
    );

    // Address
    const addr = order.shippingAddress;
    doc.text("Billing Address:", 14, 50);
    doc.text(`${addr.name}`, 14, 56);
    doc.text(`${addr.street}`, 14, 62);
    doc.text(`${addr.city}, ${addr.state} - ${addr.pincode}`, 14, 68);
    doc.text(`Phone: ${addr.phone}`, 14, 74);

    // Items Table
    const itemRows = order.orderItems.map((item) => [
      item.name,
      item.variant || "-",
      item.quantity,
      `₹${item.price}`,
      `₹${item.price * item.quantity}`,
    ]);

    doc.autoTable({
      head: [["Item", "Variant", "Qty", "Price", "Total"]],
      body: itemRows,
      startY: 90,
    });

    let Y = doc.previousAutoTable.finalY + 10;

    doc.text("Price Summary", 14, Y);
    Y += 8;
    doc.text(`Subtotal: ₹${order.itemsPrice}`, 14, Y);
    Y += 7;
    doc.text(`Delivery Charge: ₹${order.deliveryCharge}`, 14, Y);
    Y += 7;

    doc.setFont("Helvetica", "bold");
    doc.text(`Total Amount: ₹${order.totalPrice}`, 14, Y);
    doc.setFont("Helvetica", "normal");

    // Footer
    doc.setFontSize(10);
    doc.text("Thank you for shopping with us!", 14, 280);

    doc.save(`Invoice_${order._id}.pdf`);
  };

  // ------------------------------
  // LOADING STATE
  // ------------------------------
  if (loading)
    return (
      <div className="text-center text-gray-500 py-20">
        Loading order details…
      </div>
    );

  if (!order)
    return (
      <div className="text-center text-red-600 py-20">Order Not Found ❌</div>
    );

  const addr = order.shippingAddress;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="text-blue-700 underline mb-4"
      >
        ← Back
      </button>

      <h2 className="text-3xl font-bold text-blue-900">Order Details</h2>

      {/* ORDER SUMMARY */}
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between">
          <div>
            <p className="font-bold text-gray-800">Order ID: {order._id}</p>
            <p className="text-gray-600 text-sm">
              Ordered on: {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>

          <span
            className={`px-4 py-1 rounded-lg font-medium ${
              order.orderStatus === "Delivered"
                ? "bg-green-100 text-green-600"
                : order.orderStatus === "Processing"
                ? "bg-orange-100 text-orange-600"
                : "bg-blue-100 text-blue-600"
            }`}
          >
            {order.orderStatus}
          </span>
        </div>
      </div>

      {/* ADDRESS */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-bold text-blue-900 mb-3">
          Delivery Address
        </h3>
        <p className="font-semibold">{addr.name}</p>
        <p>{addr.street}</p>
        <p>
          {addr.city}, {addr.state} - {addr.pincode}
        </p>
        <p className="text-gray-500 mt-2 text-sm">Phone: {addr.phone}</p>
      </div>

      {/* TRACKING */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-bold text-blue-900 mb-4">Order Tracking</h3>

        {order.trackingHistory?.length > 0 ? (
          <div className="space-y-2">
            {order.trackingHistory.map((stage, i) => (
              <div key={i} className="flex items-center gap-2">
                <FaCheckCircle className="text-green-500" />
                <span>{stage}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Tracking unavailable</p>
        )}
      </div>

      {/* ORDER ITEMS */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-bold text-blue-900 mb-4">Items</h3>

        <div className="space-y-4">
          {order.orderItems.map((item, i) => (
            <div key={i} className="flex gap-4 items-center border-b pb-4">
              <img
                src={item.image}
                className="w-16 h-16 rounded-lg object-cover"
              />

              <div className="flex-1">
                <p className="font-semibold">{item.name}</p>
                <p className="text-gray-500 text-sm">
                  Qty: {item.quantity} •{" "}
                  {typeof item.variant === "object"
                    ? item.variant?.size
                    : item.variant || "-"}
                </p>
              </div>

              <p className="font-semibold text-blue-700">
                ₹{item.price * item.quantity}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* PRICE DETAILS */}
      <div className="bg-white p-6 rounded-xl shadow">
        <h3 className="text-xl font-bold text-blue-900 mb-4">Price Details</h3>

        <div className="space-y-2 text-gray-700">
          <p className="flex justify-between">
            <span>Subtotal</span> <span>₹{order.itemsPrice}</span>
          </p>

          <p className="flex justify-between">
            <span>Delivery Charge</span> <span>₹{order.deliveryCharge}</span>
          </p>

          <hr className="my-4" />

          <p className="flex justify-between font-bold text-blue-800 text-lg">
            <span>Total</span> <span>₹{order.totalPrice}</span>
          </p>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-4">
        <button
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition"
          onClick={() => navigate(`/product/${order.orderItems[0].productId}`)}
        >
          Reorder
        </button>

        <button
          className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition"
          onClick={downloadInvoice}
        >
          Download Invoice
        </button>
      </div>
    </div>
  );
}
