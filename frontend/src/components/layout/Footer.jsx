import {
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="mt-20 bg-[#F9FDFF] border-t border-[#E6F3FA] pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Brand */}
        <div>
          <h2 className="text-2xl font-bold text-[#2E2E2E]">MilkMart</h2>
          <p className="text-sm text-gray-600 mt-2 leading-relaxed">
            Fresh milk & dairy products delivered straight to your home every day.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-[#2E2E2E]">Quick Links</h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-600">
            {["Home", "Products", "Orders", "Subscriptions"].map((item) => (
              <li
                key={item}
                className="hover:text-[#8ECDF2] transition cursor-pointer"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-lg font-semibold text-[#2E2E2E]">Support</h3>
          <ul className="mt-3 space-y-3 text-sm text-gray-600">
            <li className="flex items-center gap-2 hover:text-[#4CAF50] transition cursor-pointer">
              <FaPhoneAlt className="text-[#8ECDF2]" /> +91 98765 43210
            </li>
            <li className="flex items-center gap-2 hover:text-[#8ECDF2] transition cursor-pointer">
              <FaEnvelope className="text-[#8ECDF2]" /> support@milkmart.com
            </li>
            <li className="hover:text-[#8ECDF2] cursor-pointer">Help & FAQ</li>
            <li className="hover:text-[#8ECDF2] cursor-pointer">Privacy Policy</li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h3 className="text-lg font-semibold text-[#2E2E2E]">Follow Us</h3>
          <div className="flex gap-5 mt-4">
            <FaFacebook className="text-2xl text-[#4267B2] hover:scale-110 transition cursor-pointer" />
            <FaInstagram className="text-2xl text-[#E4405F] hover:scale-110 transition cursor-pointer" />
            <FaWhatsapp className="text-2xl text-[#25D366] hover:scale-110 transition cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-12 pt-5 border-t border-[#E6F3FA] text-center">
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} MilkMart — All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
