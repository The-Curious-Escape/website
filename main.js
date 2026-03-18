import LogtoClient from '@logto/browser';

const logto = new LogtoClient({
    endpoint: 'https://9cbe0a.logto.app/',
    appId: 'zf8pq6upcdpd1z6rtvxlf',
    scopes: ['email', 'profile']
});

const baseUrl = window.location.origin + "/website";

// --- Gravatar v3 (SHA-256) ---
async function getGravatar(email) {
    const msgBuffer = new TextEncoder().encode(email.trim().toLowerCase());
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
    return `https://www.gravatar.com/avatar/${hashHex}?s=200&d=mp`;
}

// --- Search Interaction ---
const searchWrapper = document.getElementById('search-wrapper');
document.getElementById('search-trigger').onclick = (e) => {
    e.stopPropagation();
    searchWrapper.classList.toggle('active');
    if(searchWrapper.classList.contains('active')) document.getElementById('search-input').focus();
};

document.addEventListener('click', (e) => {
    if (!searchWrapper.contains(e.target)) searchWrapper.classList.remove('active');
});

// --- Initialization ---
async function init() {
    if (window.location.search.includes('code=')) {
        await logto.handleSignInCallback(window.location.href);
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    const isAuthenticated = await logto.isAuthenticated();
    
    if (isAuthenticated) {
        const user = await logto.fetchUserInfo();
        document.getElementById('signin').classList.add('hidden');
        document.getElementById('user-profile').classList.remove('hidden');

        const avatar = document.getElementById('user-avatar');
        avatar.src = await getGravatar(user.email);

        const menu = document.getElementById('profile-menu');
        document.getElementById('usage-anchor').onclick = () => menu.open = !menu.open;
    }
}

// --- Event Listeners ---
document.getElementById('signin').onclick = () => logto.signIn(baseUrl);
document.getElementById('signout-item').onclick = () => logto.signOut(baseUrl);
document.getElementById('menu-button').onclick = () => document.getElementById('nav-drawer').show();

init();
