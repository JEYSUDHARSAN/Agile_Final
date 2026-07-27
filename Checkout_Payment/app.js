const CART_KEY = 'amazon_in_cart';
const SESSION_KEY = 'session';
const LEGACY_SESSION_KEY = 'amazon_user_session';
const ADDRESSES_KEY = 'amazon_checkout_addresses';
const ORDERS_KEY = 'amazon_orders';

const paymentMethods = [
  { id: 'upi', label: 'UPI', note: 'Pay by any UPI app', fields: [{ id: 'upiId', label: 'UPI ID', placeholder: 'name@upi' }] },
  { id: 'credit-card', label: 'Credit Card', note: 'Visa, Mastercard, RuPay', fields: [{ id: 'creditNumber', label: 'Card number', placeholder: '4111 1111 1111 1111' }, { id: 'creditExpiry', label: 'Expiry', placeholder: 'MM/YY' }] },
  { id: 'debit-card', label: 'Debit Card', note: 'All major bank debit cards', fields: [{ id: 'debitNumber', label: 'Card number', placeholder: '5100 0000 0000 0000' }, { id: 'debitExpiry', label: 'Expiry', placeholder: 'MM/YY' }] },
  { id: 'net-banking', label: 'Net Banking', note: 'Choose your bank', fields: [{ id: 'bankName', label: 'Bank', placeholder: 'State Bank of India' }] },
  { id: 'cod', label: 'Cash on Delivery', note: 'Pay when your package arrives', fields: [] }
];

let cart = [];
let session = null;
let addresses = [];
let selectedAddressId = null;
let editingAddressId = null;
let selectedPaymentId = 'upi';

document.addEventListener('DOMContentLoaded', initCheckout);

function initCheckout() {
  session = getSession();
  cart = readJson(CART_KEY, []);

  if (!session) {
    sessionStorage.setItem(
        "redirectAfterLogin",
        "../Checkout_Payment/index.html"
    );

    window.location.href = "../Auth_and_login/index.html";
    return;
  } 

  if (!cart.length) {
    showGate('Your cart is empty. Add items before starting checkout.', '../Search_and_Cart/index.html', 'Return to cart');
    return;
  }

  addresses = getUserAddresses();
  selectedAddressId = addresses[0]?.id || null;
  document.getElementById('checkoutView').hidden = false;
  setupEvents();
  renderAll();
}

function getSession() {
  const current = readJson(SESSION_KEY, null);
  if (current && current.isLoggedIn && current.user) return current;

  const legacy = readJson(LEGACY_SESSION_KEY, null);
  if (legacy) {
    return {
      isLoggedIn: true,
      user: { name: legacy.name || 'Customer', email: legacy.email || 'customer@example.com' }
    };
  }
  return null;
}

function setupEvents() {
  document.getElementById('addAddressBtn').addEventListener('click', () => openAddressForm());
  document.getElementById('cancelAddressBtn').addEventListener('click', closeAddressForm);
  document.getElementById('addressForm').addEventListener('submit', saveAddress);
  document.getElementById('placeOrderBtn').addEventListener('click', placeOrder);
}

function renderAll() {
  renderAddresses();
  renderPayments();
  renderReview();
  renderSummary();
  updateProgress();
}

function renderAddresses() {
  const list = document.getElementById('addressList');
  if (!addresses.length) {
    list.innerHTML = '<div class="empty-card">No delivery address saved yet. Add an address to continue.</div>';
    openAddressForm();
    return;
  }

  list.innerHTML = addresses.map(address => `
    <article class="address-card ${address.id === selectedAddressId ? 'selected' : ''}">
      <label>
        <input type="radio" name="selectedAddress" value="${address.id}" ${address.id === selectedAddressId ? 'checked' : ''}>
        <span>
          <strong>${escapeHtml(address.fullName)}</strong>
          <span>${escapeHtml(address.houseNumber)}, ${escapeHtml(address.area)}</span>
          <span>${escapeHtml(address.city)}, ${escapeHtml(address.state)} ${escapeHtml(address.pincode)}</span>
          <span>Mobile: ${escapeHtml(address.mobile)}</span>
        </span>
      </label>
      <button type="button" class="link-button" data-edit-address="${address.id}">Edit</button>
    </article>
  `).join('');

  list.querySelectorAll('input[name="selectedAddress"]').forEach(input => {
    input.addEventListener('change', event => {
      selectedAddressId = event.target.value;
      renderAll();
    });
  });

  list.querySelectorAll('[data-edit-address]').forEach(button => {
    button.addEventListener('click', () => openAddressForm(button.dataset.editAddress));
  });
}

function openAddressForm(addressId = null) {
  editingAddressId = addressId;
  const form = document.getElementById('addressForm');
  const title = document.getElementById('addressFormTitle');
  const address = addresses.find(item => item.id === addressId);
  title.textContent = address ? 'Edit address' : 'Add a new address';
  form.hidden = false;
  form.reset();
  document.getElementById('addressError').textContent = '';

  if (address) {
    Object.keys(address).forEach(key => {
      if (form.elements[key]) form.elements[key].value = address[key];
    });
  } else {
    form.elements.fullName.value = session.user.name || '';
  }
}

function closeAddressForm() {
  document.getElementById('addressForm').hidden = true;
  editingAddressId = null;
}

function saveAddress(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const address = {
    id: editingAddressId || `addr-${Date.now()}`,
    fullName: form.fullName.value.trim(),
    mobile: form.mobile.value.trim(),
    pincode: form.pincode.value.trim(),
    houseNumber: form.houseNumber.value.trim(),
    area: form.area.value.trim(),
    city: form.city.value.trim(),
    state: form.state.value
  };

  const error = validateAddress(address);
  if (error) {
    document.getElementById('addressError').textContent = error;
    return;
  }

  if (editingAddressId) {
    addresses = addresses.map(item => item.id === editingAddressId ? address : item);
  } else {
    addresses.push(address);
  }

  selectedAddressId = address.id;
  saveUserAddresses();
  closeAddressForm();
  renderAll();
}

function validateAddress(address) {
  if (Object.values(address).some(value => !String(value).trim())) return 'All address fields are required.';
  if (!/^[6-9]\d{9}$/.test(address.mobile)) return 'Enter a valid 10-digit Indian mobile number.';
  if (!/^\d{6}$/.test(address.pincode)) return 'Enter a valid 6-digit pincode.';
  return '';
}

function renderPayments() {
  const options = document.getElementById('paymentOptions');
  options.innerHTML = paymentMethods.map(method => `
    <label class="payment-option ${method.id === selectedPaymentId ? 'selected' : ''}">
      <input type="radio" name="paymentMethod" value="${method.id}" ${method.id === selectedPaymentId ? 'checked' : ''}>
      <span><strong>${method.label}</strong><small>${method.note}</small></span>
    </label>
  `).join('');

  options.querySelectorAll('input[name="paymentMethod"]').forEach(input => {
    input.addEventListener('change', event => {
      selectedPaymentId = event.target.value;
      renderPayments();
      updateProgress();
    });
  });

  const method = paymentMethods.find(item => item.id === selectedPaymentId);
  document.getElementById('paymentDetails').innerHTML = method.fields.length ? method.fields.map(field => `
    <label>${field.label}
      <input id="${field.id}" type="text" placeholder="${field.placeholder}" data-payment-field>
    </label>
  `).join('') : '<p>Cash on Delivery will be collected at your doorstep. No online payment is processed.</p>';
}

function renderReview() {
  const selectedAddress = addresses.find(address => address.id === selectedAddressId);
  const deliveryDate = getEstimatedDeliveryDate();
  document.getElementById('deliverySummary').innerHTML = selectedAddress ? `
    <strong>Arriving ${deliveryDate}</strong>
    <span>Delivering to ${escapeHtml(selectedAddress.fullName)}, ${escapeHtml(selectedAddress.city)} ${escapeHtml(selectedAddress.pincode)}</span>
  ` : '<span>Select a delivery address to review delivery details.</span>';

  document.getElementById('reviewItems').innerHTML = cart.map(item => `
    <article class="review-item">
      <img src="${item.image}" alt="${escapeHtml(item.title)}">
      <div>
        <strong>${escapeHtml(item.title)}</strong>
        <span>Qty: ${item.quantity}</span>
        <span>₹${formatINR(item.price * item.quantity)}</span>
      </div>
    </article>
  `).join('');
}

function renderSummary() {
  const totals = calculateTotals();
  document.getElementById('itemsTotal').textContent = `₹${formatINR(totals.items)}`;
  document.getElementById('deliveryFee').textContent = totals.delivery === 0 ? 'FREE' : `₹${formatINR(totals.delivery)}`;
  document.getElementById('taxTotal').textContent = `₹${formatINR(totals.tax)}`;
  document.getElementById('promotionTotal').textContent = `-₹${formatINR(totals.promotion)}`;
  document.getElementById('grandTotal').textContent = `₹${formatINR(totals.grand)}`;
}

function placeOrder() {
  const selectedAddress = addresses.find(address => address.id === selectedAddressId);
  if (!selectedAddress) {
    openAddressForm();
    document.getElementById('addressError').textContent = 'Choose or add a delivery address before placing your order.';
    return;
  }

  const method = paymentMethods.find(item => item.id === selectedPaymentId);
  if (method.fields.length && !Array.from(document.querySelectorAll('[data-payment-field]')).every(input => input.value.trim())) {
    alert('Enter the mock payment details to simulate payment.');
    return;
  }

  const order = {
    id: generateOrderId(),
    placedAt: new Date().toISOString(),
    customer: session.user,
    items: cart,
    totals: calculateTotals(),
    paymentMethod: method.label,
    address: selectedAddress,
    estimatedDelivery: getEstimatedDeliveryDate()
  };

  const orders = readJson(ORDERS_KEY, {});
  const userKey = getUserKey();
  orders[userKey] = orders[userKey] || [];
  orders[userKey].push(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  localStorage.setItem(CART_KEY, JSON.stringify([]));
  showConfirmation(order);
}

function showConfirmation(order) {
  document.getElementById('checkoutView').hidden = true;
  document.getElementById('confirmationView').hidden = false;
  document.getElementById('confirmationDetails').innerHTML = `
    <div class="confirm-card"><span>Order ID</span><strong>${order.id}</strong></div>
    <div class="confirm-card"><span>Customer</span><strong>${escapeHtml(order.customer.name)}</strong></div>
    <div class="confirm-card"><span>Total</span><strong>₹${formatINR(order.totals.grand)}</strong></div>
    <div class="confirm-card"><span>Payment</span><strong>${order.paymentMethod}</strong></div>
    <div class="confirm-card wide"><span>Delivery address</span><strong>${escapeHtml(order.address.fullName)}</strong><p>${escapeHtml(order.address.houseNumber)}, ${escapeHtml(order.address.area)}, ${escapeHtml(order.address.city)}, ${escapeHtml(order.address.state)} ${escapeHtml(order.address.pincode)}</p></div>
    <div class="confirm-card"><span>Estimated delivery</span><strong>${order.estimatedDelivery}</strong></div>
    <div class="confirm-card wide"><span>Ordered items</span>${order.items.map(item => `<p>${escapeHtml(item.title)} x ${item.quantity}</p>`).join('')}</div>
  `;
}

function calculateTotals() {
  const items = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = items >= 499 ? 0 : 40;
  const tax = Math.round(items * 0.18);
  const promotion = items >= 999 ? Math.round(items * 0.03) : 0;
  return { items, delivery, tax, promotion, grand: items + delivery + tax - promotion };
}

function updateProgress() {
  const hasAddress = Boolean(selectedAddressId);
  document.querySelector('[data-step-label="address"]').classList.toggle('done', hasAddress);
  document.querySelector('[data-step-label="payment"]').classList.toggle('active', hasAddress);
  document.querySelector('[data-step-label="review"]').classList.toggle('active', hasAddress && selectedPaymentId);
}

function showGate(message, href, label) {
  const gate = document.getElementById('gateMessage');
  gate.hidden = false;
  gate.innerHTML = `<h2>${message}</h2><a href="${href}" class="primary-action">${label}</a>`;
}

function getUserAddresses() {
  const saved = readJson(ADDRESSES_KEY, {});
  return saved[getUserKey()] || [];
}

function saveUserAddresses() {
  const saved = readJson(ADDRESSES_KEY, {});
  saved[getUserKey()] = addresses;
  localStorage.setItem(ADDRESSES_KEY, JSON.stringify(saved));
}

function getUserKey() {
  return (session.user.email || session.user.name || 'guest').toLowerCase();
}

function getEstimatedDeliveryDate() {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  return date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
}

function generateOrderId() {
  return `AMZ-IN-${Date.now().toString().slice(-8)}-${Math.floor(1000 + Math.random() * 9000)}`;
}

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[char]));
}
