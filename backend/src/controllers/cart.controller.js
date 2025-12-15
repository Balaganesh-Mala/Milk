import asyncHandler from "express-async-handler";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

//
// ⭐ Helper: Recalculate totals
//
const calculateTotals = (items, deliveryCharge = 0) => {
  const subtotal = items.reduce(
    (sum, item) => sum + (item.price * item.quantity || 0),
    0
  );

  return {
    subtotal,
    grandTotal: subtotal + deliveryCharge,
  };
};


//
// 🛒 ADD TO CART (variant + stock safe)
//
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, variant } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error("Product ID is required");
  }

  // ⛔ YOU DID WRONG HERE EARLIER
  // const product = await Product.findById(req.body); ❌ WRONG

  // ✅ FIX: only pass productId
  const product = await Product.findById(productId);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  let selectedPrice = product.price;
  let selectedStock = product.stock;

  if (variant?.size && product.variants?.length > 0) {
    const selectedVariant = product.variants.find(
      (v) => v.size === variant.size
    );

    if (selectedVariant) {
      selectedPrice = selectedVariant.price;
      selectedStock = selectedVariant.stock;
    }
  }

  if (selectedStock < quantity) {
    res.status(400);
    throw new Error(`Only ${selectedStock} available`);
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });

  const existing = cart.items.find(
    (i) =>
      i.product.toString() === productId &&
      ((i.variant?.size || null) === (variant?.size || null))
  );

  if (existing) {
    if (existing.quantity + quantity > selectedStock) {
      res.status(400);
      throw new Error(`Only ${selectedStock} available`);
    }

    existing.quantity += quantity;
    existing.total = existing.quantity * selectedPrice;
  } else {
    cart.items.push({
      product: productId,
      quantity,
      price: selectedPrice,
      total: selectedPrice * quantity,
      variant: variant || null,
      productName: product.name,
      productImage: product.images[0]?.url || null,
    });
  }

  const subtotal = cart.items.reduce((s, item) => s + item.total, 0);
  cart.subtotal = subtotal;
  cart.grandTotal = subtotal + (cart.deliveryCharge || 0);

  await cart.save();

  res.json({ success: true, cart });
});




//
// 📌 GET USER CART (auto refresh prices + valid stock check)
//
export const getUserCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id })
    .populate("items.product", "price variants images stock");

  if (!cart) {
    return res.json({ success: true, cart: { items: [], subtotal: 0, grandTotal: 0 } });
  }

  // Filter deleted products
  cart.items = cart.items.filter((i) => i.product !== null);

  // Price + stock sync
  cart.items.forEach((item) => {
    if (!item.product) return;

    let updatedPrice = item.product.price;
    let updatedStock = item.product.stock;

    if (item.variant && item.product.variants?.length > 0) {
      const dbVariant = item.product.variants.find(
        (v) => v.size === item.variant.size
      );
      if (dbVariant) {
        updatedPrice = dbVariant.price;
        updatedStock = dbVariant.stock;
      }
    }

    // Auto fix invalid qty
    if (updatedStock < item.quantity) {
      item.quantity = updatedStock;
    }

    item.price = updatedPrice;
    item.total = updatedPrice * item.quantity;
  });

  const totals = calculateTotals(cart.items, cart.deliveryCharge);
  cart.subtotal = totals.subtotal;
  cart.grandTotal = totals.grandTotal;

  await cart.save();

  res.json({ success: true, cart });
});



//
// ✏️ UPDATE CART QUANTITY (stock aware)
//
export const updateCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity, variantSize } = req.body;

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new Error("Cart not found");

  const item = cart.items.find(
    (i) =>
      i.product.toString() === productId.toString() &&
      ((i.variant?.size || null) === (variantSize || null))
  );

  if (!item) throw new Error("Item not found");

  const product = await Product.findById(productId);

  let availableStock = product.stock;
  if (variantSize && product.variants?.length > 0) {
    const variant = product.variants.find((v) => v.size === variantSize);
    if (variant) availableStock = variant.stock;
  }

  if (quantity <= 0) {
    cart.items = cart.items.filter(
      (i) =>
        !(i.product.toString() === productId.toString() &&
          ((i.variant?.size || null) === (variantSize || null)))
    );
  } else if (quantity > availableStock) {
    res.status(400);
    throw new Error(`Only ${availableStock} available`);
  } else {
    item.quantity = quantity;
    item.total = item.price * item.quantity;
  }

  const totals = calculateTotals(cart.items, cart.deliveryCharge);
  cart.subtotal = totals.subtotal;
  cart.grandTotal = totals.grandTotal;

  await cart.save();

  res.json({ success: true, message: "Cart updated", cart });
});



//
// ❌ REMOVE ITEM
//
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId, variantSize } = req.body;

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new Error("Cart not found");

  cart.items = cart.items.filter(
    (i) =>
      !(i.product.toString() === productId.toString() &&
        ((i.variant?.size || null) === (variantSize || null)))
  );

  const totals = calculateTotals(cart.items, cart.deliveryCharge);
  cart.subtotal = totals.subtotal;
  cart.grandTotal = totals.grandTotal;

  await cart.save();

  res.json({ success: true, message: "Item removed", cart });
});



//
// 🧹 CLEAR CART
//
export const clearCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) throw new Error("Cart not found");

  cart.items = [];
  cart.subtotal = 0;
  cart.grandTotal = 0;

  await cart.save();

  res.json({ success: true, message: "Cart cleared", cart });
});
