import React, { useEffect, useState } from "react";
import { FiSearch, FiFilter } from "react-icons/fi";
import { motion } from "framer-motion";

import ProductCard from "../components/ui/ProductCard";
import { fetchProducts, getCategories } from "../api/project.api";

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortOrder, setSortOrder] = useState("");

  const [visibleCount, setVisibleCount] = useState(12);
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [search, selectedCategory, sortOrder]);

  const loadProducts = async () => {
    try {
      const params = {
        search,
        category: selectedCategory,
      };

      const res = await fetchProducts(params);
      let list = res.data.products || [];

      if (sortOrder === "low-high") list = list.sort((a, b) => a.price - b.price);
      if (sortOrder === "high-low") list = list.sort((a, b) => b.price - a.price);

      setProducts(list);
    } catch (err) {
      console.error("Products load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error("Category load error:", err);
    }
  };

  /* ----------------------------------------
        LOADING SCREEN
  ---------------------------------------- */
  if (loading)
    return (
      <section className="text-center py-24">
        <p className="text-[#3A8DFF] animate-pulse text-lg font-medium">
          Loading fresh products…
        </p>
      </section>
    );

  return (
    <section className="max-w-7xl mx-auto px-6 py-8">

      {/* Mobile Filter Button */}
      <div className="flex justify-end mb-6 md:hidden">
        <button
          onClick={() => setFilterOpen(true)}
          className="p-3 border rounded-full shadow-md bg-[#F0F8FF] hover:bg-[#DFF1FF] text-[#3A8DFF] transition"
        >
          <FiFilter size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-10">

        {/* SIDEBAR */}
        <aside className="space-y-6 sticky top-24 hidden md:block">

          {/* CATEGORIES */}
          <div className="rounded-2xl p-5 bg-[#F6FBFF] border border-[#E3EEF7] shadow-sm backdrop-blur">
            <h3 className="font-semibold text-[#1F2D3D] mb-3 text-lg">
              Categories
            </h3>

            <ul className="space-y-2 text-sm">
              <li
                className={`cursor-pointer rounded-lg px-3 py-2 transition ${
                  selectedCategory === ""
                    ? "bg-[#DFF6FF] font-semibold text-[#3A8DFF]"
                    : "text-[#5A6A7A] hover:bg-[#EDF7FF]"
                }`}
                onClick={() => setSelectedCategory("")}
              >
                All Products
              </li>

              {categories.map((c) => (
                <li
                  key={c._id}
                  className={`cursor-pointer rounded-lg px-3 py-2 transition ${
                    selectedCategory === c._id
                      ? "bg-[#DFF6FF] font-semibold text-[#3A8DFF]"
                      : "text-[#5A6A7A] hover:bg-[#EDF7FF]"
                  }`}
                  onClick={() => setSelectedCategory(c._id)}
                >
                  {c.name}
                </li>
              ))}
            </ul>
          </div>

          {/* SORTING */}
          <select
            className="p-3 rounded-xl border bg-white shadow-sm text-sm text-[#3A3A3A] w-full focus:ring-2 focus:ring-[#3A8DFF] outline-none"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="">Sort by Price</option>
            <option value="low-high">Low → High</option>
            <option value="high-low">High → Low</option>
          </select>
        </aside>

        {/* MAIN CONTENT */}
        <main>
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-[#1F2D3D]">
              Fresh Products
            </h1>

            {/* Search Bar */}
            <div className="mt-6 relative w-full">
              <FiSearch className="absolute left-4 top-3.5 text-gray-500" />
              <input
                type="text"
                placeholder="Search products…"
                className="
                  w-full 
                  border 
                  rounded-full 
                  py-3 
                  pl-12 pr-6 
                  bg-white 
                  shadow-sm 
                  focus:ring-2 
                  focus:ring-[#3A8DFF] 
                  outline-none
                "
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <p className="text-[#5A6A7A] mt-3 text-sm">
              Showing {Math.min(visibleCount, products.length)} of {products.length} items
            </p>
          </div>

          {/* PRODUCTS GRID */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            viewport={{ once: true }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8"
          >
            {products.slice(0, visibleCount).map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </motion.div>

          {/* LOAD MORE */}
          {visibleCount < products.length && (
            <div className="mt-14 text-center">
              <button
                onClick={() => setVisibleCount(visibleCount + 8)}
                className="
                  px-7 py-3 
                  rounded-full 
                  border border-[#3A8DFF] 
                  text-[#1F2D3D] 
                  hover:bg-[#3A8DFF] 
                  hover:text-white 
                  text-sm 
                  font-medium 
                  transition
                "
              >
                Load More →
              </button>
            </div>
          )}
        </main>
      </div>

      {/* MOBILE FILTER DRAWER */}
      {filterOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50 md:hidden"
          onClick={() => setFilterOpen(false)}
        >
          <div
            className="fixed bottom-0 left-0 right-0 bg-white p-6 rounded-t-2xl shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4 text-[#1F2D3D]">
              Filters
            </h3>

            <select
              className="border rounded-xl p-3 bg-white w-full text-sm mb-4"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option value={c._id} key={c._id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              className="border rounded-xl p-3 bg-white w-full text-sm"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="">Sort by Price</option>
              <option value="low-high">Low → High</option>
              <option value="high-low">High → Low</option>
            </select>

            <button
              onClick={() => setFilterOpen(false)}
              className="
                bg-[#3A8DFF] 
                text-white 
                py-3 
                mt-6 
                rounded-xl 
                w-full 
                text-sm 
                font-medium 
                hover:bg-[#3377D6]
              "
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default ProductsPage;
