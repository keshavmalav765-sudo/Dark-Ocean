const STORAGE_KEYS = {
    cart: "darkOceanCart",
    cartMeta: "darkOceanCartMeta",
    products: "darkOceanProducts",
    orders: "darkOceanOrders",
    lastOrder: "darkOceanLastOrder",
    checkoutDraft: "darkOceanCheckoutDraft",
    inquiries: "darkOceanInquiries",
    wishlist: "darkOceanWishlist",
    addresses: "darkOceanAddresses",
    notifications: "darkOceanNotifications",
    funnel: "darkOceanFunnel",
};

const API_BASE = "backend/api";
const backendState = {
    available: false,
    checked: false,
    checking: null
};

const CSRF_STORAGE_KEY = "darkOceanCsrfToken";
let csrfToken = sessionStorage.getItem(CSRF_STORAGE_KEY) || "";

function setCsrfToken(nextToken) {
    csrfToken = String(nextToken || "").trim();
    if (csrfToken) {
        sessionStorage.setItem(CSRF_STORAGE_KEY, csrfToken);
    } else {
        sessionStorage.removeItem(CSRF_STORAGE_KEY);
    }
}

async function ensureCsrfToken() {
    if (csrfToken) {
        return csrfToken;
    }

    try {
        const res = await fetch(`${API_BASE}/auth/csrf.php`, {
            method: "GET",
            credentials: "include",
            headers: {}
        });
        const data = await res.json().catch(() => null);
        if (res.ok && data && data.csrfToken) {
            setCsrfToken(data.csrfToken);
        }
    } catch (error) {
        // ignore
    }

    return csrfToken;
}

const DEFAULT_PRODUCT_CATALOG = [
    {
        id: 1,
        name: "Midnight Sovereign Jacket",
        category: "jacket",
        price: 9800,
        badge: "Bestseller",
        description: "Sharp-shouldered silhouette crafted for silent dominance and controlled presence.",
        image: "assets/images/products/jackets/midnight-sovereign-jacket-dark-ocean.jpg",
        gallery: [
            "assets/images/products/jackets/midnight-sovereign-jacket-dark-ocean.jpg",
            "assets/images/products/jackets/phantom-edge-blazer-dark-ocean.jpg",
            "assets/images/products/coats/deep-current-overcoat-dark-ocean.jpg"
        ],
        rating: 4.8,
        reviewsCount: 124,
        fabric: "Italian wool blend",
        care: "Dry clean only",
        fit: "Structured fit",
        modelInfo: "Model is 6'1 and wears M",
        sku: "DO-JKT-001",
        colors: ["Black", "Graphite"],
        materials: ["Wool", "Viscose"],
        stockBySize: { S: 8, M: 14, L: 12, XL: 6 }
    },
    {
        id: 2,
        name: "Abyss Noir Shirt",
        category: "shirt",
        price: 4900,
        badge: "New",
        description: "Engineered with precision tailoring for a sharp, uninterrupted silhouette.",
        image: "assets/images/products/shirts/abyss-noir-shirt-dark-ocean.jpg",
        gallery: [
            "assets/images/products/shirts/abyss-noir-shirt-dark-ocean.jpg",
            "assets/images/products/knitwear/ocean-veil-turtleneck-dark-ocean.jpg",
            "assets/images/products/trousers/black-tide-trousers-dark-ocean.jpg"
        ],
        rating: 4.6,
        reviewsCount: 87,
        fabric: "Premium cotton satin",
        care: "Cold wash, low tumble",
        fit: "Slim tailored fit",
        modelInfo: "Model is 5'11 and wears M",
        sku: "DO-SHT-002",
        colors: ["Black", "Ink Blue"],
        materials: ["Cotton Satin"],
        stockBySize: { S: 12, M: 18, L: 11, XL: 7 }
    },
    {
        id: 3,
        name: "Obsidian Crest Suit",
        category: "suit",
        price: 19500,
        badge: "Editor's Pick",
        description: "A statement of authority. Designed for those who move without noise but command the room.",
        image: "assets/images/products/suits/obsidian-crest-suit-dark-ocean.jpg",
        gallery: [
            "assets/images/products/suits/obsidian-crest-suit-dark-ocean.jpg",
            "assets/images/products/suits/eclipse-formal-set-dark-ocean.jpg",
            "assets/images/products/jackets/phantom-edge-blazer-dark-ocean.jpg"
        ],
        rating: 4.9,
        reviewsCount: 66,
        fabric: "Super 120s wool",
        care: "Dry clean only",
        fit: "Modern classic fit",
        modelInfo: "Model is 6'0 and wears L",
        sku: "DO-SUT-003",
        colors: ["Onyx", "Charcoal"],
        materials: ["Wool"],
        stockBySize: { S: 5, M: 9, L: 10, XL: 4 }
    },
    {
        id: 4,
        name: "Deep Current Overcoat",
        category: "coat",
        price: 14200,
        badge: "Seasonal",
        description: "Minimal exterior. Powerful presence. Built for colder atmospheres.",
        image: "assets/images/products/coats/deep-current-overcoat-dark-ocean.jpg",
        gallery: [
            "assets/images/products/coats/deep-current-overcoat-dark-ocean.jpg",
            "assets/images/products/jackets/midnight-sovereign-jacket-dark-ocean.jpg",
            "assets/images/products/trousers/black-tide-trousers-dark-ocean.jpg"
        ],
        rating: 4.7,
        reviewsCount: 48,
        fabric: "Wool cashmere blend",
        care: "Dry clean only",
        fit: "Relaxed overcoat fit",
        modelInfo: "Model is 6'2 and wears L",
        sku: "DO-COT-004",
        colors: ["Deep Navy", "Black"],
        materials: ["Wool", "Cashmere"],
        stockBySize: { S: 4, M: 8, L: 9, XL: 5 }
    },
    {
        id: 5,
        name: "Phantom Edge Blazer",
        category: "jacket",
        price: 11300,
        badge: "Bestseller",
        description: "Sharp cut. Refined finish. Built for elevated evenings.",
        image: "assets/images/products/jackets/phantom-edge-blazer-dark-ocean.jpg",
        gallery: [
            "assets/images/products/jackets/phantom-edge-blazer-dark-ocean.jpg",
            "assets/images/products/suits/obsidian-crest-suit-dark-ocean.jpg",
            "assets/images/products/shirts/abyss-noir-shirt-dark-ocean.jpg"
        ],
        rating: 4.8,
        reviewsCount: 91,
        fabric: "Wool viscose blend",
        care: "Dry clean only",
        fit: "Tapered fit",
        modelInfo: "Model is 6'0 and wears M",
        sku: "DO-JKT-005",
        colors: ["Black"],
        materials: ["Wool", "Viscose"],
        stockBySize: { S: 7, M: 13, L: 10, XL: 5 }
    },
    {
        id: 6,
        name: "Ocean Veil Turtleneck",
        category: "knitwear",
        price: 5600,
        badge: "Essential",
        description: "Soft texture, firm structure. Designed for understated authority.",
        image: "assets/images/products/knitwear/ocean-veil-turtleneck-dark-ocean.jpg",
        gallery: [
            "assets/images/products/knitwear/ocean-veil-turtleneck-dark-ocean.jpg",
            "assets/images/products/coats/deep-current-overcoat-dark-ocean.jpg",
            "assets/images/products/trousers/black-tide-trousers-dark-ocean.jpg"
        ],
        rating: 4.5,
        reviewsCount: 59,
        fabric: "Merino knit",
        care: "Hand wash cold",
        fit: "Regular fit",
        modelInfo: "Model is 5'10 and wears M",
        sku: "DO-KNT-006",
        colors: ["Black", "Ash"],
        materials: ["Merino Wool"],
        stockBySize: { S: 9, M: 15, L: 12, XL: 8 }
    },
    {
        id: 7,
        name: "Black Tide Trousers",
        category: "trousers",
        price: 6200,
        badge: "Classic",
        description: "Balanced taper. Controlled fall. Luxury in motion.",
        image: "assets/images/products/trousers/black-tide-trousers-dark-ocean.jpg",
        gallery: [
            "assets/images/products/trousers/black-tide-trousers-dark-ocean.jpg",
            "assets/images/products/shirts/abyss-noir-shirt-dark-ocean.jpg",
            "assets/images/products/jackets/phantom-edge-blazer-dark-ocean.jpg"
        ],
        rating: 4.6,
        reviewsCount: 74,
        fabric: "Stretch cotton twill",
        care: "Machine wash cold",
        fit: "Tapered fit",
        modelInfo: "Model is 6'0 and wears 32",
        sku: "DO-TRS-007",
        colors: ["Black", "Slate"],
        materials: ["Cotton Twill"],
        stockBySize: { S: 10, M: 16, L: 12, XL: 9 }
    },
    {
        id: 8,
        name: "Eclipse Formal Set",
        category: "suit",
        price: 24000,
        badge: "Premium",
        description: "The embodiment of Dark Ocean. Structured, commanding, untouchable.",
        image: "assets/images/products/suits/eclipse-formal-set-dark-ocean.jpg",
        gallery: [
            "assets/images/products/suits/eclipse-formal-set-dark-ocean.jpg",
            "assets/images/products/suits/obsidian-crest-suit-dark-ocean.jpg",
            "assets/images/products/coats/deep-current-overcoat-dark-ocean.jpg"
        ],
        rating: 4.9,
        reviewsCount: 41,
        fabric: "Luxury wool blend",
        care: "Dry clean only",
        fit: "Signature fit",
        modelInfo: "Model is 6'1 and wears L",
        sku: "DO-SUT-008",
        colors: ["Black"],
        materials: ["Wool Blend"],
        stockBySize: { S: 3, M: 7, L: 9, XL: 4 }
    }
];

function safeParse(value, fallback) {
    try {
        return JSON.parse(value);
    } catch (error) {
        return fallback;
    }
}

function readStorage(key, fallback) {
    return safeParse(localStorage.getItem(key), fallback);
}

function writeStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

async function apiFetch(path, options) {
    const url = `${API_BASE}${path.startsWith("/") ? "" : "/"}${path}`;

    const mergedOptions = {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        ...options
    };
    const isCsrfRetry = Boolean(mergedOptions.__csrfRetry);
    delete mergedOptions.__csrfRetry;

    const method = String(mergedOptions.method || "GET").toUpperCase();
    if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
        await ensureCsrfToken();
        if (csrfToken) {
            mergedOptions.headers = {
                ...mergedOptions.headers,
                "X-CSRF-Token": csrfToken
            };
        }
    }

    if (mergedOptions.body && typeof mergedOptions.body !== "string") {
        mergedOptions.body = JSON.stringify(mergedOptions.body);
    }

    const response = await fetch(url, mergedOptions);
    const text = await response.text();
    let data = null;

    try {
        data = text ? JSON.parse(text) : null;
    } catch (error) {
        data = null;
    }

    const message = data && data.message ? data.message : `Request failed (${response.status})`;
    if (!response.ok && response.status === 403 && message === "CSRF token missing or invalid." && !isCsrfRetry) {
        setCsrfToken("");
        await ensureCsrfToken();

        if (csrfToken) {
            return apiFetch(path, {
                ...mergedOptions,
                __csrfRetry: true,
                headers: {
                    ...mergedOptions.headers,
                    "X-CSRF-Token": csrfToken
                }
            });
        }
    }

    if (!response.ok) {
        const err = new Error(message);
        err.status = response.status;
        err.data = data;
        throw err;
    }

    return data;
}

async function checkBackend() {
    if (backendState.checked) {
        return backendState.available;
    }

    if (backendState.checking) {
        return backendState.checking;
    }

    backendState.checking = (async () => {
        try {
            const res = await apiFetch("/health.php", { method: "GET", headers: {} });
            backendState.available = Boolean(res && res.ok);
            if (backendState.available) {
                await ensureCsrfToken();
            }
        } catch (error) {
            backendState.available = false;
        } finally {
            backendState.checked = true;
            backendState.checking = null;
        }
        return backendState.available;
    })();

    return backendState.checking;
}

function syncLocalSessionFromBackendUser(user) {
    if (!user) {
        return;
    }

    sessionState = {
        active: true,
        role: user.role === "admin" ? "admin" : "user",
        name: user.name || (user.role === "admin" ? "Dark Ocean Admin" : "Dark Ocean Member"),
        email: user.email || ""
    };
    refreshNavbar();
}

let sessionState = {
    active: false,
    role: "guest",
    name: "Guest",
    email: ""
};

async function refreshSessionFromBackend() {
    const available = await checkBackend();
    if (!available) {
        return null;
    }

    try {
        const res = await apiFetch("/auth/me.php", { method: "GET", headers: {} });
        if (res && res.authenticated && res.user) {
            syncLocalSessionFromBackendUser(res.user);
            return res.user;
        }
        sessionState = { active: false, role: "guest", name: "Guest", email: "" };
        refreshNavbar();
    } catch (error) {
        // ignore
    }

    return null;
}

async function refreshCatalogFromBackend() {
    const available = await checkBackend();
    if (!available) {
        return null;
    }

    try {
        const res = await apiFetch("/products/list.php", { method: "GET", headers: {} });
        if (res && Array.isArray(res.products)) {
            // Keep using the existing local catalog path by caching API results into storage.
            writeStorage(STORAGE_KEYS.products, res.products);
            return res.products;
        }
    } catch (error) {
        // ignore
    }

    return null;
}

async function refreshOrdersFromBackend(adminMode) {
    const available = await checkBackend();
    if (!available) {
        return null;
    }

    const path = adminMode ? "/orders/admin_list.php" : "/orders/list.php";

    try {
        const res = await apiFetch(path, { method: "GET", headers: {} });
        if (res && Array.isArray(res.orders)) {
            writeStorage(STORAGE_KEYS.orders, res.orders);
            if (res.orders[0]) {
                writeStorage(STORAGE_KEYS.lastOrder, res.orders[0]);
            }
            return res.orders;
        }
    } catch (error) {
        // ignore
    }

    return null;
}

function normalizeProduct(rawProduct, fallbackId) {
    const id = Number(rawProduct.id) || fallbackId;
    const image = String(rawProduct.image || "").trim();
    const gallery = Array.isArray(rawProduct.gallery) && rawProduct.gallery.length ? rawProduct.gallery : [image];

    const baseStock = rawProduct.stockBySize || { S: 10, M: 12, L: 10, XL: 8 };

    return {
        id,
        name: String(rawProduct.name || `Product ${id}`).trim(),
        category: String(rawProduct.category || "other").trim().toLowerCase(),
        price: Number(rawProduct.price) || 0,
        badge: String(rawProduct.badge || "").trim(),
        description: String(rawProduct.description || "").trim(),
        image,
        gallery: gallery.map((item) => String(item || "").trim()).filter(Boolean),
        rating: Math.max(1, Math.min(5, Number(rawProduct.rating) || 4.5)),
        reviewsCount: Math.max(0, Number(rawProduct.reviewsCount) || 0),
        fabric: String(rawProduct.fabric || "Premium fabric").trim(),
        care: String(rawProduct.care || "Dry clean preferred").trim(),
        fit: String(rawProduct.fit || "Tailored fit").trim(),
        modelInfo: String(rawProduct.modelInfo || "Model wears M").trim(),
        sku: String(rawProduct.sku || `DO-SKU-${id}`).trim(),
        colors: Array.isArray(rawProduct.colors) && rawProduct.colors.length ? rawProduct.colors.map((item) => String(item).trim()) : ["Black"],
        materials: Array.isArray(rawProduct.materials) && rawProduct.materials.length ? rawProduct.materials.map((item) => String(item).trim()) : ["Premium fabric"],
        stockBySize: {
            S: Math.max(0, Number(baseStock.S) || 0),
            M: Math.max(0, Number(baseStock.M) || 0),
            L: Math.max(0, Number(baseStock.L) || 0),
            XL: Math.max(0, Number(baseStock.XL) || 0)
        }
    };
}

function getCatalog() {
    const storedCatalog = readStorage(STORAGE_KEYS.products, null);

    if (!Array.isArray(storedCatalog) || !storedCatalog.length) {
        return [];
    }

    const normalizedCatalog = storedCatalog.map((product, index) => normalizeProduct(product, index + 1));
    writeStorage(STORAGE_KEYS.products, normalizedCatalog);
    return normalizedCatalog;
}

function saveCatalog(catalog) {
    const normalizedCatalog = Array.isArray(catalog)
        ? catalog.map((product, index) => normalizeProduct(product, index + 1))
        : [];

    writeStorage(STORAGE_KEYS.products, normalizedCatalog);
}

function getProductById(id) {
    return getCatalog().find((product) => String(product.id) === String(id)) || null;
}

function getNextProductId() {
    // Deprecated: product IDs are assigned by the backend.
    return getCatalog().reduce((maxId, product) => Math.max(maxId, Number(product.id) || 0), 0) + 1;
}

function normalizeCartItem(rawItem) {
    return {
        productId: rawItem.productId ? Number(rawItem.productId) : null,
        name: String(rawItem.name || "Unknown product").trim(),
        price: Number(rawItem.price) || 0,
        image: String(rawItem.image || "").trim(),
        size: String(rawItem.size || "").trim(),
        quantity: Math.max(1, Number(rawItem.quantity) || 1)
    };
}

function getCart() {
    const storedCart = readStorage(STORAGE_KEYS.cart, []);

    if (!Array.isArray(storedCart)) {
        return [];
    }

    const normalizedCart = storedCart
        .map((item) => normalizeCartItem(item))
        .filter((item) => item.name && item.price >= 0 && item.quantity > 0);

    writeStorage(STORAGE_KEYS.cart, normalizedCart);
    return normalizedCart;
}

function setCart(cart) {
    const normalizedCart = Array.isArray(cart)
        ? cart
            .map((item) => normalizeCartItem(item))
            .filter((item) => item.quantity > 0)
        : [];

    writeStorage(STORAGE_KEYS.cart, normalizedCart);
    writeStorage(STORAGE_KEYS.cartMeta, {
        updatedAt: new Date().toISOString(),
        items: normalizedCart.reduce((sum, item) => sum + item.quantity, 0)
    });
    window.dispatchEvent(new Event("cartUpdated"));
}

function getCartMeta() {
    return readStorage(STORAGE_KEYS.cartMeta, { updatedAt: "", items: 0 });
}

function addToCart(product, size, quantity) {
    if (!product) {
        return { ok: false, reason: "missing_product" };
    }

    const normalizedSize = String(size || "M").trim();
    const normalizedQty = Math.max(1, Number(quantity) || 1);
    const availableStock = getProductStockBySize(product.id, normalizedSize);
    const currentQuantity = getCart().filter((item) => String(item.productId) === String(product.id) && item.size === normalizedSize).reduce((sum, item) => sum + item.quantity, 0);

    if (currentQuantity + normalizedQty > availableStock) {
        return { ok: false, reason: "out_of_stock", availableStock };
    }

    const cart = getCart();
    const existingItem = cart.find((item) => String(item.productId) === String(product.id) && item.size === normalizedSize);

    if (existingItem) {
        existingItem.quantity += normalizedQty;
    } else {
        cart.push({
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            size: normalizedSize,
            quantity: normalizedQty
        });
    }

    setCart(cart);
    trackFunnelEvent("add_to_cart", { productId: product.id, size: normalizedSize, quantity: normalizedQty });
    return { ok: true };
}

function getProductStockBySize(productId, size) {
    const product = getProductById(productId);
    if (!product || !product.stockBySize) {
        return 0;
    }

    const normalizedSize = String(size || "M").toUpperCase();
    return Math.max(0, Number(product.stockBySize[normalizedSize]) || 0);
}

function getWishlist() {
    const stored = readStorage(STORAGE_KEYS.wishlist, []);
    return Array.isArray(stored) ? stored.map((id) => Number(id)).filter(Boolean) : [];
}

function setWishlist(ids) {
    const uniqueIds = [...new Set((Array.isArray(ids) ? ids : []).map((id) => Number(id)).filter(Boolean))];
    writeStorage(STORAGE_KEYS.wishlist, uniqueIds);
    window.dispatchEvent(new Event("wishlistUpdated"));
}

function isWishlisted(productId) {
    return getWishlist().includes(Number(productId));
}

function toggleWishlist(productId) {
    const id = Number(productId);
    const current = getWishlist();
    const exists = current.includes(id);

    if (exists) {
        setWishlist(current.filter((item) => item !== id));
        return false;
    }

    current.push(id);
    setWishlist(current);
    return true;
}

function getWishlistProducts() {
    const catalogMap = new Map(getCatalog().map((product) => [product.id, product]));
    return getWishlist().map((id) => catalogMap.get(id)).filter(Boolean);
}

function formatCurrency(value) {
    const amount = Number(value) || 0;
    return `Rs. ${amount.toLocaleString("en-IN")}`;
}

function getOrders() {
    const orders = readStorage(STORAGE_KEYS.orders, []);
    return Array.isArray(orders) ? orders : [];
}

function getLastOrder() {
    return readStorage(STORAGE_KEYS.lastOrder, null);
}

function getUserSession() {
    return { ...sessionState };
}

function clearUserSession() {
    // Fire-and-forget backend logout when available; local fallback remains.
    checkBackend().then((available) => {
        if (!available) {
            return;
        }

        apiFetch("/auth/logout.php", { method: "POST", body: {} })
            .then(() => setCsrfToken(""))
            .catch(() => { });
    });

    sessionState = { active: false, role: "guest", name: "Guest", email: "" };
    refreshNavbar();
}

function getInquiries() {
    const stored = readStorage(STORAGE_KEYS.inquiries, []);
    return Array.isArray(stored) ? stored : [];
}

function saveInquiry(inquiry) {
    const inquiries = getInquiries();
    inquiries.unshift(inquiry);
    writeStorage(STORAGE_KEYS.inquiries, inquiries);
}

function getNotifications() {
    const notifications = readStorage(STORAGE_KEYS.notifications, []);
    return Array.isArray(notifications) ? notifications : [];
}

function pushNotification(notification) {
    const notifications = getNotifications();
    notifications.unshift({
        title: String(notification.title || "Update").trim(),
        message: String(notification.message || "").trim(),
        createdAt: notification.createdAt || new Date().toISOString()
    });
    writeStorage(STORAGE_KEYS.notifications, notifications.slice(0, 20));
}

function getFunnelEvents() {
    const events = readStorage(STORAGE_KEYS.funnel, []);
    return Array.isArray(events) ? events : [];
}

function trackFunnelEvent(name, payload) {
    const events = getFunnelEvents();
    events.push({
        name: String(name || "event").trim(),
        payload: payload || {},
        at: new Date().toISOString()
    });
    writeStorage(STORAGE_KEYS.funnel, events.slice(-300));
}

function getCouponCatalog() {
    return {
        OCEAN10: { type: "percent", value: 10, minTotal: 5000 },
        DARK500: { type: "flat", value: 500, minTotal: 7000 },
        SUIT15: { type: "percent", value: 15, minTotal: 12000 }
    };
}

function validateCoupon(code, total) {
    const normalizedCode = String(code || "").trim().toUpperCase();
    const coupon = getCouponCatalog()[normalizedCode];

    if (!coupon) {
        return { valid: false, reason: "invalid_code" };
    }

    if ((Number(total) || 0) < coupon.minTotal) {
        return { valid: false, reason: "min_total", minTotal: coupon.minTotal };
    }

    const discount = coupon.type === "percent"
        ? Math.round((Number(total) || 0) * (coupon.value / 100))
        : coupon.value;

    return {
        valid: true,
        code: normalizedCode,
        discount: Math.max(0, discount),
        finalTotal: Math.max(0, (Number(total) || 0) - Math.max(0, discount))
    };
}

function getRecommendedProducts(contextProductId) {
    const catalog = getCatalog();
    const cartProductIds = new Set(getCart().map((item) => Number(item.productId)).filter(Boolean));
    const wishlistIds = new Set(getWishlist());
    const contextProduct = contextProductId ? getProductById(contextProductId) : null;

    const scored = catalog
        .filter((product) => !contextProductId || product.id !== Number(contextProductId))
        .map((product) => {
            let score = Number(product.rating) * 10 + Number(product.reviewsCount || 0) / 10;

            if (cartProductIds.has(product.id)) {
                score += 40;
            }

            if (wishlistIds.has(product.id)) {
                score += 30;
            }

            if (contextProduct && contextProduct.category === product.category) {
                score += 20;
            }

            return { product, score };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .map((item) => item.product);

    return scored;
}

function consumeStockForOrder(order) {
    if (!order || !Array.isArray(order.items) || !order.items.length) {
        return;
    }

    const catalog = getCatalog();
    const nextCatalog = catalog.map((product) => ({ ...product, stockBySize: { ...product.stockBySize } }));

    order.items.forEach((item) => {
        const product = nextCatalog.find((entry) => String(entry.id) === String(item.productId));
        if (!product || !product.stockBySize) {
            return;
        }

        const normalizedSize = String(item.size || "M").toUpperCase();
        const available = Math.max(0, Number(product.stockBySize[normalizedSize]) || 0);
        product.stockBySize[normalizedSize] = Math.max(0, available - (Number(item.quantity) || 0));
    });

    saveCatalog(nextCatalog);
}

function getSavedAddresses() {
    const addresses = readStorage(STORAGE_KEYS.addresses, []);
    return Array.isArray(addresses) ? addresses : [];
}

function saveAddress(address) {
    const addresses = getSavedAddresses();
    addresses.unshift(address);
    writeStorage(STORAGE_KEYS.addresses, addresses.slice(0, 3));
}

function getCheckoutDraft() {
    return readStorage(STORAGE_KEYS.checkoutDraft, null);
}

function saveCheckoutDraft(draft) {
    writeStorage(STORAGE_KEYS.checkoutDraft, draft || null);
    trackFunnelEvent("checkout_started", { hasDraft: Boolean(draft) });
}

function clearCheckoutDraft() {
    localStorage.removeItem(STORAGE_KEYS.checkoutDraft);
}

function getToastStack() {
    let stack = document.getElementById("toastStack");

    if (!stack) {
        stack = document.createElement("div");
        stack.id = "toastStack";
        stack.className = "toast-stack";
        document.body.appendChild(stack);
    }

    return stack;
}

function notify(message, type) {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type || "info"}`;
    toast.textContent = message;

    getToastStack().appendChild(toast);

    setTimeout(() => {
        toast.classList.add("toast-hide");
        setTimeout(() => toast.remove(), 260);
    }, 2200);
}

function updateCartCount() {
    const count = getCart().reduce((total, item) => total + item.quantity, 0);
    const cartCount = document.getElementById("cartCount");

    if (cartCount) {
        cartCount.innerText = String(count);
    }

    const mobileCartCount = document.getElementById("mobileCartCount");
    if (mobileCartCount) {
        mobileCartCount.innerText = String(count);
    }
}

function updateWishlistCount() {
    const count = getWishlist().length;
    const mobileWishlistCount = document.getElementById("mobileWishlistCount");

    if (mobileWishlistCount) {
        mobileWishlistCount.innerText = String(count);
    }
}

function removeFromMiniCart(index) {
    const cart = getCart();
    cart.splice(index, 1);
    setCart(cart);
}

function loadMiniCart() {
    const miniCartItems = document.getElementById("miniCartItems");
    const miniCartTotal = document.getElementById("miniCartTotal");
    const miniCartCheckout = document.getElementById("miniCartCheckout");

    if (!miniCartItems || !miniCartTotal || !miniCartCheckout) {
        return;
    }

    const cart = getCart();
    miniCartItems.innerHTML = "";

    if (!cart.length) {
        miniCartItems.innerHTML = '<p class="mini-cart-empty">Your cart is empty.</p>';
        miniCartTotal.innerText = formatCurrency(0);
        miniCartCheckout.classList.add("is-disabled");
        miniCartCheckout.setAttribute("aria-disabled", "true");
        return;
    }

    miniCartCheckout.classList.remove("is-disabled");
    miniCartCheckout.removeAttribute("aria-disabled");

    let total = 0;

    cart.forEach((item, index) => {
        total += item.price * item.quantity;

        const itemElement = document.createElement("div");
        itemElement.className = "mini-cart-item";
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div>
                <h4>${item.name}</h4>
                <p>${item.size ? `Size ${item.size} - ` : ""}Qty ${item.quantity}</p>
                <span>${formatCurrency(item.price * item.quantity)}</span>
            </div>
            <button class="mini-remove" type="button" aria-label="Remove ${item.name}" data-mini-remove="${index}">&times;</button>
        `;

        miniCartItems.appendChild(itemElement);
    });

    miniCartTotal.innerText = formatCurrency(total);
}

function getCurrentPage() {
    const path = window.location.pathname.split("/").pop() || "index.html";
    return path.toLowerCase();
}

function getPrimaryNavLinks(session) {
    const links = [
        { href: "index.html", label: "Home" },
        { href: "shop.html", label: "Shop" },
        { href: "wishlist.html", label: "Wishlist" }
    ];

    if (session.role === "admin") {
        links.push({ href: "admin.html", label: "Dashboard" });
    }

    if (session.active) {
        links.push({ href: "account.html", label: "Account" });
    } else {
        links.push({ href: "login.html", label: "Login" });
    }

    return links;
}

function renderNavbarMarkup() {
    const session = getUserSession();
    const links = getPrimaryNavLinks(session);
    const currentPage = getCurrentPage();

    return `
        <nav class="navbar-shell">
            <div class="nav-container">
                <a class="logo" href="index.html" aria-label="Dark Ocean home">
                    <img src="assets/images/logo/logo-white.png" alt="Dark Ocean logo">
                </a>

                <div class="hamburger" id="hamburger" aria-label="Open menu" role="button" tabindex="0" aria-controls="navLinks" aria-expanded="false">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

                <ul class="nav-links" id="navLinks">
                    ${links.map((link) => `<li><a href="${link.href}" ${currentPage === link.href ? "aria-current=\"page\"" : ""}>${link.label}</a></li>`).join("")}
                </ul>

                <div class="nav-right">
                    ${session.active ? `
                        <div class="session-pill" title="Signed in as ${session.name}">
                            <span>${session.role === "admin" ? "Admin" : "Member"}</span>
                            <strong>${session.name}</strong>
                        </div>
                    ` : ""}
                    <button class="cart" id="cartIcon" type="button" aria-label="Open mini cart">
                        <span class="cart-icon">Cart</span>
                        <span class="cart-count" id="cartCount">0</span>
                    </button>
                </div>
            </div>
        </nav>

        <aside class="mini-cart" id="miniCart">
            <div class="mini-cart-panel">
                <div class="mini-cart-header">
                    <h3>Your Selection</h3>
                    <button id="closeMiniCart" type="button" aria-label="Close mini cart">&times;</button>
                </div>

                <div class="mini-cart-items" id="miniCartItems"></div>

                <div class="mini-cart-footer">
                    <p>Total: <span id="miniCartTotal">Rs. 0</span></p>
                    <a href="cart.html" class="lux-btn" id="miniCartCheckout">View Cart</a>
                </div>
            </div>
        </aside>
    `;
}

function renderFooterMarkup() {
    const currentYear = new Date().getFullYear();

    return `
        <footer class="footer">
            <div class="footer-content">
                <div>
                    <h3>DARK OCEAN</h3>
                    <p>Tailored essentials for a quiet, commanding wardrobe.</p>
                </div>

                <div class="footer-links">
                    <a href="shop.html">Shop</a>
                    <a href="wishlist.html">Wishlist</a>
                    <a href="account.html">Account</a>
                    <a href="about.html">About</a>
                    <a href="contact.html">Contact</a>
                </div>
            </div>
            <p class="footer-note">(c) ${currentYear} Dark Ocean. All rights reserved.</p>
        </footer>
    `;
}

function renderMobileDock() {
    const currentPage = getCurrentPage();

    return `
        <nav class="mobile-dock" id="mobileDock" aria-label="Mobile quick actions">
            <a href="index.html" ${currentPage === "index.html" ? "aria-current=\"page\"" : ""}>Home</a>
            <a href="shop.html" ${currentPage === "shop.html" ? "aria-current=\"page\"" : ""}>Shop</a>
            <a href="wishlist.html" ${currentPage === "wishlist.html" ? "aria-current=\"page\"" : ""}>Wishlist <span id="mobileWishlistCount">0</span></a>
            <button class="mobile-cart-btn" type="button" id="mobileCartButton" aria-label="Open cart">Cart <span id="mobileCartCount">0</span></button>
            <a href="account.html" ${currentPage === "account.html" ? "aria-current=\"page\"" : ""}>Account</a>
        </nav>
    `;
}

function setMobileMenuState(navLinks, hamburger, active) {
    if (!navLinks || !hamburger) {
        return;
    }

    navLinks.classList.toggle("active", active);
    hamburger.classList.toggle("active", active);
    hamburger.setAttribute("aria-expanded", active ? "true" : "false");
}

function initializeNavbarFeatures() {
    const cartIcon = document.getElementById("cartIcon");
    const miniCart = document.getElementById("miniCart");
    const closeMiniCart = document.getElementById("closeMiniCart");
    const mobileCartButton = document.getElementById("mobileCartButton");
    const hamburger = document.getElementById("hamburger");
    const navLinks = document.getElementById("navLinks");

    if (cartIcon && miniCart) {
        cartIcon.addEventListener("click", () => {
            miniCart.classList.add("active");
            loadMiniCart();
        });
    }

    if (closeMiniCart && miniCart) {
        closeMiniCart.addEventListener("click", () => {
            miniCart.classList.remove("active");
        });
    }

    if (mobileCartButton && miniCart) {
        mobileCartButton.addEventListener("click", () => {
            miniCart.classList.add("active");
            loadMiniCart();
        });
    }

    if (miniCart) {
        miniCart.addEventListener("click", (event) => {
            if (event.target === miniCart) {
                miniCart.classList.remove("active");
                return;
            }

            const removeButton = event.target.closest("[data-mini-remove]");
            if (removeButton) {
                removeFromMiniCart(Number(removeButton.dataset.miniRemove));
                loadMiniCart();
            }
        });
    }

    if (hamburger && navLinks) {
        const toggleMenu = () => setMobileMenuState(navLinks, hamburger, !navLinks.classList.contains("active"));

        hamburger.addEventListener("click", toggleMenu);
        hamburger.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                toggleMenu();
            }
        });

        document.addEventListener("click", (event) => {
            if (window.innerWidth > 820) {
                return;
            }

            if (!event.target.closest(".navbar-shell")) {
                setMobileMenuState(navLinks, hamburger, false);
            }
        });
    }

}

function initializeGlobalUiBehavior() {
    document.addEventListener("click", (event) => {
        const wishlistButton = event.target.closest("[data-wishlist-id]");

        if (wishlistButton) {
            const productId = Number(wishlistButton.dataset.wishlistId);
            const added = toggleWishlist(productId);
            wishlistButton.classList.toggle("active", added);
            wishlistButton.setAttribute("aria-pressed", added ? "true" : "false");
            notify(added ? "Added to wishlist." : "Removed from wishlist.", "info");
        }

        const quickAddButton = event.target.closest("[data-quick-add]");

        if (quickAddButton) {
            const productId = Number(quickAddButton.dataset.quickAdd);
            const product = getProductById(productId);

            if (product) {
                const addResult = addToCart(product, "M", 1);
                if (addResult.ok) {
                    notify(`${product.name} added to cart.`, "success");
                } else if (addResult.reason === "out_of_stock") {
                    notify(`Only ${addResult.availableStock} left in stock for size M.`, "info");
                }
            }
        }
    });

    document.addEventListener("error", (event) => {
        const target = event.target;

        if (!(target instanceof HTMLImageElement)) {
            return;
        }

        if (target.dataset.fallbackApplied === "true") {
            return;
        }

        target.dataset.fallbackApplied = "true";
        target.src = "assets/images/logo/logo-black.png";
        target.classList.add("image-fallback");
    }, true);
}

function runAbandonedCartRecoveryCheck() {
    const meta = getCartMeta();
    const cart = getCart();
    if (!cart.length || !meta.updatedAt) {
        return;
    }

    const lastUpdate = new Date(meta.updatedAt).getTime();
    if (Number.isNaN(lastUpdate)) {
        return;
    }

    const idleHours = (Date.now() - lastUpdate) / (1000 * 60 * 60);
    if (idleHours >= 6) {
        notify("Your cart is waiting. Continue checkout before stock runs low.", "info");
    }
}

function refreshNavbar() {
    const navbarTarget = document.getElementById("navbar");
    if (!navbarTarget) {
        return;
    }

    navbarTarget.innerHTML = renderNavbarMarkup();
    initializeNavbarFeatures();
    updateCartCount();
    updateWishlistCount();
    loadMiniCart();
}

window.darkOcean = {
    storageKeys: STORAGE_KEYS,
    apiBase: API_BASE,
    backendState,
    checkBackend,
    formatCurrency,
    getCart,
    getCartMeta,
    setCart,
    addToCart,
    getProductStockBySize,
    updateCartCount,
    loadMiniCart,
    getCatalog,
    getProductById,
    getUserSession,
    clearUserSession,
    getOrders,
    getLastOrder,
    getInquiries,
    saveInquiry,
    getNotifications,
    pushNotification,
    trackFunnelEvent,
    getFunnelEvents,
    getSavedAddresses,
    saveAddress,
    validateCoupon,
    getRecommendedProducts,
    getCheckoutDraft,
    saveCheckoutDraft,
    clearCheckoutDraft,
    getWishlist,
    setWishlist,
    toggleWishlist,
    isWishlisted,
    getWishlistProducts,
    refreshSessionFromBackend,
    refreshCatalogFromBackend,
    refreshOrdersFromBackend,
    apiFetch,
    notify
};

window.addEventListener("cartUpdated", () => {
    updateCartCount();
    loadMiniCart();
});

window.addEventListener("wishlistUpdated", () => {
    updateWishlistCount();
});

const navbarTarget = document.getElementById("navbar");
if (navbarTarget) {
    refreshNavbar();
}

const footerTarget = document.getElementById("footer");
if (footerTarget) {
    footerTarget.innerHTML = renderFooterMarkup();
}

let mobileDockTarget = document.getElementById("mobileDockHost");
if (!mobileDockTarget) {
    mobileDockTarget = document.createElement("div");
    mobileDockTarget.id = "mobileDockHost";
    document.body.appendChild(mobileDockTarget);
}

mobileDockTarget.innerHTML = renderMobileDock();
updateCartCount();
updateWishlistCount();

initializeGlobalUiBehavior();
runAbandonedCartRecoveryCheck();
trackFunnelEvent("page_view", { page: getCurrentPage() });

// Best-effort background sync when running under a real server.
refreshSessionFromBackend();
refreshCatalogFromBackend();
