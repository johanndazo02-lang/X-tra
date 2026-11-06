const itemsEl = document.querySelector('#checkout-items');
const totalEl = document.querySelector('#checkout-total-amount');
const form = document.querySelector('#checkout-form');
const errorEl = document.querySelector('#checkout-error');

const cart = (() => {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
        return [];
    }
})();

const renderSummary = () => {
    if(cart.length === 0){
        itemsEl.innerHTML = '<p>Votre panier est vide.</p>';
        form.querySelector('.checkout-submit-btn').disabled = true;
        return;
    }

    itemsEl.innerHTML = cart.map(item => `
        <div class="checkout-item">
            <img src="${item.img}" alt="${item.name}">
            <div class="checkout-item-text">
                <h4>${item.name}</h4>
                <span>${item.qty} x ${formatPrice(item.price)}</span>
            </div>
            <span class="checkout-item-total">${formatPrice(item.price * item.qty)}</span>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    totalEl.textContent = formatPrice(total);
};

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';

    if(!getCurrentUser()){
        window.location.href = 'index.html';
        return;
    }
    if(cart.length === 0) return;

    const address = form.address.value.trim();
    const phone = form.phone.value.trim();
    const paymentMethod = form.payment.value;
    const paid = paymentMethod !== 'livraison';

    const submitBtn = form.querySelector('.checkout-submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Traitement en cours...';

    try {
        const items = cart.map(item => ({ id: item.id, name: item.name, price: item.price, qty: item.qty }));
        const order = await placeOrder(items, paid, address, phone, paymentMethod);

        sessionStorage.setItem('xtra_last_order', JSON.stringify(order));
        localStorage.removeItem(CART_KEY);
        window.location.href = 'confirmation.html';
    } catch (err) {
        errorEl.textContent = err.message;
        submitBtn.disabled = false;
        submitBtn.textContent = 'Confirmer la commande';
    }
});

if(!getCurrentUser()){
    window.location.href = 'index.html';
} else {
    renderSummary();
}
