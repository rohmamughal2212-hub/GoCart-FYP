const img = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=80`;

export const products = [
  // ─── Vegetables ───────────────────────────────────────────────
  {
    name: "Potato 500g",
    category: "Vegetables",
    price: 25,
    offerPrice: 20,
    inStock: true,
    image: [img("1518977676405-6c8e3e00b7bd")],
    description: ["Farm fresh", "Rich in carbohydrates", "Ideal for curries and fries"],
  },
  {
    name: "Tomato 1kg",
    category: "Vegetables",
    price: 40,
    offerPrice: 35,
    inStock: true,
    image: [img("1546094096-0df4bcabd337")],
    description: ["Juicy and ripe", "Rich in Vitamin C", "Perfect for salads and sauces"],
  },
  {
    name: "Carrot 500g",
    category: "Vegetables",
    price: 30,
    offerPrice: 28,
    inStock: true,
    image: [img("1598170845058-32b9d6a5da37")],
    description: ["Sweet and crunchy", "Good for eyesight", "Ideal for juices and salads"],
  },
  {
    name: "Spinach 250g",
    category: "Vegetables",
    price: 18,
    offerPrice: 15,
    inStock: true,
    image: [img("1576045057995-568f30f6e8b8")],
    description: ["Rich in iron", "High in vitamins", "Perfect for soups and salads"],
  },
  {
    name: "Onion 500g",
    category: "Vegetables",
    price: 22,
    offerPrice: 19,
    inStock: true,
    image: [img("1618512496248-a07fe83aa8cb")],
    description: ["Fresh and pungent", "Perfect for cooking", "A kitchen staple"],
  },
  {
    name: "Bell Pepper 500g",
    category: "Vegetables",
    price: 60,
    offerPrice: 55,
    inStock: true,
    image: [img("1563565375-f3fdfdbefa83")],
    description: ["Crisp and colourful", "High in Vitamin C", "Great for stir-fries and salads"],
  },
  {
    name: "Cucumber 500g",
    category: "Vegetables",
    price: 20,
    offerPrice: 17,
    inStock: true,
    image: [img("1568584711271-6c929fb49b60")],
    description: ["Cooling and hydrating", "Low calorie snack", "Perfect for salads and dips"],
  },

  // (The rest of the large products array is copied from seed.js)
];
