import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminAxios";
import Swal from "sweetalert2";

import { FaPlus, FaEdit, FaTrash, FaCloudUploadAlt } from "react-icons/fa";

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState(null);

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    buttonText: "",
    buttonLink: "",
    isActive: true,
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // ---------------------------
  // LOAD BANNERS
  // ---------------------------
  const loadBanners = async () => {
    try {
      setLoading(true);
      const res = await adminApi.get("/banners");
      setBanners(res.data.banners || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBanners();
  }, []);

  // ---------------------------
  // OPEN ADD MODAL
  // ---------------------------
  const openAddModal = () => {
    setEditMode(false);
    setSelectedBanner(null);

    setForm({
      title: "",
      subtitle: "",
      buttonText: "",
      buttonLink: "",
      isActive: true,
    });

    setImage(null);
    setPreview(null);
    setModalOpen(true);
  };

  // ---------------------------
  // OPEN EDIT MODAL
  // ---------------------------
  const openEditModal = (banner) => {
    setEditMode(true);
    setSelectedBanner(banner);

    setForm({
      title: banner.title,
      subtitle: banner.subtitle,
      buttonText: banner.buttonText,
      buttonLink: banner.buttonLink,
      isActive: banner.isActive,
    });

    setPreview(banner.image?.url || null);
    setImage(null);

    setModalOpen(true);
  };

  // ---------------------------
  // UPLOAD IMAGE
  // ---------------------------
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // ---------------------------
  // SUBMIT FORM (ADD + UPDATE)
  // ---------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    Object.keys(form).forEach((key) => fd.append(key, form[key]));
    if (image) fd.append("image", image);

    try {
      if (editMode) {
        await adminApi.put(`/banners/${selectedBanner._id}`, fd);
        Swal.fire("Updated!", "Banner updated successfully.", "success");
      } else {
        await adminApi.post("/banners", fd);
        Swal.fire("Created!", "New banner added successfully.", "success");
      }

      setModalOpen(false);
      loadBanners();
    } catch (err) {
      Swal.fire(
        "Error",
        err.response?.data?.message || "Failed to save banner",
        "error"
      );
    }
  };

  // ---------------------------
  // DELETE BANNER
  // ---------------------------
  const deleteBanner = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "red",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await adminApi.delete(`/banners/${id}`);
        Swal.fire("Deleted!", "Banner removed successfully.", "success");
        loadBanners();
      }
    });
  };

  // ---------------------------
  // TOGGLE ACTIVE STATUS
  // ---------------------------
  const toggleActive = async (banner) => {
    await adminApi.put(`/banners/${banner._id}`, {
      isActive: !banner.isActive,
    });
    loadBanners();
  };

  // ---------------------------
  // RENDER UI
  // ---------------------------
  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-semibold">Manage Banners</h1>

        <button
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg"
          onClick={openAddModal}
        >
          <FaPlus /> Add Banner
        </button>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">
          <thead>
            <tr className="border-b">
              <th>Image</th>
              <th>Title</th>
              <th>Subtitle</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {banners.map((b) => (
              <tr key={b._id} className="border-b hover:bg-gray-50">
                <td>
                  <img
                    src={b.image?.url}
                    alt=""
                    className="w-20 h-12 rounded object-cover"
                  />
                </td>
                <td>{b.title}</td>
                <td>{b.subtitle}</td>
                <td>
                  <button
                    onClick={() => toggleActive(b)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      b.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {b.isActive ? "Active" : "Inactive"}
                  </button>
                </td>

                <td className="flex gap-3 text-lg">
                  <FaEdit
                    className="text-blue-600 cursor-pointer"
                    onClick={() => openEditModal(b)}
                  />
                  <FaTrash
                    className="text-red-600 cursor-pointer"
                    onClick={() => deleteBanner(b._id)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {banners.length === 0 && (
          <p className="text-center py-10 text-gray-500">No banners found.</p>
        )}
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-3">
              {editMode ? "Edit Banner" : "Add Banner"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* TITLE */}
              <input
                type="text"
                className="border p-2 rounded w-full"
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />

              {/* SUBTITLE */}
              <textarea
                className="border p-2 rounded w-full"
                placeholder="Subtitle"
                value={form.subtitle}
                onChange={(e) =>
                  setForm({ ...form, subtitle: e.target.value })
                }
              ></textarea>

              {/* BUTTON TEXT */}
              <input
                type="text"
                className="border p-2 rounded w-full"
                placeholder="Button Text"
                value={form.buttonText}
                onChange={(e) =>
                  setForm({ ...form, buttonText: e.target.value })
                }
              />

              {/* BUTTON LINK */}
              <input
                type="text"
                className="border p-2 rounded w-full"
                placeholder="Button Link (optional)"
                value={form.buttonLink}
                onChange={(e) =>
                  setForm({ ...form, buttonLink: e.target.value })
                }
              />

              {/* IMAGE */}
              <label className="block">
                <span className="font-medium text-sm">Banner Image</span>

                <label className="flex flex-col items-center justify-center h-32 border-dashed border rounded-lg cursor-pointer text-gray-500 hover:border-blue-500">
                  <FaCloudUploadAlt size={24} />
                  <span className="text-xs">Upload Image</span>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                </label>

                {preview && (
                  <img
                    src={preview}
                    className="mt-3 w-full h-32 object-cover rounded-lg border"
                  />
                )}
              </label>

              {/* ACTIVE STATUS */}
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                />
                Active
              </label>

              {/* ACTION BUTTONS */}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded"
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
}
