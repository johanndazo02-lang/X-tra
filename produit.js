const params = new URLSearchParams(window.location.search);
const productId = params.get('id');

const detailEl = document.querySelector('#product-detail');

const infoRow = (label, valueHtml) => `
    <div class="product-row">
        <span class="product-row-label">${label}</span>
        <span class="product-row-value">${valueHtml}</span>
    </div>
`;

const renderProduct = (product) => {
    document.title = `X-Tra - ${product.name}`;

    const sizes = (product.sizes || 'S,M,L,XL,XXL').split(',').map(s => s.trim()).filter(Boolean);

    const teamRow = product.team_name
        ? infoRow('Équipe', `${product.team_crest ? `<img class="product-row-icon" src="${product.team_crest}" alt="">` : ''}${product.team_name}`)
        : '';
    const leagueRow = product.league_name
        ? infoRow('Compétition', `${product.league_logo ? `<img class="product-row-icon" src="${product.league_logo}" alt="">` : ''}${product.league_name}`)
        : '';

    detailEl.innerHTML = `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image_url}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h1 class="product-title">${product.name}</h1>

                <div class="product-details">
                    ${teamRow}
                    ${infoRow('Saison', product.season || '—')}
                    ${infoRow('Type', product.type || '—')}
                    ${infoRow('Conception', product.design || 'Non précisée')}
                    ${infoRow('Couleurs', product.colors || 'Voir photo')}
                    ${infoRow('Marque', product.brand || 'Non précisée')}
                    ${leagueRow}
                    ${infoRow('Classement', '<span class="product-stars">☆☆☆☆☆</span> <span class="product-no-votes">pas de votes</span>')}
                </div>

                <div class="product-size-block">
                    <span class="product-row-label">Taille</span>
                    <div class="product-sizes" id="size-selector">
                        ${sizes.map((s, i) => `<button type="button" class="size-btn${i === 0 ? ' active' : ''}" data-size="${s}">${s}</button>`).join('')}
                    </div>
                </div>

                <div class="product-price">${formatPrice(product.price)}</div>

                <button type="button" class="btn product-order-btn" id="order-btn">Commander</button>
            </div>
        </div>
    `;

    let selectedSize = sizes[0] || null;

    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedSize = btn.dataset.size;
        });
    });

    document.querySelector('#order-btn').addEventListener('click', () => {
        const name = selectedSize ? `${product.name} (Taille ${selectedSize})` : product.name;
        addToCart(String(product.id) + (selectedSize ? '-' + selectedSize : ''), name, product.price, product.image_url);
        cartContent.classList.add('active');
    });
};

const init = async () => {
    if(!productId){
        detailEl.innerHTML = '<p>Aucun produit sélectionné.</p>';
        return;
    }

    try {
        const product = await fetchProduct(productId);
        renderProduct(product);
    } catch (err) {
        detailEl.innerHTML = '<p>Impossible de charger ce produit. Vérifiez que le serveur backend est démarré.</p>';
    }
};

init();
