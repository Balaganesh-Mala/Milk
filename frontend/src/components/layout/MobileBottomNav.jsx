import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiGrid,
  FiShoppingBag,
  FiUser,
} from "react-icons/fi";

export default function MobileBottomNav() {
  const navItems = [
    { name: "Home", path: "/", icon: FiHome },
    { name: "Products", path: "/products", icon: FiGrid },
    { name: "Orders", path: "/orders", icon: FiShoppingBag },
    { name: "Profile", path: "/profile", icon: FiUser },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-md md:hidden">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={idx}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center text-xs font-medium transition ${
                  isActive
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-blue-500"
                }`
              }
            >
              <Icon size={22} />
              <span className="mt-1">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
