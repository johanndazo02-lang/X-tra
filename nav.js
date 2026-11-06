/* ##################### */
/* Navigation (icônes, menu mobile, scroll) */
/* ##################### */

const searchContainer = document.querySelector('.search-container');
const searchIcon = document.querySelector('#search-icon');
const cartContent = document.querySelector('.cart-container');
const cartIcon = document.querySelector('#cart-icon');
const userContent = document.querySelector('.user-container');
const userIcon = document.querySelector('#user-icon');
const nav = document.querySelector('.navigation');
const menuIcon = document.querySelector('#menu-icon');
const linkNav = document.querySelectorAll('.navigation a');
const header = document.querySelector('nav');
const sections = document.querySelectorAll('section');

menuIcon.addEventListener('click', () => {
    nav.classList.toggle('active');
    menuIcon.classList.toggle('bx-x');
    searchContainer.classList.remove('active');
    cartContent.classList.remove('active');
    userContent.classList.remove('active');
});

searchIcon.addEventListener('click', () => {
    searchContainer.classList.toggle('active');
    cartContent.classList.remove('active');
    userContent.classList.remove('active');
    nav.classList.remove('active');
    menuIcon.classList.remove('bx-x');
    if(searchContainer.classList.contains('active')){
        searchContainer.querySelector('input').focus();
    }
});

const searchInput = searchContainer.querySelector('input');
searchInput.addEventListener('keydown', (e) => {
    if(e.key !== 'Enter') return;
    const query = searchInput.value.trim();
    if(query.length === 0) return;
    window.location.href = 'recherche.html?q=' + encodeURIComponent(query);
});

cartIcon.addEventListener('click', () => {
    cartContent.classList.toggle('active');
    searchContainer.classList.remove('active');
    userContent.classList.remove('active');
    nav.classList.remove('active');
    menuIcon.classList.remove('bx-x');
});

userIcon.addEventListener('click', () => {
    userContent.classList.toggle('active');
    searchContainer.classList.remove('active');
    cartContent.classList.remove('active');
    nav.classList.remove('active');
    menuIcon.classList.remove('bx-x');
});

linkNav.forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.remove('active');
        menuIcon.classList.remove('bx-x');
    });
});

window.addEventListener('scroll', () => {
  header.classList.toggle('active', window.scrollY > 0);
});

const footerToTop = document.querySelector('.footer-to-top');
if(footerToTop){
    footerToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

window.addEventListener('scroll', () => {
    userContent.classList.remove('active');
    searchContainer.classList.remove('active');
    cartContent.classList.remove('active');
    nav.classList.remove('active');
    menuIcon.classList.remove('bx-x');
});

const scrollActive = () => {
  sections.forEach(section => {
    let top = window.scrollY;
    let offset = section.offsetTop - 150;
    let height = section.offsetHeight;
    let id = section.getAttribute('id');

    if(top >= offset && top < offset + height) {
      linkNav.forEach(link => {
        link.classList.remove('active');
        const activeLink = document.querySelector('.navigation a[href*="' + id + '"]');
        if(activeLink) activeLink.classList.add('active');
      });
    }
  })
}

window.addEventListener('scroll', scrollActive);


/* ##################### */
/* Panier */
/* ##################### */

const cartItemsEl = document.querySelector('.cart-items');
const cartTotalEl = document.querySelector('.cart-total');
const cartCountEl = document.querySelector('#cart-count');

const loadCart = () => {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
        return [];
    }
};

let cart = loadCart();

const saveCart = () => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event('xtra:cart'));
};

// Même limite que le serveur (MAX_QTY_PER_ITEM dans orders.routes.js)
const MAX_QTY_PER_ITEM = 20;

const addToCart = (id, name, price, img) => {
    const existing = cart.find(item => item.id === id);
    if(existing){
        if(existing.qty >= MAX_QTY_PER_ITEM){
            alert(`Maximum ${MAX_QTY_PER_ITEM} exemplaires d'un même article par commande.`);
            return;
        }
        existing.qty += 1;
    } else {
        cart.push({ id, name, price, img, qty: 1 });
    }
    saveCart();
    renderCart();
};

const removeFromCart = (id) => {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    renderCart();
};

const cartTotal = () => cart.reduce((sum, item) => sum + item.price * item.qty, 0);

const renderCart = () => {
    cartItemsEl.innerHTML = '';

    cartContent.classList.toggle('empty', cart.length === 0);

    let count = 0;

    cart.forEach(item => {
        count += item.qty;

        const card = document.createElement('div');
        card.classList.add('cart-card');
        card.setAttribute('data-id', item.id);
        card.innerHTML = `
            <img src="${item.img}" alt="${item.name}">
            <div class="cart-text">
                <h3>${item.name}</h3>
                <span>${formatPrice(item.price)}</span>
                <span>${item.qty}x</span>
            </div>
            <i class="bx bx-trash"></i>
        `;
        cartItemsEl.appendChild(card);
    });

    cartTotalEl.textContent = 'Total: ' + formatPrice(cartTotal());
    cartCountEl.textContent = count > 0 ? count : '';
};

cartItemsEl.addEventListener('click', (e) => {
    if(!e.target.classList.contains('bx-trash')) return;
    const card = e.target.closest('.cart-card');
    removeFromCart(card.getAttribute('data-id'));
});

renderCart();


/* ##################### */
/* Compte client */
/* ##################### */

const loginView = document.querySelector('.login-view');
const signupView = document.querySelector('.signup-view');
const accountView = document.querySelector('.account-view');
const loginForm = document.querySelector('.login-form');
const signupForm = document.querySelector('.signup-form');
const checkoutBtn = document.querySelector('.cart-checkout-btn');

const setError = (form, message) => {
    form.querySelector('.form-error').textContent = message;
};

const switchView = (viewName) => {
    [loginView, signupView, accountView].forEach(view => view.classList.add('hidden'));
    if(viewName === 'login') loginView.classList.remove('hidden');
    if(viewName === 'signup') signupView.classList.remove('hidden');
    if(viewName === 'account') accountView.classList.remove('hidden');
};

const refreshAccountView = () => {
    const user = getCurrentUser();
    if(user){
        accountView.querySelector('.account-name').textContent = user.name;
        accountView.querySelector('.account-email').textContent = user.email;
        switchView('account');
    } else {
        switchView('login');
    }
};

document.querySelector('.show-signup').addEventListener('click', (e) => {
    e.preventDefault();
    setError(loginForm, '');
    switchView('signup');
});

document.querySelector('.show-login').addEventListener('click', (e) => {
    e.preventDefault();
    setError(signupForm, '');
    switchView('login');
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = loginForm.email.value.trim().toLowerCase();
    const password = loginForm.password.value;

    try {
        await apiLogin(email, password);
        setError(loginForm, '');
        loginForm.reset();
        refreshAccountView();
    } catch (err) {
        setError(loginForm, err.message);
    }
});

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = signupForm.name.value.trim();
    const email = signupForm.email.value.trim().toLowerCase();
    const password = signupForm.password.value;
    const confirm = signupForm.confirm.value;

    if(password !== confirm){
        setError(signupForm, 'Les mots de passe ne correspondent pas.');
        return;
    }

    try {
        await apiRegister(name, email, password);
        setError(signupForm, '');
        signupForm.reset();
        window.location.href = 'dashboard.html';
    } catch (err) {
        setError(signupForm, err.message);
    }
});

accountView.querySelector('.logout-btn').addEventListener('click', () => {
    clearSession();
    refreshAccountView();
});

checkoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if(cart.length === 0) return;

    const user = getCurrentUser();
    if(!user){
        cartContent.classList.remove('active');
        userContent.classList.add('active');
        switchView('login');
        setError(loginForm, 'Connectez-vous ou créez un compte pour passer votre commande.');
        return;
    }

    window.location.href = 'checkout.html';
});

refreshAccountView();
