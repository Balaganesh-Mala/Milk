const orders = [
  {
    id: "ORD12345",
    date: "2025-01-10",
    status: "Delivered",
    total: 165,
    items: [
      {
        name: "Fresh Cow Milk",
        image: "/products/milk1.jpg",
        quantity: 2,
        variant: "1L"
      },
      {
        name: "Fresh Curd 500ml",
        image: "/products/curd.jpg",
        quantity: 1,
        variant: "500ml"
      }
    ]
  },

  {
    id: "ORD98766",
    date: "2025-01-14",
    status: "Processing",
    total: 70,
    items: [
      {
        name: "Organic Buffalo Milk",
        image: "/products/milk2.jpg",
        quantity: 1,
        variant: "1L"
      }
    ]
  }
];

export default orders;
