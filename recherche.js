const params = new URLSearchParams(window.location.search);
const query = (params.get('q') || '').trim();

const resultsEl = document.querySelector('#search-results');
const headingEl = document.querySelector('#search-heading');

const buildResultCard = (item) => {
    const card = document.createElement('div');
    card.classList.add('kit-item');

    const subtitle = [item.team_name, item.season].filter(Boolean).join(' — ');

    card.innerHTML = `
        <div class="kit-thumb-wrap">
            <a href="produit.html?id=${item.id}" class="kit-thumb-link">
                <div class="kit-thumb">
                    <img src="${item.image_url}" alt="${item.name}">
                </div>
            </a>
        </div>
        <a href="produit.html?id=${item.id}" class="kit-title-link"><h3>${item.name}</h3></a>
        <p>${subtitle || formatPrice(item.price)}</p>
    `;
    return card;
};

const init = async () => {
    if(query.length === 0){
        headingEl.textContent = 'Recherche';
        resultsEl.innerHTML = '<p>Tapez un mot-clé dans la barre de recherche (nom, équipe, championnat...).</p>';
        return;
    }

    headingEl.innerHTML = `Résultats pour <span>« ${query} »</span>`;
    document.title = `X-Tra - Recherche : ${query}`;

    try {
        const results = await searchProducts(query);
        resultsEl.classList.add('kit-shop');

        if(results.length === 0){
            resultsEl.innerHTML = '<p>Aucun maillot ne correspond à votre recherche.</p>';
            return;
        }

        resultsEl.innerHTML = '';
        results.forEach(item => resultsEl.appendChild(buildResultCard(item)));
    } catch (err) {
        resultsEl.innerHTML = '<p>Impossible de lancer la recherche. Vérifiez que le serveur backend est démarré.</p>';
    }
};

init();
