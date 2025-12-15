import { useState, useContext, useEffect } from "react";
import { FiBell, FiMenu } from "react-icons/fi";
import { AdminAuthContext } from "../../context/AdminAuthContext";
import { getPublicSettings } from "../../api/settings.api";

const AdminNavbar = ({ toggleSidebar }) => {
  const { admin, logout } = useContext(AdminAuthContext);
  const [logo, setLogo] = useState(null);

  const [openProfile, setOpenProfile] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await getPublicSettings();
        const logoUrl = res.data.settings?.logo?.[0]?.url;
        setLogo(logoUrl);
      } catch (err) {
        console.log("Settings Load Error:", err);
      }
    };

    loadSettings();
  }, []);

  return (
    <header
      className="
        fixed top-0 left-0 right-0 h-16 z-40 flex items-center px-4 md:ml-64
        bg-gradient-to-r from-[#8ECDF2] via-[#7ADBE8] to-[#47E0C1]
        shadow-md backdrop-blur-lg border-b border-white/20
      "
    >
      {/* MOBILE MENU BUTTON */}
      <button className="md:hidden mr-4 text-white" onClick={toggleSidebar}>
        <FiMenu size={26} />
      </button>

      {/* LOGO */}
      <div className="flex items-center">
        <img
          src={logo}
          alt="Admin Logo"
          className="h-10 drop-shadow-lg brightness-110"
        />
      </div>

      <div className="flex-1"></div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-6">

        {/* NOTIFICATIONS */}
        <button className="relative text-white hover:opacity-80 transition">
          <FiBell size={22} />
          <span className="
            absolute -top-1 -right-1 bg-red-600 text-white text-[10px] 
            px-[6px] rounded-full shadow-md
          ">
            3
          </span>
        </button>

        {/* PROFILE */}
        <div className="relative">
          <button
            className="flex items-center gap-2 text-white"
            onClick={() => setOpenProfile(!openProfile)}
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
              className="h-9 w-9 rounded-full border border-white/40 shadow-md"
              alt="admin avatar"
            />
          </button>

          {/* DROPDOWN */}
          {openProfile && (
            <div
              className="
                absolute right-0 mt-3 w-60 rounded-xl p-4 z-50
                bg-white shadow-xl border border-gray-100 
                animate-fadeIn
              "
              onMouseLeave={() => setOpenProfile(false)}
            >
              <p className="font-semibold text-gray-800">{admin?.name}</p>
              <p className="text-gray-500 text-xs mb-3">{admin?.email}</p>

              <div className="h-[1px] bg-gray-200 my-2"></div>

              <button
                onClick={() => {
                  logout();
                  window.location.href = "/admin/login";
                }}
                className="
                  text-red-600 w-full text-left px-3 py-2 rounded-lg 
                  hover:bg-red-50 transition
                "
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminNavbar;
