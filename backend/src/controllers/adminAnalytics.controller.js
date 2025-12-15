import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";
import Payment from "../models/payment.model.js";

// 📌 Total stats (users / orders / products / revenue)
export const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();

    // Total successful revenue
    const revenueAgg = await Payment.aggregate([
      { $match: { status: "paid" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalRevenue = revenueAgg[0]?.total || 0;

    res.json({
      stats: {
        totalUsers,
        totalOrders,
        totalProducts,
        totalRevenue,
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load dashboard stats" });
  }
};

// 📌 Monthly revenue analytics
export const getMonthlyRevenue = async (req, res) => {
  try {
    const monthlyData = await Payment.aggregate([
      { $match: { status: "paid" } },
      {
        $group: {
          _id: { $substr: ["$createdAt", 0, 7] }, // "YYYY-MM"
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const formatted = monthlyData.map((r) => ({
      month: r._id,
      total: r.total,
    }));

    res.json({ monthlyRevenue: formatted });
  } catch (err) {
    res.status(500).json({ message: "Failed to load monthly revenue" });
  }
};
