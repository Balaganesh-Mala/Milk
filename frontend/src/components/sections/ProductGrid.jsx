// ProductGrid.jsx
import React from "react";
import ProductCard from "../ui/ProductCard";

export default function ProductGrid({ products = [] }) {
  if (!Array.isArray(products) || products.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-blue-900 mb-6">Products For You</h2>
        <p className="text-gray-500">No products found.</p>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Products For You</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {products.map((product) => (
          // pass full product object so price logic stays consistent
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
}
