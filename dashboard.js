/* ##################### */
/* Mon dashboard (espace client) */
/* ##################### */

const user = getCurrentUser();

if(!user){
    window.location.href = 'index.html';
}

const paymentLabels = {
    'orange-money': 'Orange Money',
    'mvola': 'Mvola',
    'airtel-money': 'Airtel Money',
    'livraison': 'À la livraison'
};

const STATUS_CLASSES = { 'payé': 'is-paid', 'impayé': 'is-unpaid', 'annulé': 'is-cancelled' };
const STATUS_LABELS = { 'payé': 'payée', 'impayé': 'impayée', 'annulé': 'annulée' };

let allOrders = [];
let currentStatus = '';

const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if(className) node.className = className;
    if(text !== undefined) node.textContent = text;
    return node;
};

const formatDate = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('fr-FR') + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
};

/* ##################### */
/* Bandeau de synthèse */
/* ##################### */

const renderStrip = (orders) => {
    const strip = document.querySelector('#dash-strip');
    strip.innerHTML = '';

    const count = (status) => orders.filter(o => o.status === status).length;
    const active = orders.filter(o => o.status !== 'annulé');
    const spent = orders.filter(o => o.status === 'payé').reduce((sum, o) => sum + o.total, 0);
    const toPay = orders.filter(o => o.status === 'impayé').reduce((sum, o) => sum + o.total, 0);
    const items = active.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.qty, 0), 0);
    const last = orders[0];

    const entries = [
        ['commandes', orders.length, `payées : ${count('payé')} · impayées : ${count('impayé')} · annulées : ${count('annulé')}`],
        ['total dépensé', formatPrice(spent), toPay > 0 ? `reste à payer : ${formatPrice(toPay)}` : ''],
        ['articles', items, ''],
        ['dernière commande', last ? new Date(last.created_at).toLocaleDateString('fr-FR') : '—', '']
    ];

    entries.forEach(([label, value, note]) => {
        const item = el('div', 'admin-strip-item');
        item.appendChild(el('span', 'admin-muted', label + ' : '));
        item.appendChild(el('strong', '', value));
        if(note) item.appendChild(el('span', 'admin-strip-note', note));
        strip.appendChild(item);
    });
};

/* ##################### */
/* Tableau des commandes */
/* ##################### */

const renderOrders = () => {
    const tbody = document.querySelector('#dash-orders');
    tbody.innerHTML = '';
    const orders = allOrders.filter(o => !currentStatus || o.status === currentStatus);

    if(orders.length === 0){
        const tr = el('tr');
        const td = el('td', 'admin-muted', allOrders.length === 0
            ? "vous n'avez encore passé aucune commande"
            : 'aucune commande pour ce filtre');
        td.colSpan = 7;
        tr.appendChild(td);
        tbody.appendChild(tr);
        return;
    }

    orders.forEach(order => {
        const tr = el('tr');
        tr.appendChild(el('td', 'admin-id', '#' + String(order.id).padStart(4, '0')));

        const items = el('td', 'admin-wrap');
        order.items.forEach(item => items.appendChild(el('span', 'admin-sub', `${item.qty} × ${item.name}`)));
        tr.appendChild(items);

        const delivery = el('td', 'admin-wrap');
        delivery.appendChild(el('span', '', order.address || '—'));
        if(order.phone) delivery.appendChild(el('span', 'admin-sub', order.phone));
        tr.appendChild(delivery);

        tr.appendChild(el('td', '', paymentLabels[order.payment_method] || 'non précisé'));
        tr.appendChild(el('td', 'num admin-strong', formatPrice(order.total)));
        tr.appendChild(el('td', '', formatDate(order.created_at)));

        const statusTd = el('td');
        statusTd.appendChild(el('span', 'admin-status ' + STATUS_CLASSES[order.status], STATUS_LABELS[order.status] || order.status));
        tr.appendChild(statusTd);

        tbody.appendChild(tr);
    });
};

/* ##################### */
/* Maillots commandés */
/* ##################### */

const renderItems = (orders) => {
    const container = document.querySelector('#dash-items');
    container.innerHTML = '';
    const rows = orders
        .filter(o => o.status !== 'annulé')
        .flatMap(order => order.items.map(item => ({ ...item, date: order.created_at })));

    if(rows.length === 0){
        container.appendChild(el('p', 'admin-muted', "vous n'avez encore rien commandé"));
        return;
    }

    rows.forEach(item => {
        const card = el('div', 'dash-item');
        const img = el('img');
        img.src = item.image_url || '/Images/maillot-placeholder.svg';
        img.alt = item.name;
        card.appendChild(img);
        const text = el('div');
        text.appendChild(el('span', 'admin-strong', item.name));
        text.appendChild(el('span', 'admin-sub', `${item.qty} × ${formatPrice(item.price)}`));
        text.appendChild(el('span', 'admin-sub', new Date(item.date).toLocaleDateString('fr-FR')));
        card.appendChild(text);
        container.appendChild(card);
    });
};

/* ##################### */
/* Chargement */
/* ##################### */

const loadDashboard = async () => {
    try {
        allOrders = await fetchMyOrders();
    } catch (err) {
        const message = document.querySelector('#dash-message');
        message.textContent = 'Impossible de charger vos commandes. Vérifiez que le serveur backend est démarré.';
        message.classList.remove('hidden');
        document.querySelector('#dash-content').classList.add('hidden');
        return;
    }

    renderStrip(allOrders);
    renderOrders();
    renderItems(allOrders);

    const cancelled = allOrders.filter(o => o.status === 'annulé').length;
    document.querySelector('#dash-cancel-note').textContent = cancelled > 0
        ? `${cancelled} commande${cancelled > 1 ? 's annulées' : ' annulée'} par la boutique. Pour toute question, écrivez-nous depuis la page Contact.`
        : '';
};

if(user){
    document.querySelector('#dash-name').textContent = user.name;
    document.querySelector('#dash-email').textContent = user.email;
    mountProfilePhoto(document.querySelector('#dash-avatar'));

    document.querySelector('#dash-logout').addEventListener('click', () => {
        clearSession();
        window.location.href = 'index.html';
    });

    document.querySelectorAll('[data-status]').forEach(btn => {
        btn.addEventListener('click', () => {
            currentStatus = btn.dataset.status;
            document.querySelectorAll('[data-status]').forEach(b => b.classList.toggle('active', b === btn));
            renderOrders();
        });
    });

    loadDashboard();
}
