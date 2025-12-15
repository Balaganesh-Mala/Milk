const checkoutData = {
  user: {
    name: "Ravi Kumar",
    phone: "9876543210",
    address: {
      street: "12 Gandhi Road",
      city: "Bangalore",
      state: "Karnataka",
      pincode: "560034",
    },
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
  deliveryCharge: 10,
  total: 175,
};

export default checkoutData;
