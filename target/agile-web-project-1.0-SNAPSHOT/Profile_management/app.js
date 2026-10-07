
function navigateTo(moduleName) {
    document.querySelectorAll('.module-container').forEach(el => {
        el.style.display = 'none';
    });
    const targetModule = document.getElementById('module-' + moduleName);
    if (targetModule) {
        targetModule.style.display = 'block';
    }
    
    const globalHeader = document.getElementById('global-amazon-header');
    if (globalHeader) {
        if (moduleName === 'Business_Account' || moduleName === 'Amazon_Pay') {
            globalHeader.style.display = 'none';
        } else {
            globalHeader.style.display = 'block';
        }
    }

    if (moduleName === 'Your_Addresses') {
        renderYourAddresses();
    }
    if (moduleName === 'Your_Orders') {
        renderYourOrders();
    }
    if (moduleName === 'Contact_Us') {
        const form = document.getElementById('contactUsForm');
        const msg = document.getElementById('contactSuccessMsg');
        if (form && msg) {
            form.reset();
            form.style.display = 'block';
            msg.style.display = 'none';
        }
    }
    if (moduleName === 'Prime_Membership') {
        renderPrimeMembership();
    }
    window.scrollTo(0,0);
}

function escapeHtml(value) {
    if (!value) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function formatINR(amount) {
    if(amount === undefined || amount === null) return '₹0.00';
    return '₹' + parseFloat(amount).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

function getEstimatedDeliveryDate(daysToAdd) {
    const date = new Date();
    date.setDate(date.getDate() + daysToAdd);
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-IN', options);
}

function renderPrimeMembership() {
    const el = document.getElementById('primeNextBillingDate');
    if (el) {
        el.innerText = getEstimatedDeliveryDate(365);
    }
}

// ------------------------------------
// Your Addresses Logic
// ------------------------------------
function readJson(key, fallback) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (e) {
        return fallback;
    }
}

function getUserKey() {
    const session = readJson('amazon_session', null);
    return session ? session.email : 'guest';
}

function getUserAddresses() {
    const key = getUserKey();
    const allAddresses = readJson('amazon_addresses', {});
    return allAddresses[key] || [];
}

function saveUserAddresses(addresses) {
    const key = getUserKey();
    const allAddresses = readJson('amazon_addresses', {});
    allAddresses[key] = addresses;
    localStorage.setItem('amazon_addresses', JSON.stringify(allAddresses));
}

function renderYourAddresses() {
    const container = document.getElementById('yourAddressesList');
    if (!container) return;

    const addresses = getUserAddresses();
    let html = '';

    addresses.forEach((addr, idx) => {
        const isDefault = (idx === 0);
        html += `
            <div class="address-card" style="border: 1px solid #ddd; border-radius: 8px; padding: 20px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); position: relative; background: #fff;">
                ${isDefault ? '<div style="font-size: 13px; color: #565959; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 10px;">Default: <img src="https://m.media-amazon.com/images/G/31/x-locale/common/amazon-logo-tiny._CB485933722_.gif" alt="Amazon"></div>' : ''}
                <div style="font-weight: 700; font-size: 16px; margin-bottom: 5px;">${escapeHtml(addr.fullName)}</div>
                <div style="font-size: 14px; color: #111; line-height: 1.4; margin-bottom: 15px;">
                    ${escapeHtml(addr.flat)}, ${escapeHtml(addr.area)}<br>
                    ${escapeHtml(addr.landmark)}<br>
                    ${escapeHtml(addr.city)}, ${escapeHtml(addr.state)} ${escapeHtml(addr.pincode)}<br>
                    India<br>
                    Phone number: ${escapeHtml(addr.phone)}
                </div>
                <div style="font-size: 14px; display: flex; gap: 15px;">
                    <a href="#" onclick="openAddressForm('${addr.id}'); return false;" style="color: #007185; text-decoration: none;">Edit</a>
                    <a href="#" onclick="deleteAddress('${addr.id}'); return false;" style="color: #007185; text-decoration: none;">Remove</a>
                    ${!isDefault ? `<a href="#" onclick="setDefaultAddress('${addr.id}'); return false;" style="color: #007185; text-decoration: none;">Set as Default</a>` : ''}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function openAddressForm(addressId = null) {
    const form = document.getElementById('addressForm');
    if (!form) return;
    form.reset();
    document.getElementById('addressFormId').value = addressId || '';
    
    if (addressId) {
        document.getElementById('addressFormTitle').innerText = 'Edit your address';
        const addresses = getUserAddresses();
        const addr = addresses.find(a => a.id === addressId);
        if (addr) {
            document.getElementById('fullName').value = addr.fullName;
            document.getElementById('mobileNumber').value = addr.phone;
            document.getElementById('pincode').value = addr.pincode;
            document.getElementById('flatHouse').value = addr.flat;
            document.getElementById('areaStreet').value = addr.area;
            document.getElementById('landmark').value = addr.landmark;
            document.getElementById('townCity').value = addr.city;
            document.getElementById('state').value = addr.state;
        }
    } else {
        document.getElementById('addressFormTitle').innerText = 'Add a new address';
    }
    
    navigateTo('Address_Form');
}

function saveAddress(event) {
    event.preventDefault();
    const addressId = document.getElementById('addressFormId').value;
    
    const newAddr = {
        id: addressId || 'addr_' + Date.now(),
        fullName: document.getElementById('fullName').value,
        phone: document.getElementById('mobileNumber').value,
        pincode: document.getElementById('pincode').value,
        flat: document.getElementById('flatHouse').value,
        area: document.getElementById('areaStreet').value,
        landmark: document.getElementById('landmark').value,
        city: document.getElementById('townCity').value,
        state: document.getElementById('state').value
    };

    const addresses = getUserAddresses();
    if (addressId) {
        const idx = addresses.findIndex(a => a.id === addressId);
        if (idx !== -1) {
            addresses[idx] = newAddr;
        }
    } else {
        addresses.push(newAddr);
    }
    
    saveUserAddresses(addresses);
    navigateTo('Your_Addresses');
}

function deleteAddress(addressId) {
    if (!confirm('Are you sure you want to delete this address?')) return;
    let addresses = getUserAddresses();
    addresses = addresses.filter(a => a.id !== addressId);
    saveUserAddresses(addresses);
    renderYourAddresses();
}

function setDefaultAddress(addressId) {
    const addresses = getUserAddresses();
    const idx = addresses.findIndex(a => a.id === addressId);
    if (idx !== -1) {
        const addr = addresses.splice(idx, 1)[0];
        addresses.unshift(addr);
        saveUserAddresses(addresses);
        renderYourAddresses();
    }
}

// ------------------------------------
// Your Orders Logic
// ------------------------------------
function renderYourOrders() {
    const container = document.getElementById('yourOrdersList');
    if (!container) return;

    const session = readJson('amazon_session', null);
    const key = session ? session.email : 'guest';
    const allOrders = readJson('amazon_orders', {});
    const orders = allOrders[key] || [];

    // Filter to past 3 orders, newest first
    orders.sort((a, b) => new Date(b.date) - new Date(a.date));
    const recentOrders = orders.slice(0, 3);

    if (recentOrders.length === 0) {
        container.innerHTML = '<div style="padding: 20px; font-size: 16px;">You have no recent orders.</div>';
        return;
    }

    let html = '';
    recentOrders.forEach(order => {
        let itemsHtml = '';
        order.items.forEach(item => {
            itemsHtml += `
                <div style="display: flex; gap: 20px; margin-top: 15px; border-top: 1px solid #ddd; padding-top: 15px;">
                    <div style="width: 90px; height: 90px; background: #f7f7f7; display: flex; align-items: center; justify-content: center; border-radius: 4px;">
                        <img src="https://m.media-amazon.com/images/I/41OvwuB8X2L._AC_SY200_.jpg" alt="Item" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                    </div>
                    <div>
                        <a href="#" style="color: #007185; text-decoration: none; font-size: 14px; font-weight: 700; display: block; margin-bottom: 5px;">${escapeHtml(item.title)}</a>
                        <div style="font-size: 12px; color: #565959;">Qty: ${item.qty}</div>
                        <div style="margin-top: 10px;">
                            <button style="background: #ffd814; border: 1px solid #fcd200; border-radius: 20px; padding: 5px 15px; font-size: 13px; cursor: pointer; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">Buy it again</button>
                        </div>
                    </div>
                </div>
            `;
        });

        html += `
            <div style="border: 1px solid #ddd; border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
                <div style="background: #f0f2f2; padding: 14px 18px; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; font-size: 13px; color: #565959;">
                    <div style="display: flex; gap: 40px;">
                        <div>
                            <div>ORDER PLACED</div>
                            <div style="color: #111;">${new Date(order.date).toLocaleDateString('en-IN', {day:'numeric', month:'short', year:'numeric'})}</div>
                        </div>
                        <div>
                            <div>TOTAL</div>
                            <div style="color: #111;">${formatINR(order.total)}</div>
                        </div>
                        <div>
                            <div>SHIP TO</div>
                            <div style="color: #007185; cursor: pointer;">${escapeHtml(order.shipping.fullName)} ▼</div>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div>ORDER # ${escapeHtml(order.id)}</div>
                        <div><a href="#" style="color: #007185; text-decoration: none;">View order details</a> | <a href="#" style="color: #007185; text-decoration: none;">Invoice</a></div>
                    </div>
                </div>
                <div style="padding: 20px;">
                    <h3 style="margin: 0 0 5px 0; font-size: 18px; color: #111;">Delivering ${getEstimatedDeliveryDate(3)}</h3>
                    <div style="font-size: 14px; color: #565959;">Your package will be delivered soon.</div>
                    ${itemsHtml}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}
