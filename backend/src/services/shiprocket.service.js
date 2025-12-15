import axios from "axios";

const SR_LOGIN = "https://apiv2.shiprocket.in/v1/external/auth/login";
const SR_ORDER = "https://apiv2.shiprocket.in/v1/external/orders/create/";
const SR_TRACK = "https://apiv2.shiprocket.in/v1/external/courier/track/awb/";

export const shiprocketLogin = async () => {
  try {
    const res = await axios.post(SR_LOGIN, {
      email: process.env.SR_EMAIL,
      password: process.env.SR_PASSWORD,
    });

    return res.data.token;
  } catch (error) {
    console.error("Shiprocket login failed", error.response?.data);
    throw new Error("Shiprocket login failed");
  }
};

export const createShipment = async (order, token) => {

  // ➤ Calculate shipping weight
  let totalWeight = 0.5; // default minimum
  order.orderItems.forEach(item => {
    totalWeight += (item.weight || 0.1) * item.quantity;
  });

  const payload = {
    order_id: order._id.toString(),
    order_date: new Date().toISOString(),

    pickup_location: process.env.SR_PICKUP_NAME,
    
    billing_customer_name: order.shippingAddress.name,
    billing_last_name: "",
    billing_address: order.shippingAddress.street,
    billing_city: order.shippingAddress.city,
    billing_pincode: order.shippingAddress.pincode,
    billing_state: order.shippingAddress.state,
    billing_country: "India",
    billing_email: order.user?.email || "customer@mail.com",
    billing_phone: order.shippingAddress.phone,

    shipping_is_billing: true,

    order_items: order.orderItems.map((item) => ({
      name: item.name,
      sku: String(item.productId),
      units: item.quantity,
      selling_price: item.price,
      tax: 0,
      hsn: "2106", // HSN for snacks/food products
    })),

    payment_method: order.paymentMethod === "COD" ? "COD" : "Prepaid",

    sub_total: order.totalPrice,
    
    // Volumetric specifications
    length: 10,
    breadth: 10,
    height: 10,
    weight: totalWeight,

    // Required pickup details
    pickup_phone: process.env.SR_PICKUP_PHONE,
    pickup_address: process.env.SR_PICKUP_ADDRESS
  };

  try {
    const res = await axios.post(SR_ORDER, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return {
      shipmentId: res.data.shipment_id,
      trackingId: res.data.awb_code,
      courier: res.data.courier_name
    };

  } catch (error) {
    console.error("Shiprocket Create Order Error:", error.response?.data);
    throw new Error("Shipment creation failed");
  }
};

export const trackShipment = async (awb, token) => {
  try {
    const res = await axios.get(`${SR_TRACK}${awb}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.data;
  } catch (error) {
    console.error("Shiprocket Tracking Error:", error.response?.data);
    throw new Error("Tracking failed");
  }
};
