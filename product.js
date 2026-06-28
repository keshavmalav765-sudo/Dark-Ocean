const params = new URLSearchParams(window.location.search);
const requestedId = params.get("id");
let product = window.darkOcean.getProductById(requestedId);

const productName = document.getElementById("productName");
const productPrice = document.getElementById("productPrice");
const productDescription = document.getElementById("productDescription");
const mainImage = document.getElementById("mainImage");
const thumbnailRow = document.getElementById("thumbnailRow");
const addToCartBtn = document.getElementById("addToCartBtn");
const sizeButtons = document.querySelectorAll(".size-btn");
const productStatus = document.getElementById("productStatus");
const selectedQty = document.getElementById("selectedQty");
const decreaseQtyBtn = document.getElementById("decreaseQtyBtn");
const increaseQtyBtn = document.getElementById("increaseQtyBtn");
const relatedGrid = document.getElementById("relatedGrid");
const relatedSection = document.getElementById("relatedSection");
const productRating = document.getElementById("productRating");
const productReviewsCount = document.getElementById("productReviewsCount");
const productSku = document.getElementById("productSku");
const productStock = document.getElementById("productStock");
const productColors = document.getElementById("productColors");
const productMaterials = document.getElementById("productMaterials");
const detailFabric = document.getElementById("detailFabric");
const detailCare = document.getElementById("detailCare");
const detailFit = document.getElementById("detailFit");
const detailModel = document.getElementById("detailModel");
const reviewsGrid = document.getElementById("reviewsGrid");
const wishlistBtn = document.getElementById("wishlistBtn");
const stickyBuyBar = document.getElementById("stickyBuyBar");
const stickyProductName = document.getElementById("stickyProductName");
const stickyProductPrice = document.getElementById("stickyProductPrice");
const stickyAddBtn = document.getElementById("stickyAddBtn");

let selectedSize = "M";
let quantity = 1;

const REVIEW_POOL = [
    { name: "Aarav M.", text: "Perfect structure and premium finishing. Looks even better in person." },
    { name: "Rahul P.", text: "Great fit around shoulders. Feels sharp without being loud." },
    { name: "Karan S.", text: "Fabric quality is top-tier and delivery was smooth." },
    { name: "Ishaan R.", text: "Clean silhouette. Easy to style for both work and evening events." }
];

function setProductStatus(message, type) {
    if (!productStatus) {
        return;
    }

    productStatus.innerText = message;
    productStatus.classList.remove("is-error", "is-success");

    if (type === "error") {
        productStatus.classList.add("is-error");
    }

    if (type === "success") {
        productStatus.classList.add("is-success");
    }
}

function setQuantity(nextQuantity) {
    quantity = Math.min(10, Math.max(1, Number(nextQuantity) || 1));

    if (selectedQty) {
        selectedQty.innerText = String(quantity);
    }

    if (decreaseQtyBtn) {
        decreaseQtyBtn.disabled = quantity <= 1;
    }

    if (increaseQtyBtn) {
        increaseQtyBtn.disabled = quantity >= 10;
    }
}

function selectImage(imageUrl, clickedThumb) {
    if (!mainImage || !product) {
        return;
    }

    mainImage.src = imageUrl;
    mainImage.alt = product.name;

    document.querySelectorAll(".thumbnail").forEach((thumb) => thumb.classList.remove("active"));

    if (clickedThumb) {
        clickedThumb.classList.add("active");
    }
}

function renderGallery() {
    if (!thumbnailRow || !product) {
        return;
    }

    const gallery = Array.isArray(product.gallery) && product.gallery.length ? product.gallery : [product.image];
    thumbnailRow.innerHTML = "";

    gallery.forEach((imageUrl, index) => {
        const thumbnail = document.createElement("img");
        thumbnail.src = imageUrl;
        thumbnail.alt = `${product.name} view ${index + 1}`;
        thumbnail.className = "thumbnail";
        thumbnail.loading = "lazy";

        thumbnail.addEventListener("click", () => selectImage(imageUrl, thumbnail));
        thumbnailRow.appendChild(thumbnail);

        if (index === 0) {
            selectImage(imageUrl, thumbnail);
        }
    });
}

function createRelatedCard(relatedProduct) {
    return `
        <a href="product.html?id=${relatedProduct.id}" class="product-link">
            <div class="product-card related-card">
                <div class="image-container">
                    <img src="${relatedProduct.image}" alt="${relatedProduct.name}" loading="lazy">
                </div>
                <h3>${relatedProduct.name}</h3>
                <p class="price">${window.darkOcean.formatCurrency(relatedProduct.price)}</p>
            </div>
        </a>
    `;
}

function renderRelatedProducts() {
    if (!product || !relatedGrid || !relatedSection) {
        return;
    }

    const relatedProducts = window.darkOcean
        .getRecommendedProducts(product.id)
        .slice(0, 3);

    if (!relatedProducts.length) {
        relatedSection.style.display = "none";
        return;
    }

    relatedGrid.innerHTML = relatedProducts.map(createRelatedCard).join("");
}

function renderReviews() {
    if (!reviewsGrid || !product) {
        return;
    }

    const generated = REVIEW_POOL.slice(0, 3).map((review, index) => ({
        ...review,
        stars: 5 - (index % 2 === 0 ? 0 : 1)
    }));

    reviewsGrid.innerHTML = generated.map((review) => `
        <article class="review-card">
            <p class="review-stars">Rating ${review.stars}/5</p>
            <p>${review.text}</p>
            <strong>${review.name}</strong>
            <span>Verified buyer</span>
        </article>
    `).join("");
}

function populateProduct() {
    if (!product) {
        document.title = "Product Not Found | Dark Ocean";
        if (productName) {
            productName.innerText = "This product could not be found.";
        }

        if (productPrice) {
            productPrice.innerText = "";
        }

        if (productDescription) {
            productDescription.innerText = "The piece may have been removed from the local catalog.";
        }

        if (addToCartBtn) {
            addToCartBtn.disabled = true;
            addToCartBtn.innerText = "Unavailable";
        }

        if (relatedSection) {
            relatedSection.style.display = "none";
        }

        return;
    }

    document.title = `${product.name} | Dark Ocean`;

    if (productName) {
        productName.innerText = product.name;
    }

    if (stickyProductName) {
        stickyProductName.innerText = product.name;
    }

    if (productPrice) {
        productPrice.innerText = window.darkOcean.formatCurrency(product.price);
    }

    if (stickyProductPrice) {
        stickyProductPrice.innerText = window.darkOcean.formatCurrency(product.price);
    }

    if (productDescription) {
        productDescription.innerText = product.description;
    }

    if (productSku) {
        productSku.innerText = product.sku || "-";
    }

    if (productColors) {
        productColors.innerText = (product.colors || []).join(", ") || "-";
    }

    if (productMaterials) {
        productMaterials.innerText = (product.materials || []).join(", ") || "-";
    }

    if (productRating) {
        productRating.innerText = `Rating ${Number(product.rating).toFixed(1)}`;
    }

    if (productReviewsCount) {
        productReviewsCount.innerText = `(${product.reviewsCount} reviews)`;
    }

    if (detailFabric) {
        detailFabric.innerText = product.fabric;
    }

    if (detailCare) {
        detailCare.innerText = product.care;
    }

    if (detailFit) {
        detailFit.innerText = product.fit;
    }

    if (detailModel) {
        detailModel.innerText = product.modelInfo;
    }

    if (wishlistBtn) {
        const active = window.darkOcean.isWishlisted(product.id);
        wishlistBtn.classList.toggle("active", active);
        wishlistBtn.innerText = active ? "Wishlisted" : "Save to Wishlist";
    }

    renderGallery();
    renderRelatedProducts();
    renderReviews();
}

function addProductToCart() {
    if (!product) {
        return;
    }

    const addResult = window.darkOcean.addToCart(product, selectedSize, quantity);
    if (!addResult.ok) {
        if (addResult.reason === "out_of_stock") {
            setProductStatus(`Only ${addResult.availableStock} left for size ${selectedSize}.`, "error");
            window.darkOcean.notify("Size stock limit reached.", "info");
            if (productStock) {
                productStock.innerText = `${addResult.availableStock} (size ${selectedSize})`;
            }
            return;
        }

        setProductStatus("Unable to add product to cart.", "error");
        return;
    }

    window.darkOcean.notify(`${product.name} added to cart.`, "success");
    setProductStatus(`${quantity} item${quantity > 1 ? "s" : ""} added to your cart.`, "success");
    setQuantity(1);
}

async function initProductPage() {
    try {
        await window.darkOcean.refreshCatalogFromBackend();
    } catch (error) {
        // ignore
    }

    product = window.darkOcean.getProductById(requestedId);
    populateProduct();
    setQuantity(1);

    if (product) {
        window.darkOcean.trackFunnelEvent("view_product", { productId: product.id });
        if (productStock) {
            productStock.innerText = `${window.darkOcean.getProductStockBySize(product.id, selectedSize)} (size ${selectedSize})`;
        }
    }
}

initProductPage();

if (addToCartBtn) {
    addToCartBtn.addEventListener("click", addProductToCart);
}

if (stickyAddBtn) {
    stickyAddBtn.addEventListener("click", addProductToCart);
}

if (wishlistBtn) {
    wishlistBtn.addEventListener("click", () => {
        if (!product) {
            return;
        }

        const active = window.darkOcean.toggleWishlist(product.id);
        wishlistBtn.classList.toggle("active", active);
        wishlistBtn.innerText = active ? "Wishlisted" : "Save to Wishlist";
    });
}

if (decreaseQtyBtn) {
    decreaseQtyBtn.addEventListener("click", () => setQuantity(quantity - 1));
}

if (increaseQtyBtn) {
    increaseQtyBtn.addEventListener("click", () => setQuantity(quantity + 1));
}

sizeButtons.forEach((button) => {
    button.addEventListener("click", () => {
        sizeButtons.forEach((sizeButton) => sizeButton.classList.remove("active"));
        button.classList.add("active");
        selectedSize = button.innerText.trim();
        if (productStock && product) {
            productStock.innerText = `${window.darkOcean.getProductStockBySize(product.id, selectedSize)} (size ${selectedSize})`;
        }
        setProductStatus("", "");
    });
});

if (stickyBuyBar) {
    window.addEventListener("scroll", () => {
        stickyBuyBar.classList.toggle("active", window.scrollY > 380);
    });
}
