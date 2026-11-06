const params = new URLSearchParams(window.location.search);
const teamId = params.get('team');

const headingEl = document.querySelector('#team-heading');
const jerseysContainerEl = document.querySelector('#jerseys-container');

const buildKitCard = (item) => {
    const isArchive = item.type === 'Archive historique';
    const card = document.createElement('div');
    card.classList.add('kit-item');

    const subtitle = isArchive ? 'Photos et détails à venir' : `${item.type} — ${formatPrice(item.price)}`;

    const thumb = `
        <div class="kit-thumb">
            <img src="${item.image_url}" alt="${item.name}">
        </div>
    `;
    const title = `<h3>${item.name}</h3>`;

    card.innerHTML = `
        <div class="kit-thumb-wrap">
            ${isArchive ? thumb : `<a href="produit.html?id=${item.id}" class="kit-thumb-link">${thumb}</a>`}
        </div>
        ${isArchive ? title : `<a href="produit.html?id=${item.id}" class="kit-title-link">${title}</a>`}
        <p>${subtitle}</p>
    `;
    return card;
};

const buildActionTile = (iconClass, label, sublabel, onClick) => {
    const tile = document.createElement('div');
    tile.classList.add('kit-item', 'kit-action-tile');
    tile.innerHTML = `
        <div class="kit-thumb-wrap">
            <div class="kit-thumb kit-action-thumb">
                <i class="bx ${iconClass}"></i>
            </div>
        </div>
        <h3>${label}</h3>
        <p>${sublabel}</p>
    `;
    tile.addEventListener('click', onClick);
    return tile;
};

// Au-delà de cette taille, la dernière vignette visible garde sa propre
// photo mais affiche "Regarder tous" au survol, façon boutique officielle.
const MAX_VISIBLE_PER_ROW = 6;

const buildOverlayCard = (item, hiddenCount, onReveal) => {
    const card = buildKitCard(item);
    const thumb = card.querySelector('.kit-thumb');

    const overlay = document.createElement('div');
    overlay.classList.add('kit-overlay');
    overlay.innerHTML = `<span>Regarder tous<br>(+${hiddenCount})</span>`;
    thumb.appendChild(overlay);

    card.classList.add('kit-item-overlay');

    // Cette vignette sert à révéler le reste plutôt qu'à ouvrir sa propre fiche.
    card.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            onReveal();
        });
    });

    return card;
};

const renderRow = (row, items, expanded) => {
    row.innerHTML = '';

    if(items.length <= MAX_VISIBLE_PER_ROW){
        items.forEach(item => row.appendChild(buildKitCard(item)));
        return;
    }

    if(!expanded){
        const visible = items.slice(0, MAX_VISIBLE_PER_ROW - 1);
        const overlayItem = items[MAX_VISIBLE_PER_ROW - 1];
        const hiddenCount = items.length - MAX_VISIBLE_PER_ROW + 1;

        visible.forEach(item => row.appendChild(buildKitCard(item)));
        row.appendChild(buildOverlayCard(overlayItem, hiddenCount, () => renderRow(row, items, true)));
    } else {
        items.forEach(item => row.appendChild(buildKitCard(item)));
        row.appendChild(buildActionTile('bx-chevron-up', 'Voir moins', '', () => renderRow(row, items, false)));
    }
};

const renderJerseys = (team, products) => {
    headingEl.innerHTML = `Maillots<span> ${team.name}</span>`;

    if(products.length === 0){
        jerseysContainerEl.innerHTML = '<p>Aucun produit enregistré pour cette équipe pour le moment.</p>';
        return;
    }

    jerseysContainerEl.innerHTML = '';
    jerseysContainerEl.classList.add('kit-shop');

    // Un même produit de la saison 2026/2027 (maillot, avant-match,
    // entraînement, voyage...) appartient à la même case "2026/2027" :
    // on regroupe uniquement par saison, plus par catégorie.
    const bySeason = new Map();
    products.forEach(item => {
        if(!bySeason.has(item.season)) bySeason.set(item.season, []);
        bySeason.get(item.season).push(item);
    });

    // Chaque section de saison est repliable indépendamment des autres :
    // les plus récentes sont ouvertes par défaut, les plus anciennes fermées.
    const buildSeasonBlock = (season, items, expandedByDefault) => {
        const seasonBlock = document.createElement('div');
        seasonBlock.classList.add('kit-season');

        const header = document.createElement('div');
        header.classList.add('kit-season-header');

        const label = document.createElement('h3');
        label.classList.add('kit-season-label');
        label.textContent = season;
        header.appendChild(label);

        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.classList.add('kit-season-toggle');
        header.appendChild(toggleBtn);

        seasonBlock.appendChild(header);

        const row = document.createElement('div');
        row.classList.add('kit-row');
        seasonBlock.appendChild(row);

        const setExpanded = (expanded) => {
            row.hidden = !expanded;
            toggleBtn.textContent = expanded ? 'Voir moins' : 'Voir cette période';
            toggleBtn.classList.toggle('is-expanded', expanded);
            if(expanded){
                renderRow(row, items, false);
            } else {
                row.innerHTML = '';
            }
        };

        toggleBtn.addEventListener('click', () => setExpanded(row.hidden));
        setExpanded(expandedByDefault);

        return seasonBlock;
    };

    const MAX_VISIBLE_SEASONS = 3;
    const seasonEntries = Array.from(bySeason.entries());

    seasonEntries.forEach(([season, items], index) => {
        jerseysContainerEl.appendChild(buildSeasonBlock(season, items, index < MAX_VISIBLE_SEASONS));
    });
};

const renderTimeline = (container, entries) => {
    container.innerHTML = '';
    entries.forEach((entry, index) => {
        const item = document.createElement('div');
        item.classList.add('timeline-item', index % 2 === 0 ? 'timeline-item-top' : 'timeline-item-bottom');

        const bubble = document.createElement('div');
        bubble.classList.add('timeline-bubble');
        bubble.title = `${entry.name} (${entry.period})`;
        const name = document.createElement('strong');
        name.textContent = entry.name;
        const period = document.createElement('span');
        period.textContent = entry.period;
        bubble.appendChild(name);
        bubble.appendChild(period);

        const dot = document.createElement('div');
        dot.classList.add('timeline-dot');

        item.appendChild(bubble);
        item.appendChild(dot);
        container.appendChild(item);
    });
};

/* ##################### */
/* Slider de la frise : flèches et fondus seulement si elle déborde */
/* ##################### */

const timelineSlider = document.querySelector('.timeline-slider');

const visibleTrack = () => timelineSlider.querySelector('.timeline-track:not(.hidden)');

const updateTimelineSlider = () => {
    const track = visibleTrack();
    if(!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    timelineSlider.classList.toggle('is-scrollable', maxScroll > 2);
    timelineSlider.classList.toggle('can-prev', track.scrollLeft > 2);
    timelineSlider.classList.toggle('can-next', track.scrollLeft < maxScroll - 2);
};

timelineSlider.querySelectorAll('.timeline-track').forEach(track => {
    track.addEventListener('scroll', updateTimelineSlider, { passive: true });
});

timelineSlider.querySelectorAll('.timeline-nav').forEach(btn => {
    btn.addEventListener('click', () => {
        const track = visibleTrack();
        const direction = btn.classList.contains('timeline-nav-prev') ? -1 : 1;
        track.scrollBy({ left: direction * track.clientWidth * 0.7, behavior: 'smooth' });
    });
});

window.addEventListener('resize', updateTimelineSlider);

const HISTORY_PREVIEW_LENGTH = 320;

const renderHistory = (container, text) => {
    if(!text){
        container.innerHTML = '';
        return;
    }

    if(text.length <= HISTORY_PREVIEW_LENGTH){
        container.innerHTML = `<p>${text}</p>`;
        return;
    }

    const preview = text.slice(0, HISTORY_PREVIEW_LENGTH).trim();
    const paragraph = document.createElement('p');
    const textSpan = document.createElement('span');
    textSpan.textContent = preview + '… ';
    const toggle = document.createElement('a');
    toggle.href = '#';
    toggle.classList.add('history-toggle');
    toggle.textContent = 'Afficher plus';

    let expanded = false;
    toggle.addEventListener('click', (e) => {
        e.preventDefault();
        expanded = !expanded;
        textSpan.textContent = expanded ? text + ' ' : preview + '… ';
        toggle.textContent = expanded ? 'Afficher moins' : 'Afficher plus';
    });

    paragraph.appendChild(textSpan);
    paragraph.appendChild(toggle);
    container.innerHTML = '';
    container.appendChild(paragraph);
};

const renderTeamInfo = (team) => {
    const section = document.querySelector('#team-info-section');
    const suppliers = team.suppliers ? JSON.parse(team.suppliers) : null;
    const sponsors = team.sponsors ? JSON.parse(team.sponsors) : null;

    if(!suppliers && !sponsors && !team.history){
        section.hidden = true;
        return;
    }
    section.hidden = false;

    const suppliersTrack = document.querySelector('#suppliers-timeline');
    const sponsorsTrack = document.querySelector('#sponsors-timeline');

    if(suppliers) renderTimeline(suppliersTrack, suppliers);
    if(sponsors) renderTimeline(sponsorsTrack, sponsors);

    // Un onglet sans données n'est pas affiché ; sans aucune frise, on masque tout le bloc.
    const available = { suppliers: !!suppliers, sponsors: !!sponsors };
    const tabs = document.querySelectorAll('.timeline-tab');
    const showTab = (name) => {
        tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === name));
        suppliersTrack.classList.toggle('hidden', name !== 'suppliers');
        sponsorsTrack.classList.toggle('hidden', name !== 'sponsors');
        visibleTrack().scrollLeft = 0;
        updateTimelineSlider();
    };

    tabs.forEach(tab => {
        tab.hidden = !available[tab.dataset.tab];
        tab.addEventListener('click', () => showTab(tab.dataset.tab));
    });
    document.querySelector('.timeline-tabs').hidden = !suppliers && !sponsors;
    timelineSlider.hidden = !suppliers && !sponsors;

    if(suppliers || sponsors){
        showTab(suppliers ? 'suppliers' : 'sponsors');
    }

    renderHistory(document.querySelector('#team-history'), team.history);
};

const init = async () => {
    if(!teamId){
        jerseysContainerEl.innerHTML = '<p>Aucune équipe sélectionnée.</p>';
        return;
    }

    try {
        const team = await fetchTeam(teamId);
        const products = await fetchTeamJerseys(teamId);
        renderJerseys(team, products);
        renderTeamInfo(team);
    } catch (err) {
        jerseysContainerEl.innerHTML = '<p>Impossible de charger les produits. Vérifiez que le serveur backend est démarré.</p>';
    }
};

init();
