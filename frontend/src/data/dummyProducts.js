const products = [
  {
    id: "p1",
    name: "Fresh Cow Milk",
    description: "Pure farm fresh cow milk, rich in nutrients and delivered daily.",
    price: 60,
    mrp: 65,
    stock: 120,
    sku: "MILK-COW-1L",
    variants: [
      { size: "500ml", price: 32, stock: 50 },
      { size: "1L", price: 60, stock: 70 }
    ],
    expiryDate: "2025-01-15",
    flavor: "Natural",
    brand: "MilkFresh",
    isSubscriptionAvailable: true,
    isFeatured: true,
    isBestSeller: true,
    images: [
      { public_id: "p1img", url: "https://ik.imagekit.io/izqq5ffwt/ChatGPT%20Image%20Dec%209,%202025,%2012_51_52%20PM.png" }
    ],
    category: "milk",
    ratings: 4.8,
    numOfReviews: 120,
  },

  {
    id: "p2",
    name: "Organic Buffalo Milk",
    description: "Thick creamy milk sourced from organic-fed cattle.",
    price: 70,
    mrp: 75,
    stock: 100,
    sku: "MILK-BUFF-1L",
    variants: [
      { size: "500ml", price: 38, stock: 40 },
      { size: "1L", price: 70, stock: 60 }
    ],
    expiryDate: "2025-01-18",
    flavor: "Natural",
    brand: "MilkFresh",
    isSubscriptionAvailable: true,
    isBestSeller: false,
    images: [
      { public_id: "p2img", url: "https://ik.imagekit.io/izqq5ffwt/ChatGPT%20Image%20Dec%209,%202025,%2012_51_52%20PM.png" }
    ],
    category: "milk",
    ratings: 4.6,
    numOfReviews: 95,
    reviews: [
  { name: "Ravi", rating: 5, comment: "Very fresh and tasty milk!" },
  { name: "Anita", rating: 4, comment: "Good quality but delivery late." },
],
  },

  {
    id: "p3",
    name: "Fresh Curd 500ml",
    description: "Homemade curd set naturally, thick and creamy.",
    price: 45,
    mrp: 50,
    stock: 200,
    sku: "CURD-500",
    variants: [
      { size: "500ml", price: 45, stock: 200 }
    ],
    expiryDate: "2025-01-10",
    brand: "MilkFresh",
    isSubscriptionAvailable: false,
    isFeatured: true,
    images: [
      { public_id: "p3img", url: "https://ik.imagekit.io/izqq5ffwt/ChatGPT%20Image%20Dec%209,%202025,%2012_51_52%20PM.png" }
    ],
    category: "curd",
    ratings: 4.7,
    numOfReviews: 60,
    reviews: [
  { name: "Ravi", rating: 5, comment: "Very fresh and tasty milk!" },
  { name: "Anita", rating: 4, comment: "Good quality but delivery late." },
],
  },

  {
    id: "p4",
    name: "Organic Paneer 250gm",
    description: "Soft and fresh paneer made from pure milk.",
    price: 120,
    mrp: 130,
    stock: 140,
    sku: "PANEER-250",
    variants: [
      { size: "250gm", price: 120, stock: 140 }
    ],
    expiryDate: "2025-01-07",
    brand: "MilkFresh",
    isSubscriptionAvailable: false,
    isFeatured: false,
    isBestSeller: true,
    images: [
      { public_id: "p4img", url: "https://ik.imagekit.io/izqq5ffwt/ChatGPT%20Image%20Dec%209,%202025,%2012_51_52%20PM.png" }
    ],
    category: "paneer",
    ratings: 4.9,
    numOfReviews: 180,
    reviews: [
  { name: "Ravi", rating: 5, comment: "Very fresh and tasty milk!" },
  { name: "Anita", rating: 4, comment: "Good quality but delivery late." },
],
  },

  {
    id: "p5",
    name: "Pure Ghee 500ml",
    description: "Traditional homemade ghee rich in aroma and flavour.",
    price: 350,
    mrp: 399,
    stock: 80,
    sku: "GHEE-500",
    variants: [
      { size: "250ml", price: 180, stock: 50 },
      { size: "500ml", price: 350, stock: 30 }
    ],
    expiryDate: "2025-02-28",
    brand: "MilkFresh",
    isSubscriptionAvailable: false,
    isFeatured: true,
    images: [
      { public_id: "p5img", url: "https://ik.imagekit.io/izqq5ffwt/ChatGPT%20Image%20Dec%209,%202025,%2012_51_52%20PM.png" }
    ],
    category: "ghee",
    ratings: 4.9,
    numOfReviews: 110,
    reviews: [
  { name: "Ravi", rating: 5, comment: "Very fresh and tasty milk!" },
  { name: "Anita", rating: 4, comment: "Good quality but delivery late." },
],
  }
];

export default products;
