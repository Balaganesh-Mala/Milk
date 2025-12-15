import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminAxios";
import Swal from "sweetalert2";

import { FaPlus, FaEdit, FaTrash, FaCloudUploadAlt } from "react-icons/fa";
import { MdNavigateNext, MdNavigateBefore } from "react-icons/md";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [images, setImages] = useState([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    baseStock: "",
    mrp: "",
    weight: "",
    flavor: "",
    expiryDate: "",
    category: "",
    brand: "Hunger Bites",
    isFeatured: false,
    isBestSeller: false,
    isSubscriptionAvailable: false,
  });

  const [variants, setVariants] = useState([{ size: "", price: "", stock: "" }]);

  const [page, setPage] = useState(1);
  const perPage = 50;

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    const res = await adminApi.get("/products");
    setProducts(res.data.products);
    setFiltered(res.data.products);
  };

  const loadCategories = async () => {
    const res = await adminApi.get("/categories");
    setCategories(res.data.categories);
  };

  // Filter logic
  useEffect(() => {
    let data = [...products];

    if (search.trim()) {
      data = data.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (categoryFilter) {
      data = data.filter((p) => p.category?._id === categoryFilter);
    }

    setFiltered(data);
    setPage(1);
  }, [search, categoryFilter, products]);

  const totalPages = Math.ceil(filtered.length / perPage) || 1;
  const paginatedData = filtered.slice((page - 1) * perPage, page * perPage);

  // Input & checkbox handler
  const handleChange = (e) => {
    let { name, value, type, checked } = e.target;
    if (type === "checkbox") value = checked;
    setForm({ ...form, [name]: value });
  };

  const handleVariantChange = (index, key, value) => {
    const updated = [...variants];
    updated[index][key] = value;
    setVariants(updated);
  };

  const addVariantRow = () => {
    setVariants([...variants, { size: "", price: "", stock: "" }]);
  };

  const removeVariantRow = (i) => {
    setVariants(variants.filter((_, idx) => idx !== i));
  };

  // Images
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    files.forEach((file) =>
      setImages((prev) => [
        ...prev,
        { file, preview: URL.createObjectURL(file) },
      ])
    );
  };

  const removeImage = (i) => setImages(images.filter((_, idx) => idx !== i));

  // Create Modal
  const openCreateModal = () => {
    setEditMode(false);
    setSelectedProduct(null);
    setImages([]);
    setVariants([{ size: "", price: "", stock: "" }]);
    setForm({
      name: "",
      description: "",
      price: "",
      baseStock: "",
      mrp: "",
      weight: "",
      flavor: "",
      expiryDate: "",
      category: "",
      brand: "Hunger Bites",
      isFeatured: false,
      isBestSeller: false,
      isSubscriptionAvailable: false,
    });
    setModalOpen(true);
  };

  // Edit Modal
  const openEditModal = (p) => {
    setEditMode(true);
    setSelectedProduct(p);

    setImages(
      p.images?.map((i) => ({
        preview: i.url,
        file: null,
      })) || []
    );

    setVariants(
      p.variants?.map((v) => ({
        size: v.size,
        price: v.price,
        stock: v.stock,
      })) || [{ size: "", price: "", stock: "" }]
    );

    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      baseStock: p.baseStock,
      mrp: p.mrp,
      weight: p.weight,
      flavor: p.flavor,
      expiryDate: p.expiryDate?.split("T")[0] || "",
      category: p.category?._id,
      brand: p.brand,
      isFeatured: p.isFeatured,
      isBestSeller: p.isBestSeller,
      isSubscriptionAvailable: p.isSubscriptionAvailable,
    });

    setModalOpen(true);
  };

  // Submit Form
  const submitForm = async (e) => {
    e.preventDefault();

    try {
      const fd = new FormData();

      Object.keys(form).forEach((key) => fd.append(key, form[key]));
      fd.append("variants", JSON.stringify(variants));

      images.forEach((img) => img.file && fd.append("images", img.file));

      editMode
        ? await adminApi.put(`/products/${selectedProduct._id}`, fd)
        : await adminApi.post("/products", fd);

      Swal.fire("Success", editMode ? "Updated" : "Created", "success");
      setModalOpen(false);
      loadProducts();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed", "error");
    }
  };

  const deleteProduct = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "red",
    }).then(async (resp) => {
      if (resp.isConfirmed) {
        await adminApi.delete(`/products/${id}`);
        Swal.fire("Deleted", "", "success");
        loadProducts();
      }
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-semibold">Manage Products</h1>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FaPlus /> Add Product
        </button>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex gap-3 mb-6">
        <input
          placeholder="Search..."
          className="border px-3 py-2 rounded-lg"
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="border px-3 py-2 rounded-lg"
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto bg-white rounded-xl shadow p-4">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b">
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Variants</th>
              <th>Featured</th>
              <th>Bestseller</th>
              <th>Subscription</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((p) => (
              <tr key={p._id} className="border-b hover:bg-gray-50">
                <td>
                  <img
                    src={p.images?.[0]?.url}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                </td>
                <td>{p.name}</td>
                <td>{p.category?.name}</td>
                <td>
                  {p.variants.map((v, i) => (
                    <div key={i} className="text-xs">
                      {v.size} — ₹{v.price} ({v.stock} stock)
                    </div>
                  ))}
                </td>
                <td>{p.isFeatured ? "Yes" : "No"}</td>
                <td>{p.isBestSeller ? "Yes" : "No"}</td>
                <td>{p.isSubscriptionAvailable ? "Yes" : "No"}</td>
                <td className="flex gap-2">
                  <FaEdit
                    className="text-blue-600 cursor-pointer"
                    onClick={() => openEditModal(p)}
                  />
                  <FaTrash
                    className="text-red-600 cursor-pointer"
                    onClick={() => deleteProduct(p._id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-6">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="border px-3 py-1 rounded"
        >
          <MdNavigateBefore />
        </button>

        <span className="px-3 py-1">{page} / {totalPages}</span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          className="border px-3 py-1 rounded"
        >
          <MdNavigateNext />
        </button>
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-2xl overflow-y-auto max-h-[90vh]">
          
            <h3 className="text-xl font-semibold mb-3">
              {editMode ? "Edit Product" : "Add Product"}
            </h3>

            <form onSubmit={submitForm} className="space-y-3">

              {/* Required Name Field */}
              <input
                name="name"
                placeholder="Product Name"
                value={form.name}
                onChange={handleChange}
                required
                className="border w-full p-2 rounded"
              />

              {/* Price */}
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={form.price}
                onChange={handleChange}
                className="border w-full p-2 rounded"
                required
              />

              {/* MRP */}
              <input
                type="number"
                name="mrp"
                placeholder="MRP"
                value={form.mrp}
                onChange={handleChange}
                className="border w-full p-2 rounded"
                required
              />

              {/* Base Stock */}
              <input
                type="number"
                name="baseStock"
                placeholder="Base Stock"
                value={form.baseStock}
                onChange={handleChange}
                className="border w-full p-2 rounded"
                required
              />

              {/* Weight */}
              <input
                name="weight"
                placeholder="Weight (500ml, 1L etc)"
                value={form.weight}
                onChange={handleChange}
                className="border w-full p-2 rounded"
              />

              {/* Flavor */}
              <input
                name="flavor"
                placeholder="Flavor (Chocolate / Plain)"
                value={form.flavor}
                onChange={handleChange}
                className="border w-full p-2 rounded"
              />

              {/* Expiry */}
              <input
                type="date"
                name="expiryDate"
                placeholder="Expiry Date"
                value={form.expiryDate}
                onChange={handleChange}
                className="border w-full p-2 rounded"
              />

              {/* Category */}
              <select
                name="category"
                value={form.category}
                onChange={handleChange}
                required
                className="border w-full p-2 rounded"
              >
                <option>Select category</option>
                {categories.map((c) => (
                  <option value={c._id} key={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Description */}
              <textarea
                name="description"
                placeholder="Description"
                value={form.description}
                onChange={handleChange}
                className="border w-full p-2 rounded"
              />

              {/* Check flags */}
              <label className="flex gap-2">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={form.isFeatured}
                  onChange={handleChange}
                />
                Featured
              </label>

              <label className="flex gap-2">
                <input
                  type="checkbox"
                  name="isBestSeller"
                  checked={form.isBestSeller}
                  onChange={handleChange}
                />
                Bestseller
              </label>

              <label className="flex gap-2">
                <input
                  type="checkbox"
                  name="isSubscriptionAvailable"
                  checked={form.isSubscriptionAvailable}
                  onChange={handleChange}
                />
                Subscription Available
              </label>

              {/* VARIANTS */}
              <h4 className="font-semibold mt-4">Variants:</h4>
              {variants.map((v, i) => (
                <div key={i} className="grid grid-cols-3 gap-2">
                  <input
                    placeholder="Size (500ml, 1L)"
                    value={v.size}
                    onChange={(e) =>
                      handleVariantChange(i, "size", e.target.value)
                    }
                    className="border p-2 rounded"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    value={v.price}
                    onChange={(e) =>
                      handleVariantChange(i, "price", e.target.value)
                    }
                    className="border p-2 rounded"
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    value={v.stock}
                    onChange={(e) =>
                      handleVariantChange(i, "stock", e.target.value)
                    }
                    className="border p-2 rounded"
                  />
                  {variants.length > 1 && (
                    <button
                      type="button"
                      className="text-red-500 text-sm"
                      onClick={() => removeVariantRow(i)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                className="text-sm text-blue-600"
                onClick={addVariantRow}
              >
                + Add another variant
              </button>

              {/* IMAGES */}
              <label className="font-semibold text-sm">Images:</label>
              <div className="grid grid-cols-3 gap-3">
                {images.map((img, i) => (
                  <div key={i} className="relative border rounded-lg overflow-hidden">
                    <img src={img.preview} className="w-full h-28 object-cover" />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-black/50 text-white px-2 text-xs rounded"
                      onClick={() => removeImage(i)}
                    >
                      X
                    </button>
                  </div>
                ))}

                <label className="flex flex-col border-dashed border rounded-lg h-28 justify-center items-center cursor-pointer text-gray-500 hover:border-orange-500">
                  <FaCloudUploadAlt size={24} />
                  <span className="text-xs">Upload</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end mt-4 gap-3">
                <button
                  type="button"
                  className="px-4 py-2 border rounded"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded"
                >
                  {editMode ? "Update" : "Create"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
