const wishlistGrid = document.getElementById("wishlistGrid");

function createWishlistCard(product) {
    return `
        <article class="wishlist-card">
            <a href="product.html?id=${product.id}">
                <img src="${product.image}" alt="${product.name}">
            </a>
            <h3>${product.name}</h3>
            <p class="price">${window.darkOcean.formatCurrency(product.price)}</p>
            <p>Rating ${Number(product.rating).toFixed(1)} (${product.reviewsCount})</p>
            <div class="wishlist-actions">
                <button class="ghost-btn" type="button" data-quick-add="${product.id}">Quick Add</button>
                <button class="ghost-btn" type="button" data-remove-id="${product.id}">Remove</button>
                <a class="text-link" href="product.html?id=${product.id}">View</a>
            </div>
        </article>
    `;
}

function renderWishlist() {
    const products = window.darkOcean.getWishlistProducts();

    if (!wishlistGrid) {
        return;
    }

    if (!products.length) {
        wishlistGrid.innerHTML = '<div class="empty-state"><h3>Your wishlist is empty.</h3><p>Save pieces from the shop to view them here.</p><a href="shop.html" class="lux-btn">Explore Collection</a></div>';
        return;
    }

    wishlistGrid.innerHTML = products.map(createWishlistCard).join("");
}

if (wishlistGrid) {
    wishlistGrid.addEventListener("click", (event) => {
        const removeBtn = event.target.closest("[data-remove-id]");

        if (!removeBtn) {
            return;
        }

        const productId = Number(removeBtn.dataset.removeId);
        const next = window.darkOcean.getWishlist().filter((id) => id !== productId);
        window.darkOcean.setWishlist(next);
        renderWishlist();
    });
}

window.addEventListener("wishlistUpdated", renderWishlist);
renderWishlist();
