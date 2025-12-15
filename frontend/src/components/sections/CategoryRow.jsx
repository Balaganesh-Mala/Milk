import { useEffect, useState } from "react";
import { getCategories } from "../../api/project.api";
import { useNavigate } from "react-router-dom";

export default function CategoryRow() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data.categories || []);
    } catch (err) {
      console.log("Category load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  if (loading)
    return (
      <div className="text-center py-6 text-[#8ECDF2] text-sm font-medium animate-pulse">
        Loading categories…
      </div>
    );

  return (
    <section className="max-w-7xl mx-auto px-4 py-6 overflow-x-auto whitespace-nowrap scrollbar-hide">
      <div className="flex gap-5">
        {categories.map((c) => (
          <button
            key={c._id}
            onClick={() => navigate(`/products?category=${c._id}`)}
            className="
              flex flex-col items-center cursor-pointer w-28
            "
          >
            {/* SQUARE CATEGORY CARD */}
            <div
              className="
                w-28 h-28 rounded-xl bg-white border border-[#E6F3FA]
                shadow-sm hover:shadow-md transition-all duration-200
                flex items-center justify-center overflow-hidden
                hover:border-[#8ECDF2]
              "
            >
              <img
                src={
                  c.image?.url ||
                  c.image ||
                  c.images?.[0]?.url ||
                  '/placeholder-cat.png'
                }
                alt={c.name}
                className="w-full h-full object-cover hover:scale-105 transition"
              />
            </div>

            {/* CATEGORY NAME */}
            <p className="text-xs mt-2 font-semibold text-[#2E2E2E] text-center">
              {c.name}
            </p>
          </button>
        ))}
      </div>
    </section>
  );
}
