import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminAxios";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";
import { MdNavigateNext, MdNavigateBefore } from "react-icons/md";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState(""); // YYYY-MM-DD
  const [endDate, setEndDate] = useState(""); // YYYY-MM-DD

  const [loading, setLoading] = useState(true);

  // Pagination
  const [page, setPage] = useState(1);
  const perPage = 50;

  // Fetch All Users
  const loadUsers = async () => {
    try {
      const res = await adminApi.get("/admin/users");
      const list = res.data.users || [];

      // Newest first
      const sorted = [...list].reverse();

      setUsers(sorted);
      setFiltered(sorted);
    } catch (err) {
      Swal.fire("Error", "Failed to load users", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Search + Date Filters
  useEffect(() => {
    let data = [...users];

    const s = search.toLowerCase();

    if (s.trim()) {
      data = data.filter(
        (u) =>
          u.name?.toLowerCase().includes(s) ||
          u.email?.toLowerCase().includes(s)
      );
    }

    // Date range filter (createdAt)
    if (startDate) {
      const sd = new Date(startDate);
      sd.setHours(0, 0, 0, 0);
      data = data.filter((u) => new Date(u.createdAt) >= sd);
    }

    if (endDate) {
      const ed = new Date(endDate);
      ed.setHours(23, 59, 59, 999);
      data = data.filter((u) => new Date(u.createdAt) <= ed);
    }

    setFiltered(data);
    setPage(1); // reset to page 1 when filter changes
  }, [search, startDate, endDate, users]);

  // Pagination
  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  // Export Excel (uses filtered list)
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      filtered.map((u) => ({
        "User ID": u._id,
        Name: u.name,
        Email: u.email,
        Phone: u.phone || "N/A",
        "Joined On": new Date(u.createdAt).toLocaleString(),
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");
    XLSX.writeFile(wb, `users_${new Date().toLocaleDateString()}.xlsx`);
  };

  // Export PDF (uses filtered list)
  const exportPDF = () => {
    const doc = new jsPDF("landscape");
    doc.setFontSize(14);
    doc.text("USERS LIST", 14, 10);

    const tableData = filtered.map((u) => [
      u._id,
      u.name,
      u.email,
      u.phone || "N/A",
      new Date(u.createdAt).toLocaleString(),
    ]);

    autoTable(doc, {
      startY: 20,
      head: [["User ID", "Name", "Email", "Phone", "Joined"]],
      body: tableData,
      theme: "grid",
      styles: { fontSize: 8 },
      headStyles: { fillColor: [255, 89, 0] },
    });

    doc.save("users.pdf");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Customer Management</h1>

      {/* Search + Filters + Export */}
      <div className="flex flex-wrap gap-3 items-end mb-6">
        <input
          type="text"
          placeholder="Search by name or email"
          className="p-3 border rounded-lg w-full md:w-1/3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Date range */}
        <div className="flex gap-2 items-center">
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1">From</span>
            <input
              type="date"
              className="border px-3 py-2 rounded-lg text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500 mb-1">To</span>
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
      <div className="bg-white p-4 rounded-2xl shadow overflow-x-auto">
        {loading ? (
          <p className="text-center p-6">Loading users...</p>
        ) : paginated.length === 0 ? (
          <p className="text-center p-6">No users found.</p>
        ) : (
          <table className="w-full text-left table-auto min-w-[800px]">
            <thead>
              <tr className="border-b text-gray-600">
                <th className="py-2">Name</th>
                <th className="py-2">Email</th>
                <th className="py-2">Phone</th>
                <th className="py-2">Joined</th>
              </tr>
            </thead>

            <tbody>
              {paginated.map((u) => (
                <tr key={u._id} className="border-b hover:bg-gray-50">
                  <td className="py-3">{u.name}</td>
                  <td className="py-3">{u.email}</td>
                  <td className="py-3">{u.phone || "N/A"}</td>
                  <td className="py-3">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && filtered.length > 0 && (
        <div className="flex justify-center items-center gap-2 mt-8 select-none">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className={`px-3 py-2 border rounded-lg flex items-center gap-1 text-sm ${
              page === 1
                ? "opacity-40 cursor-not-allowed"
                : "hover:bg-gray-100"
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
      )}
    </div>
  );
};

export default Users;
