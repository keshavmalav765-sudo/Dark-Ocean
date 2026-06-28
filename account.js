const accountTitle = document.getElementById("accountTitle");
const accountSubtitle = document.getElementById("accountSubtitle");
const profileStatus = document.getElementById("profileStatus");
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const loginActionBtn = document.getElementById("loginActionBtn");
const accountLogoutBtn = document.getElementById("accountLogoutBtn");
const addressList = document.getElementById("addressList");
const ordersContainer = document.getElementById("ordersContainer");
const notificationsList = document.getElementById("notificationsList");
const funnelStats = document.getElementById("funnelStats");

function renderProfile() {
    const session = window.darkOcean.getUserSession();

    if (session.active) {
        profileStatus.innerText = session.role === "admin" ? "Admin" : "Member";
        profileName.innerText = session.name;
        profileEmail.innerText = session.email || "Not added";
        loginActionBtn.innerText = "Continue Shopping";
        loginActionBtn.href = "shop.html";
        if (accountLogoutBtn) {
            accountLogoutBtn.hidden = false;
        }
        accountTitle.innerText = `Welcome back, ${session.name}.`;
        accountSubtitle.innerText = "Your account and order history are ready below.";
        return;
    }

    profileStatus.innerText = "Guest";
    profileName.innerText = "-";
    profileEmail.innerText = "-";
    loginActionBtn.innerText = "Sign In";
    loginActionBtn.href = "login.html";
    if (accountLogoutBtn) {
        accountLogoutBtn.hidden = true;
    }
}

function renderAddresses() {
    const addresses = window.darkOcean.getSavedAddresses();

    if (!addresses.length) {
        addressList.innerHTML = '<div class="stack-item"><p>No saved addresses yet. Complete checkout once to auto-save your latest shipping address.</p></div>';
        return;
    }

    addressList.innerHTML = addresses.map((address) => `
        <div class="stack-item">
            <strong>${address.fullName}</strong>
            <p>${address.address}, ${address.city} - ${address.postalCode}</p>
            <p>${address.phone}</p>
        </div>
    `).join("");
}

function renderOrders() {
    const orders = window.darkOcean.getOrders();

    if (!orders.length) {
        ordersContainer.innerHTML = '<div class="empty-state"><p>No orders found yet.</p><a class="lux-btn" href="shop.html">Explore Collection</a></div>';
        return;
    }

    ordersContainer.innerHTML = orders.map((order) => {
        const created = order.createdAt ? new Date(order.createdAt) : null;
        const dateLabel = created && !Number.isNaN(created.getTime())
            ? created.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })
            : "Date unavailable";

        return `
        <article class="order-item">
            <strong>${order.id || "DO-0000"}</strong>
            <p>${dateLabel}</p>
            <p>${order.itemCount || 1} item(s) - ${window.darkOcean.formatCurrency(order.total || 0)}</p>
            <p>Status: ${order.status || "Pending"}</p>
            <div class="timeline">
                ${(order.timeline || []).slice(0, 4).map((event) => `<span>${event.label}</span>`).join("")}
            </div>
        </article>
    `;
    }).join("");
}

function renderNotifications() {
    if (!notificationsList) {
        return;
    }

    const notifications = window.darkOcean.getNotifications();
    if (!notifications.length) {
        notificationsList.innerHTML = '<div class="stack-item"><p>No notifications yet.</p></div>';
        return;
    }

    notificationsList.innerHTML = notifications.slice(0, 8).map((item) => `
        <div class="stack-item">
            <strong>${item.title}</strong>
            <p>${item.message}</p>
            <p>${new Date(item.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
        </div>
    `).join("");
}

function renderFunnelStats() {
    if (!funnelStats) {
        return;
    }

    const events = window.darkOcean.getFunnelEvents();
    const counters = {
        views: events.filter((event) => event.name === "view_product").length,
        addToCart: events.filter((event) => event.name === "add_to_cart").length,
        checkout: events.filter((event) => event.name === "checkout_started").length,
        success: events.filter((event) => event.name === "payment_success").length
    };

    funnelStats.innerHTML = `
        <div class="stack-item"><strong>Product Views</strong><p>${counters.views}</p></div>
        <div class="stack-item"><strong>Add To Cart</strong><p>${counters.addToCart}</p></div>
        <div class="stack-item"><strong>Checkout Starts</strong><p>${counters.checkout}</p></div>
        <div class="stack-item"><strong>Successful Payments</strong><p>${counters.success}</p></div>
    `;
}

async function initAccount() {
    await window.darkOcean.refreshSessionFromBackend();

    const backendAvailable = await window.darkOcean.checkBackend();
    if (backendAvailable) {
        await window.darkOcean.refreshOrdersFromBackend(false);
    }

    renderProfile();
    renderAddresses();
    renderOrders();
    renderNotifications();
    renderFunnelStats();
}

initAccount();

if (accountLogoutBtn) {
    accountLogoutBtn.addEventListener("click", () => {
        window.darkOcean.clearUserSession();
        window.darkOcean.notify("You have been signed out.", "info");
        setTimeout(() => {
            window.location.href = "index.html";
        }, 300);
    });
}
