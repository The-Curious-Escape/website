import LogtoClient from '@logto/browser'; // Fixed import name to match importmap

const logto = new LogtoClient({
    endpoint: 'https://9cbe0a.logto.app/',
    appId: 'zf8pq6upcdpd1z6rtvxlf',
    scopes: ['email', 'profile']
});

// Robust URL detection for GitHub Pages vs Localhost
const baseUrl = window.location.origin + window.location.pathname.replace(/\/$/, "");

// --- Gravatar v3 (SHA-256) ---
async function getGravatar(email) {
    if (!email) return 'https://www.gravatar.com/avatar/000?d=mp';
    const msgBuffer = new TextEncoder().encode(email.trim().toLowerCase());
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashHex = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    return `https://www.gravatar.com/avatar/${hashHex}?s=200&d=mp`;
}

// --- Search Interaction ---
const searchWrapper = document.getElementById('search-wrapper');
const searchTrigger = document.getElementById('search-trigger');
const searchInput = document.getElementById('search-input');

if (searchTrigger) {
    searchTrigger.onclick = (e) => {
        e.stopPropagation();
        searchWrapper.classList.toggle('active');
        if (searchWrapper.classList.contains('active')) searchInput.focus();
    };
}

document.addEventListener('click', (e) => {
    if (searchWrapper && !searchWrapper.contains(e.target)) {
        searchWrapper.classList.remove('active');
    }
});

// --- Initialization ---
async function init() {
    // 1. Handle Callback
    if (window.location.search.includes('code=')) {
        try {
            await logto.handleSignInCallback(window.location.href);
            window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {
            console.error("Logto callback error:", err);
        }
    }

    const isAuthenticated = await logto.isAuthenticated();
    const signInBtn = document.getElementById('signin');
    const userProfile = document.getElementById('user-profile');
    
    if (isAuthenticated) {
        const user = await logto.fetchUserInfo();
        const picture = user.picture || await getGravatar(user.email);

        // UI Toggle
        if (signInBtn) signInBtn.classList.add('hidden');
        if (userProfile) userProfile.classList.remove('hidden');

        // Populate Profile
        document.getElementById('user-avatar').src = picture;
        document.getElementById('menu-avatar-name').src = picture;
        document.getElementById('menu-avatar-email').src = picture;
        document.getElementById('user-fullname').textContent = user.name || "Explorer";
        document.getElementById('user-email').textContent = user.email;

        // Profile Menu Toggle
        const menu = document.getElementById('profile-menu');
        const anchor = document.getElementById('usage-anchor');
        if (anchor && menu) {
            anchor.onclick = (e) => {
                e.stopPropagation();
                menu.open = !menu.open;
            };
        }
    }

    // 2. Auth Listeners (After State Check)
    if (signInBtn) {
        signInBtn.onclick = () => logto.signIn(baseUrl);
    }

    const signOutItem = document.getElementById('signout-item');
    if (signOutItem) {
        signOutItem.onclick = () => logto.signOut(baseUrl);
    }
}

// --- Navigation Drawer ---
const menuBtn = document.getElementById('menu-button');
const navDrawer = document.getElementById('nav-drawer');
if (menuBtn && navDrawer) {
    menuBtn.onclick = () => navDrawer.show();
}

init();
