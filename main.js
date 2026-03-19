import { LogtoClient } from '@logto/browser';

const logto = new LogtoClient({
  endpoint: 'https://9cbe0a.logto.app/',
  appId: 'YOUR_LOGTO_APP_ID', // Replace with your actual Logto App ID
});

let allProducts = [];
let userTier = "Free"; 

async function init() {
    // 1. Handle Sign-in Callback
    if (window.location.search.includes('code=')) {
        await logto.handleSignInCallback(window.location.href);
        window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 2. Auth State Check
    const isAuthenticated = await logto.isAuthenticated();
    if (isAuthenticated) {
        const user = await logto.fetchUserInfo();
        
        // Update UI
        document.getElementById('signin-btn').style.display = 'none';
        document.getElementById('user-profile').style.display = 'block';
        document.getElementById('user-avatar').src = user.picture || '';
        document.getElementById('welcome-msg').textContent = `Welcome back, ${user.name || 'Explorer'}!`;

        // Boot Featurebase
        window.Featurebase && window.Featurebase("boot", {
            appId: "69b7a3dea5b0a19faa848d97",
            email: user.email,
            userId: user.sub,
            theme: "light"
        });
    }

    // 3. Load and Render Products
    await loadProducts();

    // Event Listeners
    document.getElementById('signin-btn').onclick = () => logto.signIn(window.location.origin);
    document.getElementById('signout-item').onclick = () => logto.signOut(window.location.origin);
    
    // Toggle Profile Menu
    document.getElementById('usage-anchor').onclick = () => {
        document.getElementById('profile-menu').open = !document.getElementById('profile-menu').open;
    };
}

async function loadProducts() {
    try {
        const response = await fetch('products.json');
        allProducts = await response.json();
        render(allProducts);
    } catch (e) {
        console.error("Product load error", e);
    }
}

function render(data) {
    const container = document.getElementById('product-container');
    container.innerHTML = data.map(p => {
        // Logic for Patreon-only items can be added here
        return `
            <md-elevated-card class="product-card">
                <img src="${p.image}" alt="${p.name}" class="card-img">
                <div class="card-content">
                    <h3 class="title">${p.name}</h3>
                    <p class="price">$${p.price.toFixed(2)}</p>
                    <md-filled-button class="buy-btn" onclick="alert('Added ${p.name}')">Add to Cart</md-filled-button>
                </div>
            </md-elevated-card>
        `;
    }).join('');
}

// Real-time Search
document.getElementById('search-input').addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filtered = allProducts.filter(p => p.name.toLowerCase().includes(query));
    render(filtered);
});

init();
