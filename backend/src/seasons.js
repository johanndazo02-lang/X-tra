// Le catalogue ne garde que la saison en cours et la précédente.
// Une saison commence en juillet : en octobre 2026, la saison en cours est 2026/2027.
const currentSeasonStart = (date = new Date()) => (date.getMonth() >= 6 ? date.getFullYear() : date.getFullYear() - 1);

const oldestKeptSeasonStart = (date = new Date()) => currentSeasonStart(date) - 1;

module.exports = { currentSeasonStart, oldestKeptSeasonStart };
