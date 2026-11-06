const params = new URLSearchParams(window.location.search);
const leagueName = params.get('league');

const headingEl = document.querySelector('#league-heading');
const teamsContainerEl = document.querySelector('#teams-container');

const renderTeams = (league, teams) => {
    headingEl.innerHTML = `Équipes<span> ${league.name}</span>`;

    if(teams.length === 0){
        teamsContainerEl.innerHTML = '<p>Aucune équipe trouvée pour ce championnat.</p>';
        return;
    }

    teamsContainerEl.innerHTML = '';
    teams.forEach(team => {
        const box = document.createElement('a');
        box.classList.add('team-box');
        box.href = 'team.html?team=' + team.id;
        box.innerHTML = `
            <img src="${team.crest_url || '/Images/maillot-placeholder.svg'}" alt="${team.name}">
            <h3>${team.name}</h3>
        `;
        teamsContainerEl.appendChild(box);
    });
};

const init = async () => {
    if(!leagueName){
        teamsContainerEl.innerHTML = '<p>Aucun championnat sélectionné.</p>';
        return;
    }

    try {
        const leagues = await fetchLeagues();
        const league = leagues.find(l => l.name === leagueName);

        if(!league){
            teamsContainerEl.innerHTML = '<p>Championnat introuvable.</p>';
            return;
        }

        const data = await fetchLeagueTeams(league.id);
        renderTeams(data.league, data.teams);
    } catch (err) {
        teamsContainerEl.innerHTML = '<p>Impossible de charger les équipes. Vérifiez que le serveur backend est démarré.</p>';
    }
};

init();
