import React from "react";

const ProductForm = ({ form, setForm, submit, loading }) => {
  return (
    <form className="grid gap-4" onSubmit={submit}>
      <input
        type="text"
        placeholder="Product Name"
        className="border p-3 rounded"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />

      <textarea
        placeholder="Description"
        className="border p-3 rounded"
        value={form.description}
        onChange={(e) =>
          setForm({ ...form, description: e.target.value })
        }
        required
      />

      <input
        type="number"
        placeholder="Price"
        className="border p-3 rounded"
        value={form.price}
        onChange={(e) => setForm({ ...form, price: e.target.value })}
        required
      />

      <input
        type="number"
        placeholder="Stock"
        className="border p-3 rounded"
        value={form.stock}
        onChange={(e) => setForm({ ...form, stock: e.target.value })}
        required
      />

      <button
        type="submit"
        className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg"
      >
        {loading ? "Saving..." : "Save Product"}
      </button>
    </form>
  );
};

export default ProductForm;
