/* ##################### */
/* Administration — back-office (produits, commandes, utilisateurs, compte) */
/* Utilise les utilitaires d'admin.js (el, emptyRow, timeAgo, paymentLabels, showLogin). */
/* ##################### */

const toastEl = document.querySelector('#admin-toast');
let toastTimer;

const toast = (message, isError) => {
    toastEl.textContent = message;
    toastEl.classList.toggle('is-error', !!isError);
    toastEl.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.add('hidden'), 3500);
};

// Session expirée ou droits retirés : retour à l'écran de connexion.
const handleAdminError = (err) => {
    if(err.status === 401 || err.status === 403){
        showLogin(err.status === 403 ? "Ce compte n'a pas accès à l'administration." : 'Session expirée, reconnectez-vous.');
        return;
    }
    toast(err.message === 'Failed to fetch' ? 'Serveur injoignable. Vérifiez que le backend est démarré.' : err.message, true);
};

const button = (label, icon, className) => {
    const btn = el('button', 'admin-btn ' + (className || ''));
    btn.type = 'button';
    if(icon) btn.appendChild(el('i', 'bx ' + icon));
    btn.appendChild(document.createTextNode(' ' + label));
    return btn;
};

/* ##################### */
/* Navigation entre les sections */
/* ##################### */

const VIEWS = {
    'tableau-de-bord': 'dashboard',
    'produits': 'products',
    'commandes': 'orders',
    'utilisateurs': 'users',
    'mon-compte': 'account'
};

const viewLoaders = {};

const showView = () => {
    const view = VIEWS[window.location.hash.slice(1)] || 'dashboard';
    document.querySelectorAll('.admin-view').forEach(v => v.classList.toggle('hidden', v.dataset.view !== view));
    document.querySelectorAll('[data-view-link]').forEach(a => a.classList.toggle('active', a.dataset.viewLink === view));

    // La courbe se dessine à la largeur de son conteneur : on la redessine une fois visible.
    if(view === 'dashboard' && lastData) renderRevenueChart(lastData.timeline, lastData.bucket);
    if(viewLoaders[view] && getAdminToken()) viewLoaders[view]();
};

window.addEventListener('hashchange', showView);

/* ##################### */
/* Produits */
/* ##################### */

const productsTable = document.querySelector('#products-table');
const productsSearch = document.querySelector('#products-search');
const productsCategory = document.querySelector('#products-category');
const productDialog = document.querySelector('#product-dialog');
const productForm = document.querySelector('#product-form');
const productPreview = document.querySelector('#product-preview');
const productError = document.querySelector('#product-error');

let productsPage = 1;
let productsTotalPages = 1;
let editingProductId = null;
let teamsLoaded = false;

const loadProducts = async () => {
    try {
        const data = await adminFetchProducts(productsSearch.value.trim(), productsCategory.value, productsPage);
        productsTotalPages = Math.max(1, Math.ceil(data.total / data.page_size));
        renderProducts(data);
    } catch (err) {
        handleAdminError(err);
    }
};

const renderProducts = (data) => {
    productsTable.innerHTML = '';
    document.querySelector('#products-count').textContent = `${data.total} produit${data.total > 1 ? 's' : ''}`;
    document.querySelector('#products-page').textContent = `page ${data.page} / ${productsTotalPages}`;
    document.querySelector('#products-prev').disabled = data.page <= 1;
    document.querySelector('#products-next').disabled = data.page >= productsTotalPages;

    if(data.products.length === 0){
        emptyRow(productsTable, 7, 'aucun produit ne correspond');
        return;
    }

    data.products.forEach(product => {
        const tr = el('tr');

        const photoTd = el('td');
        const img = el('img', 'admin-thumb');
        img.src = product.image_url;
        img.alt = '';
        photoTd.appendChild(img);
        tr.appendChild(photoTd);

        const nameTd = el('td', 'admin-wrap');
        nameTd.appendChild(el('span', 'admin-strong', product.name));
        nameTd.appendChild(el('span', 'admin-sub', `#${product.id}${product.type ? ' · ' + product.type : ''}`));
        tr.appendChild(nameTd);

        tr.appendChild(el('td', '', product.team_name || '—'));
        tr.appendChild(el('td', '', product.category));
        tr.appendChild(el('td', '', product.season || '—'));
        tr.appendChild(el('td', 'num', formatPrice(product.price)));

        const actions = el('td', 'num admin-actions');
        const view = el('a', 'admin-btn');
        view.href = `produit.html?id=${product.id}`;
        view.target = '_blank';
        view.title = 'Voir sur la boutique';
        view.appendChild(el('i', 'bx bx-show'));
        const edit = button('modifier', 'bx-edit');
        edit.addEventListener('click', () => openProductDialog(product));
        const del = button('', 'bx-trash', 'admin-btn-danger');
        del.title = 'Supprimer';
        del.addEventListener('click', () => deleteProduct(product));
        actions.append(view, edit, del);
        tr.appendChild(actions);

        productsTable.appendChild(tr);
    });
};

const loadTeamsOptions = async () => {
    if(teamsLoaded) return;
    const teams = await adminFetchTeams();
    const select = document.querySelector('#product-team');
    let group = null;
    teams.forEach(team => {
        if(!group || group.label !== team.league_name){
            group = document.createElement('optgroup');
            group.label = team.league_name;
            select.appendChild(group);
        }
        const option = el('option', '', team.name);
        option.value = team.id;
        group.appendChild(option);
    });
    teamsLoaded = true;
};

const openProductDialog = async (product) => {
    try {
        await loadTeamsOptions();
    } catch (err) {
        handleAdminError(err);
        return;
    }
    editingProductId = product ? product.id : null;
    document.querySelector('#product-dialog-title').textContent = product ? `modifier le produit #${product.id}` : 'ajouter un produit';
    productForm.reset();
    productError.textContent = '';

    const values = product || { category: 'Maillots', sizes: 'S,M,L,XL,XXL', image_url: '/Images/maillot-placeholder.svg' };
    ['name', 'price', 'category', 'season', 'type', 'design', 'colors', 'brand', 'sizes', 'image_url'].forEach(field => {
        productForm.elements[field].value = values[field] ?? '';
    });
    productForm.elements.team_id.value = values.team_id || '';
    productPreview.src = values.image_url;
    productDialog.showModal();
};

const deleteProduct = async (product) => {
    if(!confirm(`Supprimer « ${product.name} » ?\nLes commandes déjà passées gardent le nom et le prix de ce produit.`)) return;
    try {
        await adminDeleteProduct(product.id);
        toast('Produit supprimé.');
        loadProducts();
    } catch (err) {
        handleAdminError(err);
    }
};

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
});

document.querySelector('#product-file').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    if(file.size > 5 * 1024 * 1024){
        productError.textContent = 'Image trop lourde (5 Mo maximum).';
        return;
    }
    productError.textContent = 'envoi de la photo…';
    try {
        const { image_url } = await adminUploadImage(file.name, await readFileAsDataUrl(file));
        productForm.elements.image_url.value = image_url;
        productPreview.src = image_url;
        productError.textContent = '';
    } catch (err) {
        productError.textContent = err.message;
    } finally {
        e.target.value = '';
    }
});

productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = Object.fromEntries(new FormData(productForm).entries());
    payload.price = Number(payload.price);
    const saveBtn = document.querySelector('#product-save');
    saveBtn.disabled = true;
    productError.textContent = '';
    try {
        if(editingProductId){
            await adminUpdateProduct(editingProductId, payload);
            toast('Produit mis à jour.');
        } else {
            await adminCreateProduct(payload);
            toast('Produit ajouté.');
            productsPage = 1;
        }
        productDialog.close();
        loadProducts();
    } catch (err) {
        if(err.status === 401 || err.status === 403){
            productDialog.close();
            handleAdminError(err);
        } else {
            productError.textContent = err.message;
        }
    } finally {
        saveBtn.disabled = false;
    }
});

document.querySelector('#product-cancel').addEventListener('click', () => productDialog.close());
document.querySelector('#product-add').addEventListener('click', () => openProductDialog(null));

let searchTimer;
productsSearch.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { productsPage = 1; loadProducts(); }, 300);
});
productsCategory.addEventListener('change', () => { productsPage = 1; loadProducts(); });
document.querySelector('#products-prev').addEventListener('click', () => { productsPage--; loadProducts(); });
document.querySelector('#products-next').addEventListener('click', () => { productsPage++; loadProducts(); });

viewLoaders.products = loadProducts;

/* ##################### */
/* Commandes */
/* ##################### */

const ordersTable = document.querySelector('#manage-orders-table');
let ordersStatus = '';

const STATUS_LABELS = { 'payé': 'payée', 'impayé': 'impayée', 'annulé': 'annulée' };

const loadManagedOrders = async () => {
    try {
        renderManagedOrders(await adminFetchOrders(ordersStatus));
    } catch (err) {
        handleAdminError(err);
    }
};

const renderManagedOrders = (orders) => {
    ordersTable.innerHTML = '';
    if(orders.length === 0){
        emptyRow(ordersTable, 7, 'aucune commande pour ce filtre');
        return;
    }

    orders.forEach(order => {
        const tr = el('tr');
        tr.appendChild(el('td', 'admin-id', '#' + String(order.id).padStart(4, '0')));

        const customer = el('td', 'admin-wrap');
        customer.appendChild(el('span', 'admin-strong', order.customer));
        customer.appendChild(el('span', 'admin-sub', order.customer_email));
        tr.appendChild(customer);

        const items = el('td', 'admin-wrap');
        order.items.forEach(item => items.appendChild(el('span', 'admin-sub', `${item.qty} × ${item.name}`)));
        tr.appendChild(items);

        const delivery = el('td', 'admin-wrap');
        delivery.appendChild(el('span', '', order.address || '—'));
        delivery.appendChild(el('span', 'admin-sub', [order.phone, paymentLabels[order.payment_method || 'non-precise']].filter(Boolean).join(' · ')));
        tr.appendChild(delivery);

        tr.appendChild(el('td', 'num admin-strong', formatPrice(order.total)));

        const date = el('td', '', timeAgo(order.created_at));
        date.title = new Date(order.created_at).toLocaleString('fr-FR');
        tr.appendChild(date);

        // Le statut se change directement dans la liste.
        const statusTd = el('td');
        const select = el('select', 'admin-status-select');
        Object.entries(STATUS_LABELS).forEach(([value, label]) => {
            const option = el('option', '', label);
            option.value = value;
            option.selected = value === order.status;
            select.appendChild(option);
        });
        select.addEventListener('change', async () => {
            if(select.value === 'annulé' && !confirm(`Annuler la commande #${order.id} ?`)){
                select.value = order.status;
                return;
            }
            try {
                await adminUpdateOrderStatus(order.id, select.value);
                order.status = select.value;
                toast(`Commande #${order.id} : ${STATUS_LABELS[select.value]}.`);
                if(ordersStatus) loadManagedOrders();
            } catch (err) {
                select.value = order.status;
                handleAdminError(err);
            }
        });
        statusTd.appendChild(select);
        tr.appendChild(statusTd);

        ordersTable.appendChild(tr);
    });
};

document.querySelectorAll('[data-order-status]').forEach(btn => {
    btn.addEventListener('click', () => {
        ordersStatus = btn.dataset.orderStatus;
        document.querySelectorAll('[data-order-status]').forEach(b => b.classList.toggle('active', b === btn));
        loadManagedOrders();
    });
});

viewLoaders.orders = loadManagedOrders;

/* ##################### */
/* Utilisateurs */
/* ##################### */

const usersTable = document.querySelector('#users-table');

const loadUsers = async () => {
    try {
        renderUsers(await adminFetchUsers());
    } catch (err) {
        handleAdminError(err);
    }
};

const renderUsers = (users) => {
    usersTable.innerHTML = '';
    users.forEach(user => {
        const tr = el('tr');
        const name = el('td', 'admin-strong', user.name + (user.is_self ? ' (vous)' : ''));
        tr.appendChild(name);
        tr.appendChild(el('td', '', user.email));
        tr.appendChild(el('td', '', new Date(user.created_at).toLocaleDateString('fr-FR')));
        tr.appendChild(el('td', 'num', user.orders));
        tr.appendChild(el('td', 'num', formatPrice(user.spent)));

        const role = el('td');
        role.appendChild(el('span', 'admin-status ' + (user.is_admin ? 'is-paid' : 'is-unpaid'), user.is_admin ? 'admin' : 'client'));
        tr.appendChild(role);

        const actions = el('td', 'num admin-actions');
        if(!user.is_self){
            const toggle = button(user.is_admin ? 'retirer admin' : 'passer admin', user.is_admin ? 'bx-user-minus' : 'bx-user-plus');
            toggle.addEventListener('click', async () => {
                const verb = user.is_admin ? 'Retirer les droits administrateur à' : 'Donner les droits administrateur à';
                if(!confirm(`${verb} ${user.name} ?`)) return;
                try {
                    await adminSetUserAdmin(user.id, !user.is_admin);
                    toast('Rôle mis à jour.');
                    loadUsers();
                } catch (err) {
                    handleAdminError(err);
                }
            });
            const del = button('', 'bx-trash', 'admin-btn-danger');
            del.title = user.orders > 0 ? 'Impossible : ce compte a des commandes' : 'Supprimer le compte';
            del.disabled = user.orders > 0;
            del.addEventListener('click', async () => {
                if(!confirm(`Supprimer définitivement le compte de ${user.name} ?`)) return;
                try {
                    await adminDeleteUser(user.id);
                    toast('Compte supprimé.');
                    loadUsers();
                } catch (err) {
                    handleAdminError(err);
                }
            });
            actions.append(toggle, del);
        }
        tr.appendChild(actions);
        usersTable.appendChild(tr);
    });
};

viewLoaders.users = loadUsers;

/* ##################### */
/* Mon compte */
/* ##################### */

const accountForm = document.querySelector('#account-form');
const passwordForm = document.querySelector('#password-form');

viewLoaders.account = () => {
    const admin = getAdminUser();
    if(admin){
        accountForm.elements.name.value = admin.name || '';
        accountForm.elements.email.value = admin.email || '';
    }
};

accountForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
        const user = await adminUpdateMe(accountForm.elements.name.value.trim(), accountForm.elements.email.value.trim());
        document.querySelector('#admin-name').textContent = user.name;
        toast('Informations enregistrées.');
    } catch (err) {
        handleAdminError(err);
    }
});

passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const { current, next, confirm: confirmation } = passwordForm.elements;
    if(next.value !== confirmation.value){
        toast('Les deux nouveaux mots de passe ne correspondent pas.', true);
        return;
    }
    try {
        await adminChangePassword(current.value, next.value);
        passwordForm.reset();
        toast('Mot de passe modifié.');
    } catch (err) {
        handleAdminError(err);
    }
});

/* ##################### */
/* Démarrage : afficher la section demandée dans l'adresse */
/* ##################### */

showView();
