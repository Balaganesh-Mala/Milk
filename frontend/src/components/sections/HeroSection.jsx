import { motion } from "framer-motion";
import banner from "../../assets/images/logo.jpg";

export default function HeroSection() {
  return (
    <div className="w-full bg-gradient-to-r from-blue-100 to-white py-10">
      <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-10">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 leading-tight">
            Smart Shopping,
            <span className="text-blue-600"> Trusted by Families</span>
          </h1>
          <p className="text-gray-600 mt-3">
            Buy fresh groceries, milk, daily essentials and more at your doorstep.
          </p>

          <button className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700 transition">
            Start Shopping
          </button>
        </motion.div>

        <motion.img
          src={banner}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-80 mx-auto"
        />
      </div>
    </div>
  );
}
