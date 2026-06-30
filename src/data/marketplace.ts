import { MarketplaceProduct } from "../types";

export const MARKETPLACE_PRODUCTS: MarketplaceProduct[] = [
  // --- APPAREL ---
  {
    id: "prod-apparel-1",
    name: "Ultra-Flex DryFit Active Shirt",
    description:
      "Premium moisture-wicking and sweat-repelling stretch shirt designed for high-intensity training. Ergonomic flatlock seams prevent chafing.",
    price: 29.99,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500&auto=format&fit=crop&q=80",
    category: "apparel",
    badge: "Best Seller",
  },
  {
    id: "prod-apparel-2",
    name: "AeroShield Lightweight Workout Hoodie",
    description:
      "Lightweight, breathable, and highly flexible knit fabric designed to regulate core temperatures during warmups and outdoor training sessions.",
    price: 49.99,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&auto=format&fit=crop&q=80",
    category: "apparel",
  },
  {
    id: "prod-apparel-3",
    name: 'Apex Compression Gym Shorts (7")',
    description:
      "Features built-in phone pocket and double-layer compressive liner for muscle support during deep barbell squats and dynamic runs.",
    price: 34.99,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1539185441755-769473a23570?w=500&auto=format&fit=crop&q=80",
    category: "apparel",
    badge: "Premium",
  },
  {
    id: "prod-apparel-4",
    name: "Apex Grip Athletic Cross-Trainers",
    description:
      "Flat-sole lightweight gym trainers designed specifically for squat stability, deadlift force transmission, and agility movements.",
    price: 119.99,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500&auto=format&fit=crop&q=80",
    category: "apparel",
    badge: "Top Rated",
  },
  {
    id: "prod-apparel-5",
    name: "Thermoregulating Seamless Sports Bra",
    description:
      "Medium-impact moisture-wicking sports bra featuring high-stretch nylon-spandex blend and seamless knit cups for friction-free movement.",
    price: 27.99,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=500&auto=format&fit=crop&q=80",
    category: "apparel",
  },
  {
    id: "prod-apparel-6",
    name: "Elite Performance Grip Socks (3-Pack)",
    description:
      "Compression-arch athletic socks with non-slip sole silicone grip pods, perfect for yoga, pilates, or maximal shoe traction.",
    price: 14.99,
    rating: 4.5,
    image:
      "https://images.unsplash.com/photo-1582966772680-860e372bb558?w=500&auto=format&fit=crop&q=80",
    category: "apparel",
  },

  // --- SUPPLEMENTS ---
  {
    id: "prod-1",
    name: "FitLife Grass-Fed Whey Protein (1kg)",
    description:
      "Premium pure micro-filtered whey isolate containing 26g of clean protein per scoop. Zero artificial sweeteners.",
    price: 49.99,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=500&auto=format&fit=crop&q=80",
    category: "supplements",
    badge: "Best Seller",
  },
  {
    id: "prod-6",
    name: "Pure Creatine Monohydrate (250g)",
    description:
      "100% pure micronized creatine monohydrate for rapid ATP regeneration, muscle hydration, and cognitive performance.",
    price: 29.99,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80",
    category: "supplements",
  },
  {
    id: "prod-supp-3",
    name: "Ignite Focus Pre-Workout (Apple Sour)",
    description:
      "Supercharged formulation of Citrulline Malate, Beta-Alanine, and natural caffeine for explosive muscular pumps and laser-sharp focus.",
    price: 39.99,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80",
    category: "supplements",
    badge: "New Flavor",
  },
  {
    id: "prod-supp-4",
    name: "Nightly ZMA & Ashwagandha Caps",
    description:
      "Zinc, Magnesium, and Vitamin B6 matrix paired with KSM-66 Ashwagandha to optimize sleep quality, recovery rates, and stress reduction.",
    price: 24.99,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=500&auto=format&fit=crop&q=80",
    category: "supplements",
  },
  {
    id: "prod-supp-5",
    name: "Vegan BCAAs + Coconut Hydration",
    description:
      "Fermented branch-chain amino acids in an optimal 2:1:1 ratio, fortified with freeze-dried coconut water powder for premium cellular hydration.",
    price: 27.99,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500&auto=format&fit=crop&q=80",
    category: "supplements",
  },

  // --- EQUIPMENT ---
  {
    id: "prod-2",
    name: "Precision Adjustable Dumbbells (Pair)",
    description:
      "Space-saving heavy-duty iron dumbbells adjusting seamlessly from 2kg to 24kg with an ergonomic handle dial.",
    price: 249.99,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=500&auto=format&fit=crop&q=80",
    category: "equipment",
    badge: "Premium",
  },
  {
    id: "prod-3",
    name: "Pro-Grip Latex Resistance Bands Set",
    description:
      "Set of 5 heavy-duty stackable latex loops (10lbs to 50lbs) with padded sweat-proof handles and door anchor.",
    price: 24.99,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1598262138533-030f2f1165b4?w=500&auto=format&fit=crop&q=80",
    category: "equipment",
  },
  {
    id: "prod-5",
    name: "Eco-Density Non-Slip Yoga Mat (8mm)",
    description:
      "Ultra-dense biodegradable TPE cushioning with double-sided alignment textures for perfect alignment during poses.",
    price: 34.99,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500&auto=format&fit=crop&q=80",
    category: "equipment",
  },
  {
    id: "prod-eq-4",
    name: "Pro-Grip Cast Iron Kettlebell (16kg)",
    description:
      "Solid single-cast iron kettlebell with matte textured coating for secure hold and non-slip athletic handling.",
    price: 44.99,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=500&auto=format&fit=crop&q=80",
    category: "equipment",
  },
  {
    id: "prod-eq-5",
    name: "Elite Speed Cable Jump Rope",
    description:
      "Durable stainless steel speed cable with ball bearings in handles for ultra-fast, frictionless rotations.",
    price: 19.99,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80",
    category: "equipment",
    badge: "New",
  },

  // --- ACCESSORIES ---
  {
    id: "prod-4",
    name: "FitLife Pulse Smart Health Tracker",
    description:
      "Vibrant AMOLED fitness tracker with continuous heart rate monitoring, blood oxygen levels, and multi-sport GPS tracking.",
    price: 89.99,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=500&auto=format&fit=crop&q=80",
    category: "accessories",
    badge: "New",
  },
  {
    id: "prod-acc-2",
    name: "Insulated Stainless Steel Shaker (750ml)",
    description:
      "Double-walled vacuum insulated steel shaker. Keeps beverages ice-cold for 24 hours. Leak-proof lock-top.",
    price: 19.99,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=500&auto=format&fit=crop&q=80",
    category: "accessories",
  },
  {
    id: "prod-acc-3",
    name: "Heavy-Duty Gym Duffel with Shoe Vent",
    description:
      "Water-resistant, puncture-proof duffel featuring high-capacity compartments, dual bottle pockets, and isolated ventilated pocket.",
    price: 39.99,
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80",
    category: "accessories",
    badge: "Must Have",
  },
  {
    id: "prod-acc-4",
    name: "Quick-Dry Microfiber Towels (2-Pack)",
    description:
      "Hypoallergenic, ultra-absorbent microfiber gym towels that dry 3x faster than cotton. Extremely lightweight and compact.",
    price: 12.99,
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=500&auto=format&fit=crop&q=80",
    category: "accessories",
  },
  {
    id: "prod-acc-5",
    name: "Leather Neoprene Lifting Belt (4-Inch)",
    description:
      "Reinforced genuine leather belt backed by memory foam neoprene cushion to deliver high core and lumbar support during heavy deadlifts.",
    price: 29.99,
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=500&auto=format&fit=crop&q=80",
    category: "accessories",
    badge: "Best Seller",
  },
  {
    id: "prod-acc-6",
    name: "Premium Neoprene Knee Sleeves (7mm Pair)",
    description:
      "Heavy-duty 7mm neoprene sleeve compression designed to maximize joints stability and knee heat retention during deep compound squats.",
    price: 34.99,
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=500&auto=format&fit=crop&q=80",
    category: "accessories",
  },
];
