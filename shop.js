const sortSelect = document.getElementById("sort");
const categoryFilters = document.querySelectorAll('input[name="category"]');
const priceFilters = document.querySelectorAll('input[name="price"]');
const searchInput = document.getElementById("searchInput");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");
const productGrid = document.getElementById("productGrid");
const resultMeta = document.getElementById("resultMeta");
const activeFilterChips = document.getElementById("activeFilterChips");
const searchSuggestions = document.getElementById("searchSuggestions");
const recommendGrid = document.getElementById("recommendGrid");
const recommendStrip = document.getElementById("recommendStrip");

const SEARCH_SYNONYMS = {
    blazer: "jacket",
    sherwani: "suit",
    pant: "trousers",
    pants: "trousers",
    trouser: "trousers",
    coat: "coat",
    formal: "suit",
    tneck: "turtleneck"
};

function getSelectedCategories() {
    return Array.from(categoryFilters)
        .filter((input) => input.checked)
        .map((input) => input.value);
}

function getSelectedPriceRange() {
    const selected = Array.from(priceFilters).find((input) => input.checked);
    return selected ? selected.value : "all";
}

function getSearchQuery() {
    return String(searchInput ? searchInput.value : "").trim().toLowerCase();
}

function normalizeSearchQuery(rawQuery) {
    const words = String(rawQuery || "").toLowerCase().split(/\s+/).filter(Boolean);
    const expanded = words.flatMap((word) => {
        const mapped = SEARCH_SYNONYMS[word];
        return mapped ? [word, mapped] : [word];
    });
    return [...new Set(expanded)].join(" ");
}

function matchesPriceRange(price, range) {
    if (range === "low") {
        return price < 5000;
    }

    if (range === "mid") {
        return price >= 5000 && price <= 15000;
    }

    if (range === "high") {
        return price > 15000;
    }

    return true;
}

function sortProducts(products, sortValue) {
    const sorted = [...products];

    if (sortValue === "low-high") {
        sorted.sort((a, b) => a.price - b.price);
    }

    if (sortValue === "high-low") {
        sorted.sort((a, b) => b.price - a.price);
    }

    if (sortValue === "name") {
        sorted.sort((a, b) => a.name.localeCompare(b.name));
    }

    return sorted;
}

function createProductCard(product) {
    const wishlistActive = window.darkOcean.isWishlisted(product.id);
    const secondaryImage = product.gallery && product.gallery[1] ? product.gallery[1] : product.image;
    const stockM = window.darkOcean.getProductStockBySize(product.id, "M");

    return `
        <article class="product-card interactive-card">
            ${product.badge ? `<span class="product-badge">${product.badge}</span>` : ""}
            <button type="button" class="wishlist-btn ${wishlistActive ? "active" : ""}" data-wishlist-id="${product.id}" aria-label="Toggle wishlist" aria-pressed="${wishlistActive ? "true" : "false"}">Wish</button>

            <a href="product.html?id=${product.id}" class="product-link">
                <div class="image-container has-alt">
                    <img src="${product.image}" alt="${product.name} by Dark Ocean" class="img-primary" loading="lazy">
                    <img src="${secondaryImage}" alt="${product.name} alternate view" class="img-secondary" loading="lazy">
                    <div class="overlay"><span>View Product</span></div>
                </div>
                <h3>${product.name}</h3>
                <p class="price">&#8377;${Number(product.price).toLocaleString("en-IN")}</p>
                <p class="product-rating">Rating ${Number(product.rating).toFixed(1)} (${product.reviewsCount})</p>
                <p class="product-rating">Stock (M): ${stockM}</p>
            </a>

            <div class="card-actions">
                <button type="button" class="ghost-btn small-pill" data-quick-add="${product.id}">Quick Add</button>
                <a href="product.html?id=${product.id}" class="text-link">Details</a>
            </div>
        </article>
    `;
}

function getFilterState() {
    return {
        categories: getSelectedCategories(),
        price: getSelectedPriceRange(),
        search: getSearchQuery(),
        sort: sortSelect ? sortSelect.value : "featured"
    };
}

function syncFiltersToUrl(state) {
    const url = new URL(window.location.href);

    url.searchParams.delete("category");
    state.categories.forEach((category) => url.searchParams.append("category", category));

    if (state.price && state.price !== "all") {
        url.searchParams.set("price", state.price);
    } else {
        url.searchParams.delete("price");
    }

    if (state.search) {
        url.searchParams.set("search", state.search);
    } else {
        url.searchParams.delete("search");
    }

    if (state.sort && state.sort !== "featured") {
        url.searchParams.set("sort", state.sort);
    } else {
        url.searchParams.delete("sort");
    }

    window.history.replaceState({}, "", url);
}

function renderFilterChips(state) {
    if (!activeFilterChips) {
        return;
    }

    const chips = [];

    state.categories.forEach((category) => {
        chips.push(`<button type="button" class="filter-chip" data-chip-type="category" data-chip-value="${category}">${category}</button>`);
    });

    if (state.price !== "all") {
        chips.push(`<button type="button" class="filter-chip" data-chip-type="price" data-chip-value="${state.price}">${state.price} price</button>`);
    }

    if (state.search) {
        chips.push(`<button type="button" class="filter-chip" data-chip-type="search" data-chip-value="${state.search}">"${state.search}"</button>`);
    }

    activeFilterChips.innerHTML = chips.length ? chips.join("") : "";
}

function renderResultMeta(visibleCount, totalCount) {
    if (!resultMeta) {
        return;
    }

    if (!visibleCount) {
        resultMeta.innerText = "No matching products. Adjust filters to explore more pieces.";
        return;
    }

    resultMeta.innerText = `Showing ${visibleCount} of ${totalCount} products.`;
}

function showLoadingSkeleton() {
    if (!productGrid) {
        return;
    }

    productGrid.innerHTML = Array.from({ length: 6 }).map(() => `
        <div class="skeleton-card">
            <div class="skeleton skeleton-image"></div>
            <div class="skeleton skeleton-line"></div>
            <div class="skeleton skeleton-line short"></div>
        </div>
    `).join("");
}

function renderProducts() {
    if (!productGrid) {
        return;
    }

    const allProducts = window.darkOcean.getCatalog();
    const state = getFilterState();

    syncFiltersToUrl(state);
    renderFilterChips(state);

    const normalizedQuery = normalizeSearchQuery(state.search);
    const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);

    const filteredProducts = allProducts.filter((product) => {
        const categoryMatch = !state.categories.length || state.categories.includes(product.category);
        const priceMatch = matchesPriceRange(Number(product.price), state.price);
        const searchableText = [
            product.name,
            product.category,
            product.description,
            product.fabric,
            (product.materials || []).join(" ")
        ].join(" ").toLowerCase();
        const searchMatch = !state.search || queryTokens.every((token) => searchableText.includes(token));

        return categoryMatch && priceMatch && searchMatch;
    });

    const sortedProducts = sortProducts(filteredProducts, state.sort);

    renderResultMeta(sortedProducts.length, allProducts.length);

    if (!sortedProducts.length) {
        productGrid.innerHTML = '<p class="empty-state">No products match your current filters.</p>';
        return;
    }

    productGrid.innerHTML = sortedProducts.map(createProductCard).join("");
}

function renderRecommendations() {
    if (!recommendGrid || !recommendStrip) {
        return;
    }

    const recommendations = window.darkOcean.getRecommendedProducts(null).slice(0, 3);
    if (!recommendations.length) {
        recommendStrip.hidden = true;
        return;
    }

    recommendGrid.innerHTML = recommendations.map(createProductCard).join("");
    recommendStrip.hidden = false;
}

function renderSearchSuggestions() {
    if (!searchSuggestions) {
        return;
    }

    const catalog = window.darkOcean.getCatalog();
    const options = new Set();

    catalog.forEach((product) => {
        options.add(product.name);
        options.add(product.category);
        options.add(product.fabric);
        (product.materials || []).forEach((material) => options.add(material));
    });

    Object.keys(SEARCH_SYNONYMS).forEach((key) => options.add(key));
    searchSuggestions.innerHTML = Array.from(options).slice(0, 40).map((value) => `<option value="${value}"></option>`).join("");
}

function applyUrlFilters() {
    const url = new URL(window.location.href);
    const urlCategories = url.searchParams.getAll("category");
    const urlPrice = url.searchParams.get("price") || "all";
    const urlSearch = url.searchParams.get("search") || "";
    const urlSort = url.searchParams.get("sort") || "featured";

    categoryFilters.forEach((input) => {
        input.checked = urlCategories.includes(input.value);
    });

    const priceMatch = Array.from(priceFilters).find((input) => input.value === urlPrice);
    if (priceMatch) {
        priceMatch.checked = true;
    }

    if (searchInput) {
        searchInput.value = urlSearch;
    }

    if (sortSelect) {
        sortSelect.value = urlSort;
    }
}

function clearAllFilters() {
    categoryFilters.forEach((input) => {
        input.checked = false;
    });

    const allPrice = Array.from(priceFilters).find((input) => input.value === "all");
    if (allPrice) {
        allPrice.checked = true;
    }

    if (searchInput) {
        searchInput.value = "";
    }

    if (sortSelect) {
        sortSelect.value = "featured";
    }

    renderProducts();
}

if (sortSelect) {
    sortSelect.addEventListener("change", renderProducts);
}

categoryFilters.forEach((input) => input.addEventListener("change", renderProducts));
priceFilters.forEach((input) => input.addEventListener("change", renderProducts));

if (searchInput) {
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim();
        if (query.length >= 3) {
            window.darkOcean.trackFunnelEvent("search", { query });
        }
        renderProducts();
    });
}

if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", clearAllFilters);
}

if (activeFilterChips) {
    activeFilterChips.addEventListener("click", (event) => {
        const chip = event.target.closest("[data-chip-type]");

        if (!chip) {
            return;
        }

        const chipType = chip.dataset.chipType;
        const chipValue = chip.dataset.chipValue;

        if (chipType === "category") {
            const categoryInput = Array.from(categoryFilters).find((input) => input.value === chipValue);
            if (categoryInput) {
                categoryInput.checked = false;
            }
        }

        if (chipType === "price") {
            const allPrice = Array.from(priceFilters).find((input) => input.value === "all");
            if (allPrice) {
                allPrice.checked = true;
            }
        }

        if (chipType === "search" && searchInput) {
            searchInput.value = "";
        }

        renderProducts();
    });
}

window.addEventListener("wishlistUpdated", renderProducts);
window.addEventListener("wishlistUpdated", renderRecommendations);

showLoadingSkeleton();
applyUrlFilters();

(async () => {
    try {
        await window.darkOcean.refreshCatalogFromBackend();
    } catch (error) {
        // ignore
    }

    renderSearchSuggestions();
    renderProducts();
    renderRecommendations();
})();
