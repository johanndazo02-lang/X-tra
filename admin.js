/* ##################### */
/* Administration — tableau de bord des ventes */
/* ##################### */

const SVG_NS = 'http://www.w3.org/2000/svg';
const DAY = 86400000;

const paymentLabels = {
    'orange-money': 'Orange Money',
    'mvola': 'Mvola',
    'airtel-money': 'Airtel Money',
    'livraison': 'À la livraison',
    'non-precise': 'Non précisé'
};

// Nuances de gris (fond sombre) : identité portée aussi par la légende et les %.
const SPLIT_SHADES = ['#f2f2f2', '#b3b3b3', '#808080', '#666666'];
const SPLIT_MAX = 4;

const loginEl = document.querySelector('#admin-login');
const appEl = document.querySelector('#admin-app');
const contentEl = document.querySelector('#admin-content');
const messageEl = document.querySelector('#admin-message');
const tooltipEl = document.querySelector('#admin-tooltip');
const fromInput = document.querySelector('#filter-from');
const toInput = document.querySelector('#filter-to');

let lastData = null;
let currentSplit = 'by_league';
let currentStatus = 'all';

/* ##################### */
/* Utilitaires */
/* ##################### */

// Date du jour à Madagascar (UTC+3), au format AAAA-MM-JJ.
const isoDate = (date) => new Date(date.getTime() + 3 * 3600000).toISOString().slice(0, 10);

const formatCompact = (amount) => {
    if(amount >= 1000000) return (amount / 1000000).toLocaleString('fr-FR', { maximumFractionDigits: 1 }) + 'M';
    if(amount >= 1000) return Math.round(amount / 1000) + 'K';
    return String(amount);
};

const formatDay = (iso, options) => new Date(iso + 'T00:00:00').toLocaleDateString('fr-FR', options);

const timeAgo = (isoString) => {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.round(diff / 60000);
    if(minutes < 1) return "à l'instant";
    if(minutes < 60) return `il y a ${minutes} min`;
    const hours = Math.round(minutes / 60);
    if(hours < 24) return `il y a ${hours} h`;
    const days = Math.round(hours / 24);
    if(days < 30) return `il y a ${days} j`;
    return new Date(isoString).toLocaleDateString('fr-FR');
};

const el = (tag, className, text) => {
    const node = document.createElement(tag);
    if(className) node.className = className;
    if(text !== undefined) node.textContent = text;
    return node;
};

const svgEl = (tag, attrs) => {
    const node = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
};

const emptyRow = (tbody, colspan, text) => {
    const tr = el('tr');
    const td = el('td', 'admin-muted', text);
    td.colSpan = colspan;
    tr.appendChild(td);
    tbody.appendChild(tr);
};

const showTooltip = (x, y, value, label) => {
    tooltipEl.innerHTML = '';
    tooltipEl.appendChild(el('strong', '', value));
    tooltipEl.appendChild(el('span', '', label));
    tooltipEl.classList.remove('hidden');
    const { width, height } = tooltipEl.getBoundingClientRect();
    tooltipEl.style.left = Math.min(Math.max(8, x - width / 2), window.innerWidth - width - 8) + 'px';
    tooltipEl.style.top = (y - height - 12 < 8 ? y + 16 : y - height - 12) + 'px';
};

const hideTooltip = () => tooltipEl.classList.add('hidden');

/* ##################### */
/* Bandeau de synthèse */
/* ##################### */

const renderStrip = (data) => {
    const { summary, store } = data;
    const strip = document.querySelector('#admin-strip');
    strip.innerHTML = '';

    const items = [
        ['commandes', summary.orders, `payées : ${summary.paid_orders} · impayées : ${summary.unpaid_orders}`],
        ["chiffre d'affaires", formatPrice(summary.revenue), summary.pending > 0 ? `en attente : ${formatPrice(summary.pending)}` : ''],
        ['panier moyen', formatPrice(summary.average_basket), ''],
        ['articles vendus', summary.items_sold, ''],
        ['clients', summary.customers, `comptes : ${store.accounts} · nouveaux : ${store.new_accounts}`],
        ['catalogue', store.products, `produits · ${store.teams} équipes`]
    ];

    items.forEach(([label, value, note]) => {
        const item = el('div', 'admin-strip-item');
        item.appendChild(el('span', 'admin-muted', label + ' : '));
        item.appendChild(el('strong', '', value));
        if(note) item.appendChild(el('span', 'admin-strip-note', note));
        strip.appendChild(item);
    });
};

/* ##################### */
/* Courbe du chiffre d'affaires (lissage monotone : jamais sous zéro) */
/* ##################### */

const monotonePath = (pts) => {
    if(pts.length < 3) return 'M' + pts.map(p => `${p.x},${p.y}`).join(' L');
    const n = pts.length;
    const slopes = [];
    for(let i = 0; i < n - 1; i++){
        slopes.push((pts[i + 1].y - pts[i].y) / (pts[i + 1].x - pts[i].x));
    }
    const tangents = [slopes[0]];
    for(let i = 1; i < n - 1; i++){
        tangents.push(slopes[i - 1] * slopes[i] <= 0 ? 0 : (slopes[i - 1] + slopes[i]) / 2);
    }
    tangents.push(slopes[n - 2]);
    for(let i = 0; i < n - 1; i++){
        if(slopes[i] === 0){
            tangents[i] = 0;
            tangents[i + 1] = 0;
            continue;
        }
        const a = tangents[i] / slopes[i];
        const b = tangents[i + 1] / slopes[i];
        const h = a * a + b * b;
        if(h > 9){
            const t = 3 / Math.sqrt(h);
            tangents[i] = t * a * slopes[i];
            tangents[i + 1] = t * b * slopes[i];
        }
    }
    let d = `M${pts[0].x},${pts[0].y}`;
    for(let i = 0; i < n - 1; i++){
        const dx = (pts[i + 1].x - pts[i].x) / 3;
        d += ` C${pts[i].x + dx},${pts[i].y + tangents[i] * dx} ${pts[i + 1].x - dx},${pts[i + 1].y - tangents[i + 1] * dx} ${pts[i + 1].x},${pts[i + 1].y}`;
    }
    return d;
};

const niceMax = (value) => {
    if(value <= 0) return 1000;
    const magnitude = Math.pow(10, Math.floor(Math.log10(value)));
    const step = [1, 2, 2.5, 5, 10].find(s => s * magnitude >= value / 4) * magnitude;
    return Math.ceil(value / step) * step;
};

const bucketLabel = (point, bucket) => bucket === 'week'
    ? 'semaine du ' + formatDay(point.date, { day: 'numeric', month: 'long', year: 'numeric' })
    : formatDay(point.date, { weekday: 'long', day: 'numeric', month: 'long' });

const renderRevenueChart = (timeline, bucket) => {
    const container = document.querySelector('#revenue-chart');
    container.innerHTML = '';

    const width = container.clientWidth;
    const height = 240;
    const margin = { top: 12, right: 12, bottom: 28, left: 56 };
    const plotW = width - margin.left - margin.right;
    const plotH = height - margin.top - margin.bottom;
    const last = timeline.length - 1;

    const maxY = niceMax(Math.max(...timeline.map(p => p.revenue)));
    const x = (i) => margin.left + (last === 0 ? plotW / 2 : (i / last) * plotW);
    const y = (v) => margin.top + plotH - (v / maxY) * plotH;

    const svg = svgEl('svg', { width, height, viewBox: `0 0 ${width} ${height}`, role: 'img', 'aria-label': "Courbe du chiffre d'affaires" });

    for(let i = 0; i <= 4; i++){
        const value = (maxY / 4) * i;
        svg.appendChild(svgEl('line', { x1: margin.left, x2: width - margin.right, y1: y(value), y2: y(value), class: 'chart-grid' }));
        const tick = svgEl('text', { x: margin.left - 8, y: y(value) + 4, class: 'chart-tick', 'text-anchor': 'end' });
        tick.textContent = formatCompact(value);
        svg.appendChild(tick);
    }

    const tickCount = Math.min(timeline.length, width < 520 ? 3 : 7);
    for(let i = 0; i < tickCount; i++){
        const index = tickCount === 1 ? 0 : Math.round((i / (tickCount - 1)) * last);
        const anchor = tickCount === 1 ? 'middle' : i === 0 ? 'start' : i === tickCount - 1 ? 'end' : 'middle';
        const tick = svgEl('text', { x: x(index), y: height - 8, class: 'chart-tick', 'text-anchor': anchor });
        tick.textContent = formatDay(timeline[index].date, { day: 'numeric', month: 'short' });
        svg.appendChild(tick);
    }

    const pts = timeline.map((p, i) => ({ x: x(i), y: y(p.revenue) }));
    const line = monotonePath(pts);
    svg.appendChild(svgEl('path', { d: `${line} L${x(last)},${y(0)} L${x(0)},${y(0)} Z`, class: 'chart-area' }));
    svg.appendChild(svgEl('path', { d: line, class: 'chart-line' }));

    // Points : seulement les jours avec ventes, plus le dernier point.
    timeline.forEach((p, i) => {
        if(p.revenue > 0 || i === last){
            svg.appendChild(svgEl('circle', { cx: x(i), cy: y(p.revenue), r: 4, class: 'chart-dot' }));
        }
    });

    const crosshair = svgEl('line', { y1: margin.top, y2: margin.top + plotH, class: 'chart-crosshair hidden' });
    const hoverDot = svgEl('circle', { r: 5, class: 'chart-dot chart-dot-hover hidden' });
    svg.appendChild(crosshair);
    svg.appendChild(hoverDot);

    const overlay = svgEl('rect', { x: margin.left, y: margin.top, width: plotW, height: plotH, class: 'chart-overlay', tabindex: 0 });
    svg.appendChild(overlay);

    const focusIndex = (index) => {
        const rect = svg.getBoundingClientRect();
        const point = timeline[index];
        crosshair.setAttribute('x1', x(index));
        crosshair.setAttribute('x2', x(index));
        hoverDot.setAttribute('cx', x(index));
        hoverDot.setAttribute('cy', y(point.revenue));
        crosshair.classList.remove('hidden');
        hoverDot.classList.remove('hidden');
        showTooltip(rect.left + x(index), rect.top + y(point.revenue), formatPrice(point.revenue),
            `${bucketLabel(point, bucket)} · ${point.orders} commande${point.orders > 1 ? 's' : ''}`);
    };
    const clear = () => {
        crosshair.classList.add('hidden');
        hoverDot.classList.add('hidden');
        hideTooltip();
    };

    overlay.addEventListener('pointermove', (e) => {
        const rect = svg.getBoundingClientRect();
        const ratio = (e.clientX - rect.left - margin.left) / plotW;
        focusIndex(Math.max(0, Math.min(last, Math.round(ratio * last))));
    });
    overlay.addEventListener('pointerleave', clear);
    overlay.addEventListener('focus', () => focusIndex(last));
    overlay.addEventListener('blur', clear);

    container.appendChild(svg);
};

const renderTimelineTable = (timeline, bucket) => {
    const tbody = document.querySelector('#timeline-table');
    tbody.innerHTML = '';
    // Les périodes sans vente sont omises pour que le tableau reste lisible.
    const rows = timeline.filter(p => p.orders > 0).reverse();
    if(rows.length === 0){
        emptyRow(tbody, 3, 'aucune vente sur cette période');
        return;
    }
    rows.forEach(point => {
        const tr = el('tr');
        tr.appendChild(el('td', '', bucketLabel(point, bucket)));
        tr.appendChild(el('td', 'num', point.orders));
        tr.appendChild(el('td', 'num', formatPrice(point.revenue)));
        tbody.appendChild(tr);
    });
};

/* ##################### */
/* Anneau de répartition */
/* ##################### */

const splitLabel = (key, label) => key === 'by_payment' ? (paymentLabels[label] || label) : label;

const renderSplit = () => {
    const container = document.querySelector('#split-chart');
    const legend = document.querySelector('#split-legend');
    container.innerHTML = '';
    legend.innerHTML = '';

    const rows = lastData[currentSplit];
    if(rows.length === 0){
        container.appendChild(el('p', 'admin-muted', 'aucune vente sur cette période'));
        return;
    }

    // Au-delà de 4 parts, le reste est regroupé dans « Autres ».
    let slices = rows.map(r => ({ label: splitLabel(currentSplit, r.label), revenue: r.revenue, qty: r.qty }));
    if(slices.length > SPLIT_MAX){
        const rest = slices.slice(SPLIT_MAX - 1);
        slices = slices.slice(0, SPLIT_MAX - 1).concat({
            label: 'Autres',
            revenue: rest.reduce((s, r) => s + r.revenue, 0),
            qty: rest.reduce((s, r) => s + r.qty, 0)
        });
    }
    const total = slices.reduce((s, r) => s + r.revenue, 0) || 1;

    const size = 200;
    const r = 80;
    const c = size / 2;
    const svg = svgEl('svg', { width: size, height: size, viewBox: `0 0 ${size} ${size}`, role: 'img', 'aria-label': 'Répartition des ventes' });

    let angle = -Math.PI / 2;
    slices.forEach((slice, i) => {
        const share = slice.revenue / total;
        const shade = SPLIT_SHADES[i];
        const percent = Math.round(share * 100);
        let mark;
        if(share >= 0.9999){
            mark = svgEl('circle', { cx: c, cy: c, r, class: 'donut-slice', stroke: shade });
        } else {
            const end = angle + share * Math.PI * 2;
            // Espace de 2px entre deux parts voisines.
            const gap = Math.min(3 / r, (end - angle) / 3);
            const a0 = angle + gap / 2;
            const a1 = end - gap / 2;
            const large = a1 - a0 > Math.PI ? 1 : 0;
            mark = svgEl('path', {
                d: `M${c + r * Math.cos(a0)},${c + r * Math.sin(a0)} A${r},${r} 0 ${large} 1 ${c + r * Math.cos(a1)},${c + r * Math.sin(a1)}`,
                class: 'donut-slice',
                stroke: shade
            });
            angle = end;
        }
        mark.setAttribute('tabindex', 0);
        const show = (e) => {
            const rect = mark.getBoundingClientRect();
            showTooltip(e.clientX || rect.left + rect.width / 2, e.clientY || rect.top, formatPrice(slice.revenue), `${slice.label} · ${percent} % · ${slice.qty} article${slice.qty > 1 ? 's' : ''}`);
        };
        mark.addEventListener('pointermove', show);
        mark.addEventListener('focus', show);
        mark.addEventListener('pointerleave', hideTooltip);
        mark.addEventListener('blur', hideTooltip);
        svg.appendChild(mark);

        const li = el('li');
        const swatch = el('span', 'admin-swatch');
        swatch.style.background = shade;
        li.appendChild(swatch);
        li.appendChild(el('span', 'admin-legend-label', slice.label));
        li.appendChild(el('span', 'admin-legend-value', `${percent} % · ${formatCompact(slice.revenue)}AR`));
        legend.appendChild(li);
    });

    const centerValue = svgEl('text', { x: c, y: c + 2, class: 'donut-total', 'text-anchor': 'middle' });
    centerValue.textContent = formatCompact(total) + 'AR';
    const centerLabel = svgEl('text', { x: c, y: c + 20, class: 'donut-caption', 'text-anchor': 'middle' });
    centerLabel.textContent = 'total';
    svg.appendChild(centerValue);
    svg.appendChild(centerLabel);

    container.appendChild(svg);
};

/* ##################### */
/* Meilleures ventes */
/* ##################### */

const renderTopProducts = (rows) => {
    const container = document.querySelector('#top-products');
    container.innerHTML = '';
    if(rows.length === 0){
        container.appendChild(el('p', 'admin-muted', 'aucune vente sur cette période'));
        return;
    }
    const max = Math.max(...rows.map(r => r.revenue)) || 1;
    rows.forEach(row => {
        const item = el('div', 'admin-bar-row');
        item.tabIndex = 0;
        const name = el('span', 'admin-bar-label', row.label);
        name.title = row.label;
        const track = el('span', 'admin-bar-track');
        const bar = el('span', 'admin-bar-fill');
        bar.style.width = Math.max(2, (row.revenue / max) * 100) + '%';
        track.appendChild(bar);
        item.appendChild(name);
        item.appendChild(track);
        item.appendChild(el('span', 'admin-bar-value', formatCompact(row.revenue) + 'AR'));

        const show = () => {
            const rect = bar.getBoundingClientRect();
            showTooltip(rect.right, rect.top, formatPrice(row.revenue), `${row.label} · ${row.qty} article${row.qty > 1 ? 's' : ''}`);
        };
        item.addEventListener('pointerenter', show);
        item.addEventListener('focus', show);
        item.addEventListener('pointerleave', hideTooltip);
        item.addEventListener('blur', hideTooltip);
        container.appendChild(item);
    });
};

/* ##################### */
/* Comparaison avec la période précédente */
/* ##################### */

const renderCompare = (data) => {
    const { summary, previous } = data;
    const tbody = document.querySelector('#compare-table');
    tbody.innerHTML = '';

    const days = Math.round((new Date(data.to) - new Date(data.from)) / DAY) + 1;
    const prevEnd = new Date(new Date(data.from + 'T00:00:00') - DAY);
    const prevStart = new Date(prevEnd - (days - 1) * DAY);
    document.querySelector('#compare-caption').textContent =
        `${days} jour${days > 1 ? 's' : ''} vs ${prevStart.toLocaleDateString('fr-FR')} → ${prevEnd.toLocaleDateString('fr-FR')}`;

    const rows = [
        ["chiffre d'affaires", summary.revenue, previous.revenue, formatPrice],
        ['commandes payées', summary.paid_orders, previous.paid_orders, String],
        ['panier moyen', summary.average_basket, previous.average_basket, formatPrice],
        ['articles vendus', summary.items_sold, previous.items_sold, String],
        ['clients', summary.customers, previous.customers, String],
        ['montant impayé', summary.pending, previous.pending, formatPrice]
    ];

    rows.forEach(([label, now, before, format]) => {
        const tr = el('tr');
        tr.appendChild(el('td', '', label));
        tr.appendChild(el('td', 'num', format(now)));
        tr.appendChild(el('td', 'num admin-muted', format(before)));
        let delta;
        if(before === 0){
            delta = now === 0 ? '—' : 'nouveau';
        } else {
            const change = Math.round(((now - before) / before) * 100);
            delta = `${change > 0 ? '▲ +' : change < 0 ? '▼ ' : ''}${change} %`;
        }
        tr.appendChild(el('td', 'num', delta));
        tbody.appendChild(tr);
    });
};

/* ##################### */
/* Commandes */
/* ##################### */

const renderOrders = () => {
    const tbody = document.querySelector('#orders-table');
    tbody.innerHTML = '';
    const orders = lastData.orders.filter(o => currentStatus === 'all' || o.status === currentStatus);

    if(orders.length === 0){
        emptyRow(tbody, 7, 'aucune commande pour ce filtre');
        return;
    }

    orders.forEach(order => {
        const tr = el('tr');
        tr.appendChild(el('td', 'admin-id', '#' + String(order.id).padStart(4, '0')));
        tr.appendChild(el('td', 'admin-strong', order.customer));
        tr.appendChild(el('td', 'num', order.items));
        tr.appendChild(el('td', '', paymentLabels[order.payment_method || 'non-precise'] || order.payment_method));
        tr.appendChild(el('td', 'num admin-strong', formatPrice(order.total)));
        const dateTd = el('td', '', timeAgo(order.created_at));
        dateTd.title = new Date(order.created_at).toLocaleString('fr-FR');
        tr.appendChild(dateTd);
        const statusTd = el('td');
        const statusClass = { 'payé': 'is-paid', 'impayé': 'is-unpaid', 'annulé': 'is-cancelled' }[order.status];
        statusTd.appendChild(el('span', 'admin-status ' + statusClass, order.status));
        tr.appendChild(statusTd);
        tbody.appendChild(tr);
    });
};

/* ##################### */
/* Chargement */
/* ##################### */

const render = (data) => {
    renderStrip(data);
    document.querySelector('#timeline-caption').textContent =
        (data.bucket === 'week' ? 'par semaine' : 'par jour') + ' · commandes payées';
    renderRevenueChart(data.timeline, data.bucket);
    renderTimelineTable(data.timeline, data.bucket);
    renderSplit();
    renderTopProducts(data.top_products);
    renderCompare(data);
    renderOrders();
    document.querySelector('#admin-updated').textContent = new Date().toLocaleString('fr-FR');
};

const showLogin = (message) => {
    clearAdminSession();
    appEl.classList.add('hidden');
    loginEl.classList.remove('hidden');
    document.querySelector('#admin-login-error').textContent = message || '';
};

const loadStats = async () => {
    if(!fromInput.value || !toInput.value || fromInput.value > toInput.value){
        messageEl.textContent = 'Choisissez une date de début antérieure à la date de fin.';
        messageEl.classList.remove('hidden');
        return;
    }
    document.querySelectorAll('[data-days]').forEach(btn => {
        const from = isoDate(new Date(Date.now() - (Number(btn.dataset.days) - 1) * DAY));
        btn.classList.toggle('active', fromInput.value === from && toInput.value === isoDate(new Date()));
    });

    history.replaceState(null, '', `?du=${fromInput.value}&au=${toInput.value}${window.location.hash}`);

    // Pendant le rechargement, l'affichage précédent reste visible, atténué.
    contentEl.classList.add('is-loading');
    try {
        lastData = await fetchSalesStats(fromInput.value, toInput.value);
        messageEl.classList.add('hidden');
        contentEl.classList.remove('hidden');
        render(lastData);
    } catch (err) {
        if(err.status === 401 || err.status === 403){
            showLogin(err.status === 403 ? "Ce compte n'a pas accès à l'administration." : 'Session expirée, reconnectez-vous.');
            return;
        }
        messageEl.textContent = err.status === 400
            ? err.message
            : 'Impossible de charger les statistiques. Vérifiez que le serveur backend est démarré.';
        messageEl.classList.remove('hidden');
        if(!lastData) contentEl.classList.add('hidden');
    } finally {
        contentEl.classList.remove('is-loading');
    }
};

const setRange = (days) => {
    toInput.value = isoDate(new Date());
    fromInput.value = isoDate(new Date(Date.now() - (days - 1) * DAY));
};

const showApp = () => {
    const admin = getAdminUser();
    loginEl.classList.add('hidden');
    appEl.classList.remove('hidden');
    document.querySelector('#admin-name').textContent = admin ? admin.name : '';
    const params = new URLSearchParams(window.location.search);
    const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v || '');
    if(isDate(params.get('du')) && isDate(params.get('au'))){
        fromInput.value = params.get('du');
        toInput.value = params.get('au');
    } else if(!fromInput.value){
        setRange(30);
    }
    loadStats();
    // Défini par admin-manage.js (chargé après ce fichier).
    if(typeof showView === 'function') showView();
};

/* ##################### */
/* Événements */
/* ##################### */

document.querySelector('#admin-login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const errorEl = document.querySelector('#admin-login-error');
    const submitBtn = form.querySelector('button[type="submit"]');
    errorEl.textContent = '';
    submitBtn.disabled = true;
    try {
        await apiAdminLogin(form.email.value.trim().toLowerCase(), form.password.value);
        form.reset();
        showApp();
    } catch (err) {
        errorEl.textContent = err.message === 'Failed to fetch'
            ? 'Serveur injoignable. Vérifiez que le backend est démarré.'
            : err.message;
    } finally {
        submitBtn.disabled = false;
    }
});

document.querySelector('#admin-logout').addEventListener('click', () => showLogin());
document.querySelector('#admin-refresh').addEventListener('click', loadStats);
fromInput.addEventListener('change', loadStats);
toInput.addEventListener('change', loadStats);

document.querySelectorAll('[data-days]').forEach(btn => {
    btn.addEventListener('click', () => {
        setRange(Number(btn.dataset.days));
        loadStats();
    });
});

document.querySelectorAll('[data-split]').forEach(btn => {
    btn.addEventListener('click', () => {
        currentSplit = btn.dataset.split;
        document.querySelectorAll('[data-split]').forEach(b => b.classList.toggle('active', b === btn));
        if(lastData) renderSplit();
    });
});

document.querySelectorAll('[data-status]').forEach(btn => {
    btn.addEventListener('click', () => {
        currentStatus = btn.dataset.status;
        document.querySelectorAll('[data-status]').forEach(b => b.classList.toggle('active', b === btn));
        if(lastData) renderOrders();
    });
});

let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if(lastData) renderRevenueChart(lastData.timeline, lastData.bucket);
    }, 150);
});

if(getAdminToken()){
    showApp();
} else {
    showLogin();
}
