import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import adminApi from "../../api/adminAxios"; // ✅ Use admin axios instance
import { FiArrowLeft } from "react-icons/fi";

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadBlog = async () => {
    try {
      const res = await adminApi.get(`/blogs/${id}`);
      // ✅ Your backend returns: { success, blog }
      if (res.data.success && res.data.blog) {
        setBlog(res.data.blog);
      } else {
        throw new Error("Invalid blog response");
      }
    } catch (err) {
      console.error("Blog details error:", err);
      Swal.fire("Error", "Failed to load blog details", "error").then(() =>
        navigate("/admin/blogs")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlog();
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center py-24">
        <motion.p
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.4 }}
          className="text-gray-400 font-medium text-lg"
        >
          Loading blog…
        </motion.p>
      </div>
    );

  if (!blog) return null;

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

      {/* BACK BUTTON */}
      <button
        onClick={() => navigate("/admin/blogs")}
        className="flex items-center gap-2 text-gray-600 font-medium hover:text-black transition mb-6 text-sm"
      >
        <FiArrowLeft /> Back to Blogs
      </button>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
      >
        {/* BLOG IMAGE */}
        {blog.image?.url && (
          <div className="h-64 sm:h-72 bg-gray-50 overflow-hidden">
            <motion.img
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.08 }}
              transition={{ duration: 0.5 }}
              src={blog.image.url}
              alt={blog.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* BLOG CONTENT */}
        <div className="p-5 sm:p-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
            {blog.title}
          </h1>

          <p className="text-sm text-slate-600 mt-3 leading-relaxed">
            {blog.description || ""}
          </p>

          {/* OPTIONAL BLOG LINKS */}
          <div className="mt-6 flex flex-wrap gap-3">
            {blog.links?.map((l, i) => (
              <a
                key={i}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 text-xs sm:text-sm underline hover:text-orange-700 transition"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* SOCIAL MEDIA LINKS */}
          <div className="flex gap-5 mt-8 text-xl">
            {blog.socialLinks?.facebook && (
              <a href={`https://${blog.socialLinks.facebook}`} target="_blank" rel="noopener noreferrer"
                 className="text-blue-600 hover:scale-110 transition">
                Facebook
              </a>
            )}

            {blog.socialLinks?.instagram && (
              <a href={`https://${blog.socialLinks.instagram}`} target="_blank" rel="noopener noreferrer"
                 className="text-pink-500 hover:scale-110 transition">
                Instagram
              </a>
            )}

            {blog.socialLinks?.linkedin && (
              <a href={`https://${blog.socialLinks.linkedin}`} target="_blank" rel="noopener noreferrer"
                 className="text-sky-600 hover:scale-110 transition">
                LinkedIn
              </a>
            )}
          </div>
        </div>
      </motion.div>

    </section>
  );
};

export default BlogDetails;
