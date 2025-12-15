import { useEffect, useState } from "react";
import api from "../api/axios";

const useCartCount = () => {
  const [count, setCount] = useState(0);

  const loadCart = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return; // user not logged in → no cart count

      const res = await api.get("/cart");
      const items = res.data.cart?.items || [];

      const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);
      setCount(totalQty);
    } catch (err) {
      console.error("Cart Count Error:", err);
    }
  };

  useEffect(() => {
    loadCart();
    // Optional: Auto refresh on every page change
  }, []);

  return count;
};

export default useCartCount;
