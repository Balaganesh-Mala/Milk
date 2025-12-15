import { useEffect, useState } from "react";
import { fetchProfile, removeWishlist } from "../api/project.api";
import { FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function WishlistPage() {
  const [wishlistData, setWishlistData] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const res = await fetchProfile();
      setWishlistData(res.data.user.wishlist || []);
    } catch (err) {
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (productId) => {
    try {
      await removeWishlist({ productId });
      loadWishlist();
    } catch {
      alert("Remove failed");
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  if (loading) return <div className="text-center py-10">Loading...</div>;

  if (!wishlistData.length)
    return <div className="text-center py-20 text-gray-600">No wishlist items ❤️</div>;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h2 className="text-3xl font-bold text-blue-900 mb-6">My Wishlist</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {wishlistData.map((p, idx) => (
          <div key={idx} className="border p-4 rounded-xl bg-white shadow">
            <p className="text-gray-800 font-semibold">{p.name || "Product"}</p>

            <button
              className="mt-3 bg-red-500 text-white px-3 py-1 rounded-lg flex items-center gap-2 text-sm"
              onClick={() => handleRemove(p._id || p)}
            >
              <FaTrash /> Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
