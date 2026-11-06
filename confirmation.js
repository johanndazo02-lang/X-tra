const sectionEl = document.querySelector('#confirmation-section');

const paymentLabels = {
    'orange-money': 'Orange Money',
    'mvola': 'Mvola',
    'airtel-money': 'Airtel Money',
    'livraison': 'Paiement à la livraison'
};

const init = () => {
    const raw = sessionStorage.getItem('xtra_last_order');
    if(!raw){
        sectionEl.innerHTML = `
            <div class="confirmation-box">
                <i class='bx bx-error-circle confirmation-icon confirmation-icon-error'></i>
                <h1>Aucune commande à afficher</h1>
                <p>Il semble que vous ayez atteint cette page directement.</p>
                <a href="index.html" class="btn">Retour à la boutique</a>
            </div>
        `;
        return;
    }

    const order = JSON.parse(raw);
    const paymentLabel = paymentLabels[order.payment_method] || order.payment_method || '—';
    const isPaid = order.status === 'payé';

    sectionEl.innerHTML = `
        <div class="confirmation-box">
            <i class='bx bx-check-circle confirmation-icon'></i>
            <h1>Merci pour votre commande !</h1>
            <p>Commande <strong>#${order.id}</strong> enregistrée avec succès.</p>

            <div class="confirmation-status ${isPaid ? 'is-paid' : 'is-unpaid'}">
                ${isPaid ? 'Paiement confirmé' : 'À régler à la livraison'}
            </div>

            <div class="confirmation-details">
                <div class="product-row"><span class="product-row-label">Mode de paiement</span><span class="product-row-value">${paymentLabel}</span></div>
                <div class="product-row"><span class="product-row-label">Adresse de livraison</span><span class="product-row-value">${order.address || '—'}</span></div>
                <div class="product-row"><span class="product-row-label">Téléphone</span><span class="product-row-value">${order.phone || '—'}</span></div>
                <div class="product-row"><span class="product-row-label">Total</span><span class="product-row-value">${formatPrice(order.total)}</span></div>
            </div>

            <div class="confirmation-items">
                ${order.items.map(item => `
                    <div class="checkout-item">
                        <div class="checkout-item-text">
                            <h4>${item.name}</h4>
                            <span>${item.qty} x ${formatPrice(item.price)}</span>
                        </div>
                        <span class="checkout-item-total">${formatPrice(item.price * item.qty)}</span>
                    </div>
                `).join('')}
            </div>

            <div class="confirmation-actions">
                <a href="dashboard.html" class="btn">Voir mes commandes</a>
                <a href="index.html" class="btn-user">Continuer mes achats</a>
            </div>
        </div>
    `;

    sessionStorage.removeItem('xtra_last_order');
};

init();
