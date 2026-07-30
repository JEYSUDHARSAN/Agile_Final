# Checkout & Payment Module

## Module Overview
This module implements Use Case 3: Checkout & Payment for the Amazon.in frontend clone. It is a static, frontend-only checkout flow that consumes the shared cart, requires an active customer session, captures a shipping address, simulates payment, records the order in browser storage, and displays order confirmation.

## Folder Structure
- `index.html` - Checkout, shipping, payment, review, summary, and confirmation markup.
- `styles.css` - Amazon.in-inspired responsive checkout styling.
- `app.js` - Session guard, cart integration, address management, payment simulation, order creation, and confirmation rendering.

## Components
- Checkout header with Amazon.in branding and secure checkout marker.
- Session and empty-cart gate message.
- Delivery address list and add/edit address form.
- Payment method selector for UPI, Credit Card, Debit Card, Net Banking, and Cash on Delivery.
- Delivery and item review section.
- Sticky order summary with item total, delivery fee, estimated tax, promotion, and grand total.
- Order confirmation view with order ID, customer, items, total, payment method, address, and estimated delivery.

## Architecture
The module is self-contained and uses plain HTML, CSS, and JavaScript to match the existing project architecture. It does not introduce dependencies, build tools, backend services, or database calls.

## Data Flow
1. Checkout reads cart data from `localStorage.amazon_in_cart`.
2. Checkout reads the active user from `localStorage.session`, with support for the older `amazon_user_session` shape.
3. Addresses are saved per customer in `localStorage.amazon_checkout_addresses`.
4. Placing an order writes the completed order to `localStorage.amazon_orders`.
5. The cart is cleared after a successful order.

## Integration with Login
The login module stores the active customer session under `localStorage.session`. Checkout requires that session to contain `isLoggedIn: true` and user details. If no active session exists, checkout displays a sign-in gate and links back to the Login module.

## Integration with Search & Cart
The Search & Cart module owns cart state through `localStorage.amazon_in_cart`. Its checkout handoff now navigates to `Checkout_Payment/index.html` after ensuring the cart is not empty. If checkout is loaded with an empty cart, it sends the customer back to Search & Cart.

## State Management
All state is browser-local:
- Cart: `amazon_in_cart`
- Session: `session`
- Saved addresses: `amazon_checkout_addresses`
- Orders: `amazon_orders`

Orders and addresses are keyed by the customer's email when available.

## Mock Payment Design
Payment is simulated only. Online methods require simple mock details before order placement, but no payment API, tokenization, network request, or real validation is performed. Cash on Delivery requires no extra fields.

## Order Flow
Cart -> Checkout -> Shipping Address -> Payment -> Order Review -> Place Order -> Order Confirmation.

## Assumptions
- The customer has signed in through the existing Login module.
- Cart items already exist in `amazon_in_cart`.
- Estimated tax is calculated at 18% for a realistic price breakdown.
- Delivery is free for orders at or above ₹499.
- A small mock promotion is applied on orders at or above ₹999.

## Limitations
- No backend, database, inventory reservation, payment gateway, or real order fulfillment.
- Address and order data are stored only in localStorage.
- Mock payment fields are checked only for presence.

## Future Improvements
- Add a full order history page in the account area.
- Support multiple delivery speeds and delivery slot selection.
- Add richer payment validation and masked saved payment instruments.
- Sync session shape across all modules.
## Create New
- These lines are intentionally added to show changes
```bash
Powershell -SetExecutionPolicy -RemoteSigned
```
_The actual Powershell code is way longer than that but again it is only a demo_