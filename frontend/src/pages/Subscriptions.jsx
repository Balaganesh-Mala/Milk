import { useEffect, useState } from "react";
import {
  fetchMySubscriptions,
  addSubscription,
  cancelSubscription,
} from "../api/project.api";
import { FaPlus, FaTimes, FaCheck } from "react-icons/fa";

export default function Subscriptions() {
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");

  // Temporary demo product (replace from UI)
  const demoVariants = ["500ML", "1L"];

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetchMySubscriptions();
      setSubs(res.data.subscriptions || []);
    } catch (err) {
      console.error(err);
      setSubs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Submit Subscription
  const handleSubmit = async () => {
    if (!selectedPlan || !selectedVariant) {
      alert("Please select plan & variant");
      return;
    }

    await addSubscription({
      productId: "PRODUCT_ID_HERE", // replace with real product
      plan: selectedPlan,
      variantSize: selectedVariant,
    });

    setShowModal(false);
    setSelectedPlan("");
    setSelectedVariant("");
    load();
  };

  const handleCancel = async (subId) => {
    await cancelSubscription({ subId });
    load();
  };

  if (loading)
    return (
      <div className="flex justify-center py-20 text-gray-500">
        Loading your subscriptions...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-blue-900">My Subscriptions</h2>

        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-3 rounded-lg shadow hover:bg-blue-700 transition"
        >
          <FaPlus /> Add Subscription
        </button>
      </div>

      {/* Empty UI */}
      {subs.length === 0 ? (
        <div className="text-center py-20 text-gray-500">
          <img
            src="/empty-subscription.png"
            className="w-40 mx-auto opacity-80"
            alt="empty"
          />
          <p className="mt-4">You don’t have any active subscriptions.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {subs.map((s) => (
            <div
              key={s._id}
              className="bg-white p-5 rounded-2xl shadow hover:shadow-md transition border"
            >
              {/* Product Row */}
              <div className="flex items-center gap-4">
                <img
                  src={s.product?.images?.[0]?.url}
                  alt={s.product?.name}
                  className="w-20 h-20 rounded-lg object-cover border"
                />

                <div>
                  <h3 className="text-lg font-semibold text-blue-900">
                    {s.product?.name}
                  </h3>
                  <p className="text-gray-600 text-sm capitalize">{s.plan} plan</p>

                  {/* Status Badge */}
                  <span
                    className={`text-xs px-3 py-1 rounded-full mt-1 inline-block font-medium ${
                      s.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {s.status}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t my-4"></div>

              {/* Subscription Details */}
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <strong>Variant:</strong> {s.variantSize || "-"}
                </p>
                <p>
                  <strong>Next Delivery:</strong>{" "}
                  {s.nextDeliveryDate
                    ? new Date(s.nextDeliveryDate).toLocaleDateString()
                    : "-"}
                </p>
              </div>

              {/* Cancel Button */}
              {s.status === "active" && (
                <button
                  onClick={() => handleCancel(s._id)}
                  className="mt-4 flex items-center justify-center gap-2 bg-red-100 text-red-600 px-4 py-2 rounded-lg w-full hover:bg-red-200 transition"
                >
                  <FaTimes /> Cancel Subscription
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ---------------- MODAL ---------------- */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-xl relative">

            {/* Close Button */}
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 text-gray-600 hover:text-black"
            >
              <FaTimes size={18} />
            </button>

            <h3 className="text-2xl font-bold text-blue-900 mb-4">
              Choose Your Plan
            </h3>

            {/* Plans */}
            <div className="space-y-3 mb-5">
              {["daily", "alternate", "weekly"].map((plan) => (
                <div
                  key={plan}
                  onClick={() => setSelectedPlan(plan)}
                  className={`border rounded-xl p-3 flex justify-between items-center cursor-pointer 
                    ${
                      selectedPlan === plan
                        ? "border-blue-600 bg-blue-50"
                        : "hover:bg-gray-50"
                    }`}
                >
                  <span className="capitalize text-gray-800">{plan} plan</span>
                  {selectedPlan === plan && (
                    <FaCheck className="text-blue-600" />
                  )}
                </div>
              ))}
            </div>

            {/* Variant Selection */}
            <label className="text-gray-700 font-medium">Select Variant</label>
            <select
              value={selectedVariant}
              onChange={(e) => setSelectedVariant(e.target.value)}
              className="w-full border p-3 rounded-lg mt-2 mb-5"
            >
              <option value="">Choose variant</option>
              {demoVariants.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition"
            >
              Confirm Subscription
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
