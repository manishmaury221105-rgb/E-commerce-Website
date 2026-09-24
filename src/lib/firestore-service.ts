import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  writeBatch,
  increment,
  onSnapshot,
  runTransaction,
  Unsubscribe 
} from "firebase/firestore";
import { db } from "./firebase";
import { 
  Product, 
  Category, 
  Order, 
  OrderItem, 
  SafeUser, 
  Coupon, 
  Banner, 
  StoreSetting, 
  ProductReview, 
  Address,
  OrderStatus,
  CartItem 
} from "@/types";

// ==========================================
// 1. STORE SETTINGS
// ==========================================
const DEFAULT_SETTINGS: StoreSetting = {
  id: "default",
  shopName: "FreshMart Local Supermarket",
  phone: "+91 73804 92118",
  whatsapp: "+917380492118",
  email: "contact@freshmart.local",
  address: "Shop #14, Main Market Square, Near Central Clock Tower",
  currency: "₹",
  freeDeliveryMin: 499,
  deliveryFee: 40,
  announcement: "⚡ Super Fast Local Delivery in under 45 mins! Use code WELCOME10 for 10% OFF",
  openHours: "Mon - Sun: 7:00 AM - 10:30 PM",
};

export async function getStoreSettings(): Promise<StoreSetting> {
  try {
    const docRef = doc(db, "settings", "default");
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...DEFAULT_SETTINGS, ...snap.data(), id: "default" } as StoreSetting;
    }
    // Initialize default if not present
    await setDoc(docRef, DEFAULT_SETTINGS);
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.warn("Using fallback store settings:", error);
    return DEFAULT_SETTINGS;
  }
}

export async function updateStoreSettings(data: Partial<StoreSetting>): Promise<StoreSetting> {
  const docRef = doc(db, "settings", "default");
  await setDoc(docRef, { ...data, updatedAt: new Date().toISOString() }, { merge: true });
  return getStoreSettings();
}

// ==========================================
// 2. CATEGORIES
// ==========================================
export async function getCategories(): Promise<Category[]> {
  try {
    const colRef = collection(db, "categories");
    const snap = await getDocs(colRef);
    if (snap.empty) {
      return [];
    }
    
    // Sort by order
    const categories = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
    categories.sort((a, b) => (a.order || 0) - (b.order || 0));
    return categories;
  } catch (error) {
    console.error("getCategories error:", error);
    return [];
  }
}

export async function getCategoryByIdOrSlug(idOrSlug: string): Promise<Category | null> {
  try {
    // Check by ID
    const docRef = doc(db, "categories", idOrSlug);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Category;
    }

    // Check by Slug
    const colRef = collection(db, "categories");
    const q = query(colRef, where("slug", "==", idOrSlug), limit(1));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const d = querySnap.docs[0];
      return { id: d.id, ...d.data() } as Category;
    }
    return null;
  } catch (error) {
    console.error("getCategoryByIdOrSlug error:", error);
    return null;
  }
}

export async function createCategory(data: Partial<Category>): Promise<Category> {
  const colRef = collection(db, "categories");
  const slug = data.slug || (data.name || "category").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const newCat = {
    name: data.name || "New Category",
    slug,
    description: data.description || "",
    image: data.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600",
    icon: data.icon || "ShoppingBag",
    isFeatured: data.isFeatured !== undefined ? data.isFeatured : true,
    order: data.order !== undefined ? data.order : 0,
    parentId: data.parentId || null,
    productCount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const res = await addDoc(colRef, newCat);
  return { id: res.id, ...newCat };
}

export async function updateCategory(id: string, data: Partial<Category>): Promise<Category | null> {
  const docRef = doc(db, "categories", id);
  await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
  return getCategoryByIdOrSlug(id);
}

export async function deleteCategory(id: string): Promise<boolean> {
  try {
    // 1. Reassign products belonging to this category
    const productsCol = collection(db, "products");
    const q = query(productsCol, where("categoryId", "==", id));
    const prodSnap = await getDocs(q);

    if (!prodSnap.empty) {
      const batch = writeBatch(db);
      prodSnap.docs.forEach((pDoc) => {
        batch.update(pDoc.ref, { categoryId: "" });
      });
      await batch.commit();
    }

    // 2. Delete the category permanently
    await deleteDoc(doc(db, "categories", id));
    return true;
  } catch (error) {
    console.error("deleteCategory error:", error);
    throw error;
  }
}

// ==========================================
// 3. PRODUCTS
// ==========================================
export interface ProductQueryFilters {
  categoryId?: string;
  categorySlug?: string;
  search?: string;
  isFeatured?: boolean;
  isDailyDeal?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sort?: "price_asc" | "price_desc" | "newest" | "rating" | "popular";
  limitCount?: number;
}

export async function getProducts(filters: ProductQueryFilters = {}): Promise<Product[]> {
  try {
    const colRef = collection(db, "products");
    const snap = await getDocs(colRef);

    if (snap.empty) {
      return [];
    }

    let products: Product[] = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
    return filterAndSortProducts(products, filters);
  } catch (error) {
    console.error("getProducts error:", error);
    return [];
  }
}

function filterAndSortProducts(products: Product[], filters: ProductQueryFilters): Product[] {
  let filtered = [...products];

  if (filters.categoryId) {
    filtered = filtered.filter((p) => p.categoryId === filters.categoryId);
  }

  if (filters.isFeatured) {
    filtered = filtered.filter((p) => p.isFeatured === true);
  }

  if (filters.isDailyDeal) {
    filtered = filtered.filter((p) => p.isDailyDeal === true);
  }

  if (filters.search && filters.search.trim()) {
    const term = filters.search.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        (p.description && p.description.toLowerCase().includes(term)) ||
        (p.shortDescription && p.shortDescription.toLowerCase().includes(term))
    );
  }

  if (filters.minPrice !== undefined) {
    filtered = filtered.filter((p) => p.price >= filters.minPrice!);
  }

  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter((p) => p.price <= filters.maxPrice!);
  }

  // Sorting
  if (filters.sort === "price_asc") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (filters.sort === "price_desc") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (filters.sort === "rating") {
    filtered.sort((a, b) => (b.rating || 5) - (a.rating || 5));
  } else {
    // Default newest
    filtered.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  if (filters.limitCount) {
    filtered = filtered.slice(0, filters.limitCount);
  }

  return filtered;
}

export async function getProductByIdOrSlug(idOrSlug: string): Promise<Product | null> {
  try {
    // Check by ID
    const docRef = doc(db, "products", idOrSlug);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Product;
    }

    // Check by Slug
    const colRef = collection(db, "products");
    const q = query(colRef, where("slug", "==", idOrSlug), limit(1));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const d = querySnap.docs[0];
      return { id: d.id, ...d.data() } as Product;
    }
    return null;
  } catch (error) {
    console.error("getProductByIdOrSlug error:", error);
    return null;
  }
}

export async function createProduct(data: Partial<Product>): Promise<Product> {
  const colRef = collection(db, "products");
  const slug = data.slug || (data.name || "product").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Math.random().toString(36).substring(2, 6);
  
  const newProduct = {
    name: data.name || "Untitled Product",
    slug,
    description: data.description || "",
    shortDescription: data.shortDescription || "",
    price: Number(data.price) || 0,
    compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : null,
    costPrice: data.costPrice ? Number(data.costPrice) : null,
    sku: data.sku || `SKU-${Date.now().toString(36).toUpperCase()}`,
    barcode: data.barcode || "",
    stock: data.stock !== undefined ? Number(data.stock) : 50,
    lowStockThreshold: data.lowStockThreshold !== undefined ? Number(data.lowStockThreshold) : 5,
    unit: data.unit || "1 piece",
    isFeatured: data.isFeatured !== undefined ? Boolean(data.isFeatured) : false,
    isDailyDeal: data.isDailyDeal !== undefined ? Boolean(data.isDailyDeal) : false,
    dealEndsAt: data.dealEndsAt || null,
    images: Array.isArray(data.images) && data.images.length > 0 ? data.images : ["https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600"],
    rating: data.rating || 5.0,
    numReviews: data.numReviews || 0,
    categoryId: data.categoryId || "fruits-vegetables",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const res = await addDoc(colRef, newProduct);
  return { id: res.id, ...newProduct };
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
  const docRef = doc(db, "products", id);
  const cleanData: Record<string, any> = { ...data, updatedAt: new Date().toISOString() };
  if (cleanData.price !== undefined) cleanData.price = Number(cleanData.price);
  if (cleanData.compareAtPrice !== undefined && cleanData.compareAtPrice !== null) cleanData.compareAtPrice = Number(cleanData.compareAtPrice);
  if (cleanData.stock !== undefined) cleanData.stock = Number(cleanData.stock);

  await updateDoc(docRef, cleanData);
  return getProductByIdOrSlug(id);
}

export async function deleteProduct(id: string): Promise<boolean> {
  await deleteDoc(doc(db, "products", id));
  return true;
}

export async function updateProductStock(id: string, quantityChange: number): Promise<void> {
  await updateProductStockSafely(id, quantityChange);
}

// ==========================================
// 4. BANNERS
// ==========================================
export async function getBanners(activeOnly: boolean = false): Promise<Banner[]> {
  try {
    const colRef = collection(db, "banners");
    const snap = await getDocs(colRef);
    if (snap.empty) {
      return [];
    }

    let banners = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Banner));
    if (activeOnly) {
      banners = banners.filter((b) => b.isActive !== false);
    }
    banners.sort((a, b) => (a.order || 0) - (b.order || 0));
    return banners;
  } catch (error) {
    console.error("getBanners error:", error);
    return [];
  }
}

export async function createBanner(data: Partial<Banner>): Promise<Banner> {
  const colRef = collection(db, "banners");
  const newBanner = {
    title: data.title || "Special Offer",
    subtitle: data.subtitle || "",
    tag: data.tag || "HOT DEAL",
    image: data.image || "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200",
    link: data.link || "/products",
    buttonText: data.buttonText || "Shop Now",
    isActive: data.isActive !== undefined ? data.isActive : true,
    order: data.order || 0,
    createdAt: new Date().toISOString(),
  };
  const res = await addDoc(colRef, newBanner);
  return { id: res.id, ...newBanner };
}

export async function deleteBanner(id: string): Promise<boolean> {
  await deleteDoc(doc(db, "banners", id));
  return true;
}

// ==========================================
// 5. ORDERS
// ==========================================
export async function getOrders(userId?: string): Promise<Order[]> {
  try {
    const colRef = collection(db, "orders");
    let snap;
    if (userId) {
      const q = query(colRef, where("userId", "==", userId));
      snap = await getDocs(q);
    } else {
      snap = await getDocs(colRef);
    }

    const orders = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
    orders.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return orders;
  } catch (error) {
    console.error("getOrders error:", error);
    return [];
  }
}

export async function getOrderByIdOrNumber(idOrNumber: string): Promise<Order | null> {
  try {
    const docRef = doc(db, "orders", idOrNumber);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Order;
    }

    const colRef = collection(db, "orders");
    const q = query(colRef, where("orderNumber", "==", idOrNumber), limit(1));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      const d = querySnap.docs[0];
      return { id: d.id, ...d.data() } as Order;
    }
    return null;
  } catch (error) {
    console.error("getOrderByIdOrNumber error:", error);
    return null;
  }
}

export async function createOrder(data: {
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: Address | Record<string, any>;
  deliverySlot?: string | null;
  notes?: string | null;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  couponCode?: string | null;
  total: number;
  paymentMethod: any;
}): Promise<Order> {
  const colRef = collection(db, "orders");
  const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

  const newOrder: Omit<Order, "id"> = {
    orderNumber,
    userId: data.userId || null,
    customerName: data.customerName,
    customerEmail: data.customerEmail,
    customerPhone: data.customerPhone,
    shippingAddress: data.shippingAddress,
    deliverySlot: data.deliverySlot || "Standard Delivery (Today)",
    notes: data.notes || "",
    items: data.items,
    subtotal: data.subtotal,
    deliveryFee: data.deliveryFee,
    discountAmount: data.discountAmount || 0,
    couponCode: data.couponCode || null,
    total: data.total,
    paymentMethod: data.paymentMethod || "COD",
    paymentStatus: data.paymentMethod === "COD" ? "PENDING" : "PAID",
    orderStatus: "CONFIRMED",
    trackingHistory: [
      {
        status: "CONFIRMED",
        timestamp: new Date().toISOString(),
        note: "Order confirmed and being prepared by FreshMart store staff.",
      },
    ],
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Save order to Firestore
  const docRef = await addDoc(colRef, newOrder);

  // Reduce stock for each product in background
  try {
    for (const item of data.items) {
      if (item.productId) {
        await updateProductStock(item.productId, -item.quantity);
      }
    }
  } catch (stockErr) {
    console.warn("Stock adjustment notice:", stockErr);
  }

  // Increment coupon usage if applied
  if (data.couponCode) {
    try {
      await incrementCouponUsage(data.couponCode);
    } catch (couponErr) {
      console.warn("Coupon increment notice:", couponErr);
    }
  }

  return { id: docRef.id, ...newOrder };
}

export async function updateOrderStatus(
  orderId: string, 
  newStatus: OrderStatus, 
  note?: string
): Promise<Order | null> {
  const order = await getOrderByIdOrNumber(orderId);
  if (!order) return null;

  const newStep = {
    status: newStatus,
    timestamp: new Date().toISOString(),
    note: note || `Order status updated to ${newStatus}.`,
  };

  const updatedHistory = [...(order.trackingHistory || []), newStep];
  const docRef = doc(db, "orders", order.id);

  const updates: Record<string, any> = {
    orderStatus: newStatus,
    trackingHistory: updatedHistory,
    updatedAt: new Date().toISOString(),
  };

  if (newStatus === "DELIVERED" && order.paymentMethod === "COD") {
    updates.paymentStatus = "PAID";
  }

  await updateDoc(docRef, updates);
  return { ...order, ...updates };
}

// ==========================================
// 6. COUPONS
// ==========================================
export async function getCoupons(): Promise<Coupon[]> {
  try {
    const colRef = collection(db, "coupons");
    const snap = await getDocs(colRef);
    if (snap.empty) {
      return [];
    }
    return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Coupon));
  } catch (error) {
    console.error("getCoupons error:", error);
    return [];
  }
}

export async function validateCoupon(code: string, cartTotal: number): Promise<{
  valid: boolean;
  coupon?: Coupon;
  discountAmount?: number;
  message?: string;
}> {
  try {
    const colRef = collection(db, "coupons");
    const q = query(colRef, where("code", "==", code.toUpperCase().trim()), limit(1));
    const snap = await getDocs(q);

    if (snap.empty) {
      return { valid: false, message: "Invalid coupon code" };
    }

    const coupon = { id: snap.docs[0].id, ...snap.docs[0].data() } as Coupon;

    if (!coupon.isActive) {
      return { valid: false, message: "This coupon is no longer active" };
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return { valid: false, message: "This coupon has expired" };
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, message: "Coupon usage limit reached" };
    }

    if (cartTotal < coupon.minOrderAmount) {
      return {
        valid: false,
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required for this coupon`,
      };
    }

    let discountAmount = 0;
    if (coupon.discountType === "PERCENTAGE") {
      discountAmount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    discountAmount = Math.min(discountAmount, cartTotal);

    return {
      valid: true,
      coupon,
      discountAmount: Math.round(discountAmount),
      message: `Coupon "${coupon.code}" applied! You saved ₹${Math.round(discountAmount)}.`,
    };
  } catch (error: any) {
    return { valid: false, message: error.message || "Error validating coupon" };
  }
}

export async function createCoupon(data: Partial<Coupon>): Promise<Coupon> {
  const colRef = collection(db, "coupons");
  const newCoupon = {
    code: (data.code || "DISCOUNT").toUpperCase().trim(),
    discountType: data.discountType || "PERCENTAGE",
    discountValue: Number(data.discountValue) || 10,
    minOrderAmount: Number(data.minOrderAmount) || 0,
    maxDiscountAmount: data.maxDiscountAmount ? Number(data.maxDiscountAmount) : null,
    usageLimit: data.usageLimit ? Number(data.usageLimit) : null,
    usageCount: 0,
    expiresAt: data.expiresAt || null,
    isActive: data.isActive !== undefined ? data.isActive : true,
    createdAt: new Date().toISOString(),
  };
  const res = await addDoc(colRef, newCoupon);
  return { id: res.id, ...newCoupon };
}

export async function deleteCoupon(id: string): Promise<boolean> {
  await deleteDoc(doc(db, "coupons", id));
  return true;
}

export async function incrementCouponUsage(code: string): Promise<void> {
  const colRef = collection(db, "coupons");
  const q = query(colRef, where("code", "==", code.toUpperCase().trim()), limit(1));
  const snap = await getDocs(q);
  if (!snap.empty) {
    await updateDoc(snap.docs[0].ref, {
      usageCount: increment(1),
    });
  }
}

// ==========================================
// 7. PRODUCT REVIEWS
// ==========================================
export async function getProductReviews(productId: string): Promise<ProductReview[]> {
  try {
    const colRef = collection(db, "reviews");
    const q = query(colRef, where("productId", "==", productId));
    const snap = await getDocs(q);
    const reviews = snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProductReview));
    reviews.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    return reviews;
  } catch (error) {
    console.error("getProductReviews error:", error);
    return [];
  }
}

export async function createProductReview(data: {
  productId: string;
  userId?: string | null;
  userName: string;
  rating: number;
  comment: string;
}): Promise<ProductReview> {
  const colRef = collection(db, "reviews");
  const newRev: Omit<ProductReview, "id"> = {
    productId: data.productId,
    userId: data.userId || null,
    userName: data.userName || "Verified Customer",
    rating: Math.max(1, Math.min(5, Number(data.rating) || 5)),
    comment: data.comment,
    isApproved: true,
    createdAt: new Date().toISOString(),
  };
  const res = await addDoc(colRef, newRev);

  // Recalculate average product rating
  try {
    const reviews = await getProductReviews(data.productId);
    const avgRating = reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length;
    await updateProduct(data.productId, {
      rating: parseFloat(avgRating.toFixed(1)),
      numReviews: reviews.length,
    });
  } catch (calcErr) {
    console.warn("Rating recalculation notice:", calcErr);
  }

  return { id: res.id, ...newRev };
}

// ==========================================
// 8. DEFAULT SEED DATA HELPER (AUTO-POPULATE)
// ==========================================
export async function seedDefaultFirestoreData(): Promise<void> {
  try {
    console.log("🌱 Checking and seeding initial Firestore collections...");

    // 1. Settings
    const settingsRef = doc(db, "settings", "default");
    await setDoc(settingsRef, DEFAULT_SETTINGS, { merge: true });

    // 2. Categories
    const categoriesData = [
      {
        id: "fruits-vegetables",
        name: "Fresh Fruits & Veggies",
        slug: "fruits-vegetables",
        description: "Farm-fresh organic fruits and crisp green vegetables delivered daily.",
        image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600",
        icon: "Apple",
        isFeatured: true,
        order: 1,
      },
      {
        id: "dairy-bakery",
        name: "Dairy, Bread & Eggs",
        slug: "dairy-bakery",
        description: "Fresh milk, artisan breads, paneer, curd, butter, and farm eggs.",
        image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=600",
        icon: "Milk",
        isFeatured: true,
        order: 2,
      },
      {
        id: "grocery-staples",
        name: "Atta, Rice & Dal",
        slug: "grocery-staples",
        description: "Premium basmati rice, chakki fresh atta, pulses, grains and spices.",
        image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600",
        icon: "Wheat",
        isFeatured: true,
        order: 3,
      },
      {
        id: "snacks-beverages",
        name: "Snacks & Drinks",
        slug: "snacks-beverages",
        description: "Crispy namkeens, chips, premium biscuits, cold drinks, juices and tea.",
        image: "https://images.unsplash.com/photo-1563227812-0ea4c22e6cc8?w=600",
        icon: "Coffee",
        isFeatured: true,
        order: 4,
      },
      {
        id: "oils-masalas",
        name: "Oils, Ghee & Masalas",
        slug: "oils-masalas",
        description: "Pure mustard oil, cow ghee, sunflower oil, and authentic whole spices.",
        image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600",
        icon: "Flame",
        isFeatured: true,
        order: 5,
      },
      {
        id: "personal-care",
        name: "Personal Care",
        slug: "personal-care",
        description: "Soaps, shampoos, oral hygiene, skincare and wellness products.",
        image: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600",
        icon: "Sparkles",
        isFeatured: false,
        order: 6,
      },
    ];

    for (const cat of categoriesData) {
      await setDoc(doc(db, "categories", cat.id), {
        ...cat,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }

    // 3. Products
    const sampleProducts = [
      {
        id: "prod-apple-kashmir",
        name: "Fresh Kashmiri Royal Gala Apples",
        slug: "fresh-kashmiri-royal-gala-apples",
        description: "Hand-picked sweet and crunchy Royal Gala apples sourced directly from apple orchards in Kashmir. Rich in fiber and essential vitamins.",
        shortDescription: "Sweet, crunchy and juicy premium apples.",
        price: 180,
        compareAtPrice: 220,
        stock: 45,
        lowStockThreshold: 10,
        unit: "1 kg",
        isFeatured: true,
        isDailyDeal: true,
        images: [
          "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800",
          "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800",
        ],
        rating: 4.8,
        numReviews: 24,
        categoryId: "fruits-vegetables",
      },
      {
        id: "prod-farm-spinach",
        name: "Fresh Farm Spinach (Palak)",
        slug: "fresh-farm-spinach-palak",
        description: "Tender green spinach leaves harvested daily from local hydroponic farms. Cleaned and hygienically packed for your curries and soups.",
        shortDescription: "Tender, nutrient-rich green leaves.",
        price: 35,
        compareAtPrice: 45,
        stock: 60,
        lowStockThreshold: 10,
        unit: "500g Bunch",
        isFeatured: true,
        isDailyDeal: false,
        images: ["https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800"],
        rating: 4.9,
        numReviews: 18,
        categoryId: "fruits-vegetables",
      },
      {
        id: "prod-amul-milk",
        name: "Amul Taaza Homogenised Toned Milk",
        slug: "amul-taaza-homogenised-toned-milk",
        description: "Fresh toned milk with 3.0% fat content. Perfect for daily tea, coffee, breakfast cereal and homemade desserts.",
        shortDescription: "Pure pasteurised toned milk.",
        price: 74,
        compareAtPrice: 78,
        stock: 80,
        lowStockThreshold: 15,
        unit: "1 Litre Tetra",
        isFeatured: true,
        isDailyDeal: false,
        images: ["https://images.unsplash.com/photo-1550583724-b2692b85b150?w=800"],
        rating: 5.0,
        numReviews: 42,
        categoryId: "dairy-bakery",
      },
      {
        id: "prod-paneer-fresh",
        name: "Fresh Malai Paneer Block",
        slug: "fresh-malai-paneer-block",
        description: "Super soft, rich and creamy malai paneer prepared from 100% pure cow milk. Ideal for matar paneer and tikkas.",
        shortDescription: "Soft, melt-in-mouth cottage cheese.",
        price: 110,
        compareAtPrice: 125,
        stock: 35,
        lowStockThreshold: 8,
        unit: "200g Pack",
        isFeatured: true,
        isDailyDeal: true,
        images: ["https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=800"],
        rating: 4.9,
        numReviews: 31,
        categoryId: "dairy-bakery",
      },
      {
        id: "prod-fortune-oil",
        name: "Fortune Sunlite Refined Sunflower Oil",
        slug: "fortune-sunlite-refined-sunflower-oil",
        description: "Light and healthy refined sunflower oil enriched with Vitamins A and D. Excellent stability for high-heat frying and cooking.",
        shortDescription: "Heart-friendly light cooking oil.",
        price: 145,
        compareAtPrice: 165,
        stock: 50,
        lowStockThreshold: 10,
        unit: "1 Litre Pouch",
        isFeatured: true,
        isDailyDeal: false,
        images: ["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800"],
        rating: 4.8,
        numReviews: 29,
        categoryId: "oils-masalas",
      },
      {
        id: "prod-daawat-rice",
        name: "Daawat Rozana Super Basmati Rice",
        slug: "daawat-rozana-super-basmati-rice",
        description: "Aromatic long-grain basmati rice aged to perfection. Fluffy, non-sticky grains ideal for everyday pulao and biryani.",
        shortDescription: "Aromatic aged long grain basmati.",
        price: 380,
        compareAtPrice: 450,
        stock: 30,
        lowStockThreshold: 5,
        unit: "5 kg Bag",
        isFeatured: true,
        isDailyDeal: false,
        images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800"],
        rating: 4.7,
        numReviews: 19,
        categoryId: "grocery-staples",
      },
    ];

    for (const prod of sampleProducts) {
      await setDoc(doc(db, "products", prod.id), {
        ...prod,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    }

    // 4. Banners
    const bannersData = [
      {
        id: "banner-1",
        title: "⚡ 30-Min Local Express Delivery",
        subtitle: "Fresh groceries, dairy & veggies delivered right to your doorstep",
        tag: "FREE DELIVERY ON ₹499+",
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200",
        link: "/products",
        buttonText: "Shop Fresh Today",
        isActive: true,
        order: 1,
      },
      {
        id: "banner-2",
        title: "Farm Fresh Organic Vegetables",
        subtitle: "Directly sourced from trusted local farmers every morning",
        tag: "UP TO 30% OFF",
        image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1200",
        link: "/products?category=fruits-vegetables",
        buttonText: "Explore Fresh Veggies",
        isActive: true,
        order: 2,
      },
    ];

    for (const ban of bannersData) {
      await setDoc(doc(db, "banners", ban.id), {
        ...ban,
        createdAt: new Date().toISOString(),
      }, { merge: true });
    }

    // 5. Coupons
    const couponsData = [
      {
        id: "coupon-welcome10",
        code: "WELCOME10",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minOrderAmount: 299,
        maxDiscountAmount: 100,
        usageLimit: 1000,
        usageCount: 15,
        isActive: true,
      },
      {
        id: "coupon-fresh50",
        code: "FRESH50",
        discountType: "FIXED",
        discountValue: 50,
        minOrderAmount: 499,
        usageLimit: 500,
        usageCount: 8,
        isActive: true,
      },
    ];

    for (const coup of couponsData) {
      await setDoc(doc(db, "coupons", coup.id), {
        ...coup,
        createdAt: new Date().toISOString(),
      }, { merge: true });
    }

    console.log("✅ Initial Firestore Database Seeding Complete!");
  } catch (error) {
    console.warn("Seeding notice:", error);
  }
}

// ==========================================
// 9. REAL-TIME SNAPSHOT LISTENERS (ONSNAPSHOT)
// ==========================================

/**
 * Real-time listener for Products collection.
 * Automatically triggers whenever products are added, edited, deleted, or stock changes.
 */
export function subscribeToProducts(
  callback: (products: Product[]) => void,
  filters: ProductQueryFilters = {}
): Unsubscribe {
  const colRef = collection(db, "products");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const products: Product[] = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Product));
      const processed = filterAndSortProducts(products, filters);
      callback(processed);
    },
    (error) => {
      console.error("Real-time products subscription error:", error);
    }
  );
}

/**
 * Real-time listener for a single Product document.
 */
export function subscribeToProduct(
  idOrSlug: string,
  callback: (product: Product | null) => void
): Unsubscribe {
  // If it might be an ID first, listen on docRef directly
  const docRef = doc(db, "products", idOrSlug);
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() } as Product);
      } else {
        // Fallback search by slug
        const q = query(collection(db, "products"), where("slug", "==", idOrSlug), limit(1));
        const unsubscribeSlug = onSnapshot(q, (querySnap) => {
          if (!querySnap.empty) {
            const d = querySnap.docs[0];
            callback({ id: d.id, ...d.data() } as Product);
          } else {
            callback(null);
          }
        });
        return unsubscribeSlug;
      }
    },
    (error) => {
      console.error("Real-time single product subscription error:", error);
    }
  );
}

/**
 * Real-time listener for Categories.
 */
export function subscribeToCategories(
  callback: (categories: Category[]) => void
): Unsubscribe {
  const colRef = collection(db, "categories");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const categories = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
      categories.sort((a, b) => (a.order || 0) - (b.order || 0));
      callback(categories);
    },
    (error) => {
      console.error("Real-time categories subscription error:", error);
    }
  );
}

/**
 * Real-time listener for Banners.
 */
export function subscribeToBanners(
  callback: (banners: Banner[]) => void,
  activeOnly: boolean = false
): Unsubscribe {
  const colRef = collection(db, "banners");
  return onSnapshot(
    colRef,
    (snapshot) => {
      let banners = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Banner));
      if (activeOnly) {
        banners = banners.filter((b) => b.isActive !== false);
      }
      banners.sort((a, b) => (a.order || 0) - (b.order || 0));
      callback(banners);
    },
    (error) => {
      console.error("Real-time banners subscription error:", error);
    }
  );
}

/**
 * Real-time listener for Orders (Admin list or Customer list).
 */
export function subscribeToOrders(
  callback: (orders: Order[]) => void,
  userId?: string
): Unsubscribe {
  const colRef = collection(db, "orders");
  const q = userId
    ? query(colRef, where("userId", "==", userId))
    : colRef;

  return onSnapshot(
    q,
    (snapshot) => {
      const orders = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Order));
      orders.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      callback(orders);
    },
    (error) => {
      console.error("Real-time orders subscription error:", error);
    }
  );
}

/**
 * Real-time listener for a single Order document (Customer Live Tracker).
 */
export function subscribeToOrder(
  orderIdOrNumber: string,
  callback: (order: Order | null) => void
): Unsubscribe {
  const docRef = doc(db, "orders", orderIdOrNumber);
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() } as Order);
      } else {
        // Fallback query by orderNumber
        const q = query(collection(db, "orders"), where("orderNumber", "==", orderIdOrNumber), limit(1));
        const unsub = onSnapshot(q, (snap) => {
          if (!snap.empty) {
            callback({ id: snap.docs[0].id, ...snap.docs[0].data() } as Order);
          } else {
            callback(null);
          }
        });
        return unsub;
      }
    },
    (error) => {
      console.error("Real-time single order subscription error:", error);
    }
  );
}

/**
 * Real-time listener for Store Settings.
 */
export function subscribeToStoreSettings(
  callback: (settings: StoreSetting) => void
): Unsubscribe {
  const docRef = doc(db, "settings", "default");
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback({ ...DEFAULT_SETTINGS, ...docSnap.data(), id: "default" } as StoreSetting);
      } else {
        callback(DEFAULT_SETTINGS);
      }
    },
    (error) => {
      console.error("Real-time settings subscription error:", error);
    }
  );
}

/**
 * Real-time listener for Coupons.
 */
export function subscribeToCoupons(
  callback: (coupons: Coupon[]) => void
): Unsubscribe {
  const colRef = collection(db, "coupons");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const coupons = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Coupon));
      callback(coupons);
    },
    (error) => {
      console.error("Real-time coupons subscription error:", error);
    }
  );
}

/**
 * Real-time listener for Product Reviews.
 */
export function subscribeToReviews(
  productId: string,
  callback: (reviews: ProductReview[]) => void
): Unsubscribe {
  const colRef = collection(db, "reviews");
  const q = query(colRef, where("productId", "==", productId));
  return onSnapshot(
    q,
    (snapshot) => {
      const reviews = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as ProductReview));
      reviews.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      callback(reviews);
    },
    (error) => {
      console.error("Real-time reviews subscription error:", error);
    }
  );
}

/**
 * Real-time sync for Customer Cart with Firestore.
 */
export function subscribeToCustomerCart(
  userId: string,
  callback: (items: CartItem[]) => void
): Unsubscribe {
  const docRef = doc(db, "users", userId);
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (Array.isArray(data.cart)) {
          callback(data.cart as CartItem[]);
        }
      }
    },
    (error) => {
      console.warn("Cart real-time sync notice:", error);
    }
  );
}

export async function syncCustomerCart(userId: string, items: CartItem[]): Promise<void> {
  try {
    const docRef = doc(db, "users", userId);
    await updateDoc(docRef, {
      cart: items,
      cartUpdatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.warn("Sync cart error:", error);
  }
}

/**
 * Real-time listener for all Customers in Admin Directory
 */
export function subscribeToUsers(callback: (users: SafeUser[]) => void): Unsubscribe {
  const colRef = collection(db, "users");
  return onSnapshot(
    colRef,
    (snapshot) => {
      const users: SafeUser[] = snapshot.docs.map((d) => {
        const u = d.data();
        return {
          id: d.id,
          name: u.name || "Customer",
          email: u.email || "",
          phone: u.phone || null,
          role: u.role || "CUSTOMER",
          createdAt: u.createdAt || new Date().toISOString(),
        };
      });
      callback(users);
    },
    (error) => {
      console.error("Real-time users subscription error:", error);
    }
  );
}

/**
 * Real-time listener for a customer's saved addresses
 */
export function subscribeToCustomerAddresses(
  userId: string,
  callback: (addresses: Address[]) => void
): Unsubscribe {
  const docRef = doc(db, "users", userId);
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        callback(data.addresses || []);
      }
    },
    (error) => {
      console.error("Real-time addresses subscription error:", error);
    }
  );
}

/**
 * Concurrency-safe atomic stock update using Firestore transaction.
 */
export async function updateProductStockSafely(
  productId: string,
  quantityChange: number
): Promise<{ success: boolean; newStock: number; message?: string }> {
  const docRef = doc(db, "products", productId);
  try {
    const result = await runTransaction(db, async (transaction) => {
      const prodDoc = await transaction.get(docRef);
      if (!prodDoc.exists()) {
        throw new Error("Product not found");
      }
      const currentStock = prodDoc.data().stock ?? 0;
      const newStock = currentStock + quantityChange;
      if (newStock < 0) {
        throw new Error(`Insufficient stock. Current available stock is ${currentStock}.`);
      }
      transaction.update(docRef, {
        stock: newStock,
        updatedAt: new Date().toISOString(),
      });
      return newStock;
    });
    return { success: true, newStock: result };
  } catch (err: any) {
    return { success: false, newStock: 0, message: err.message || "Stock update transaction failed" };
  }
}

