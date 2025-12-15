import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  fetchProfile,
  removeWishlist,
  addWalletBalance,
  getMyOrders,
  cancelSubscription,
} from "../api/project.api";

import {
  FaUser,
  FaBox,
  FaMapMarkedAlt,
  FaHeart,
  FaWallet,
  FaBell,
  FaSignOutAlt,
  FaTrash,
  FaPlus,
} from "react-icons/fa";

export default function AccountPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);

  // wallet popup state
  const [showWalletPopup, setShowWalletPopup] = useState(false);
  const [walletAmount, setWalletAmount] = useState("");

  // Load user info
  const loadUser = async () => {
    try {
      setLoading(true);
      const res = await fetchProfile();
      setUser(res.data.user);
    } catch (err) {
      localStorage.removeItem("token");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const logoutHandler = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  // Remove wishlist item
  const removeWishlistItem = async (productId) => {
    try {
      await removeWishlist({ productId });
      loadUser(); // refresh UI
    } catch {
      alert("Wishlist update failed");
    }
  };

  // Wallet - Add Money
  const handleWalletAdd = async () => {
    if (!walletAmount || walletAmount <= 0) return alert("Enter valid amount");

    try {
      await addWalletBalance({ amount: walletAmount });
      setWalletAmount("");
      setShowWalletPopup(false);
      loadUser();
    } catch {
      alert("Wallet update failed");
    }
  };

  // Cancel Subscription
  const handleCancelSubscription = async (subId) => {
    try {
      await cancelSubscription({ subId });
      loadUser();
    } catch {
      alert("Subscription cancel failed");
    }
  };

  if (loading)
    return <div className="text-center py-20 text-gray-500">Loading...</div>;

  if (!user)
    return <div className="text-center py-20 text-red-500">User not found</div>;

  // ⏳ UI per tab
  const tabScreens = {
    profile: (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-blue-900">Profile</h2>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email || "Not provided"}</p>
        <p><strong>Phone:</strong> +91 {user.phone}</p>

        <button
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg"
          onClick={() => navigate("/edit-profile")}
        >
          Edit Profile
        </button>
      </div>
    ),

    orders: (
      <div>
        <h2 className="text-2xl font-bold text-blue-900">My Orders</h2>
        <p className="mt-2 text-gray-600">Order history coming soon...</p>
      </div>
    ),

    address: (
      <div>
        <h2 className="text-2xl font-bold text-blue-900">Saved Addresses</h2>

        {!user.addresses?.length ? (
          <p className="text-gray-500 mt-2">No addresses available.</p>
        ) : (
          <div className="grid gap-4 mt-4">
            {user.addresses.map((addr, idx) => (
              <div key={idx} className="border p-4 rounded-xl bg-gray-50">
                <p className="font-semibold">{addr.street}</p>
                <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                <p className="text-gray-500">Phone: +91 {addr.phone}</p>
                {addr.isDefault && (
                  <p className="text-green-600 mt-1 text-sm">Default Address</p>
                )}
              </div>
            ))}
          </div>
        )}

        <button
          className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg"
          onClick={() => navigate("/add-address")}
        >
          Add Address
        </button>
      </div>
    ),

    wishlist: (
      <div>
        <h2 className="text-2xl font-bold text-blue-900">Wishlist</h2>

        {!user.wishlist?.length ? (
          <p className="mt-2 text-gray-500">No wishlist products yet.</p>
        ) : (
          <div className="grid gap-4 mt-4">
            {user.wishlist.map((product, idx) => (
              <div
                key={idx}
                className="border p-4 rounded-xl flex justify-between items-center"
              >
                <p>Product: {product}</p>

                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => removeWishlistItem(product)}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    ),

    wallet: (
      <div>
        <h2 className="text-2xl font-bold text-blue-900 mb-3">Wallet</h2>

        <div className="text-xl font-bold text-green-700">
          ₹{user.wallet?.toFixed(2) || 0}
        </div>

        <button
          className="mt-5 flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg"
          onClick={() => setShowWalletPopup(true)}
        >
          <FaPlus /> Add Money
        </button>

        {/* Wallet Popup */}
        {showWalletPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg w-80 shadow-xl">
              <h3 className="text-lg font-semibold mb-3">Add Wallet Money</h3>

              <input
                type="number"
                className="border w-full p-2 rounded-lg"
                placeholder="Enter amount"
                value={walletAmount}
                onChange={(e) => setWalletAmount(e.target.value)}
              />

              <button
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg"
                onClick={handleWalletAdd}
              >
                Add
              </button>

              <button
                className="mt-2 w-full text-gray-600 py-2 rounded-lg border"
                onClick={() => setShowWalletPopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    ),

    subscriptions: (
      <div>
        <h2 className="text-2xl font-bold text-blue-900 mb-3">
          My Subscriptions
        </h2>

        {!user.subscriptions?.length ? (
          <p className="text-gray-500">No active subscriptions.</p>
        ) : (
          <div className="grid gap-4">
            {user.subscriptions.map((sub, idx) => (
              <div
                key={idx}
                className="border p-4 rounded-xl flex justify-between items-center bg-gray-50"
              >
                <div>
                  <p className="font-semibold">Product: {sub.product}</p>
                  <p className="text-gray-600 text-sm">
                    Size: {sub.variantSize} | Plan: {sub.plan}
                  </p>
                  <p className="text-green-600 text-sm">
                    Status: {sub.status}
                  </p>
                </div>

                <button
                  className="text-red-500 hover:text-red-700"
                  onClick={() => handleCancelSubscription(sub._id)}
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    ),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 grid md:grid-cols-4 gap-10">
      
      {/* Sidebar */}
      <aside className="bg-white shadow-lg p-6 rounded-xl">
        
        <div className="mb-6 text-center">
          <div className="w-20 h-20 mx-auto bg-blue-200 rounded-full flex justify-center items-center">
            <FaUser className="text-4xl text-blue-700" />
          </div>
          <h3 className="mt-2 text-lg font-bold">{user.name}</h3>
          <p className="text-gray-500 text-sm">{user.email}</p>
        </div>

        <nav className="space-y-3">

          {[
            ["profile", <FaUser />, "Profile"],
            ["orders", <FaBox />, "Orders"],
            ["address", <FaMapMarkedAlt />, "Address"],
            ["wishlist", <FaHeart />, "Wishlist"],
            ["subscriptions", <FaBell />, "Subscriptions"],
          ].map(([tab, icon, label]) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg ${
                activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-100"
              }`}
            >
              {icon} {label}
            </button>
          ))}

          <button
            onClick={logoutHandler}
            className="w-full mt-6 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500 text-white"
          >
            <FaSignOutAlt /> Logout
          </button>
        </nav>
      </aside>

      {/* tab content */}
      <section className="md:col-span-3 bg-white shadow-lg p-6 rounded-xl">
        {tabScreens[activeTab]}
      </section>
    </div>
  );
}
