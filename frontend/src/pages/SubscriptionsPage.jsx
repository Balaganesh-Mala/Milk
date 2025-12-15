import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchProductById, addSubscription } from "../api/project.api";
import { FaCheckCircle } from "react-icons/fa";

export default function SubscribePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const PLANS = [
    {
      key: "daily",
      title: "Daily Delivery",
      desc: "Get fresh product delivered every day.",
    },
    {
      key: "alt",
      title: "Alternate Day",
      desc: "Delivery every 2 days. Good for medium usage.",
    },
    {
      key: "weekly",
      title: "Weekly",
      desc: "Delivered once a week. Best for storage users.",
    },
  ];

  // Load Product
  const loadProduct = async () => {
    try {
      const res = await fetchProductById(id);
      const p = res.data.product;

      setProduct(p);
      if (p.variants?.length > 0) setSelectedVariant(p.variants[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProduct(); }, []);

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      alert("Please pick a subscription plan.");
      return;
    }
    await addSubscription({
      productId: id,
      variantSize: selectedVariant?.size,
      plan: selectedPlan,
    });

    navigate("/subscription");
  };

  if (loading)
    return (
      <div className="flex justify-center items-center py-20">
        Loading subscription plans...
      </div>
    );

  if (!product)
    return (
      <div className="text-center py-20 text-gray-600">
        Product not found.
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h2 className="text-3xl font-bold text-blue-900 mb-6">
        Subscribe to {product.name}
      </h2>

      {/* Product Info */}
      <div className="flex gap-6 bg-white shadow rounded-2xl p-6 border">
        <img
          src={product.images?.[0]?.url}
          alt={product.name}
          className="w-32 h-32 rounded-xl object-cover border"
        />

        <div>
          <h3 className="text-xl font-semibold text-blue-900">
            {product.name}
          </h3>
          <p className="text-gray-600 mt-1">{product.description?.slice(0, 100)}...</p>

          {/* Variant Selector */}
          {product.variants?.length > 0 && (
            <div className="mt-4">
              <p className="font-semibold text-gray-700 mb-2">Choose Variant:</p>
              <div className="flex gap-2 flex-wrap">
                {product.variants.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-lg border text-sm transition ${
                      selectedVariant?.size === v.size
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 text-gray-700 hover:border-blue-600"
                    }`}
                  >
                    {v.size} — ₹{v.price}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Subscription Plan Selection */}
      <h3 className="text-2xl font-bold text-blue-900 mt-10 mb-4">
        Choose Your Plan
      </h3>

      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map((p) => (
          <div
            key={p.key}
            className={`p-6 rounded-2xl border shadow cursor-pointer transition hover:shadow-md relative ${
              selectedPlan === p.key
                ? "border-blue-600 bg-blue-50"
                : "border-gray-300 bg-white"
            }`}
            onClick={() => setSelectedPlan(p.key)}
          >
            {selectedPlan === p.key && (
              <FaCheckCircle className="absolute top-4 right-4 text-blue-600 text-xl" />
            )}
            <h4 className="text-lg font-semibold text-blue-900">{p.title}</h4>
            <p className="text-gray-600 mt-2">{p.desc}</p>
          </div>
        ))}
      </div>

      {/* Confirm Button */}
      <button
        onClick={handleSubscribe}
        className="w-full mt-10 bg-green-600 text-white py-4 rounded-xl text-lg font-semibold shadow hover:bg-green-700 transition"
      >
        Confirm Subscription
      </button>
    </div>
  );
}
