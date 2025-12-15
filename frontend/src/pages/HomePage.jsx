import { useEffect, useState } from "react";
import HeroCarousel from "../components/sections/HeroCarousel";
import CategoryRow from "../components/sections/CategoryRow";
import ProductGrid from "../components/sections/ProductGrid";

import { fetchProducts, getCategories } from "../api/project.api";

export default function HomePage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // 🔹 Load Categories
  const loadCategories = async () => {
    try {
      const res = await getCategories();
      const data = res.data.categories || [];
      // Convert format for UI
      const formatted = data.map((c) => ({
        label: c.name,
        image: c.image || "/placeholder.png",
      }));
      setCategories(formatted);
    } catch (err) {
      console.log("Failed to load categories", err);
    } finally {
      setLoadingCategories(false);
    }
  };

  // 🔹 Load Products
  const loadProducts = async () => {
    try {
      const res = await fetchProducts();
      setProducts(res.data.products || []);
    } catch (err) {
      console.log("Failed to load products", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  return (
    <>
      <HeroCarousel />

      {/* Category Row */}
      {loadingCategories ? (
        <div className="text-center py-6">Loading categories...</div>
      ) : (
        <CategoryRow categories={categories} />
      )}

      {/* Products */}
      {loadingProducts ? (
        <div className="text-center py-10">Loading products...</div>
      ) : (
        <ProductGrid products={products} />
      )}
    </>
  );
}
