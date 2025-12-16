import { Routes, Route } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import HomePage from "./pages/HomePage";
import ProductsPage from "./pages/ProductsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CartPage from "./pages/CartPage";
import OrdersPage from "./pages/OrdersPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AccountPage from "./pages/AccountPage";
import EditProfile from "./pages/EditProfile.jsx";
import CheckoutPage from "./pages/CheckoutPage";
import Footer from "./components/layout/Footer";
import MobileBottomNav from "./components/layout/MobileBottomNav.jsx";

import EditAddressPage from "./pages/EditAddressPage.jsx";
import Subscriptions from "./pages/Subscriptions.jsx";
import SubscribePage from "./pages/SubscriptionsPage.jsx";
import WishlistPage from "./pages/WishlistPage.jsx";

export default function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:id" element={<ProductDetailsPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/order/:id" element={<OrderDetailsPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<SignupPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/add-address" element={<EditAddressPage />} />
        <Route path="/subscription" element={<Subscriptions />} />
        <Route path="/subscribe/:id" element={<SubscribePage />} />

        <Route path="/wishlist" element={<WishlistPage />} />
        <Route
          path="*"
          element={<div className="p-20 text-center">404 - Page Not Found</div>}
        />
      </Routes>
      <MobileBottomNav />
      <Footer />
    </>
  );
}
