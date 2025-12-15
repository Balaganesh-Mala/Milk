export default function SidebarFilters({
  categories,
  selectedCategory,
  setSelectedCategory,
  priceRange,
  setPriceRange,
  minPrice,
  maxPrice
}) {
  return (
    <div className="bg-white p-4 border rounded-xl shadow-sm w-full">
      {/* Category Filter */}
      <h3 className="font-bold text-blue-900 mb-2">Category</h3>
      <select
        className="border p-2 rounded-lg w-full"
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        {categories.map((c, idx) => (
          <option key={idx} value={c.value}>
            {c.label}
          </option>
        ))}
      </select>

      {/* Price Range Filter */}
      <h3 className="font-bold text-blue-900 mt-4 mb-2">Price Range</h3>

      <div className="space-y-1">
        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          value={priceRange[0]}
          onChange={(e) =>
            setPriceRange([Number(e.target.value), priceRange[1]])
          }
        />

        <input
          type="range"
          min={minPrice}
          max={maxPrice}
          value={priceRange[1]}
          onChange={(e) =>
            setPriceRange([priceRange[0], Number(e.target.value)])
          }
        />
      </div>

      <p className="text-sm text-gray-600 mt-2">
        ₹{priceRange[0]} - ₹{priceRange[1]}
      </p>
    </div>
  );
}
