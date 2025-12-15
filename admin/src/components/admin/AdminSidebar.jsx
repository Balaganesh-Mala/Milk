import { Link, useLocation } from "react-router-dom";
import {
  FiHome,
  FiBox,
  FiUsers,
  FiShoppingBag,
  FiSettings,
  FiTrendingUp,
  FiEdit2,
  FiRepeat,
} from "react-icons/fi";
import { TbCategory2 } from "react-icons/tb";

const AdminSidebar = ({ open, setOpen }) => {
  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <FiHome /> },
    { name: "Products", path: "/admin/products", icon: <FiBox /> },
    { name: "Orders", path: "/admin/orders", icon: <FiShoppingBag /> },
    { name: "Categories", path: "/admin/categories", icon: <TbCategory2 /> },
    { name: "Customers", path: "/admin/users", icon: <FiUsers /> },
    { name: "Payments", path: "/admin/payments", icon: <FiTrendingUp /> },
    {name: "Subscriptions", path: "/admin/subscriptions", icon: <FiRepeat/> },
    { name: "Banner", path: "/admin/banner", icon: <FiEdit2 /> },
    { name: "Settings", path: "/admin/settings", icon: <FiSettings /> },
  ];

  return (
    <>
      {/* MOBILE OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setOpen(false)}
        ></div>
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 z-50 border-r border-white/20 shadow-xl 
          transform transition-transform duration-300
          bg-gradient-to-b from-[#C7DFFF] via-[#7BA6FF] to-[#3E70FF]

          ${open ? "translate-x-0" : "-translate-x-64"}
          md:translate-x-0
        `}
      >
        {/* HEADER */}
        <div className="h-16 flex items-center px-6 border-b border-white/20">
          <h1 className="text-2xl font-bold text-white drop-shadow-md">
            Admin<span className="opacity-95">Panel</span>
          </h1>
        </div>

        {/* MENU */}
        <nav className="mt-4">
          {menuItems.map((item, idx) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={idx}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`
                  relative flex items-center gap-3 px-6 py-3 text-sm font-medium 
                  transition-all cursor-pointer text-white
                  ${isActive ? "opacity-100" : "opacity-80 hover:opacity-100"}
                `}
              >
                {/* ACTIVE HIGHLIGHT */}
                {isActive && (
                  <span className="
                    absolute inset-0 
                    bg-white/20 
                    rounded-lg
                    backdrop-blur-sm
                    transition
                  "></span>
                )}

                {/* ICON */}
                <span className="text-lg relative z-10">{item.icon}</span>

                {/* NAME */}
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;
