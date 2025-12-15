import Modal from "react-modal";
import { FaTimes, FaCalendarAlt } from "react-icons/fa";
import { useState } from "react";

Modal.setAppElement("#root");

export default function SubscriptionPopup({
  isOpen,
  onClose,
  variants,
  onSubscribe,
}) {
  const [selectedVariant, setSelectedVariant] = useState(
    variants?.[0] || null
  );

  const [plan, setPlan] = useState("daily");

  const plans = [
    { id: "daily", label: "Daily Delivery", icon: <FaCalendarAlt /> },
    { id: "3days", label: "Every 3 Days", icon: <FaCalendarAlt /> },
    { id: "weekly", label: "Weekly Delivery", icon: <FaCalendarAlt /> },
  ];

  const handleSubscribe = () => {
    if (!selectedVariant) return;
    onSubscribe(selectedVariant.size, plan);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      overlayClassName="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center"
      className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative"
    >
      <button
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        onClick={onClose}
      >
        <FaTimes size={20} />
      </button>

      <h2 className="text-lg font-bold text-blue-900 mb-4">
        Choose Subscription Plan
      </h2>

      {/* Variant Select */}
      <p className="font-semibold mb-2 text-gray-700">Size:</p>
      <div className="flex gap-2 mb-4">
        {variants.map((v, idx) => (
          <button
            key={idx}
            className={`px-4 py-2 rounded-lg border text-sm ${
              selectedVariant?.size === v.size
                ? "bg-blue-600 text-white border-blue-600"
                : "border-gray-400 text-gray-600"
            }`}
            onClick={() => setSelectedVariant(v)}
          >
            {v.size}
          </button>
        ))}
      </div>

      {/* Plan Select */}
      <p className="font-semibold mb-2 text-gray-700">Plan:</p>
      <div className="grid grid-cols-3 gap-3">
        {plans.map((p) => (
          <button
            key={p.id}
            className={`p-3 rounded-lg border flex flex-col items-center gap-2 ${
              plan === p.id
                ? "bg-green-600 text-white border-green-600"
                : "border-gray-300 text-gray-700"
            }`}
            onClick={() => setPlan(p.id)}
          >
            {p.icon}
            <span className="text-xs">{p.label}</span>
          </button>
        ))}
      </div>

      <button
        className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
        onClick={handleSubscribe}
      >
        Confirm Subscription
      </button>
    </Modal>
  );
}
