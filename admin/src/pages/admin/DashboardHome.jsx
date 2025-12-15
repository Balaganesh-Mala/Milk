import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminAxios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const StatCard = ({ title, value, subtitle }) => (
  <div className="bg-white p-4 rounded-2xl shadow">
    <p className="text-sm text-slate-500">{title}</p>
    <h3 className="text-2xl font-semibold mt-2">{value}</h3>
    {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
  </div>
);

const AdminDashboardHome = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // Fetch dashboard stats, monthly revenue, top products and recent orders in parallel
        const [sRes, rRes, tRes, oRes] = await Promise.all([
          adminApi.get("/admin/dashboard"),
          adminApi.get("/admin/revenue"),
          adminApi.get("/admin/top-products"),
          adminApi.get("/admin/orders"),
        ]);

        setStats(sRes.data.stats || {});

        // revenue endpoint returns array of { month: "m-y", total }
        const rev = (rRes.data.monthlyRevenue || []).map((r) => ({
          name: r.month,
          revenue: r.total,
        }));
        setRevenueData(rev);

        setTopProducts(tRes.data.topProducts || []);

        // recent orders (limit first 6)
        setRecentOrders((oRes.data.orders || []).slice(0, 6));
        console.log(oRes);
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to load dashboard"
        );
      }
      setLoading(false);
    };

    load();
  }, []);

  if (loading) return <div className="p-6">Loading dashboard...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">Admin Dashboard</h1>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Users" value={stats.totalUsers ?? 0} />
        <StatCard title="Total Orders" value={stats.totalOrders ?? 0} />
        <StatCard title="Total Products" value={stats.totalProducts ?? 0} />
        <StatCard
          title="Total Revenue"
          value={`₹${stats.totalRevenue ?? 0}`}
          subtitle="(successful payments)"
        />
      </div>

      {/* Main grid: Revenue chart + Top products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-4 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-3">Monthly Revenue</h2>
          {revenueData.length === 0 ? (
            <p className="text-sm text-slate-500">No revenue data available.</p>
          ) : (
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#ff7a00"
                    strokeWidth={3}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-3">Top Products</h2>

          {topProducts.length === 0 ? (
            <p className="text-sm text-slate-500">No top products found.</p>
          ) : (
            <ul className="space-y-3">
              {topProducts.map((p, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  {/* FIXED IMAGE ACCESS */}
                  <img
                    src={
                      p.images?.[0]?.url ||
                      p.images?.[0] ||
                      "https://via.placeholder.com/64"
                    }
                    alt={p.name}
                    className="w-12 h-12 object-cover rounded"
                  />

                  <div className="flex-1">
                    <div className="text-sm font-medium">{p.name}</div>

                    <div className="text-xs text-slate-500">
                      Sold: {p.totalSold}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recent orders table */}
      <div className="mt-6 bg-white p-4 rounded-2xl shadow">
        <h2 className="text-lg font-semibold mb-3">Recent Orders</h2>

        {recentOrders.length === 0 ? (
          <p className="text-sm text-slate-500">No recent orders.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left table-auto">
              <thead>
                <tr className="text-sm text-slate-600 border-b">
                  <th className="py-2">Order ID</th>
                  <th className="py-2">Customer</th>
                  <th className="py-2">Items</th>
                  <th className="py-2">Total</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Placed</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => (
                  <tr key={o._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 text-sm">{o._id}</td>
                    <td className="py-3 text-sm">
                      {o.user?.name || o.user?.email || "-"}
                    </td>
                    <td className="py-3 text-sm">
                      {o.orderItems?.length || 0}
                    </td>
                    <td className="py-3 text-sm">₹{o.totalPrice}</td>
                    <td className="py-3 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs ${
                          o.orderStatus === "Delivered"
                            ? "bg-green-100 text-green-600"
                            : o.orderStatus === "Cancelled"
                            ? "bg-red-100 text-red-600"
                            : "bg-orange-100 text-orange-600"
                        }`}
                      >
                        {o.orderStatus}
                      </span>
                    </td>
                    <td className="py-3 text-sm">
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardHome;
