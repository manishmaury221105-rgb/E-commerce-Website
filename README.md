# 🛒 FreshMart - Modern Full-Stack Local E-Commerce Platform

A fast, mobile-friendly, production-ready full-stack e-commerce web platform engineered for local supermarkets and grocery shops.

Built with **Next.js 14+ (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, and **SQLite**.

---

## ✨ Features Overview

### 🛍️ Storefront & User Experience
* **Hero Carousel & Banners**: High-impact promotional slides with limited-time deal countdowns and value highlights.
* **Smart Catalog & Filter Engine**: Instant multi-attribute search, category filtering, price sliders, stock availability, and sorting (Price, Newest, Top-rated).
* **Product Details Page (PDP)**:
  * Multi-image zoom gallery.
  * Discount percentage badge and price comparison.
  * Pincode-based delivery availability checker.
  * Quantity steppers, "Add to Cart", and instant "Buy Now".
  * Direct "Order via WhatsApp" pre-filled message generator.
  * Verified customer reviews submission and average ratings.
* **Interactive Shopping Cart & Drawer**:
  * Slide-over quick cart drawer + dedicated `/cart` page.
  * Real-time free delivery progress meter (e.g. *"Add ₹120 more for FREE Delivery"*).
  * Promo coupon code engine with automatic discount calculation.
* **Smooth 2-Step Checkout**:
  * Customer address selection & address book manager.
  * Scheduled delivery time slot selection (Express 2-Hour, Morning, Evening).
  * Payment options: **Cash on Delivery (COD)** + **Instant Simulated Online UPI (GPay/PhonePe/Paytm), Cards, NetBanking**.
  * Confetti order celebration.
* **Live Order Tracking & Tax Invoices**:
  * 5-step visual tracking timeline (`Order Placed` ➔ `Confirmed` ➔ `Packed` ➔ `Out for Delivery` ➔ `Delivered`).
  * Live status notes log with timestamps.
  * Clean printable tax invoice / packing slip format.
* **WhatsApp Integration**:
  * Floating WhatsApp support widget with quick query options.
  * One-click WhatsApp product order & cart order sharing.

---

### 👑 Admin Management Suite (`/admin`)
* **Dashboard Analytics**: Real-time sales revenue, order volumes, active delivery counters, 7-day revenue trend chart, and low-stock alerts.
* **Product & Inventory CRUD**: Create, edit, delete products, manage stock counts, cost/selling prices, SKUs, barcodes, categories, and daily deal tags.
* **Categories & Hero Banners Manager**: Create and organize product categories and customize promotional banner slides.
* **Order Fulfillment Center**: Live order pipeline, status updater (`PENDING` ➔ `CONFIRMED` ➔ `PACKED` ➔ `OUT_FOR_DELIVERY` ➔ `DELIVERED` ➔ `CANCELLED`), tracking note logger, and thermal packing slip printer.
* **Coupon & Promotion Engine**: Create percentage/flat discount codes with minimum cart thresholds, max discount caps, and usage limits.
* **Customer CRM**: View customer order history, lifetime spend, and address profiles.
* **Store Settings**: Customize shop name, contact number, WhatsApp ordering number, delivery thresholds, and announcement banners.

---

## 🔑 Pre-Seeded Demo Credentials

| Role | Email | Password | Access Link |
| :--- | :--- | :--- | :--- |
| **Store Admin** | `manish@2211` or `manish@2211.com` | `m@221105` | [/admin](http://localhost:3000/admin) or [/auth/login](http://localhost:3000/auth/login) |
| **Demo Customer** | `customer@localshop.com` | `Customer@123` | [/auth/login](http://localhost:3000/auth/login) |

> 💡 **Tip**: The login page includes convenient 1-click demo login buttons!

---

## 🚀 Quick Start & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database & Seed Initial Catalog
```bash
npx prisma db push
npx prisma db seed
```

### 3. Run Local Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 14+ (App Router & Server Actions)
- **Language**: TypeScript
- **Styling**: Vanilla Tailwind CSS + Glassmorphism tokens
- **Database & ORM**: SQLite + Prisma ORM (zero setup, easy migration to PostgreSQL/MySQL)
- **Authentication**: JWT Cookie Sessions + bcryptjs password encryption
- **Icons**: Lucide-React
- **Effects**: Canvas-Confetti
