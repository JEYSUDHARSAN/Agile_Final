# Your Account Module

## Overview

The **Your Account Module** is a frontend-only implementation of the Amazon.in account page. It allows users to view and manage their account information through a simple and responsive interface.

This module is built using **HTML, CSS, and JavaScript** and stores data in the browser using **Local Storage**. No backend or database is used.

---

## Features

* Amazon-style "Your Account" dashboard
* Responsive 8-card account layout
* View the latest 3 orders
* Add, edit, and delete shipping addresses
* Amazon Pay dashboard (static)
* Amazon Business registration page
* Prime Membership page
* Payment Options page
* Contact Us form
* Shared Amazon header for navigation

---

## Project Structure

```text
Your_Account/
│── index.html      # Main account page
│── styles.css      # Styling
│── app.js          # Navigation and Local Storage logic
│── README.md       # Documentation
```

---

## Technologies Used

* HTML5
* CSS3
* JavaScript (ES6)
* Local Storage

---

## Data Storage

The module stores data using the browser's Local Storage.

| Key                | Purpose                   |
| ------------------ | ------------------------- |
| `amazon_session`   | Stores the logged-in user |
| `amazon_orders`    | Stores user orders        |
| `amazon_addresses` | Stores saved addresses    |

---

## How It Works

1. The Login module stores the current user in `amazon_session`.
2. The module reads the logged-in user's information.
3. Orders are loaded from `amazon_orders`.
4. Addresses are loaded from `amazon_addresses`.
5. All account pages are displayed without reloading the page using JavaScript.

---

## Navigation Flow

```text
Your Account Dashboard
        ↓
Select a Card
        ↓
navigateTo(moduleName)
        ↓
Open Selected Page
```

---

## Integration

### Login Module

Uses `amazon_session` to identify the current user.

### Checkout Module

Reads order history from `amazon_orders`.

### Search & Cart Module

Shares the common Amazon header for navigation.

---

## Assumptions

* The user has already logged in.
* Orders are available from the Checkout module.
* The browser supports Local Storage.

---

## Limitations

* No backend or database.
* No real API calls.
* Amazon Pay and Prime data are static.
* Contact Us form is for UI only.
* Data will be lost if the browser's Local Storage is cleared.

---

## Future Improvements

* Connect with a backend database.
* Add order search and filtering.
* Add profile editing.
* Add form validation.
* Integrate real payment features.
* Improve order management.

---

## Summary

The **Your Account Module** provides a simple Amazon-like account management system where users can view orders, manage addresses, access Amazon Pay, Prime, Business, and other account pages. It is designed to integrate easily with the Login, Checkout, and Search & Cart modules while keeping all data stored locally in the browser.



changes made in this line