/* ##################### */
/* Photo de profil du client (accueil connecté et Mon dashboard) */
/* ##################### */

const AVATAR_SIZE = 320;

const initialsOf = (name) => (name || '?')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part[0].toUpperCase())
    .join('');

// Recadre l'image au centre en carré et la réduit avant l'envoi (fichier léger).
const squareImage = (file) => new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
        const side = Math.min(img.width, img.height);
        const canvas = document.createElement('canvas');
        canvas.width = AVATAR_SIZE;
        canvas.height = AVATAR_SIZE;
        canvas.getContext('2d').drawImage(
            img,
            (img.width - side) / 2, (img.height - side) / 2, side, side,
            0, 0, AVATAR_SIZE, AVATAR_SIZE
        );
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL('image/jpeg', 0.88));
    };
    img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Ce fichier n'est pas une image lisible."));
    };
    img.src = url;
});

// Construit le bloc photo dans `container` : rond (photo ou initiales),
// bouton « changer la photo », lien « retirer », et message d'erreur.
const mountProfilePhoto = (container) => {
    // Déjà monté (ex. reconnexion sur l'accueil) : on rafraîchit seulement le profil.
    if(container.dataset.mounted){
        window.dispatchEvent(new Event('xtra:profile'));
        apiFetchMe().catch(() => {});
        return;
    }
    container.dataset.mounted = 'true';
    container.innerHTML = '';
    container.classList.add('profile-photo');

    const circle = document.createElement('button');
    circle.type = 'button';
    circle.className = 'profile-photo-circle';
    circle.setAttribute('aria-label', 'Changer la photo de profil');

    const image = document.createElement('img');
    image.alt = '';
    const initials = document.createElement('span');
    initials.className = 'profile-photo-initials';
    const badge = document.createElement('i');
    badge.className = 'bx bx-camera profile-photo-badge';
    circle.append(image, initials, badge);

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/webp';
    input.hidden = true;

    const actions = document.createElement('div');
    actions.className = 'profile-photo-actions';
    const change = document.createElement('button');
    change.type = 'button';
    change.textContent = 'Changer la photo';
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = 'Retirer';
    actions.append(change, remove);

    const message = document.createElement('p');
    message.className = 'profile-photo-message';
    message.setAttribute('role', 'status');

    container.append(circle, input, actions, message);

    const render = () => {
        const user = getCurrentUser();
        if(!user) return;
        const hasPhoto = !!user.avatar_url;
        image.hidden = !hasPhoto;
        if(hasPhoto) image.src = user.avatar_url;
        initials.hidden = hasPhoto;
        initials.textContent = initialsOf(user.name);
        remove.hidden = !hasPhoto;
        change.textContent = hasPhoto ? 'Changer la photo' : 'Ajouter une photo';
    };

    const setBusy = (busy, text) => {
        circle.classList.toggle('is-busy', busy);
        change.disabled = busy;
        remove.disabled = busy;
        message.textContent = text || '';
        message.classList.remove('is-error');
    };

    const fail = (err) => {
        setBusy(false);
        message.textContent = err.message;
        message.classList.add('is-error');
    };

    circle.addEventListener('click', () => input.click());
    change.addEventListener('click', () => input.click());

    input.addEventListener('change', async () => {
        const file = input.files[0];
        input.value = '';
        if(!file) return;
        if(file.size > 15 * 1024 * 1024){
            fail(new Error('Image trop lourde (15 Mo maximum).'));
            return;
        }
        setBusy(true, 'Envoi de la photo…');
        try {
            await apiUploadAvatar(await squareImage(file), file.name);
            setBusy(false, 'Photo de profil mise à jour.');
        } catch (err) {
            fail(err);
        }
    });

    remove.addEventListener('click', async () => {
        if(!confirm('Retirer votre photo de profil ?')) return;
        setBusy(true, 'Suppression…');
        try {
            await apiRemoveAvatar();
            setBusy(false, 'Photo retirée.');
        } catch (err) {
            fail(err);
        }
    });

    window.addEventListener('xtra:profile', render);
    render();

    // Le profil mémorisé peut être ancien (connexion d'avant, autre appareil) : on le rafraîchit.
    apiFetchMe().catch(() => {});
};
