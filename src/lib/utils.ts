import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number | null | undefined,
  currency: string = "₹"
): string {
  if (amount === null || amount === undefined || isNaN(amount)) return `${currency}0.00`;
  return `${currency}${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatShortDate(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
  });
}

export function generateOrderNumber(): string {
  const datePart = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${datePart}-${randomPart}`;
}

export function generateWhatsAppSupportLink(phone: string, message?: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const defaultMsg = message || "Hello FreshMart! I have a question about my shopping order.";
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(defaultMsg)}`;
}

export function generateWhatsAppProductOrderLink(
  phone: string,
  productName: string,
  price: number,
  productUrl: string
): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const msg = `Hi FreshMart, I would like to order this item directly:\n\n🛍️ *${productName}*\n💰 Price: ₹${price}\n🔗 Product link: ${productUrl}\n\nPlease confirm availability and delivery time. Thank you!`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
}

export function generateWhatsAppOrderSummaryLink(
  phone: string,
  orderNumber: string,
  total: number,
  itemsCount: number,
  customerName: string
): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  const msg = `Hi FreshMart, I just placed an order on the website:\n\n📦 *Order ID:* ${orderNumber}\n👤 *Customer:* ${customerName}\n🛒 *Items:* ${itemsCount}\n💵 *Total Amount:* ₹${total}\n\nPlease verify and process my order. Thank you!`;
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`;
}
