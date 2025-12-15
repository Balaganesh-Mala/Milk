const orderDetails = {
  id: "ORD12345",
  date: "2025-01-10",
  status: "Delivered",
  deliverySlot: "6AM - 8AM",
  paymentMethod: "Online",
  paymentStatus: "Paid",
  
  address: {
    name: "Ravi Kumar",
    street: "12 Gandhi Road",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560034",
    phone: "9876543210",
  },

  items: [
    {
      name: "Fresh Cow Milk",
      image: "/products/milk1.jpg",
      quantity: 2,
      variant: "1L",
      price: 120
    },
    {
      name: "Fresh Curd 500ml",
      image: "/products/curd.jpg",
      quantity: 1,
      variant: "500ml",
      price: 45
    }
  ],

  subtotal: 165,
  shipping: 10,
  total: 175,

  trackingStages: [
    "Processing",
    "Shipped",
    "Out for Delivery",
    "Delivered"
  ],
};

export default orderDetails;
