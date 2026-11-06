/* ##################### */
/* Accueil : espace client (affiché à la place de la bannière une fois connecté) */
/* ##################### */

const heroSection = document.querySelector('#accueil');
const clientHome = document.querySelector('#client-home');

const ORDER_STATUS = {
    'payé': { label: 'Payée', className: 'status-paye' },
    'impayé': { label: 'Impayée', className: 'status-impaye' },
    'annulé': { label: 'Annulée', className: 'status-annule' }
};

const node = (tag, className, text) => {
    const n = document.createElement(tag);
    if(className) n.className = className;
    if(text !== undefined) n.textContent = text;
    return n;
};

const emptyText = (container, text) => {
    container.innerHTML = '';
    container.appendChild(node('p', 'client-empty', text));
};

/* ##################### */
/* Cartes */
/* ##################### */

const renderClientOrders = async () => {
    const container = document.querySelector('#client-orders');
    try {
        const orders = await fetchMyOrders();
        container.innerHTML = '';
        if(orders.length === 0){
            emptyText(container, "Vous n'avez pas encore passé de commande. Vos achats apparaîtront ici.");
            return;
        }
        orders.slice(0, 3).forEach(order => {
            const row = node('div', 'client-order');
            const img = node('img');
            img.src = (order.items[0] && order.items[0].image_url) || '/Images/maillot-placeholder.svg';
            img.alt = '';
            const text = node('div', 'client-order-text');
            const count = order.items.reduce((s, i) => s + i.qty, 0);
            text.appendChild(node('strong', '', `Commande #${String(order.id).padStart(4, '0')}`));
            text.appendChild(node('span', '', `${new Date(order.created_at).toLocaleDateString('fr-FR')} · ${count} article${count > 1 ? 's' : ''} · ${formatPrice(order.total)}`));
            const status = ORDER_STATUS[order.status] || { label: order.status, className: '' };
            row.append(img, text, node('span', 'order-status ' + status.className, status.label));
            container.appendChild(row);
        });
    } catch (err) {
        emptyText(container, 'Impossible de charger vos commandes pour le moment.');
    }
};

const renderClientCart = () => {
    const container = document.querySelector('#client-cart');
    const checkout = document.querySelector('#client-checkout');
    let items = [];
    try {
        items = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
        items = [];
    }

    container.innerHTML = '';
    checkout.hidden = items.length === 0;
    if(items.length === 0){
        emptyText(container, 'Votre panier est vide. Ajoutez un maillot depuis le catalogue.');
        return;
    }

    const count = items.reduce((s, i) => s + i.qty, 0);
    const total = items.reduce((s, i) => s + i.price * i.qty, 0);

    const thumbs = node('div', 'client-cart-thumbs');
    items.slice(0, 4).forEach(item => {
        const img = node('img');
        img.src = item.img || '/Images/maillot-placeholder.svg';
        img.alt = item.name;
        img.title = `${item.qty} × ${item.name}`;
        thumbs.appendChild(img);
    });
    container.appendChild(thumbs);
    container.appendChild(node('p', 'client-cart-total', `${count} article${count > 1 ? 's' : ''} · ${formatPrice(total)}`));
};

const renderClientReco = async () => {
    const container = document.querySelector('#client-reco');
    try {
        const products = await fetchRecommendations();
        container.innerHTML = '';
        if(products.length === 0){
            emptyText(container, 'Nos nouveautés arrivent bientôt.');
            return;
        }
        // Titre adapté quand la suggestion vient d'un club déjà acheté.
        const favourite = products.find(p => p.same_team && p.team_name);
        document.querySelector('#client-reco-title').textContent = favourite
            ? `Pour les fans de ${favourite.team_name}`
            : 'Recommandé pour vous';

        products.forEach(product => {
            const link = node('a', 'client-thumb');
            link.href = `produit.html?id=${product.id}`;
            link.title = product.name;
            const img = node('img');
            img.src = product.image_url;
            img.alt = product.name;
            link.append(img, node('span', '', formatPrice(product.price)));
            container.appendChild(link);
        });
    } catch (err) {
        emptyText(container, 'Impossible de charger les suggestions pour le moment.');
    }
};

const renderClientLeagues = async () => {
    const container = document.querySelector('#client-leagues');
    try {
        const leagues = await fetchLeagues();
        container.innerHTML = '';
        leagues.forEach(league => {
            const link = node('a', 'client-league');
            link.href = 'teams.html?league=' + encodeURIComponent(league.name);
            const img = node('img');
            img.src = league.logo_url;
            img.alt = '';
            link.append(img, node('span', '', league.name));
            container.appendChild(link);
        });
    } catch (err) {
        emptyText(container, 'Impossible de charger les championnats pour le moment.');
    }
};

/* ##################### */
/* Bascule bannière / espace client selon la session */
/* ##################### */

const refreshHome = () => {
    const user = getCurrentUser();
    heroSection.classList.toggle('is-client', !!user);
    clientHome.hidden = !user;
    if(!user) return;

    document.querySelector('#client-firstname').textContent = user.name.split(' ')[0];
    mountProfilePhoto(document.querySelector('#client-avatar'));
    renderClientOrders();
    renderClientCart();
    renderClientReco();
    renderClientLeagues();
};

window.addEventListener('xtra:session', refreshHome);
window.addEventListener('xtra:cart', () => {
    if(getCurrentUser()) renderClientCart();
});

refreshHome();
