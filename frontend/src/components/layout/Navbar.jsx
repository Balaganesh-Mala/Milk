import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiShoppingCart, FiUser, FiMenu, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { label: "Home", path: "/" },
    { label: "Products", path: "/products" },
    { label: "Orders", path: "/orders" },
  ];

  return (
    <nav className="backdrop-blur-lg bg-white/70 border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="logo" className="h-10" />
          <span className="text-xl font-bold text-blue-900">Milk Fresh</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`relative font-medium transition ${
                location.pathname === item.path
                  ? "text-blue-700"
                  : "text-gray-600 hover:text-blue-700"
              }`}
            >
              {item.label}
              {location.pathname === item.path && (
                <motion.div
                  layoutId="underline"
                  className="absolute left-0 bottom-[-4px] w-full h-[2px] bg-blue-700"
                />
              )}
            </Link>
          ))}

          {/* Cart */}
          <Link to="/cart" className="relative">
            <FiShoppingCart size={22} />
            <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-[6px] rounded-full">
              2
            </span>
          </Link>

          {/* User */}
          <Link to="/account">
            <FiUser size={22} className="text-gray-700 hover:text-blue-700" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="md:hidden bg-white/90 backdrop-blur-md border-t shadow-sm p-5 flex flex-col gap-4"
          >
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`py-1 ${
                  location.pathname === item.path
                    ? "text-blue-700 font-semibold"
                    : "text-gray-700 hover:text-blue-700"
                }`}
                onClick={() => setMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}

            <Link
              to="/cart"
              className="flex items-center gap-2"
              onClick={() => setMenuOpen(false)}
            >
              <FiShoppingCart /> Cart
            </Link>

            <Link
              to="/account"
              className="flex items-center gap-2"
              onClick={() => setMenuOpen(false)}
            >
              <FiUser /> Account
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
