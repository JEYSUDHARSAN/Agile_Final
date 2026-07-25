// Initialize Mock DB if not exists
if (!localStorage.getItem('users')) {
    localStorage.setItem('users', JSON.stringify([]));
}

// Check if user is already logged in on load
document.addEventListener('DOMContentLoaded', () => {
    checkSession();
});

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
    
    showDashboard();
}

function checkSession() {
    const sessionData = localStorage.getItem('session');
    if (sessionData) {
        const session = JSON.parse(sessionData);
        if (session.isLoggedIn) {
            showDashboard();
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
}
