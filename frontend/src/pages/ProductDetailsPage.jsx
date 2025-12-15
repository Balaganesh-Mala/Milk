import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaStar, FaArrowLeft } from "react-icons/fa";

import { fetchProductById, fetchProducts, addToCart } from "../api/project.api";

import ProductCard from "../components/ui/ProductCard";
import Swal from "sweetalert2";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [qty, setQty] = useState(1);

  /* -------------------------------
     RECENTLY VIEWED
  ------------------------------- */
  const saveRecentlyViewed = (product) => {
    if (!product?._id) return;

    let viewed = JSON.parse(localStorage.getItem("recent_viewed")) || [];
    viewed = viewed.filter((p) => p._id !== product._id);

    const basePrice = product?.variants?.[0]?.price ?? product.price ?? 0;

    viewed.unshift({
      _id: product._id,
      name: product.name,
      price: basePrice,
      image: product.images?.[0]?.url,
    });

    if (viewed.length > 10) viewed = viewed.slice(0, 10);
    localStorage.setItem("recent_viewed", JSON.stringify(viewed));
  };

  /* -------------------------------
     LOAD PRODUCT
  ------------------------------- */
  const loadProduct = async () => {
    try {
      setLoading(true);

      const res = await fetchProductById(id);
      const data = res.data.product;

      setProduct(data);
      saveRecentlyViewed(data);

      if (data.variants?.length > 0) {
        setSelectedVariant(data.variants[0]);
      }

      if (data.category?._id) {
        const rel = await fetchProducts({ category: data.category._id });
        setRelated(rel.data.products?.filter((p) => p._id !== data._id));
      }
    } catch {
      Swal.fire("Error", "Failed to load product", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  /* -------------------------------
     QTY CHANGE
  ------------------------------- */
  const handleQtyChange = (val) => {
    const maxStock = selectedVariant?.stock ?? product?.baseStock ?? 1;
    setQty((prev) => Math.min(Math.max(prev + val, 1), maxStock));
  };

  /* -------------------------------
     ADD TO CART
  ------------------------------- */
  const handleAddToCart = async () => {
    if (!localStorage.getItem("token")) return navigate("/login");

    try {
      await addToCart(
        product._id,
        qty,
        selectedVariant ? { size: selectedVariant.size } : null
      );

      Swal.fire("Success", "Added to cart!", "success");
      navigate("/cart");
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Cart failed", "error");
    }
  };

  /* -------------------------------
     BUY NOW
  ------------------------------- */
  const handleBuyNow = () => {
    if (!localStorage.getItem("token")) return navigate("/login");

    navigate("/checkout", {
      state: {
        buyNow: true,
        product: {
          _id: product._id,
          name: product.name,
          price: selectedVariant?.price ?? product.price,
          img: product.images?.[0]?.url,
          variant: selectedVariant?.size ?? null,
          qty,
        },
      },
    });
  };

  /* -------------------------------
     LOADING STATES
  ------------------------------- */
  if (loading)
    return (
      <p className="text-center text-[#3A8DFF] py-20 animate-pulse">
        Loading product details…
      </p>
    );

  if (!product)
    return <p className="text-center text-gray-500 py-20">Product Not Found</p>;

  /* -------------------------------
     PRICE LOGIC
  ------------------------------- */
  const mainPrice = selectedVariant?.price ?? product.price ?? 0;

  const mrp = selectedVariant?.mrp ?? product.mrp ?? mainPrice;

  const discount =
    mrp > mainPrice ? Math.round(((mrp - mainPrice) / mrp) * 100) : 0;

  const stock = selectedVariant?.stock ?? product.baseStock ?? 0;

  /* -------------------------------
     UI START
  ------------------------------- */
  return (
    <div className="bg-[#F6FBFF] min-h-screen pb-20">
      {/* HEADER */}
      <div className="max-w-6xl mx-auto px-6 py-8 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#1F2D3D] hover:text-[#3A8DFF] transition font-medium text-sm"
        >
          <FaArrowLeft size={16} /> Back
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* LEFT IMAGES */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Thumbnails */}
          <div className="hidden md:flex flex-col gap-3">
            {product.images?.map((img, i) => (
              <img
                key={i}
                src={img.url}
                alt=""
                className={`w-16 h-16 rounded-xl cursor-pointer border object-cover transition ${
                  selectedImage === i
                    ? "border-[#3A8DFF] shadow-md scale-105"
                    : "border-[#D9E6F2]"
                }`}
                onClick={() => setSelectedImage(i)}
              />
            ))}
          </div>

          {/* Main Image */}
          <div className="border border-[#D9E6F2] rounded-2xl w-full overflow-hidden bg-white shadow-sm">
            <img
              src={product.images?.[selectedImage]?.url}
              alt={product.name}
              className="object-cover w-full h-96 transition duration-300 hover:scale-110"
            />
          </div>
        </div>

        {/* RIGHT DETAILS */}
        <div>
          <h2 className="text-3xl font-bold text-[#1F2D3D]">{product.name}</h2>

          <p className="text-[#5A6A7A] mt-3 leading-relaxed">
            {product.description?.slice(0, 250)}
          </p>

          {/* PRICE */}
          <div className="flex items-center gap-4 mt-5">
            <p className="text-3xl font-bold text-[#3A8DFF]">₹{mainPrice}</p>

            {mrp > 0 && (
              <p className="line-through text-gray-400 text-lg">₹{mrp}</p>
            )}

            {discount > 0 && (
              <span className="text-[#4CAF50] text-sm font-semibold bg-[#E5F8E8] px-3 py-1 rounded-full">
                -{discount}% OFF
              </span>
            )}
          </div>

          {/* VARIANTS */}
          {product.variants?.length > 0 && (
            <div className="mt-6">
              <p className="font-semibold text-[#1F2D3D]">Choose Size:</p>

              <div className="flex gap-2 flex-wrap mt-2">
                {product.variants.map((v, i) => (
                  <button
                    key={i}
                    className={`px-4 py-2 rounded-xl border text-sm transition ${
                      selectedVariant?.size === v.size
                        ? "bg-[#3A8DFF] text-white border-[#3A8DFF]"
                        : "border-[#A9C7DE] text-[#3A3A3A] hover:border-[#3A8DFF]"
                    }`}
                    onClick={() => {
                      setSelectedVariant(v);
                      setQty(1);
                    }}
                  >
                    {v.size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STOCK */}
          <p className="mt-5">
            <span
              className={`px-3 py-1 text-xs rounded-full ${
                stock === 0
                  ? "bg-red-100 text-red-600"
                  : stock > 50
                  ? "bg-[#E5F8E8] text-[#4CAF50]"
                  : "bg-[#FFF7D9] text-[#B08500]"
              }`}
            >
              {stock === 0
                ? "Out of Stock"
                : stock > 50
                ? "In Stock"
                : "Limited Stock"}
            </span>
          </p>

          {/* QUANTITY */}
          <div className="mt-6">
            <p className="font-semibold text-[#1F2D3D]">Quantity:</p>

            <div className="flex items-center gap-3 mt-2">
              <button
                className="px-3 py-2 bg-[#E3EEF7] rounded-lg text-lg hover:bg-[#D6E8F5]"
                onClick={() => handleQtyChange(-1)}
              >
                −
              </button>

              <span className="text-lg font-medium">{qty}</span>

              <button
                className="px-3 py-2 bg-[#3A8DFF] text-white rounded-lg text-lg hover:bg-[#3377D6]"
                onClick={() => handleQtyChange(1)}
              >
                +
              </button>
            </div>
          </div>

          {/* BUTTONS */}
<div className="mt-7 flex flex-wrap gap-4">

  {/* Add to Cart */}
  <button
    onClick={handleAddToCart}
    disabled={stock === 0}
    className={`px-6 py-3 rounded-xl font-semibold shadow ${
      stock === 0
        ? "bg-gray-300 cursor-not-allowed text-gray-600"
        : "bg-[#3A8DFF] hover:bg-[#3377D6] text-white"
    }`}
  >
    {stock === 0 ? "Out of Stock" : "Add to Cart"}
  </button>

  {/* Buy Now */}
  <button
    onClick={handleBuyNow}
    disabled={stock === 0}
    className={`px-6 py-3 rounded-xl font-semibold border ${
      stock === 0
        ? "border-gray-400 text-gray-400 cursor-not-allowed"
        : "border-[#3A8DFF] text-[#3A8DFF] hover:bg-[#E7F2FF]"
    }`}
  >
    Buy Now
  </button>

  {/* SUBSCRIBE BUTTON — show only if backend allows */}
  {product.isSubscriptionAvailable && (
    <button
      onClick={() => navigate(`/subscribe/${product._id}`)}
      className="px-6 py-3 rounded-xl font-semibold bg-green-600 text-white shadow hover:bg-green-700 transition"
    >
      Subscribe Now
    </button>
  )}
</div>

        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {related.length > 0 && (
        <div className="max-w-6xl mx-auto mt-12 px-6">
          <h3 className="text-xl font-semibold text-[#1F2D3D] mb-4">
            Related Products
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* REVIEWS */}
      {product.reviews?.length > 0 && (
        <div className="max-w-6xl mx-auto mt-12 px-6">
          <h3 className="text-xl font-semibold text-[#1F2D3D] mb-4">
            Customer Reviews
          </h3>

          <div className="space-y-4">
            {product.reviews.map((rev, i) => (
              <div
                key={i}
                className="bg-white p-4 rounded-xl shadow border border-[#E3EEF7]"
              >
                <p className="font-semibold text-[#1F2D3D]">{rev.name}</p>

                <div className="flex items-center gap-1 mt-1">
                  {[...Array(5)].map((_, idx) => (
                    <FaStar
                      key={idx}
                      className={
                        idx < rev.rating ? "text-[#FFD700]" : "text-gray-300"
                      }
                      size={14}
                    />
                  ))}
                </div>

                <p className="text-sm text-[#4A4A4A] mt-2">{rev.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
