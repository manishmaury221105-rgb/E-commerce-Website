export type UserRole = "CUSTOMER" | "ADMIN" | "STAFF";

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: UserRole;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  name: string;
  phone: string;
  street: string;
  apartment?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
  label: "HOME" | "WORK" | "OTHER";
  createdAt?: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  icon?: string | null;
  isFeatured: boolean;
  order: number;
  parentId?: string | null;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  userId?: string | null;
  userName: string;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string | null;
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  sku?: string | null;
  barcode?: string | null;
  stock: number;
  lowStockThreshold: number;
  unit: string;
  isFeatured: boolean;
  isDailyDeal: boolean;
  dealEndsAt?: string | null;
  images: string[]; // Parsed from JSON string in database
  rating: number;
  numReviews: number;
  categoryId: string;
  category?: Category;
  reviews?: ProductReview[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  compareAtPrice?: number | null;
  unit: string;
  quantity: number;
  stock: number;
}

export type PaymentMethod = "COD" | "ONLINE_UPI" | "ONLINE_CARD" | "ONLINE_NETBANKING";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type OrderStatus = "PENDING" | "CONFIRMED" | "PACKED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED";

export interface TrackingStep {
  status: OrderStatus;
  timestamp: string;
  note: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId?: string | null;
  productName: string;
  productImage?: string | null;
  price: number;
  quantity: number;
  unit?: string | null;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
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
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  trackingHistory: TrackingStep[];
  invoiceNumber?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number | null;
  usageLimit?: number | null;
  usageCount: number;
  expiresAt?: string | null;
  isActive: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  tag?: string | null;
  image: string;
  link: string;
  buttonText: string;
  isActive: boolean;
  order: number;
}

export interface StoreSetting {
  id: string;
  shopName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  currency: string;
  freeDeliveryMin: number;
  deliveryFee: number;
  announcement?: string | null;
  openHours?: string | null;
}
