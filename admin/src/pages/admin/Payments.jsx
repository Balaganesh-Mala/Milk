import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminAxios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";
import { MdNavigateNext, MdNavigateBefore } from "react-icons/md";

const Payments = () => {
  const [payments, setPayments] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const perPage = 50;

  // Load payments
 const loadPayments = async () => {
  try {
    const res = await adminApi.get("/payment");

    // Sort payments newest → oldest
    const sorted = [...res.data.payments].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    setPayments(sorted);
    setFiltered(sorted);
  } catch (err) {
    Swal.fire("Error", "Failed to load payments", "error");
  }
  setLoading(false);
};


  useEffect(() => {
    loadPayments();
  }, []);

  // Filtering logic
  useEffect(() => {
    let data = [...payments];

    // Search text
    if (search.trim()) {
      const s = search.toLowerCase();
      data = data.filter(
        (p) =>
          p.razorpay_order_id?.toLowerCase().includes(s) ||
          p.razorpay_payment_id?.toLowerCase().includes(s) ||
          p.user?.email?.toLowerCase().includes(s)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      data = data.filter((p) => {
        if (statusFilter === "Success") return p.status === "paid";
        if (statusFilter === "Failed") return p.status === "failed";
        if (statusFilter === "Pending") return p.status === "created";
        return true;
      });
    }

    // Date filter
    if (startDate) {
      const sd = new Date(startDate);
      sd.setHours(0, 0, 0, 0);
      data = data.filter((p) => new Date(p.createdAt) >= sd);
    }

    if (endDate) {
      const ed = new Date(endDate);
      ed.setHours(23, 59, 59, 999);
      data = data.filter((p) => new Date(p.createdAt) <= ed);
    }

    setFiltered(data);
    setPage(1);
  }, [search, statusFilter, startDate, endDate, payments]);

  // Pagination calculation
  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  // Export Excel
  const exportExcel = () => {
    const sheet = XLSX.utils.json_to_sheet(
      filtered.map((p) => ({
        "Payment ID": p.razorpay_payment_id || "N/A",
        "Order ID": p.razorpay_order_id || "N/A",
        Email: p.user?.email || "N/A",
        Amount: "₹" + p.amount,
        Status:
          p.status === "paid"
            ? "Success"
            : p.status === "failed"
            ? "Failed"
            : "Pending",
        Date: new Date(p.createdAt).toLocaleString(),
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, "Payments");
    XLSX.writeFile(wb, `payments_${new Date().toLocaleDateString()}.xlsx`);
  };

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF("landscape");
    doc.setFontSize(14);
    doc.text("PAYMENTS REPORT", 14, 10);

    autoTable(doc, {
      startY: 20,
      head: [
        ["Payment ID", "Order ID", "Email", "Amount", "Status", "Date"],
      ],
      body: filtered.map((p) => [
        p.razorpay_payment_id || "N/A",
        p.razorpay_order_id || "N/A",
        p.user?.email || "N/A",
        "₹" + p.amount,
        p.status === "paid"
          ? "Success"
          : p.status === "failed"
          ? "Failed"
          : "Pending",
        new Date(p.createdAt).toLocaleDateString(),
      ]),
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [255, 89, 0] },
    });

    doc.save("payments.pdf");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Payments</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end mb-6">
        <input
          type="text"
          placeholder="Search by Order / Payment / Email"
          className="p-3 border rounded-lg w-full md:w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-3 border rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="Success">Success</option>
          <option value="Failed">Failed</option>
          <option value="Pending">Pending</option>
        </select>

        {/* Date Range */}
        <div className="flex gap-2 items-center">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">From</span>
            <input
              type="date"
              className="border px-3 py-2 rounded-lg text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">To</span>
            <input
              type="date"
              className="border px-3 py-2 rounded-lg text-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        
        
      </div>

      {/* Table */}
      <div className="bg-white p-4 rounded-xl shadow overflow-x-auto">
        {loading ? (
          <p className="text-center p-6">Loading payments...</p>
        ) : paginated.length === 0 ? (
          <p className="text-center p-6">No payments found.</p>
        ) : (
          <table className="w-full min-w-[850px] text-left">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="py-2">Payment ID</th>
                <th className="py-2">Order ID</th>
                <th className="py-2">Email</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Status</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>

            <tbody>
              {paginated.map((p) => (
                <tr key={p._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 text-sm">
                    {p.razorpay_payment_id || "N/A"}
                  </td>
                  <td className="py-3 text-sm">
                    {p.razorpay_order_id || "N/A"}
                  </td>
                  <td className="py-3 text-sm">{p.user?.email || "N/A"}</td>
                  <td className="py-3 text-sm">₹{p.amount}</td>

                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-xs ${
                        p.status === "paid"
                          ? "bg-green-100 text-green-600"
                          : p.status === "failed"
                          ? "bg-red-100 text-red-600"
                          : "bg-orange-100 text-orange-600"
                      }`}
                    >
                      {p.status === "paid"
                        ? "Success"
                        : p.status === "failed"
                        ? "Failed"
                        : "Pending"}
                    </span>
                  </td>

                  <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center items-center gap-2 mt-8 select-none">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className={`px-3 py-2 border rounded-lg flex items-center gap-1 text-sm ${
            page === 1 ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"
          }`}
        >
          <MdNavigateBefore size={18} /> Prev
        </button>

        {[...Array(totalPages)].map((_, i) => {
          const p = i + 1;
          if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
            return (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium border ${
                  p === page
                    ? "bg-blue-600 text-white border-blue-600"
                    : "hover:bg-gray-100"
                }`}
              >
                {p}
              </button>
            );
          } else if (p === page - 2 || p === page + 2) {
            return (
              <span key={p} className="px-1 text-gray-400">
                ...
              </span>
            );
          }
          return null;
        })}

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className={`px-3 py-2 border rounded-lg flex items-center gap-1 text-sm ${
            page === totalPages
              ? "opacity-40 cursor-not-allowed"
              : "hover:bg-gray-100"
          }`}
        >
          Next <MdNavigateNext size={18} />
        </button>
      </div>
    </div>
  );
};

export default Payments;
