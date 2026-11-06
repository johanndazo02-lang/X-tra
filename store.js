/* ##################### */
/* Client API (backend Node/Express + PostgreSQL) */
/* ##################### */

const API_BASE = 'http://localhost:3000/api';

const TOKEN_KEY = 'xtra_token';
const USER_KEY = 'xtra_user';
const CART_KEY = 'xtra_cart';

const formatPrice = (amount) => {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'AR';
};

const getToken = () => localStorage.getItem(TOKEN_KEY);

const getCurrentUser = () => {
    try {
        return JSON.parse(localStorage.getItem(USER_KEY));
    } catch {
        return null;
    }
};

// L'évènement « xtra:session » prévient la page (ex. l'espace client de l'accueil)
// qu'on vient de se connecter ou de se déconnecter.
const setSession = (token, user) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event('xtra:session'));
};

const clearSession = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    window.dispatchEvent(new Event('xtra:session'));
};

const apiRegister = async (name, email, password) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
    });
    const data = await res.json();
    if(!res.ok) throw new Error(data.error || "Erreur lors de l'inscription.");
    setSession(data.token, data.user);
    return data.user;
};

const apiLogin = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if(!res.ok) throw new Error(data.error || 'Erreur de connexion.');
    setSession(data.token, data.user);
    return data.user;
};

const fetchProducts = async () => {
    const res = await fetch(`${API_BASE}/products`);
    if(!res.ok) throw new Error('Impossible de charger les produits.');
    return res.json();
};

const placeOrder = async (items, paid, address, phone, paymentMethod) => {
    const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ items, paid, address, phone, paymentMethod })
    });
    const data = await res.json();
    if(!res.ok) throw new Error(data.error || 'Erreur lors de la commande.');
    return data;
};

const fetchMyOrders = async () => {
    const res = await fetch(`${API_BASE}/orders/me`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if(!res.ok) throw new Error('Impossible de charger vos commandes.');
    return res.json();
};

const fetchRecommendations = async () => {
    const res = await fetch(`${API_BASE}/products/recommendations`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    if(!res.ok) throw new Error('Impossible de charger les suggestions.');
    return res.json();
};

const fetchLeagues = async () => {
    const res = await fetch(`${API_BASE}/leagues`);
    if(!res.ok) throw new Error('Impossible de charger les championnats.');
    return res.json();
};

const fetchLeagueTeams = async (leagueId) => {
    const res = await fetch(`${API_BASE}/leagues/${leagueId}/teams`);
    if(!res.ok) throw new Error('Impossible de charger les équipes.');
    return res.json();
};

const fetchTeam = async (teamId) => {
    const res = await fetch(`${API_BASE}/teams/${teamId}`);
    if(!res.ok) throw new Error('Équipe introuvable.');
    return res.json();
};

const fetchTeamJerseys = async (teamId) => {
    const res = await fetch(`${API_BASE}/teams/${teamId}/jerseys`);
    if(!res.ok) throw new Error('Impossible de charger les maillots.');
    return res.json();
};

const sendContactMessage = async (name, email, subject, message) => {
    const res = await fetch(`${API_BASE}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message })
    });
    const data = await res.json();
    if(!res.ok) throw new Error(data.error || "Impossible d'envoyer votre message.");
    return data;
};

const searchProducts = async (query) => {
    const res = await fetch(`${API_BASE}/products/search?q=${encodeURIComponent(query)}`);
    if(!res.ok) throw new Error('Impossible de lancer la recherche.');
    return res.json();
};

const fetchProduct = async (productId) => {
    const res = await fetch(`${API_BASE}/products/${productId}`);
    if(!res.ok) throw new Error('Produit introuvable.');
    return res.json();
};

/* ##################### */
/* Espace admin (session séparée de celle des clients) */
/* ##################### */

const ADMIN_TOKEN_KEY = 'xtra_admin_token';
const ADMIN_USER_KEY = 'xtra_admin_user';

const getAdminToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);

const getAdminUser = () => {
    try {
        return JSON.parse(localStorage.getItem(ADMIN_USER_KEY));
    } catch {
        return null;
    }
};

const clearAdminSession = () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
};

const apiAdminLogin = async (email, password) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if(!res.ok) throw new Error(data.error || 'Erreur de connexion.');
    // Un serveur API pas encore redémarré ne renvoie pas du tout le champ is_admin.
    if(data.user.is_admin === undefined) throw new Error("Le serveur API n'est pas à jour : redémarrez-le (npm run dev dans backend).");
    if(!data.user.is_admin) throw new Error("Ce compte n'a pas accès à l'administration.");
    localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(data.user));
    return data.user;
};

const fetchSalesStats = async (from, to) => {
    const params = new URLSearchParams({ from, to });
    const res = await fetch(`${API_BASE}/stats/sales?${params}`, {
        headers: { 'Authorization': `Bearer ${getAdminToken()}` }
    });
    const data = await res.json();
    if(!res.ok){
        const error = new Error(data.error || 'Impossible de charger les statistiques.');
        error.status = res.status;
        throw error;
    }
    return data;
};

// Requête vers l'API d'administration avec le jeton admin.
const adminRequest = async (method, path, body) => {
    const res = await fetch(`${API_BASE}/admin${path}`, {
        method,
        headers: {
            'Authorization': `Bearer ${getAdminToken()}`,
            ...(body ? { 'Content-Type': 'application/json' } : {})
        },
        body: body ? JSON.stringify(body) : undefined
    });
    const data = await res.json();
    if(!res.ok){
        const error = new Error(data.error || "Erreur lors de l'opération.");
        error.status = res.status;
        throw error;
    }
    return data;
};

const adminFetchProducts = (q, category, page) =>
    adminRequest('GET', `/products?${new URLSearchParams({ q, category, page })}`);
const adminCreateProduct = (product) => adminRequest('POST', '/products', product);
const adminUpdateProduct = (id, product) => adminRequest('PUT', `/products/${id}`, product);
const adminDeleteProduct = (id) => adminRequest('DELETE', `/products/${id}`);
const adminFetchTeams = () => adminRequest('GET', '/teams');
const adminUploadImage = (filename, data) => adminRequest('POST', '/uploads', { filename, data });

const adminFetchOrders = (status) => adminRequest('GET', `/orders?${new URLSearchParams({ status })}`);
const adminUpdateOrderStatus = (id, status) => adminRequest('PATCH', `/orders/${id}`, { status });

const adminFetchUsers = () => adminRequest('GET', '/users');
const adminSetUserAdmin = (id, isAdmin) => adminRequest('PATCH', `/users/${id}`, { is_admin: isAdmin });
const adminDeleteUser = (id) => adminRequest('DELETE', `/users/${id}`);

const adminUpdateMe = async (name, email) => {
    const user = await adminRequest('PUT', '/me', { name, email });
    localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(user));
    return user;
};
const adminChangePassword = (current, next) => adminRequest('PUT', '/me/password', { current, next });

/* ##################### */
/* Profil du client (photo) */
/* ##################### */

// Met à jour l'utilisateur mémorisé et prévient la page (évènement « xtra:profile »).
const storeUser = (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    window.dispatchEvent(new Event('xtra:profile'));
    return user;
};

const apiFetchMe = async () => {
    const res = await fetch(`${API_BASE}/auth/me`, {
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await res.json();
    if(!res.ok) throw new Error(data.error || 'Impossible de charger votre profil.');
    return storeUser(data);
};

const apiUploadAvatar = async (dataUrl, filename) => {
    const res = await fetch(`${API_BASE}/auth/me/avatar`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getToken()}`
        },
        body: JSON.stringify({ data: dataUrl, filename })
    });
    const data = await res.json();
    if(!res.ok) throw new Error(data.error || "Impossible d'envoyer la photo.");
    return storeUser(data);
};

const apiRemoveAvatar = async () => {
    const res = await fetch(`${API_BASE}/auth/me/avatar`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    const data = await res.json();
    if(!res.ok) throw new Error(data.error || 'Impossible de retirer la photo.');
    return storeUser(data);
};
