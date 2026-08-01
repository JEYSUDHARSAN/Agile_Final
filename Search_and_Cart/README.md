# Amazon Web Application - Module 2: Search & Add to Cart Engine

This repository contains the Amazon Web Application project split into three modules as assigned:

- **Module 1:** Authentication & Login (User registration, session management)
- **Module 2 (This Section):** Product Catalog, Instant Search Engine, Category & Price Filters, Product Details Modal, Slide-out Shopping Cart, and Pre-Checkout Handover.
- **Module 3:** Checkout Process & Payment Gateway.

---

## 🛍️ Module 2 Features (Amazon.in Design)

1. **Header & Navigation Strip:**
   - Authentic Amazon India dark navy theme (`#131921`, `#232f3e`).
   - Location deliver selector (`Deliver to India 400001`).
   - Real-time search bar with category dropdown selector.
   - User account status (synced with Module 1 `localStorage` session).
   - Animated Cart icon displaying live item count.

2. **Search & Filtering System:**
   - Real-time keyword filtering (matches product titles, categories, and badges).
   - Category navigation pills (Mobiles & Electronics, Fashion, Home & Kitchen, Books, Gaming).
   - Price Range Filter (Min & Max in ₹ INR).
   - Star Rating Filter (4.5+ ★, 4.0+ ★).
   - Sorting Engine (Featured, Price: Low to High, Price: High to Low, Customer Reviews).

3. **Product Catalog & Quick-View Modal:**
   - Amazon product cards with badges (*Best Seller*, *Amazon Choice*, *Deal of the Day*).
   - Prices formatted in Indian Rupees (₹) with strike-through MRP and discount percentage.
   - Interactive Quick View modal displaying product image, specs, and details.

4. **Shopping Cart Engine & Module 3 Handover:**
   - Slide-out Cart Drawer + dynamic subtotal computation.
   - Free shipping progress bar (Free delivery for orders over ₹499).
   - Quantity increment/decrement and item deletion.
   - Seamless data sync: Saves cart state in `localStorage` (`amazon_in_cart`) for Module 3 to read during payment processing.

---

## 🚀 How to Run Locally

1. Open a terminal in this folder:
   ```bash
   cd amazon-clone
   ```
2. Open `index.html` in your web browser or start a local server:
   ```bash
   # Option A: Double-click index.html
   # Option B: Run a local server at http://localhost:3000
   ```
hello again