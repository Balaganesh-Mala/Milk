import React, { useEffect, useState } from "react";
import adminApi from "../../api/adminAxios";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { FiEdit2, FiTrash2, FiPlus, FiLoader, FiX, FiUploadCloud } from "react-icons/fi";

const BlogManager = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    readMoreLink: "",
    socialLinks: { facebook: "", instagram: "", linkedin: "", twitter: "" },
    image: null,
  });

  const [imagePreview, setImagePreview] = useState(null);

  // Load Blogs
  const loadBlogs = async () => {
    try {
      const res = await adminApi.get("/blogs");
      setBlogs(res.data.blogs || []);
    } catch {
      Swal.fire("Error", "Failed to load blogs", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  // Open Create Form
  const openCreateForm = () => {
    setEditingId(null);
    setForm({
      title: "",
      description: "",
      readMoreLink: "",
      socialLinks: { facebook: "", instagram: "", linkedin: "", twitter:"" },
      image: null,
    });
    setImagePreview(null);
    setShowForm(true);
  };

  // Open Edit Form
  const openEditForm = (blog) => {
    setEditingId(blog._id);
    setForm({
      title: blog.title,
      description: blog.description,
      readMoreLink: blog.readMoreLink,
      socialLinks: blog.socialLinks,
      image: null,
    });
    setImagePreview(blog.image?.url);
    setShowForm(true);
  };

  // Submit Blog
  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("readMoreLink", form.readMoreLink);
    fd.append("socialLinks", JSON.stringify(form.socialLinks));
    if (form.image) fd.append("image", form.image);

    try {
      if (editingId) {
        await adminApi.put(`/blogs/${editingId}`, fd);
        Swal.fire("Updated", "Blog updated successfully", "success");
      } else {
        await adminApi.post("/blogs", fd);
        Swal.fire("Created", "Blog added successfully", "success");
      }

      setShowForm(false);
      loadBlogs();
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Failed to save blog", "error");
    } finally {
      setProcessing(false);
    }
  };

  // Delete Blog
  const deleteBlog = async (id) => {
    const ok = await Swal.fire({
      icon: "question",
      title: "Delete this blog?",
      showCancelButton: true,
    });
    if (!ok.isConfirmed) return;

    try {
      await adminApi.delete(`/blogs/${id}`);
      Swal.fire("Deleted", "Blog removed successfully", "success");
      setBlogs(blogs.filter((b) => b._id !== id));
    } catch {
      Swal.fire("Error", "Delete failed", "error");
    }
  };

  return (
    <section className="max-w-6xl mx-auto py-6 px-4">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Manage Blogs</h2>
        <button
          onClick={openCreateForm}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-full text-white text-sm">
          <FiPlus size={16} /> Add Blog
        </button>
      </div>

      {/* BLOG GRID */}
      {loading ? (
        <div className="flex justify-center py-16">
          <FiLoader className="animate-spin text-gray-400" size={32} />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {blogs.map((b, i) => (
            <motion.div
              key={b._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
            >
              <img src={b.image?.url} className="w-full h-40 object-cover" alt="" />
              <div className="p-3">
                <p className="font-semibold text-sm truncate">{b.title}</p>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{b.description}</p>
              </div>
              <div className="flex justify-between border-t p-2">
                <button onClick={() => openEditForm(b)} className="text-blue-600">
                  <FiEdit2 size={16} />
                </button>
                <button onClick={() => deleteBlog(b._id)} className="text-red-500">
                  <FiTrash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* FORM MODAL */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
          >
            <div className="bg-white p-6 rounded-xl shadow-xl w-[420px] relative">

              <button
                onClick={() => setShowForm(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-red-600">
                <FiX size={20} />
              </button>

              <h3 className="text-lg font-semibold mb-4">
                {editingId ? "Edit Blog ✏" : "Create Blog 📝"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">

                <input
                  className="border w-full p-2 rounded text-sm"
                  placeholder="Blog Title"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />

                <textarea
                  className="border w-full h-24 p-2 rounded text-sm"
                  placeholder="Blog Description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />

                <input
                  className="border w-full p-2 rounded text-sm"
                  placeholder="Read More Link"
                  value={form.readMoreLink}
                  onChange={(e) => setForm({ ...form, readMoreLink: e.target.value })}
                />

                {/* IMAGE UPLOAD BOX */}
                <label className="block text-xs font-semibold text-gray-600">
                  Blog Image
                </label>
                <div
                  className="border border-dashed p-4 rounded-lg text-center cursor-pointer"
                  onClick={() => document.getElementById("blogImageInput").click()}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-gray-500 text-xs">
                      <FiUploadCloud size={22} />
                      Upload Image
                    </div>
                  )}
                </div>
                <input
                  id="blogImageInput"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    setForm({ ...form, image: e.target.files[0] });
                    setImagePreview(URL.createObjectURL(e.target.files[0]));
                  }}
                />

                {/* SUBMIT BUTTON */}
                <button
                  className="bg-orange-600 text-white w-full py-2 rounded-full text-sm hover:bg-orange-700 transition">
                  {processing ? <FiLoader className="animate-spin mx-auto" /> : editingId ? "Update" : "Create"}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default BlogManager;
