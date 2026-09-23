export const ORDER_STATUS_LABELS: Record<string, { label: string; color: string; description: string }> = {
  PENDING: {
    label: "Order Placed",
    color: "bg-amber-100 text-amber-800 border-amber-300",
    description: "Your order has been received and is waiting for store confirmation.",
  },
  CONFIRMED: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    description: "The shop has accepted and verified your order items.",
  },
  PACKED: {
    label: "Packed & Ready",
    color: "bg-indigo-100 text-indigo-800 border-indigo-300",
    description: "Your items are securely packed and waiting for delivery pickup.",
  },
  OUT_FOR_DELIVERY: {
    label: "Out for Delivery",
    color: "bg-purple-100 text-purple-800 border-purple-300",
    description: "Our delivery partner is on the way to your address!",
  },
  DELIVERED: {
    label: "Delivered",
    color: "bg-emerald-100 text-emerald-800 border-emerald-300",
    description: "Order successfully delivered! Thank you for shopping with us.",
  },
  CANCELLED: {
    label: "Cancelled",
    color: "bg-rose-100 text-rose-800 border-rose-300",
    description: "This order was cancelled.",
  },
};

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  COD: "Cash on Delivery",
  ONLINE_UPI: "Instant UPI (GPay / PhonePe / Paytm)",
  ONLINE_CARD: "Credit / Debit Card",
  ONLINE_NETBANKING: "Net Banking",
};

export const PAYMENT_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: "Payment Pending", color: "bg-yellow-100 text-yellow-800" },
  PAID: { label: "Paid Successfully", color: "bg-green-100 text-green-800" },
  FAILED: { label: "Payment Failed", color: "bg-red-100 text-red-800" },
  REFUNDED: { label: "Refunded", color: "bg-gray-100 text-gray-800" },
};

export const DELIVERY_SLOTS = [
  { id: "express", label: "⚡ Express Delivery (Within 2 Hours)", fee: 0 },
  { id: "standard_morning", label: "🌅 Morning Slot (8:00 AM - 12:00 PM)", fee: 0 },
  { id: "standard_evening", label: "🌆 Evening Slot (4:00 PM - 8:00 PM)", fee: 0 },
  { id: "tomorrow_morning", label: "📅 Tomorrow Morning (8:00 AM - 12:00 PM)", fee: 0 },
];
