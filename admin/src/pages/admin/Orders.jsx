import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminAxios";
import Swal from "sweetalert2";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  MdNavigateNext,
  MdNavigateBefore
} from "react-icons/md";

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [page, setPage] = useState(1);
  const perPage = 50;

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await adminApi.get("/admin/orders");
      const list = (res.data.orders || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setOrders(list);
      setFiltered(list);
    } catch (err) {
      console.error("Order fetch failed", err);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await adminApi.put(`/admin/order/${id}/status`, { status });

      Swal.fire("Updated!", "Order status updated", "success");
      loadOrders();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message, "error");
    }
  };

  useEffect(() => {
    let data = [...orders];

    if (search.trim()) {
      const s = search.toLowerCase();
      data = data.filter(
        (o) =>
          o._id.toLowerCase().includes(s) ||
          o.user?.name?.toLowerCase().includes(s) ||
          o.user?.email?.toLowerCase().includes(s)
      );
    }

    if (statusFilter !== "all") {
      data = data.filter((o) => o.orderStatus === statusFilter);
    }

    if (paymentFilter !== "all") {
      data = data.filter((o) => o.paymentMethod === paymentFilter);
    }

    if (startDate) {
      const sd = new Date(startDate);
      sd.setHours(0, 0, 0, 0);
      data = data.filter((o) => new Date(o.createdAt) >= sd);
    }

    if (endDate) {
      const ed = new Date(endDate);
      ed.setHours(23, 59, 59, 999);
      data = data.filter((o) => new Date(o.createdAt) <= ed);
    }

    setFiltered(data);
    setPage(1);
  }, [search, statusFilter, paymentFilter, startDate, endDate, orders]);

  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const paginatedData = filtered.slice(
    (page - 1) * perPage,
    page * perPage
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Orders Management</h1>

      <div className="flex flex-wrap gap-4 mb-6 items-center">
        <input
          type="text"
          placeholder="Search by Order ID, name or email"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-4 py-2 rounded-lg w-full lg:w-1/3"
        />

        <select
          className="border px-4 py-2 rounded-lg"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Statuses</option>
          <option value="Processing">Processing</option>
          <option value="Shipped">Shipped</option>
          <option value="Delivered">Delivered</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <select
          className="border px-4 py-2 rounded-lg"
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
        >
          <option value="all">All Payments</option>
          <option value="COD">COD</option>
          <option value="online">Online</option>
        </select>
      </div>

      <div className="bg-white rounded-xl shadow p-4 overflow-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b text-slate-600">
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Update</th>
              <th>Payment</th>
              <th>Date</th>
              <th>View</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((order) => (
              <tr key={order._id} className="border-b">
                <td>{order._id}</td>
                <td>{order.user?.name || "-"}</td>
                <td>{order.orderItems?.length}</td>
                <td>₹{order.totalPrice}</td>

                {/* Status pill */}
                <td>
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    order.orderStatus === "Delivered"
                      ? "bg-green-100 text-green-600"
                      : order.orderStatus === "Cancelled"
                      ? "bg-red-100 text-red-600"
                      : "bg-orange-100 text-orange-600"
                  }`}>
                    {order.orderStatus}
                  </span>
                </td>

                {/* Status update dropdown */}
                <td>
                  <select
                    className="border rounded px-2 py-1 text-sm"
                    value={order.orderStatus}
                    onChange={(e) =>
                      updateStatus(order._id, e.target.value)
                    }
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>

                <td>{order.paymentMethod?.toUpperCase()}</td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>

                <td>
                  <a
                    href={`/admin/orders/${order._id}`}
                    className="text-orange-600 underline text-sm"
                  >
                    View
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
