import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";

const ProductCard = ({ product }) => {
  if (!product) {
    console.warn("⚠ ProductCard received undefined product");
    return null;
  }

  /* Price Logic */
  const basePrice =
    product?.variants?.[0]?.price ?? product?.price ?? 0;

  const mrp =
    product?.variants?.[0]?.mrp ?? product?.mrp ?? basePrice;

  const discount =
    mrp > basePrice ? Math.round(((mrp - basePrice) / mrp) * 100) : 0;

  /* Safe image fallback */
  const mainImage = product?.images?.[0]?.url || "/placeholder.png";

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 180, damping: 14 }}
      className="
        bg-white 
        rounded-2xl 
        shadow-[0_4px_14px_rgba(0,0,0,0.08)] 
        hover:shadow-[0_6px_22px_rgba(0,0,0,0.12)]
        overflow-hidden 
        border border-[#E3ECF4] 
        cursor-pointer 
        transition-all
      "
    >
      {/* IMAGE */}
      <Link to={`/product/${product._id}`}>
        <div className="relative h-[210px] bg-[#F5FAFF]">
          {/* DISCOUNT BADGE */}
          {discount > 0 && (
            <span
              className="
                absolute top-3 left-3 
                bg-gradient-to-r from-[#3A8DFF] to-[#6AC8FF]
                text-white text-[11px] 
                px-2 py-1 
                rounded-md shadow 
                font-semibold
              "
            >
              -{discount}%
            </span>
          )}

          <motion.img
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.35 }}
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-cover rounded-b-lg"
          />
        </div>
      </Link>

      {/* CONTENT */}
      <div className="p-4">
        {/* PRODUCT NAME */}
        <h3
          className="
            font-semibold 
            text-[#1F1F1F] 
            text-[15px]
            leading-tight 
            truncate 
            group-hover:text-[#3A8DFF] 
            transition
          "
        >
          {product.name}
        </h3>

        {/* PRICE */}
        <div className="flex items-center gap-2 text-sm mt-2">
          {mrp > basePrice && (
            <span className="text-gray-400 line-through text-[13px]">
              ₹{mrp}
            </span>
          )}
          <span className="text-[#1F1F1F] font-bold text-[15px]">
            ₹{basePrice}
          </span>
        </div>

        {/* VIEW DETAILS */}
        <div className="flex items-center justify-between mt-4">
          <Link
            to={`/product/${product._id}`}
            className="
              text-xs 
              text-[#3A8DFF] 
              font-medium 
              flex items-center 
              hover:underline 
              transition
            "
          >
            View <FiArrowRight className="ml-1" size={12} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
