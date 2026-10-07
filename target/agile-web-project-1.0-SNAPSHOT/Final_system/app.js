// ========================================== 
// MODULE: Auth_and_login 
// ========================================== 
// Initialize Mock DB if not exists
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([]));
}

// Check if user is already logged in on load
document.addEventListener('DOMContentLoaded', () => {
    checkSession();
});

// SPA Routing for Combined Modules
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
          if (moduleName === 'Checkout_Payment' || moduleName === 'Auth_and_login' || moduleName === 'Business_Account' || moduleName === 'Amazon_Pay') {
              globalHeader.style.display = 'none';
          } else {
              globalHeader.style.display = 'block';
          }
      }

    
    if (moduleName === 'Checkout_Payment' && typeof initCheckout === 'function') {
        initCheckout();
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

function toggleAuthMode(mode) {
    document.getElementById('auth-error-box').classList.remove('active');
    if (mode === 'login') {
        document.getElementById('login-container').style.display = 'block';
        document.getElementById('register-container').style.display = 'none';
    } else {
        document.getElementById('login-container').style.display = 'none';
        document.getElementById('register-container').style.display = 'block';
    }
}

function showError(msg) {
    const errorBox = document.getElementById('auth-error-box');
    const errorMsg = document.getElementById('auth-error-msg');
    errorMsg.innerText = msg;
    errorBox.classList.add('active');
}

// Handle Registration
document.getElementById('register-form').addEventListener('submit', function(e) {
    e.preventDefault();
    document.getElementById('auth-error-box').classList.remove('active');
    
    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const password = document.getElementById('reg-password').value;
    
    if (!name || !email || !password) {
        showError("All fields are required.");
        return;
    }
    if (password.length < 6) {
        showError("Minimum 6 characters required");
        return;
    }

    let users = JSON.parse(localStorage.getItem('users'));
    if (users.find(u => u.email === email)) {
        showError("Email already registered.");
        return;
    }

    const newUser = { name, email, password };
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    createSession(newUser);
});

// Handle Login
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    document.getElementById('auth-error-box').classList.remove('active');

    const email = document.getElementById('login-email').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;

    let users = JSON.parse(localStorage.getItem('users'));
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        showError("We cannot find an account with that email address or the password was incorrect.");
        return;
    }

    createSession(user);
});

// Session Management
function createSession(user) {
    const sessionObj = {
        isLoggedIn: true,
        loginTime: new Date().toISOString(),
        user: {
            name: user.name,
            email: user.email
        }
    };

    localStorage.setItem('session', JSON.stringify(sessionObj));
    
    document.getElementById('login-form').reset();
    document.getElementById('register-form').reset();
    const redirect = sessionStorage.getItem("redirectAfterLogin");
    if (redirect) {
        sessionStorage.removeItem("redirectAfterLogin");
        navigateTo(redirect);
    } else {
        navigateTo('Search_and_Cart');
    }
}

function checkSession() {
    const sessionData = localStorage.getItem('session');
    if (sessionData) {
        const session = JSON.parse(sessionData);
        if (session.isLoggedIn) {
            navigateTo('Search_and_Cart');
            return;
        }
    }
    showAuth();
}

function logout() {
    localStorage.removeItem('session');
    showAuth();
}

// UI Views
function showDashboard() {
    document.getElementById('auth-view').classList.remove('active');
    document.getElementById('dashboard-view').classList.add('active');
    
    const session = JSON.parse(localStorage.getItem('session'));
    document.getElementById('welcome-msg').innerText = `Welcome, ${session.user.name}!`;
}

function showAuth() {
    document.getElementById('dashboard-view').classList.remove('active');
    document.getElementById('auth-view').classList.add('active');
    toggleAuthMode('login');
    navigateTo('Auth_and_login');
}


// ========================================== 
// MODULE: Search_and_Cart 
// ========================================== 
/**
 * Amazon India Web App - Module 2 (Search, Catalog & Add-to-Cart Engine)
 * Features 100% unique, non-repeating products with exact image-title matches,
 * pixel-perfect Amazon.in UI, cart drawer, and Module 3 handover.
 */

// Curated 100% Unique, Non-Repeating Product Catalog with Verified Image-Title Matches
const PRODUCTS_DATA = [
  // ==================== ELECTRONICS & MOBILES ====================
  {
    id: "amz-elec-01",
    title: "Apple iPhone 15 Pro (128 GB) - Natural Titanium",
    category: "Electronics",
    price: 127990,
    originalPrice: 134900,
    discount: "5% off",
    rating: 4.7,
    reviewsCount: 18420,
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=80",
    badge: "Best Seller",
    isPrime: true,
    specs: ["A17 Pro chip with 6-core GPU", "Forged in titanium with 6.1-inch Super Retina XDR display", "48MP Main camera with multiple focal lengths", "Customizable Action button"]
  },
  {
    id: "amz-elec-02",
    title: "Samsung Galaxy S24 Ultra 5G (256 GB, Titanium Gray)",
    category: "Electronics",
    price: 129999,
    originalPrice: 139999,
    discount: "7% off",
    rating: 4.6,
    reviewsCount: 12910,
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&auto=format&fit=crop&q=80",
    badge: "Amazon Choice",
    isPrime: true,
    specs: ["Galaxy AI featuring Circle to Search & Live Translate", "200MP camera with Quad Tele System", "Built-in S Pen & Snapdragon 8 Gen 3 for Galaxy", "6.8-inch QHD+ Dynamic AMOLED 2X"]
  },
  {
    id: "amz-elec-03",
    title: "OnePlus 12 (Silky Black, 16GB RAM, 512GB Storage)",
    category: "Electronics",
    price: 69999,
    originalPrice: 74999,
    discount: "7% off",
    rating: 4.5,
    reviewsCount: 9450,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=500&auto=format&fit=crop&q=80",
    badge: "Deal of the Day",
    isPrime: true,
    specs: ["Snapdragon 8 Gen 3 Mobile Platform", "4th Gen Hasselblad Camera System for Mobile", "5400 mAh Battery with 100W SUPERVOOC Charging", "2K 120 Hz ProXDR Display"]
  },
  {
    id: "amz-elec-04",
    title: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
    category: "Electronics",
    price: 29990,
    originalPrice: 34990,
    discount: "14% off",
    rating: 4.8,
    reviewsCount: 24100,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
    badge: "Best Seller",
    isPrime: true,
    specs: ["Two processors control 8 microphones for noise cancellation", "Auto NC Optimizer automatically adjusts noise canceling", "Up to 30-hour battery life with quick charging", "Ultra-comfortable lightweight design with soft leather"]
  },
  {
    id: "amz-elec-05",
    title: "Apple MacBook Air 15-inch M3 Chip (16GB RAM, 512GB SSD) - Space Grey",
    category: "Electronics",
    price: 144900,
    originalPrice: 154900,
    discount: "6% off",
    rating: 4.9,
    reviewsCount: 5210,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&auto=format&fit=crop&q=80",
    badge: "Top Rated",
    isPrime: true,
    specs: ["M3 chip with 8-core CPU and 10-core GPU", "15.3-inch Liquid Retina display with 500 nits brightness", "Up to 18 hours of battery life", "MagSafe charging port & Silent fanless design"]
  },
  {
    id: "amz-elec-06",
    title: "HP Spectre x360 14-inch Intel Core Ultra 7 2-in-1 Laptop",
    category: "Electronics",
    price: 154990,
    originalPrice: 169990,
    discount: "9% off",
    rating: 4.6,
    reviewsCount: 1890,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop&q=80",
    badge: "",
    isPrime: true,
    specs: ["Intel Core Ultra 7 155H processor with AI Boost NPU", "2.8K OLED Touchscreen display 120Hz", "32GB LPDDR5x RAM & 1TB PCIe Gen4 SSD", "Poly Studio Audio with Quad Speakers"]
  },
  {
    id: "amz-elec-07",
    title: "Bose QuietComfort 45 Bluetooth Wireless Headphones",
    category: "Electronics",
    price: 26900,
    originalPrice: 29900,
    discount: "10% off",
    rating: 4.7,
    reviewsCount: 11400,
    image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500&auto=format&fit=crop&q=80",
    badge: "Amazon Choice",
    isPrime: true,
    specs: ["Iconic quietness, comfort, and sound", "Quiet and Aware Modes for total environment awareness", "High-fidelity audio with TriPort acoustic architecture", "24-hour battery life on a single charge"]
  },
  {
    id: "amz-elec-08",
    title: "Samsung Galaxy Watch 6 LTE (44mm, Graphite)",
    category: "Electronics",
    price: 26999,
    originalPrice: 36999,
    discount: "27% off",
    rating: 4.4,
    reviewsCount: 7890,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80",
    badge: "Deal of the Day",
    isPrime: true,
    specs: ["20% larger display with thinner bezel", "Advanced Sleep Coaching & ECG monitoring", "BioActive Sensor for Body Composition analysis", "Sapphire Crystal glass durability"]
  },
  {
    id: "amz-elec-09",
    title: "Canon EOS R6 Mark II 24.2MP Mirrorless Camera (Body Only)",
    category: "Electronics",
    price: 215995,
    originalPrice: 243995,
    discount: "11% off",
    rating: 4.8,
    reviewsCount: 1420,
    image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&auto=format&fit=crop&q=80",
    badge: "Top Rated",
    isPrime: true,
    specs: ["24.2 MP Full-Frame CMOS Sensor", "Up to 40 fps continuous shooting with electronic shutter", "In-Body Image Stabilizer up to 8 stops", "Uncropped 4K 60p video oversampled from 6K"]
  },
  {
    id: "amz-elec-10",
    title: "Logitech MX Master 3S Performance Wireless Mouse",
    category: "Electronics",
    price: 8995,
    originalPrice: 10995,
    discount: "18% off",
    rating: 4.7,
    reviewsCount: 31500,
    image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&auto=format&fit=crop&q=80",
    badge: "Best Seller",
    isPrime: true,
    specs: ["8K DPI any-surface tracking with quiet clicks", "MagSpeed Electromagnetic Scrolling wheel", "Ergonomic silhouette with thumb control", "Multi-device Flow cross-computer control"]
  },
  {
    id: "amz-elec-11",
    title: "Keychron K2 Wireless Mechanical Keyboard RGB Backlit",
    category: "Electronics",
    price: 7499,
    originalPrice: 8999,
    discount: "17% off",
    rating: 4.6,
    reviewsCount: 6410,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=80",
    badge: "",
    isPrime: true,
    specs: ["75% layout 84 keys wireless mechanical keyboard", "Connects up to 3 devices via Bluetooth 5.1", "Mac & Windows layout support with extra keycaps", "Gateron G Pro mechanical switches"]
  },
  {
    id: "amz-elec-12",
    title: "JBL Flip 6 Portable Waterproof Bluetooth Speaker - Black",
    category: "Electronics",
    price: 9999,
    originalPrice: 13999,
    discount: "28% off",
    rating: 4.6,
    reviewsCount: 42100,
    image: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=500&auto=format&fit=crop&q=80",
    badge: "Best Seller",
    isPrime: true,
    specs: ["2-way speaker system for louder, crystal clear sound", "IP67 waterproof and dustproof design", "12 hours of playtime on a single charge", "PartyBoost pair two speakers for stereo sound"]
  },

  // ==================== FASHION & APPAREL ====================
  {
    id: "amz-fash-01",
    title: "Nike Air Force 1 '07 Men's All-White Sneakers",
    category: "Fashion",
    price: 7495,
    originalPrice: 8995,
    discount: "16% off",
    rating: 4.7,
    reviewsCount: 16800,
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&auto=format&fit=crop&q=80",
    badge: "Best Seller",
    isPrime: true,
    specs: ["Real and synthetic leather upper for crisp style", "Nike Air cushioning originally designed for performance hoops", "Low-cut padded collar looks sleek and feels comfortable", "Non-marking rubber outsole with pivot circles"]
  },
  {
    id: "amz-fash-02",
    title: "Adidas Ultraboost Light Men's Running Shoes - Core Black",
    category: "Fashion",
    price: 11999,
    originalPrice: 18999,
    discount: "36% off",
    rating: 4.6,
    reviewsCount: 8420,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80",
    badge: "Deal of the Day",
    isPrime: true,
    specs: ["Light BOOST material for ultimate energy return", "Primeknit+ textile upper conforms to your foot", "Continentalâ„¢ Rubber outsole for superior grip", "Linear Energy Push system for responsive stride"]
  },
  {
    id: "amz-fash-03",
    title: "Levi's Men's 501 Original Fit Denim Jeans - Dark Wash Blue",
    category: "Fashion",
    price: 2499,
    originalPrice: 3999,
    discount: "37% off",
    rating: 4.5,
    reviewsCount: 22100,
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500&auto=format&fit=crop&q=80",
    badge: "Amazon Choice",
    isPrime: true,
    specs: ["100% Heavyweight Cotton Denim", "Signature button fly & 5-pocket design", "Regular fit through thigh with straight leg opening", "Red Tab iconic detail on back pocket"]
  },
  {
    id: "amz-fash-04",
    title: "Casio G-Shock GA-2100 'CasiOak' Black Analog-Digital Watch",
    category: "Fashion",
    price: 7995,
    originalPrice: 9995,
    discount: "20% off",
    rating: 4.8,
    reviewsCount: 14500,
    image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&auto=format&fit=crop&q=80",
    badge: "Best Seller",
    isPrime: true,
    specs: ["Carbon Core Guard structure for extreme shock resistance", "Octagonal bezel minimalist sleek profile", "200-meter water resistance & Double LED light", "World time 31 time zones & 5 daily alarms"]
  },
  {
    id: "amz-fash-05",
    title: "Ray-Ban Classic Wayfarer Polarized Sunglasses (Black Frame)",
    category: "Fashion",
    price: 8490,
    originalPrice: 10490,
    discount: "19% off",
    rating: 4.7,
    reviewsCount: 9810,
    image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&auto=format&fit=crop&q=80",
    badge: "Top Rated",
    isPrime: true,
    specs: ["100% UV Protection G-15 Green Polarized Glass Lenses", "Durable Acetate Frame handcrafted in Italy", "Eliminates glare and increases visual clarity", "Includes Ray-Ban protective case & microfiber cleaning cloth"]
  },
  {
    id: "amz-fash-06",
    title: "Fossil Minimalist Stainless Steel Quartz Watch with Brown Leather Strap",
    category: "Fashion",
    price: 6495,
    originalPrice: 9995,
    discount: "35% off",
    rating: 4.5,
    reviewsCount: 6710,
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500&auto=format&fit=crop&q=80",
    badge: "",
    isPrime: true,
    specs: ["Slim 44mm round stainless steel case", "Genuine brown leather band with buckle closure", "Water resistant up to 50m (165 ft)", "Sleek sunray dial with Roman numeral indices"]
  },
  {
    id: "amz-fash-07",
    title: "Tommy Hilfiger Men's Custom Fit Cotton Polo Shirt",
    category: "Fashion",
    price: 2799,
    originalPrice: 4499,
    discount: "37% off",
    rating: 4.4,
    reviewsCount: 5120,
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500&auto=format&fit=crop&q=80",
    badge: "",
    isPrime: true,
    specs: ["100% Premium Breathable Cotton Pique", "Two-button placket & ribbed collar", "Iconic Tommy Hilfiger flag embroidery on chest", "Machine washable durable color retention"]
  },

  // ==================== HOME & KITCHEN ====================
  {
    id: "amz-home-01",
    title: "Philips HD9252/90 Touch Digital Air Fryer 4.1L (1400W)",
    category: "Home & Kitchen",
    price: 6999,
    originalPrice: 10995,
    discount: "36% off",
    rating: 4.6,
    reviewsCount: 29800,
    image: "https://images.unsplash.com/photo-1585515320310-259814833e62?w=500&auto=format&fit=crop&q=80",
    badge: "Best Seller",
    isPrime: true,
    specs: ["Rapid Air Technology for 90% less fat cooking", "7 Preset touch screen programs for baking, grilling, frying", "Keep Warm function & NutriU Recipe App integration", "Dishwasher safe non-stick removable basket"]
  },
  {
    id: "amz-home-02",
    title: "Instant Pot Duo 7-in-1 Electric Pressure Cooker (5.7 Litre)",
    category: "Home & Kitchen",
    price: 8490,
    originalPrice: 12990,
    discount: "34% off",
    rating: 4.7,
    reviewsCount: 48900,
    image: "https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?w=500&auto=format&fit=crop&q=80",
    badge: "Amazon Choice",
    isPrime: true,
    specs: ["7-in-1: Pressure Cooker, Slow Cooker, Rice Cooker, Yogurt Maker, Steamer", "13 Smart Touch Programs for foolproof meals", "Food-grade 304 stainless steel inner pot", "10+ built-in safety features including overheat protection"]
  },
  {
    id: "amz-home-03",
    title: "De'Longhi Dedica EC685 Manual Espresso & Cappuccino Coffee Machine",
    category: "Home & Kitchen",
    price: 19990,
    originalPrice: 24990,
    discount: "20% off",
    rating: 4.6,
    reviewsCount: 7410,
    image: "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&auto=format&fit=crop&q=80",
    badge: "Deal of the Day",
    isPrime: true,
    specs: ["15-bar professional pressure pump", "Thermoblock heating system heats up in 35 seconds", "Adjustable Cappuccino System for rich velvety foam", "Compact 15cm ultra-slim stainless steel design"]
  },
  {
    id: "amz-home-04",
    title: "Dyson V15 Detect Cordless Vacuum Cleaner with Laser Illumination",
    category: "Home & Kitchen",
    price: 62900,
    originalPrice: 69900,
    discount: "10% off",
    rating: 4.8,
    reviewsCount: 3910,
    image: "https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?w=500&auto=format&fit=crop&q=80",
    badge: "Top Rated",
    isPrime: true,
    specs: ["Laser reveals microscopic dust on hard floors", "Piezo sensor counts and measures dust particles", "Dyson Hyperdymium motor spins up to 125,000rpm", "Up to 60 minutes run time with swappable battery"]
  },
  {
    id: "amz-home-05",
    title: "Milton Thermosteel Flip Lid Vacuum Insulated Flask (1000ml)",
    category: "Home & Kitchen",
    price: 999,
    originalPrice: 1399,
    discount: "28% off",
    rating: 4.5,
    reviewsCount: 64200,
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=80",
    badge: "Best Seller",
    isPrime: true,
    specs: ["Double-walled vacuum insulation keeps drinks hot/cold for 24 hours", "100% Rust-proof 304 food-grade stainless steel", "Flip lid with jacket for easy pouring and protection", "BPA free & leak-proof seal"]
  },

  // ==================== BOOKS ====================
  {
    id: "amz-book-01",
    title: "Atomic Habits: An Easy & Proven Way to Build Good Habits by James Clear",
    category: "Books",
    price: 499,
    originalPrice: 799,
    discount: "38% off",
    rating: 4.8,
    reviewsCount: 114200,
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80",
    badge: "#1 Best Seller",
    isPrime: true,
    specs: ["Hardcover Edition | 320 Pages", "Publisher: Random House Business Books", "Over 15 million copies sold globally", "Practical strategies to form good habits & break bad ones"]
  },
  {
    id: "amz-book-02",
    title: "The Psychology of Money: Timeless Lessons on Wealth by Morgan Housel",
    category: "Books",
    price: 275,
    originalPrice: 499,
    discount: "45% off",
    rating: 4.7,
    reviewsCount: 89400,
    image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=500&auto=format&fit=crop&q=80",
    badge: "Best Seller",
    isPrime: true,
    specs: ["Paperback Edition | 252 Pages", "Publisher: Jaico Publishing House", "19 short stories exploring strange ways people think about money", "Essential read for financial freedom & investing mindset"]
  },
  {
    id: "amz-book-03",
    title: "Rich Dad Poor Dad: What the Rich Teach Their Kids About Money by Robert Kiyosaki",
    category: "Books",
    price: 320,
    originalPrice: 599,
    discount: "46% off",
    rating: 4.6,
    reviewsCount: 96100,
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=80",
    badge: "Amazon Choice",
    isPrime: true,
    specs: ["25th Anniversary Edition | 336 Pages", "Explodes the myth that you need to earn a high income to become rich", "Teaches why financial literacy is crucial for long-term independence", "Personal finance #1 benchmark classic"]
  },
  {
    id: "amz-book-04",
    title: "Deep Work: Rules for Focused Success in a Distracted World by Cal Newport",
    category: "Books",
    price: 350,
    originalPrice: 699,
    discount: "50% off",
    rating: 4.6,
    reviewsCount: 34100,
    image: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=80",
    badge: "Top Rated",
    isPrime: true,
    specs: ["Paperback Edition | 304 Pages", "Publisher: Grand Central Publishing", "Provides 4 rigorous rules for transforming your mind and habits", "Wall Street Journal Bestseller on productivity"]
  },
  {
    id: "amz-book-05",
    title: "Sapiens: A Brief History of Humankind by Yuval Noah Harari",
    category: "Books",
    price: 450,
    originalPrice: 899,
    discount: "50% off",
    rating: 4.7,
    reviewsCount: 67800,
    image: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500&auto=format&fit=crop&q=80",
    badge: "",
    isPrime: true,
    specs: ["Paperback Edition | 512 Pages", "International Sunday Times & New York Times Bestseller", "Explores how Homo Sapiens came to dominate the planet", "Recommended by Bill Gates & Barack Obama"]
  },

  // ==================== GAMING CONSOLES ====================
  {
    id: "amz-game-01",
    title: "PlayStation 5 Console (Slim Edition, Disc Version)",
    category: "Gaming",
    price: 54990,
    originalPrice: 54990,
    discount: "",
    rating: 4.8,
    reviewsCount: 14200,
    image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=500&auto=format&fit=crop&q=80",
    badge: "Best Seller",
    isPrime: true,
    specs: ["1TB Ultra-High Speed Custom SSD for lightning load times", "DualSense Wireless Controller with Haptic Feedback & Adaptive Triggers", "4K-TV Gaming up to 120fps with 120Hz output", "Ray Tracing technology for realistic shadows & reflections"]
  },
  {
    id: "amz-game-02",
    title: "Xbox Series X 1TB Gaming Console - Black",
    category: "Gaming",
    price: 49990,
    originalPrice: 55990,
    discount: "11% off",
    rating: 4.7,
    reviewsCount: 8910,
    image: "https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=500&auto=format&fit=crop&q=80",
    badge: "Amazon Choice",
    isPrime: true,
    specs: ["12 Teraflops of raw graphic processing power", "Xbox Velocity Architecture powered by custom 1TB NVMe SSD", "Quick Resume seamlessly switch between multiple games", "4K gaming at up to 120 FPS & Dolby Vision support"]
  },
  {
    id: "amz-game-03",
    title: "Nintendo Switch OLED Model with Neon Blue & Neon Red Joy-Con",
    category: "Gaming",
    price: 31990,
    originalPrice: 37990,
    discount: "16% off",
    rating: 4.8,
    reviewsCount: 19400,
    image: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=500&auto=format&fit=crop&q=80",
    badge: "Deal of the Day",
    isPrime: true,
    specs: ["Vibrant 7-inch OLED screen with vivid colors", "Wide adjustable stand for comfortable tabletop mode", "64GB internal storage & wired LAN dock port", "3 Play Modes: TV, Tabletop, and Handheld"]
  },
  {
    id: "amz-game-04",
    title: "Sony PlayStation DualSense Wireless Controller - Midnight Black",
    category: "Gaming",
    price: 5990,
    originalPrice: 6390,
    discount: "6% off",
    rating: 4.7,
    reviewsCount: 21400,
    image: "https://images.unsplash.com/photo-1592840496694-26d035b52b48?w=500&auto=format&fit=crop&q=80",
    badge: "Best Seller",
    isPrime: true,
    specs: ["Haptic feedback replaces traditional rumble motors", "Dynamic adaptive triggers with variable tension levels", "Built-in microphone & 3.5mm headset jack", "Create button to capture and broadcast gaming moments"]
  },
  {
    id: "amz-game-05",
    title: "Meta Quest 3 128GB - Breakthrough Mixed Reality VR Headset",
    category: "Gaming",
    price: 46990,
    originalPrice: 52990,
    discount: "11% off",
    rating: 4.7,
    reviewsCount: 4120,
    image: "https://images.unsplash.com/photo-1622979135225-d2ba269bc1bd?w=500&auto=format&fit=crop&q=80",
    badge: "Top Rated",
    isPrime: true,
    specs: ["Full-color Passthrough blends virtual elements into physical space", "Snapdragon XR2 Gen 2 processor doubles graphic processing power", "4K+ Infinite Display resolution (2064x2208 per eye)", "Touch Plus controllers with TruTouch haptics"]
  }
];

// State
let cartState = JSON.parse(localStorage.getItem('amazon_in_cart')) || [];
let activeCategory = 'All';
let searchQuery = '';
let priceMin = 0;
let priceMax = 250000;
let minRatingFilter = 0;
let currentSort = 'featured';

// Helper: Format INR
function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0
  }).format(amount);
}

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  renderUserModule1Status();
  renderProducts();
  updateCartUI();
  setupEventListeners();
});

// Render User Status from Module 1
function renderUserModule1Status() {
    const userSession = getActiveUserSession();

    const userNavLine1 = document.getElementById("userNavLine1");
    const menu = document.getElementById("accountMenu");
    const trigger = document.getElementById("accountTrigger");
    const dropdown = menu.querySelector(".account-dropdown");

    if (userSession) {
        // Logged in
        userNavLine1.textContent = `Hello, ${userSession.user?.name || userSession.name}`;
    } else {
        // Not logged in
        userNavLine1.textContent = "Hello, Sign in";
    }

    // Always clear inline "none" to let CSS hover work
    dropdown.style.display = "";

    // Toggle dropdown visibility on click instead of navigating
    trigger.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (dropdown.style.display === "block") {
            dropdown.style.display = "";
        } else {
            dropdown.style.display = "block";
        }
    };

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
        if (!menu.contains(e.target)) {
            dropdown.style.display = "";
        }
    });
}

function getActiveUserSession() {
  const moduleSession = JSON.parse(localStorage.getItem('session') || 'null');
  if (moduleSession && moduleSession.isLoggedIn) return moduleSession;
  return JSON.parse(localStorage.getItem('amazon_user_session') || 'null');
}

// Set Active Category
function setActiveCategory(cat) {
  activeCategory = cat;
  
  const subnavLinks = document.querySelectorAll('.subnav-link');
  subnavLinks.forEach(link => {
    if (link.getAttribute('data-category') === cat) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  const categorySelect = document.getElementById('searchCategorySelect');
  if (categorySelect && (cat === 'All' || cat === 'Electronics' || cat === 'Fashion' || cat === 'Home & Kitchen' || cat === 'Books' || cat === 'Gaming')) {
    categorySelect.value = cat;
  }

  const radioInputs = document.querySelectorAll('input[name="categoryFilter"]');
  radioInputs.forEach(radio => {
    radio.checked = (radio.value === cat);
  });

  const titleElem = document.getElementById('categoryHeaderTitle');
  const breadcrumbElem = document.getElementById('categoryBreadcrumbName');
  if (titleElem && breadcrumbElem) {
    titleElem.textContent = cat === 'All' ? 'All Verified Products' : cat;
    breadcrumbElem.textContent = cat;
  }

  renderProducts();
}

// Filter Products
function getFilteredProducts() {
  const primeOnly = document.getElementById('primeOnlyToggle')?.checked;

  return PRODUCTS_DATA.filter(product => {
    let matchCategory = true;
    if (activeCategory === 'Deals') {
      matchCategory = product.badge !== '';
    } else if (activeCategory === 'Prime') {
      matchCategory = product.isPrime;
    } else if (activeCategory !== 'All') {
      matchCategory = product.category.toLowerCase() === activeCategory.toLowerCase();
    }

    const query = searchQuery.trim().toLowerCase();
    const matchQuery = !query || 
      product.title.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      (product.badge && product.badge.toLowerCase().includes(query));

    const matchPrice = product.price >= priceMin && product.price <= priceMax;
    const matchRating = product.rating >= minRatingFilter;
    const matchPrime = !primeOnly || product.isPrime;

    return matchCategory && matchQuery && matchPrice && matchRating && matchPrime;
  }).sort((a, b) => {
    if (currentSort === 'price-low') return a.price - b.price;
    if (currentSort === 'price-high') return b.price - a.price;
    if (currentSort === 'rating') return b.rating - a.rating;
    return 0;
  });
}

// Render Products Grid
function renderProducts() {
  const container = document.getElementById('productGridContainer');
  const countLabel = document.getElementById('resultsCountLabel');

  if (activeCategory === 'Amazon Pay') {
    container.innerHTML = `
      <div class="special-view-card">
        <div class="special-view-icon">ðŸ’³</div>
        <h2 class="special-view-title">Amazon Pay India</h2>
        <p class="special-view-desc">Fast, secure payments & instant cashback for electricity bills, mobile recharges, flights, and shopping.</p>
        <button class="hero-cta" onclick="alert('Amazon Pay Balance: â‚¹1,250.00 Available');">Check Pay Balance</button>
      </div>
    `;
    if (countLabel) countLabel.innerHTML = 'Showing <strong>Amazon Pay Gateway</strong>';
    return;
  }

  if (activeCategory === 'Customer Service') {
    container.innerHTML = `
      <div class="special-view-card">
        <div class="special-view-icon">ðŸŽ§</div>
        <h2 class="special-view-title">Amazon India Customer Support</h2>
        <p class="special-view-desc">Have a question about your orders, returns, or Module 2 shopping cart? We are here to help 24/7.</p>
        <button class="hero-cta" onclick="alert('Customer Service Hotline: 1800-3000-9009 (24x7 Support)');">Contact Support</button>
      </div>
    `;
    if (countLabel) countLabel.innerHTML = 'Showing <strong>Customer Service Hub</strong>';
    return;
  }

  const filtered = getFilteredProducts();

  if (countLabel) {
    countLabel.innerHTML = `Showing <strong>1-${filtered.length}</strong> of <strong>${filtered.length}</strong> results`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; background: white; border-radius: 4px;">
        <h3>No matching products found</h3>
        <p style="color: #666; margin-top: 8px;">Try adjusting your price filter or category search.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(product => `
    <div class="product-card">
      ${product.badge ? `<span class="card-badge ${product.badge.toLowerCase().includes('seller') ? 'best-seller' : 'deal'}">${product.badge}</span>` : ''}
      <div class="product-img-container" onclick="openProductModal('${product.id}')">
        <img src="${product.image}" alt="${product.title}" loading="lazy">
      </div>
      <div class="product-title" onclick="openProductModal('${product.id}')">${product.title}</div>
      <div class="product-rating">
        <span class="stars">${'â˜…'.repeat(Math.floor(product.rating))}${'â˜†'.repeat(5 - Math.floor(product.rating))}</span>
        <span class="rating-count">${product.rating} (${formatINR(product.reviewsCount)})</span>
      </div>
      <div class="product-price-box">
        <div class="price-row">
          <span class="currency-symbol">â‚¹</span>
          <span class="price-main">${formatINR(product.price)}</span>
          ${product.originalPrice ? `<span class="original-price">M.R.P: â‚¹${formatINR(product.originalPrice)}</span>` : ''}
        </div>
        ${product.discount ? `<div class="discount-badge">${product.discount}</div>` : ''}
      </div>
      ${product.isPrime ? `
        <div class="prime-delivery">
          <svg class="prime-badge-svg" viewBox="0 0 54 16" fill="none">
            <path d="M12.5 2h-11v12h3.5v-4.5h7.5v-3h-7.5v-1.5h7.5v-3z" fill="#00A8E1"/>
            <text x="2" y="12" fill="#00A8E1" font-weight="900" font-style="italic" font-size="12">prime</text>
          </svg>
          <span>FREE Delivery by Tomorrow</span>
        </div>
      ` : ''}
      <div class="card-actions">
        <button class="btn-add-cart" onclick="addToCart('${product.id}')">Add to Cart</button>
        <button class="btn-quick-view" onclick="openProductModal('${product.id}')">Quick View</button>
      </div>
    </div>
  `).join('');
}

// Shopping Cart Actions
function addToCart(productId, qty = 1) {
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  if (!product) return;

  const existingItem = cartState.find(item => item.id === productId);
  if (existingItem) {
    existingItem.quantity += qty;
  } else {
    cartState.push({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      quantity: qty
    });
  }

  saveCart();
  updateCartUI();
  showToast(`Added "${product.title.substring(0, 24)}..." to Cart!`);
  openCartDrawer();
}

function updateCartQuantity(productId, newQty) {
  if (newQty <= 0) {
    removeFromCart(productId);
    return;
  }
  const item = cartState.find(item => item.id === productId);
  if (item) {
    item.quantity = newQty;
    saveCart();
    updateCartUI();
  }
}

function removeFromCart(productId) {
  cartState = cartState.filter(item => item.id !== productId);
  saveCart();
  updateCartUI();
  showToast('Item removed from cart.');
}

function saveCart() {
  localStorage.setItem('amazon_in_cart', JSON.stringify(cartState));
}

function updateCartUI() {
  const totalCount = cartState.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartState.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const navCartCount = document.getElementById('navCartCount');
  if (navCartCount) navCartCount.textContent = totalCount;

  const drawerList = document.getElementById('cartDrawerItemsList');
  const drawerSubtotal = document.getElementById('drawerSubtotal');
  const drawerProgress = document.getElementById('shippingProgressBar');
  const drawerShippingText = document.getElementById('shippingBannerText');

  if (drawerList) {
    if (cartState.length === 0) {
      drawerList.innerHTML = `<div style="text-align:center; padding: 40px; color:#666;">Your Amazon Cart is empty.</div>`;
    } else {
      drawerList.innerHTML = cartState.map(item => `
        <div class="cart-item">
          <img src="${item.image}" class="cart-item-img" alt="${item.title}">
          <div class="cart-item-info">
            <div class="cart-item-title">${item.title}</div>
            <div class="cart-item-price">â‚¹${formatINR(item.price)}</div>
            <div class="cart-qty-controls">
              <button class="qty-btn" onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})">-</button>
              <span class="qty-val">${item.quantity}</span>
              <button class="qty-btn" onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})">+</button>
              <span class="cart-item-delete" onclick="removeFromCart('${item.id}')">Delete</span>
            </div>
          </div>
        </div>
      `).join('');
    }
  }

  if (drawerSubtotal) {
    drawerSubtotal.textContent = `â‚¹${formatINR(subtotal)}`;
  }

  const freeThreshold = 499;
  if (drawerProgress && drawerShippingText) {
    if (subtotal >= freeThreshold) {
      drawerProgress.style.width = '100%';
      drawerShippingText.innerHTML = `ðŸŽ‰ Your order qualifies for <strong>FREE Delivery</strong>!`;
    } else {
      const pct = Math.min(100, (subtotal / freeThreshold) * 100);
      const remaining = freeThreshold - subtotal;
      drawerProgress.style.width = `${pct}%`;
      drawerShippingText.innerHTML = `Add <strong>â‚¹${formatINR(remaining)}</strong> of eligible items to get FREE Delivery.`;
    }
  }
}

// Handover to Module 3 (Checkout)
function proceedToCheckoutModule3() {
  if (cartState.length === 0) {
    alert('Your cart is empty! Add items before proceeding to checkout.');
    return;
  }
  saveCart();
  navigateTo('Checkout_Payment');
}

// Modal & Drawers
function openCartDrawer() {
  document.getElementById('cartDrawer').classList.add('active');
  document.getElementById('cartDrawerOverlay').classList.add('active');
}

function closeCartDrawer() {
  document.getElementById('cartDrawer').classList.remove('active');
  document.getElementById('cartDrawerOverlay').classList.remove('active');
}

function openProductModal(productId) {
  const product = PRODUCTS_DATA.find(p => p.id === productId);
  if (!product) return;

  const modalBody = document.getElementById('modalContentBody');
  modalBody.innerHTML = `
    <div class="modal-img-container">
      <img src="${product.image}" alt="${product.title}">
    </div>
    <div class="modal-details">
      <h2 class="modal-title">${product.title}</h2>
      <div class="product-rating">
        <span class="stars">${'â˜…'.repeat(Math.floor(product.rating))}${'â˜†'.repeat(5 - Math.floor(product.rating))}</span>
        <span class="rating-count">${product.rating} | ${formatINR(product.reviewsCount)} ratings</span>
      </div>
      <div class="product-price-box" style="margin-top: 10px;">
        <span style="font-size:13px; color:#565959;">Price: </span>
        <span class="currency-symbol">â‚¹</span>
        <span class="price-main">${formatINR(product.price)}</span>
        ${product.originalPrice ? `<span class="original-price" style="margin-left:8px;">M.R.P: â‚¹${formatINR(product.originalPrice)}</span>` : ''}
      </div>
      <div class="modal-specs">
        <strong>About this item:</strong>
        <ul>
          ${product.specs.map(spec => `<li>${spec}</li>`).join('')}
        </ul>
      </div>
      <button class="btn-add-cart" style="margin-top: 16px;" onclick="addToCart('${product.id}'); closeModal();">Add to Cart</button>
    </div>
  `;

  document.getElementById('productModalOverlay').classList.add('active');
}

function closeModal() {
  document.getElementById('productModalOverlay').classList.remove('active');
}

function showToast(message) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>âœ”</span> <span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// Event Listeners
function setupEventListeners() {
  const categorySelect = document.getElementById('searchCategorySelect');
  if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
      setActiveCategory(e.target.value);
    });
  }

  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchSubmitBtn');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderProducts();
    });
  }
  if (searchBtn) {
    searchBtn.addEventListener('click', () => renderProducts());
  }

  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      renderProducts();
    });
  }

  const priceGoBtn = document.getElementById('priceGoBtn');
  if (priceGoBtn) {
    priceGoBtn.addEventListener('click', () => {
      const minInput = document.getElementById('priceMinInput').value;
      const maxInput = document.getElementById('priceMaxInput').value;
      priceMin = minInput ? parseFloat(minInput) : 0;
      priceMax = maxInput ? parseFloat(maxInput) : 250000;
      renderProducts();
    });
  }

  const subnavContainer = document.getElementById('subnavContainer');
  if (subnavContainer) {
    subnavContainer.addEventListener('click', (e) => {
      const link = e.target.closest('.subnav-link');
      if (link) {
        e.preventDefault();
        const cat = link.getAttribute('data-category');
        if (cat) setActiveCategory(cat);
      }
    });
  }
}
function logout(){

    localStorage.removeItem("session");

    navigateTo('Auth_and_login');

}
document.addEventListener("DOMContentLoaded",()=>{

    const logoutLink=document.getElementById("logoutLink");

    if(logoutLink){

        logoutLink.addEventListener("click",(e)=>{

            e.preventDefault();

            logout();

        });

    }

});

// ========================================== 
// ========================================== 
// MODULE: Checkout_Payment 
// ========================================== 
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
let addressFormReturnModule = 'Your_Addresses';



function initCheckout() {
  session = getSession();
  cart = readJson(CART_KEY, []);

  if (!session) {
    sessionStorage.setItem(
        "redirectAfterLogin",
        'Checkout_Payment'
    );

    navigateTo('Auth_and_login');
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
  
  if (document.getElementById('module-Checkout_Payment') && document.getElementById('module-Checkout_Payment').style.display !== 'none') {
      addressFormReturnModule = 'Checkout_Payment';
  } else {
      addressFormReturnModule = 'Your_Addresses';
  }

  const form = document.getElementById('addressForm');
  const title = document.getElementById('addressFormTitle');
  const breadcrumb = document.getElementById('addressFormBreadcrumb');
  const address = addresses.find(item => item.id === addressId);
  
  const titleText = address ? 'Edit address' : 'Add a new address';
  if(title) title.textContent = titleText;
  if(breadcrumb) breadcrumb.textContent = titleText;
  
  navigateTo('Address_Form');
  form.reset();
  document.getElementById('addressError').textContent = '';

  if (address) {
    Object.keys(address).forEach(key => {
      if (form.elements[key]) form.elements[key].value = address[key];
    });
    if (form.elements.landmark && address.landmark) form.elements.landmark.value = address.landmark;
  } else {
    const currentSession = session || getSession();
    form.elements.fullName.value = (currentSession && currentSession.user) ? currentSession.user.name || '' : '';
  }
}

function closeAddressForm() {
  editingAddressId = null;
  navigateTo(addressFormReturnModule);
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
    landmark: (form.landmark ? form.landmark.value.trim() : ''),
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
  
  closeAddressForm(); // This now navigates back and triggers re-rendering via navigateTo
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
        <span>â‚¹${formatINR(item.price * item.quantity)}</span>
      </div>
    </article>
  `).join('');
}

function renderSummary() {
  const totals = calculateTotals();
  document.getElementById('itemsTotal').textContent = `â‚¹${formatINR(totals.items)}`;
  document.getElementById('deliveryFee').textContent = totals.delivery === 0 ? 'FREE' : `â‚¹${formatINR(totals.delivery)}`;
  document.getElementById('taxTotal').textContent = `â‚¹${formatINR(totals.tax)}`;
  document.getElementById('promotionTotal').textContent = `-â‚¹${formatINR(totals.promotion)}`;
  document.getElementById('grandTotal').textContent = `â‚¹${formatINR(totals.grand)}`;
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
    alert('Enter the necessary payment details to facilitate payment.');
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
    <div class="confirm-card"><span>Total</span><strong>â‚¹${formatINR(order.totals.grand)}</strong></div>
    <div class="confirm-card"><span>Payment</span><strong>${order.paymentMethod}</strong></div>
    <div class="confirm-card"><span>Estimated delivery</span><strong>${order.estimatedDelivery}</strong></div>
    <div class="confirm-card wide" style="grid-column: 1 / -1;">
        <span>Ordered items</span>
        <div style="display: flex; flex-direction: column; gap: 15px; margin-top: 10px;">
        ${order.items.map(item => `
            <div style="display: flex; gap: 15px; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 10px;">
                <img src="${item.image}" alt="${escapeHtml(item.title)}" style="width: 80px; height: 80px; object-fit: contain;">
                <div>
                    <h4 style="margin: 0 0 5px 0; font-size: 14px; font-weight: 500;">${escapeHtml(item.title)}</h4>
                    <p style="margin: 0; color: #555; font-size: 12px;">Qty: ${item.quantity}</p>
                    <p style="margin: 5px 0 0 0; font-weight: 700; color: #b12704;">â‚¹${formatINR(item.price * item.quantity)}</p>
                </div>
            </div>
        `).join('')}
        </div>
    </div>
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
  gate.innerHTML = `<h2>${message}</h2><a href="#" onclick="navigateTo('Search_and_Cart'); return false;" class="primary-action">${label}</a>`;
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
  const currentSession = session || getSession();
  if (currentSession && currentSession.user) {
      return (currentSession.user.email || currentSession.user.name || 'guest').toLowerCase();
  }
  return 'guest';
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

function submitContactForm(e) {
    e.preventDefault();
    document.getElementById('contactUsForm').style.display = 'none';
    document.getElementById('contactSuccessMsg').style.display = 'block';
}

function renderYourOrders() {
    const list = document.getElementById('yourOrdersList');
    if (!list) return;

    let userKey = 'guest';
    if (typeof getUserKey === 'function') {
        userKey = getUserKey();
    }
    
    let allOrders = {};
    try {
        allOrders = JSON.parse(localStorage.getItem('amazon_orders') || '{}');
    } catch(e) {}
    
    const userOrders = allOrders[userKey] || [];
    
    // Get only the past 3 orders
    const pastOrders = userOrders.slice(-3).reverse();

    if (pastOrders.length === 0) {
        list.innerHTML = '<p style="padding: 20px; font-size: 16px;">You have no past orders.</p>';
        return;
    }

    let html = '';
    pastOrders.forEach(order => {
        html += `
        <div style="border: 1px solid #ddd; border-radius: 8px; margin-bottom: 20px; overflow: hidden;">
            <div style="background: #f0f2f2; padding: 14px 18px; border-bottom: 1px solid #ddd; display: flex; justify-content: space-between; font-size: 14px; color: #565959;">
                <div>
                    <span style="display: block; margin-bottom: 4px;">ORDER PLACED</span>
                    <span style="color: #111;">Recently</span>
                </div>
                <div>
                    <span style="display: block; margin-bottom: 4px;">TOTAL</span>
                    <span style="color: #111;">₹${formatINR(order.totals?.grand || 0)}</span>
                </div>
                <div>
                    <span style="display: block; margin-bottom: 4px;">SHIP TO</span>
                    <span style="color: #007185;">${escapeHtml(order.address?.fullName || 'Customer')}</span>
                </div>
                <div style="text-align: right;">
                    <span style="display: block; margin-bottom: 4px;">ORDER # ${order.id}</span>
                    <a href="#" style="color: #007185; text-decoration: none;">View order details</a>
                </div>
            </div>
            <div style="padding: 18px;">
                <h3 style="font-size: 18px; color: #111; margin-top: 0; margin-bottom: 10px;">${order.estimatedDelivery ? 'Arriving: ' + order.estimatedDelivery : 'Order Processed'}</h3>
                ${(order.items || []).map(item => `
                    <div style="display: flex; gap: 15px; margin-bottom: 10px;">
                        <div>
                            <div style="font-weight: 700; color: #007185;">${escapeHtml(item.title)}</div>
                            <div style="font-size: 14px; color: #565959;">Qty: ${item.quantity}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        `;
    });

    list.innerHTML = html;
}

function renderYourAddresses() {
  const grid = document.getElementById('yourAddressesGrid');
  if (!grid) return;
  
  addresses = getUserAddresses(); // ensure latest

  let html = `
      <div class="add-address-card" onclick="openAddressForm()">
          <div class="plus-icon">+</div>
          <h2>Add address</h2>
      </div>
  `;

  addresses.forEach(address => {
      const isDefault = address.id === (addresses[0]?.id || selectedAddressId);
      const defaultBadge = isDefault ? `<span style="font-weight: bold; color: #565959;">Default:</span> <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon" style="height: 12px; margin-left: 5px;">` : '';
      
      html += `
      <div class="saved-address-card ${isDefault ? 'default-address' : ''}">
          ${defaultBadge ? `<div class="saved-address-header">${defaultBadge}</div>` : '<div class="saved-address-header">&nbsp;</div>'}
          <div class="saved-address-body">
              <strong>${escapeHtml(address.fullName)}</strong>
              ${escapeHtml(address.houseNumber)}, ${escapeHtml(address.area)}<br>
              ${escapeHtml(address.city)}, ${escapeHtml(address.state)} ${escapeHtml(address.pincode)}<br>
              India<br>
              Phone number: ${escapeHtml(address.mobile)}<br>
              <a href="#" style="color: #007185; text-decoration: none; font-size: 13px; margin-top: 5px; display: inline-block;">Add delivery instructions</a>
          </div>
          <div class="saved-address-actions">
              <a href="#" onclick="openAddressForm('${address.id}'); return false;">Edit</a>
              <span class="action-separator">|</span>
              <a href="#" onclick="removeAddress('${address.id}'); return false;">Remove</a>
              ${!isDefault ? `<span class="action-separator">|</span><a href="#" onclick="setDefaultAddress('${address.id}'); return false;">Set as Default</a>` : ''}
          </div>
      </div>
      `;
  });

  grid.innerHTML = html;
}

function removeAddress(id) {
  if (confirm('Are you sure you want to remove this address?')) {
      addresses = addresses.filter(a => a.id !== id);
      if (selectedAddressId === id) {
          selectedAddressId = addresses[0]?.id || null;
      }
      saveUserAddresses();
      renderYourAddresses();
      if (document.getElementById('module-Checkout_Payment').style.display !== 'none') {
          renderAll();
      }
  }
}

function setDefaultAddress(id) {
  const idx = addresses.findIndex(a => a.id === id);
  if (idx > -1) {
      const addr = addresses.splice(idx, 1)[0];
      addresses.unshift(addr); // put at front
      saveUserAddresses();
      renderYourAddresses();
  }
}


function renderPrimeMembership() {
    const nameEl = document.getElementById('primeUserName');
    if (!nameEl) return;
    const currentSession = session || getSession();
    if (currentSession && currentSession.user && currentSession.user.name) {
        nameEl.innerText = currentSession.user.name;
    } else {
        nameEl.innerText = 'Guest User';
    }
}
