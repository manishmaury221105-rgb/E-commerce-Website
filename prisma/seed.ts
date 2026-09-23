import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seeding...");

  // Clean existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productReview.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.coupon.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.storeSetting.deleteMany();

  // 1. Create Default Store Settings
  await prisma.storeSetting.create({
    data: {
      id: "default",
      shopName: "FreshMart Local Supermarket",
      phone: "+91 73804 92118",
      whatsapp: "+917380492118",
      email: "help@freshmart.local",
      address: "Shop #14, Main Market Square, Near Central Clock Tower",
      currency: "₹",
      freeDeliveryMin: 499,
      deliveryFee: 40,
      announcement: "⚡ Super Fast Local Delivery in under 45 mins! Use code WELCOME10 for 10% OFF",
      openHours: "Mon - Sun: 7:00 AM - 10:30 PM",
    },
  });

  // 2. Create Users (Admin & Customer)
  const adminPassword = await bcrypt.hash("Admin@12345", 10);
  const customerPassword = await bcrypt.hash("Customer@12345", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Shop Manager (Admin)",
      email: "admin@localshop.com",
      password: adminPassword,
      phone: "+91 98765 43210",
      role: "ADMIN",
    },
  });

  const customer = await prisma.user.create({
    data: {
      name: "Rahul Sharma",
      email: "customer@localshop.com",
      password: customerPassword,
      phone: "+91 98111 22233",
      role: "CUSTOMER",
      addresses: {
        create: [
          {
            name: "Rahul Sharma",
            phone: "+91 98111 22233",
            street: "Flat 402, Sunshine Heights, 5th Cross",
            apartment: "Block B",
            city: "Metropolis",
            state: "State",
            postalCode: "110001",
            country: "India",
            isDefault: true,
            label: "HOME",
          },
          {
            name: "Rahul Sharma",
            phone: "+91 98111 22233",
            street: "Tech Park Phase 2, Cyber Tower",
            apartment: "Office #601",
            city: "Metropolis",
            state: "State",
            postalCode: "110008",
            country: "India",
            isDefault: false,
            label: "WORK",
          },
        ],
      },
    },
  });

  console.log("✅ Seeded Store Settings and Users (Admin & Demo Customer)");

  // 3. Create Categories
  const categoriesData = [
    {
      name: "Fresh Fruits & Veggies",
      slug: "fruits-vegetables",
      description: "Farm-fresh organic fruits and crisp green vegetables delivered daily.",
      image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&auto=format&fit=crop&q=80",
      icon: "Apple",
      isFeatured: true,
      order: 1,
    },
    {
      name: "Dairy, Bread & Eggs",
      slug: "dairy-bakery",
      description: "Fresh milk, paneer, artisan breads, butter, and farm eggs.",
      image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80",
      icon: "Milk",
      isFeatured: true,
      order: 2,
    },
    {
      name: "Daily Grocery & Staples",
      slug: "grocery-staples",
      description: "Premium basmati rice, lentils, organic flour, cold-pressed oils & spices.",
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=80",
      icon: "ShoppingBag",
      isFeatured: true,
      order: 3,
    },
    {
      name: "Snacks & Munchies",
      slug: "snacks-munchies",
      description: "Crispy namkeens, biscuits, gourmet chocolates, roasted nuts & chips.",
      image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600&auto=format&fit=crop&q=80",
      icon: "Cookie",
      isFeatured: true,
      order: 4,
    },
    {
      name: "Beverages & Cold Drinks",
      slug: "beverages",
      description: "Real fruit juices, energy drinks, cold brew coffee, teas & sodas.",
      image: "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=600&auto=format&fit=crop&q=80",
      icon: "Coffee",
      isFeatured: true,
      order: 5,
    },
    {
      name: "Personal Care & Hygiene",
      slug: "personal-care",
      description: "Gentle body washes, shampoos, skincare, oral care, and deodorants.",
      image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
      icon: "Sparkles",
      isFeatured: true,
      order: 6,
    },
    {
      name: "Household & Cleaning",
      slug: "household-cleaning",
      description: "Detergents, surface cleaners, dishwash liquids, and garbage bags.",
      image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80",
      icon: "Home",
      isFeatured: true,
      order: 7,
    },
    {
      name: "Electronics & Kitchen Essentials",
      slug: "electronics-utilities",
      description: "Smart bulbs, kitchen scales, charging cables, batteries & gadgets.",
      image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80",
      icon: "Zap",
      isFeatured: true,
      order: 8,
    },
  ];

  const createdCategories: Record<string, any> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({
      data: cat,
    });
    createdCategories[cat.slug] = created;
  }
  console.log(`✅ Seeded ${Object.keys(createdCategories).length} Categories`);

  // 4. Create Products
  const productsData = [
    // Fruits & Veggies
    {
      name: "Fresh Kashmiri Royal Gala Apples",
      slug: "fresh-kashmiri-apples",
      description: "Crisp, sweet, and handpicked Kashmiri Royal Gala Apples. Rich in natural vitamins, dietary fiber, and antioxidants. Freshly harvested from organic orchards.",
      shortDescription: "Sweet & crispy organic apples from Kashmir",
      price: 180,
      compareAtPrice: 240,
      costPrice: 120,
      sku: "FRT-APP-001",
      barcode: "890123400001",
      stock: 45,
      unit: "1 kg (approx 4-5 pcs)",
      isFeatured: true,
      isDailyDeal: true,
      dealEndsAt: new Date(Date.now() + 24 * 3600 * 1000),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1619546813926-a78fa6372cd2?w=800&auto=format&fit=crop&q=80",
      ]),
      rating: 4.9,
      numReviews: 38,
      categoryId: createdCategories["fruits-vegetables"].id,
    },
    {
      name: "Fresh Farm Spinach (Palak)",
      slug: "fresh-spinach-palak",
      description: "Crisp, cleaned, and tender green spinach leaves. Sourced every morning from local hydroponic farms. Free of harmful pesticides.",
      shortDescription: "Tender, iron-rich fresh spinach bundle",
      price: 35,
      compareAtPrice: 50,
      costPrice: 20,
      sku: "VEG-SPN-002",
      barcode: "890123400002",
      stock: 60,
      unit: "250g Bunch",
      isFeatured: true,
      isDailyDeal: false,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&auto=format&fit=crop&q=80",
      ]),
      rating: 4.8,
      numReviews: 24,
      categoryId: createdCategories["fruits-vegetables"].id,
    },
    {
      name: "Ripe Alphonso Mangoes (Box)",
      slug: "ripe-alphonso-mangoes-box",
      description: "Naturally ripened Ratnagiri Alphonso Mangoes. Unmatched aroma, golden pulp, and rich buttery sweetness. Zero carbide ripening guarantee.",
      shortDescription: "Original GI-tagged sweet Ratnagiri Alphonso",
      price: 699,
      compareAtPrice: 899,
      costPrice: 480,
      sku: "FRT-MNG-003",
      barcode: "890123400003",
      stock: 25,
      unit: "1 Box (6 Pieces)",
      isFeatured: true,
      isDailyDeal: true,
      dealEndsAt: new Date(Date.now() + 48 * 3600 * 1000),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80",
      ]),
      rating: 5.0,
      numReviews: 89,
      categoryId: createdCategories["fruits-vegetables"].id,
    },
    {
      name: "Organic Red Hybrid Tomatoes",
      slug: "organic-red-tomatoes",
      description: "Juicy, firm, and vibrant red tomatoes picked at peak ripeness. Perfect for curries, salads, sauces, and fresh soups.",
      shortDescription: "Juicy vine-ripened red tomatoes",
      price: 45,
      compareAtPrice: 60,
      costPrice: 25,
      sku: "VEG-TOM-004",
      barcode: "890123400004",
      stock: 80,
      unit: "1 kg",
      isFeatured: false,
      isDailyDeal: false,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80",
      ]),
      rating: 4.7,
      numReviews: 42,
      categoryId: createdCategories["fruits-vegetables"].id,
    },

    // Dairy, Bakery & Eggs
    {
      name: "Fresh Malai Paneer (Cottage Cheese)",
      slug: "fresh-malai-paneer",
      description: "Melt-in-mouth creamy fresh malai paneer made from pure cow milk. Soft texture, high in protein, and free from preservatives.",
      shortDescription: "Ultra soft, fresh high-protein cottage cheese",
      price: 95,
      compareAtPrice: 110,
      costPrice: 70,
      sku: "DRY-PAN-005",
      barcode: "890123400005",
      stock: 35,
      unit: "200g Pack",
      isFeatured: true,
      isDailyDeal: false,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=800&auto=format&fit=crop&q=80",
      ]),
      rating: 4.9,
      numReviews: 67,
      categoryId: createdCategories["dairy-bakery"].id,
    },
    {
      name: "Organic Brown Eggs (Farm Fresh)",
      slug: "organic-brown-eggs-farm-fresh",
      description: "Free-range, grain-fed hen eggs. Rich in Omega-3, vitamins, and protein with golden deep yolks. Washed and sanitized.",
      shortDescription: "Free-range grain-fed brown eggs",
      price: 90,
      compareAtPrice: 115,
      costPrice: 65,
      sku: "DRY-EGG-006",
      barcode: "890123400006",
      stock: 50,
      unit: "Pack of 6",
      isFeatured: true,
      isDailyDeal: false,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800&auto=format&fit=crop&q=80",
      ]),
      rating: 4.8,
      numReviews: 53,
      categoryId: createdCategories["dairy-bakery"].id,
    },
    {
      name: "100% Whole Wheat Artisan Bread",
      slug: "whole-wheat-artisan-bread",
      description: "Freshly baked whole wheat sandwich bread. No added maida, zero palm oil, naturally fermented for easy digestion.",
      shortDescription: "Soft, zero-maida whole wheat sliced bread",
      price: 55,
      compareAtPrice: 65,
      costPrice: 35,
      sku: "BAK-BRD-007",
      barcode: "890123400007",
      stock: 28,
      unit: "400g Loaf",
      isFeatured: false,
      isDailyDeal: false,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&auto=format&fit=crop&q=80",
      ]),
      rating: 4.6,
      numReviews: 19,
      categoryId: createdCategories["dairy-bakery"].id,
    },

    // Daily Grocery & Staples
    {
      name: "Royal Aged Basmati Rice (XXL Grain)",
      slug: "royal-aged-basmati-rice",
      description: "Aged for 2 years in traditional cellars. Extra-long pearl white grains with authentic Himalayan aromatic fragrance.",
      shortDescription: "2-Year aged extra long grain aromatic basmati",
      price: 340,
      compareAtPrice: 420,
      costPrice: 260,
      sku: "GRO-RIC-008",
      barcode: "890123400008",
      stock: 40,
      unit: "2 kg Bag",
      isFeatured: true,
      isDailyDeal: true,
      dealEndsAt: new Date(Date.now() + 36 * 3600 * 1000),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80",
      ]),
      rating: 5.0,
      numReviews: 112,
      categoryId: createdCategories["grocery-staples"].id,
    },
    {
      name: "Pure Cold Pressed Mustard Oil (Kachi Ghani)",
      slug: "cold-pressed-mustard-oil-kachi-ghani",
      description: "Traditional wooden cold-pressed mustard oil with pungent natural aroma. Rich in MUFA and PUFA for heart health.",
      shortDescription: "Traditional wood-pressed unfiltered mustard oil",
      price: 210,
      compareAtPrice: 260,
      costPrice: 160,
      sku: "GRO-OIL-009",
      barcode: "890123400009",
      stock: 35,
      unit: "1 Litre Bottle",
      isFeatured: false,
      isDailyDeal: false,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&auto=format&fit=crop&q=80",
      ]),
      rating: 4.8,
      numReviews: 31,
      categoryId: createdCategories["grocery-staples"].id,
    },
    {
      name: "Unpolished Organic Toor Dal",
      slug: "unpolished-organic-toor-dal",
      description: "100% naturally processed yellow pigeon peas without any chemical polish or added colors. Cooks quickly with rich nutty flavor.",
      shortDescription: "Natural unpolished high-protein yellow dal",
      price: 165,
      compareAtPrice: 195,
      costPrice: 130,
      sku: "GRO-DAL-010",
      barcode: "890123400010",
      stock: 55,
      unit: "1 kg",
      isFeatured: true,
      isDailyDeal: false,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1585994192701-f1a505c8574a?w=800&auto=format&fit=crop&q=80",
      ]),
      rating: 4.9,
      numReviews: 44,
      categoryId: createdCategories["grocery-staples"].id,
    },

    // Snacks & Munchies
    {
      name: "Roasted California Almonds (Salted & Crunchy)",
      slug: "roasted-california-almonds",
      description: "Premium jumbo California almonds, slowly dry roasted and lightly sprinkled with Himalayan pink salt. High energy snack.",
      shortDescription: "Crunchy salted roasted jumbo almonds",
      price: 280,
      compareAtPrice: 350,
      costPrice: 200,
      sku: "SNK-ALM-011",
      barcode: "890123400011",
      stock: 45,
      unit: "200g Jar",
      isFeatured: true,
      isDailyDeal: true,
      dealEndsAt: new Date(Date.now() + 18 * 3600 * 1000),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?w=800&auto=format&fit=crop&q=80",
      ]),
      rating: 4.9,
      numReviews: 76,
      categoryId: createdCategories["snacks-munchies"].id,
    },
    {
      name: "Dark Chocolate Gourmet Cookies",
      slug: "dark-chocolate-gourmet-cookies",
      description: "Handcrafted buttery biscuits loaded with 60% rich Belgian dark chocolate chunks. Perfect with morning coffee or milk.",
      shortDescription: "Rich Belgian chocolate chunk artisan cookies",
      price: 140,
      compareAtPrice: 175,
      costPrice: 95,
      sku: "SNK-CKI-012",
      barcode: "890123400012",
      stock: 30,
      unit: "150g Box",
      isFeatured: false,
      isDailyDeal: false,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800&auto=format&fit=crop&q=80",
      ]),
      rating: 4.7,
      numReviews: 33,
      categoryId: createdCategories["snacks-munchies"].id,
    },

    // Beverages
    {
      name: "Pure Tender Coconut Water (No Added Sugar)",
      slug: "pure-tender-coconut-water",
      description: "100% natural and isotonic tender coconut water, packed immediately at source to lock in refreshing electrolytes and potassium.",
      shortDescription: "Refreshing 100% pure coconut water",
      price: 60,
      compareAtPrice: 75,
      costPrice: 42,
      sku: "BEV-COC-013",
      barcode: "890123400013",
      stock: 70,
      unit: "300ml Bottle",
      isFeatured: true,
      isDailyDeal: false,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1527661591475-527312dd65f5?w=800&auto=format&fit=crop&q=80",
      ]),
      rating: 4.9,
      numReviews: 58,
      categoryId: createdCategories["beverages"].id,
    },
    {
      name: "Premium Assam CTC Spiced Chai (Tea)",
      slug: "premium-assam-ctc-spiced-chai",
      description: "Rich, aromatic blend of whole leaf Assam black tea infused with real cardamom, cinnamon, clove, and dried ginger.",
      shortDescription: "Aromatic kadak masala tea with real spices",
      price: 240,
      compareAtPrice: 299,
      costPrice: 170,
      sku: "BEV-TEA-014",
      barcode: "890123400014",
      stock: 50,
      unit: "500g Pack",
      isFeatured: true,
      isDailyDeal: false,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=800&auto=format&fit=crop&q=80",
      ]),
      rating: 5.0,
      numReviews: 92,
      categoryId: createdCategories["beverages"].id,
    },

    // Personal Care
    {
      name: "Organic Aloe Vera & Neem Gentle Body Wash",
      slug: "organic-aloe-neem-body-wash",
      description: "Sulphate-free, pH balanced herbal body wash formulated with pure organic Aloe Vera, Neem, and Tea Tree essential oil.",
      shortDescription: "Sulphate-free soothing botanical body wash",
      price: 299,
      compareAtPrice: 399,
      costPrice: 190,
      sku: "PER-ALW-015",
      barcode: "890123400015",
      stock: 40,
      unit: "300ml Pump Bottle",
      isFeatured: false,
      isDailyDeal: false,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80",
      ]),
      rating: 4.8,
      numReviews: 41,
      categoryId: createdCategories["personal-care"].id,
    },

    // Household & Cleaning
    {
      name: "Eco-Friendly Herbal Dishwash Gel (Lemon & Mint)",
      slug: "eco-friendly-herbal-dishwash-gel",
      description: "Tough on grease, gentle on hands. Made with bio-enzymes, lemon peel extracts, and refreshing mint.",
      shortDescription: "Natural grease-cutting herbal dishwash liquid",
      price: 135,
      compareAtPrice: 165,
      costPrice: 90,
      sku: "HOU-DSH-016",
      barcode: "890123400016",
      stock: 65,
      unit: "750ml Bottle",
      isFeatured: false,
      isDailyDeal: false,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80",
      ]),
      rating: 4.7,
      numReviews: 29,
      categoryId: createdCategories["household-cleaning"].id,
    },

    // Electronics & Utilities
    {
      name: "Smart 9W WiFi RGB LED Bulb",
      slug: "smart-9w-wifi-rgb-led-bulb",
      description: "16 million colors, dimmable, schedule timer, works with Alexa & Google Assistant directly over 2.4GHz WiFi without bridge.",
      shortDescription: "16M colors smart WiFi bulb with voice control",
      price: 499,
      compareAtPrice: 799,
      costPrice: 320,
      sku: "ELE-BLB-017",
      barcode: "890123400017",
      stock: 30,
      unit: "1 Piece (B22 Cap)",
      isFeatured: true,
      isDailyDeal: true,
      dealEndsAt: new Date(Date.now() + 12 * 3600 * 1000),
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80",
      ]),
      rating: 4.8,
      numReviews: 83,
      categoryId: createdCategories["electronics-utilities"].id,
    },
    {
      name: "Digital Kitchen Food Weighing Scale (1g - 10kg)",
      slug: "digital-kitchen-food-weighing-scale",
      description: "High-precision strain gauge sensors with Tare function, backlit LCD display, and multi-unit conversion (g, kg, oz, lb).",
      shortDescription: "High precision LCD kitchen weighing scale",
      price: 450,
      compareAtPrice: 650,
      costPrice: 280,
      sku: "ELE-SCL-018",
      barcode: "890123400018",
      stock: 22,
      unit: "1 Unit (Includes 2x AAA)",
      isFeatured: false,
      isDailyDeal: false,
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80",
      ]),
      rating: 4.9,
      numReviews: 47,
      categoryId: createdCategories["electronics-utilities"].id,
    },
  ];

  for (const prod of productsData) {
    await prisma.product.create({
      data: {
        ...prod,
        reviews: {
          create: [
            {
              userName: "Ananya Gupta",
              rating: 5,
              comment: "Top notch quality! Arrived within 30 minutes from our local store, super fresh packaging.",
              isApproved: true,
            },
            {
              userName: "Vikram Mehta",
              rating: 5,
              comment: "Very genuine product, fair pricing compared to big supermarkets. Highly recommend!",
              isApproved: true,
            },
          ],
        },
      },
    });
  }
  console.log(`✅ Seeded ${productsData.length} Products with Reviews`);

  // 5. Create Coupons
  const couponsData = [
    {
      code: "WELCOME10",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrderAmount: 299,
      maxDiscountAmount: 150,
      usageLimit: 500,
      isActive: true,
    },
    {
      code: "FREEDEL",
      discountType: "FIXED",
      discountValue: 40,
      minOrderAmount: 300,
      maxDiscountAmount: 40,
      usageLimit: 1000,
      isActive: true,
    },
    {
      code: "SAVE100",
      discountType: "FIXED",
      discountValue: 100,
      minOrderAmount: 799,
      maxDiscountAmount: 100,
      usageLimit: 200,
      isActive: true,
    },
    {
      code: "FESTIVE20",
      discountType: "PERCENTAGE",
      discountValue: 20,
      minOrderAmount: 999,
      maxDiscountAmount: 300,
      usageLimit: 100,
      isActive: true,
    },
  ];

  for (const c of couponsData) {
    await prisma.coupon.create({
      data: c,
    });
  }
  console.log(`✅ Seeded ${couponsData.length} Coupons`);

  // 6. Create Hero Banners
  const bannersData = [
    {
      title: "Fresh Harvest Deals & Organic Groceries",
      subtitle: "Farm-to-door fresh veggies, fruits & daily essentials delivered in 45 mins",
      tag: "⚡ EXPRESS LOCAL DELIVERY",
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1600&auto=format&fit=crop&q=80",
      link: "/products",
      buttonText: "Shop Fresh Today",
      isActive: true,
      order: 1,
    },
    {
      title: "Mega Weekend Pantry Stock Up",
      subtitle: "Get up to 35% OFF on Basmati Rice, Cold Pressed Oils & Spices",
      tag: "🔥 LIMITED TIME OFFERS",
      image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=1600&auto=format&fit=crop&q=80",
      link: "/products?category=grocery-staples",
      buttonText: "Explore Staples",
      isActive: true,
      order: 2,
    },
    {
      title: "Smart Home & Kitchen Upgrades",
      subtitle: "Convenient electronic utilities, gadgets & essentials for modern homes",
      tag: "💡 NEW ARRIVALS",
      image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1600&auto=format&fit=crop&q=80",
      link: "/products?category=electronics-utilities",
      buttonText: "View Gadgets",
      isActive: true,
      order: 3,
    },
  ];

  for (const b of bannersData) {
    await prisma.banner.create({
      data: b,
    });
  }
  console.log(`✅ Seeded ${bannersData.length} Banners`);

  // 7. Create Sample Initial Orders
  const sampleProduct = await prisma.product.findFirst();
  if (sampleProduct) {
    const order1 = await prisma.order.create({
      data: {
        orderNumber: "ORD-202609-1001",
        userId: customer.id,
        customerName: "Rahul Sharma",
        customerEmail: "customer@localshop.com",
        customerPhone: "+91 98111 22233",
        shippingAddress: JSON.stringify({
          name: "Rahul Sharma",
          phone: "+91 98111 22233",
          street: "Flat 402, Sunshine Heights, 5th Cross",
          apartment: "Block B",
          city: "Metropolis",
          state: "State",
          postalCode: "110001",
          country: "India",
        }),
        deliverySlot: "⚡ Express Delivery (Within 2 Hours)",
        notes: "Please call when arriving at gate #2",
        subtotal: 520,
        deliveryFee: 0,
        discountAmount: 52,
        couponCode: "WELCOME10",
        total: 468,
        paymentMethod: "ONLINE_UPI",
        paymentStatus: "PAID",
        orderStatus: "OUT_FOR_DELIVERY",
        trackingHistory: JSON.stringify([
          { status: "PENDING", timestamp: new Date(Date.now() - 3600 * 1000 * 3).toISOString(), note: "Order placed online via UPI payment." },
          { status: "CONFIRMED", timestamp: new Date(Date.now() - 3600 * 1000 * 2).toISOString(), note: "Store verified item inventory." },
          { status: "PACKED", timestamp: new Date(Date.now() - 3600 * 1000 * 1).toISOString(), note: "Items packed securely in eco-friendly bag." },
          { status: "OUT_FOR_DELIVERY", timestamp: new Date().toISOString(), note: "Rider Amit Kumar (+91 9988776655) is en route." },
        ]),
        invoiceNumber: "INV-2026-0089",
        items: {
          create: [
            {
              productId: sampleProduct.id,
              productName: sampleProduct.name,
              productImage: JSON.parse(sampleProduct.images)[0] || "",
              price: sampleProduct.price,
              quantity: 2,
              unit: sampleProduct.unit,
              total: sampleProduct.price * 2,
            },
          ],
        },
      },
    });

    const order2 = await prisma.order.create({
      data: {
        orderNumber: "ORD-202609-1002",
        userId: customer.id,
        customerName: "Rahul Sharma",
        customerEmail: "customer@localshop.com",
        customerPhone: "+91 98111 22233",
        shippingAddress: JSON.stringify({
          name: "Rahul Sharma",
          phone: "+91 98111 22233",
          street: "Flat 402, Sunshine Heights, 5th Cross",
          apartment: "Block B",
          city: "Metropolis",
          state: "State",
          postalCode: "110001",
          country: "India",
        }),
        deliverySlot: "🌅 Morning Slot (8:00 AM - 12:00 PM)",
        notes: "Leave with security guard if not available",
        subtotal: 750,
        deliveryFee: 40,
        discountAmount: 0,
        total: 790,
        paymentMethod: "COD",
        paymentStatus: "PENDING",
        orderStatus: "PENDING",
        trackingHistory: JSON.stringify([
          { status: "PENDING", timestamp: new Date().toISOString(), note: "Order placed with Cash on Delivery." },
        ]),
        invoiceNumber: "INV-2026-0090",
        items: {
          create: [
            {
              productId: sampleProduct.id,
              productName: sampleProduct.name,
              productImage: JSON.parse(sampleProduct.images)[0] || "",
              price: sampleProduct.price,
              quantity: 3,
              unit: sampleProduct.unit,
              total: sampleProduct.price * 3,
            },
          ],
        },
      },
    });
    console.log("✅ Seeded Sample Initial Orders");
  }

  console.log("🎉 Database seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
