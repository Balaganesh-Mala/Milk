import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminAxios";
import Swal from "sweetalert2";

import { FaSearch, FaEye, FaTimesCircle } from "react-icons/fa";
import { MdNavigateNext, MdNavigateBefore } from "react-icons/md";

const AdminSubscriptions = () => {
  const [subs, setSubs] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);

  const [page, setPage] = useState(1);
  const perPage = 30;

  useEffect(() => {
    loadSubs();
  }, []);

  const loadSubs = async () => {
    const res = await adminApi.get("admin/subscriptions/active"); 
    setSubs(res.data.activeSubscriptions);
    setFiltered(res.data.activeSubscriptions);
  };

  // Filtering logic
  useEffect(() => {
    let data = [...subs];

    if (search.trim()) {
      data = data.filter(
        (s) =>
          s.userName.toLowerCase().includes(search.toLowerCase()) ||
          s.product?.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (planFilter) {
      data = data.filter((s) => s.plan === planFilter);
    }

    if (statusFilter) {
      data = data.filter((s) => s.status === statusFilter);
    }

    setFiltered(data);
    setPage(1);
  }, [search, planFilter, statusFilter, subs]);

  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const paginatedData = filtered.slice((page - 1) * perPage, page * perPage);

  const openDetails = (sub) => {
    setSelectedSub(sub);
    setModalOpen(true);
  };

  const cancelSubscription = async (id) => {
    Swal.fire({
      title: "Cancel Subscription?",
      text: "This will stop all future deliveries.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "red",
    }).then(async (resp) => {
      if (resp.isConfirmed) {
        await adminApi.put(`/subscriptions/cancel/${id}`);
        Swal.fire("Cancelled", "Subscription cancelled", "success");
        loadSubs();
      }
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-semibold">Manage Subscriptions</h1>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex gap-3 mb-6">
        <div className="relative w-full max-w-xs">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            placeholder="Search user or product..."
            className="border px-9 py-2 rounded-lg w-full"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="border px-3 py-2 rounded-lg"
          onChange={(e) => setPlanFilter(e.target.value)}
        >
          <option value="">All Plans</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>

        <select
          className="border px-3 py-2 rounded-lg"
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Status</option>
          <option value="active">Active</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b">
              <th>User</th>
              <th>Phone</th>
              <th>Product</th>
              <th>Variant</th>
              <th>Plan</th>
              <th>Next Delivery</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((s) => (
              <tr key={s.subscriptionId} className="border-b hover:bg-gray-50">
                <td>{s.userName}</td>
                <td>{s.userPhone}</td>

                <td className="flex items-center gap-2">
                  <img
                    src={s.product?.images?.[0]?.url}
                    className="w-10 h-10 rounded object-cover"
                  />
                  {s.product?.name}
                </td>

                <td>{s.variantSize}</td>
                <td className="capitalize">{s.plan}</td>

                <td>
                  {s.nextDeliveryDate
                    ? new Date(s.nextDeliveryDate).toLocaleDateString()
                    : "-"}
                </td>

                <td className="flex gap-3 text-lg">
                  <FaEye
                    className="text-blue-600 cursor-pointer"
                    onClick={() => openDetails(s)}
                  />

                  <FaTimesCircle
                    className="text-red-600 cursor-pointer"
                    onClick={() => cancelSubscription(s.subscriptionId)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="border px-3 py-1 rounded"
        >
          <MdNavigateBefore />
        </button>

        <span className="px-3 py-1">
          {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="border px-3 py-1 rounded"
        >
          <MdNavigateNext />
        </button>
      </div>

      {/* MODAL DETAILS */}
      {modalOpen && selectedSub && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Subscription Details</h2>

            <div className="space-y-2 text-sm">
              <p>
                <strong>User:</strong> {selectedSub.userName}
              </p>
              <p>
                <strong>Phone:</strong> {selectedSub.userPhone}
              </p>
              <p>
                <strong>Product:</strong> {selectedSub.product?.name}
              </p>
              <p>
                <strong>Variant:</strong> {selectedSub.variantSize}
              </p>
              <p>
                <strong>Plan:</strong> {selectedSub.plan}
              </p>
              <p>
                <strong>Next Delivery:</strong>{" "}
                {selectedSub.nextDeliveryDate
                  ? new Date(selectedSub.nextDeliveryDate).toDateString()
                  : "-"}
              </p>
            </div>

            <div className="flex justify-end mt-4 gap-3">
              <button
                className="px-4 py-2 border rounded"
                onClick={() => setModalOpen(false)}
              >
                Close
              </button>

              <button
                className="px-5 py-2 bg-red-600 text-white rounded"
                onClick={() => cancelSubscription(selectedSub.subscriptionId)}
              >
                Cancel Plan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptions;
