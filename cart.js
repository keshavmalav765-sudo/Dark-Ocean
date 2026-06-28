const cartItemsContainer = document.getElementById("cartItems");
const totalPrice = document.getElementById("totalPrice");
const cartMeta = document.getElementById("cartMeta");
const clearCartBtn = document.getElementById("clearCartBtn");
const checkoutBtn = document.getElementById("checkoutBtn");
const couponCodeInput = document.getElementById("couponCode");
const applyCouponBtn = document.getElementById("applyCouponBtn");
const couponStatus = document.getElementById("couponStatus");
const discountLine = document.getElementById("discountLine");
const discountValue = document.getElementById("discountValue");
const finalTotalLine = document.getElementById("finalTotalLine");
const finalTotalValue = document.getElementById("finalTotalValue");

let activeCoupon = null;

function getSession() {
    return window.darkOcean.getUserSession();
}

async function initCartSession() {
    await window.darkOcean.refreshSessionFromBackend();
    renderCart();
}

function updateCartMeta(itemCount, totalValue) {
    const session = getSession();

    if (cartMeta) {
        cartMeta.innerText = `${itemCount} item${itemCount === 1 ? "" : "s"} in your cart`;
    }

    if (checkoutBtn) {
        if (!itemCount) {
            checkoutBtn.classList.add("is-disabled");
            checkoutBtn.setAttribute("aria-disabled", "true");
            checkoutBtn.setAttribute("tabindex", "-1");
            checkoutBtn.innerText = "Proceed to Checkout";
            checkoutBtn.setAttribute("href", "checkout.html");
        } else {
            checkoutBtn.classList.remove("is-disabled");
            checkoutBtn.removeAttribute("aria-disabled");
            checkoutBtn.removeAttribute("tabindex");
            if (session.active) {
                checkoutBtn.innerText = "Proceed to Checkout";
                checkoutBtn.setAttribute("href", "checkout.html");
            } else {
                checkoutBtn.innerText = "Login to Checkout";
                checkoutBtn.setAttribute("href", "login.html");
            }
        }
    }

    if (clearCartBtn) {
        clearCartBtn.disabled = !itemCount;
    }

    if (totalPrice) {
        totalPrice.innerText = Number(totalValue).toLocaleString("en-IN");
    }

    if (activeCoupon && activeCoupon.valid) {
        renderCouponDiscount(totalValue);
    }
}

function renderCart() {
    if (!cartItemsContainer || !totalPrice) {
        return;
    }

    const cart = window.darkOcean.getCart();
    cartItemsContainer.innerHTML = "";

    if (!cart.length) {
        cartItemsContainer.innerHTML = `
            <div class="empty-state">
                <h3>Your cart is empty.</h3>
                <p>Add pieces from the collection to begin your order.</p>
                <a href="shop.html" class="lux-btn">Explore Collection</a>
            </div>
        `;
        updateCartMeta(0, 0);
        resetCouponUi();
        return;
    }

    let total = 0;
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    cart.forEach((item, index) => {
        total += item.price * item.quantity;

        const itemElement = document.createElement("div");
        itemElement.className = "cart-item";
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-copy">
                <h3>${item.name}</h3>
                <p>Size: ${item.size || "-"}</p>
                <p>${window.darkOcean.formatCurrency(item.price)}</p>
            </div>
            <div class="qty-controls">
                <button type="button" data-action="decrease" data-index="${index}" aria-label="Decrease quantity">-</button>
                <span>${item.quantity}</span>
                <button type="button" data-action="increase" data-index="${index}" aria-label="Increase quantity">+</button>
            </div>
            <button class="remove-btn" type="button" data-action="remove" data-index="${index}">
                Remove
            </button>
        `;

        cartItemsContainer.appendChild(itemElement);
    });

    updateCartMeta(totalItems, total);
}

function resetCouponUi() {
    activeCoupon = null;
    if (couponStatus) {
        couponStatus.innerText = "";
        couponStatus.classList.remove("is-error", "is-success");
    }
    if (discountLine) {
        discountLine.hidden = true;
    }
    if (finalTotalLine) {
        finalTotalLine.hidden = true;
    }
}

function renderCouponDiscount(totalValue) {
    if (!activeCoupon || !activeCoupon.valid) {
        return;
    }

    const result = window.darkOcean.validateCoupon(activeCoupon.code, totalValue);
    if (!result.valid) {
        resetCouponUi();
        return;
    }

    activeCoupon = result;
    if (discountLine && discountValue) {
        discountLine.hidden = false;
        discountValue.innerText = window.darkOcean.formatCurrency(result.discount);
    }

    if (finalTotalLine && finalTotalValue) {
        finalTotalLine.hidden = false;
        finalTotalValue.innerText = window.darkOcean.formatCurrency(result.finalTotal);
    }
}

function updateCartItem(index, action) {
    const cart = window.darkOcean.getCart();
    const item = cart[index];

    if (!item) {
        return;
    }

    if (action === "increase") {
        const availableStock = window.darkOcean.getProductStockBySize(item.productId, item.size);
        if (item.quantity + 1 > availableStock) {
            window.darkOcean.notify(`Only ${availableStock} left in stock for size ${item.size}.`, "info");
            return;
        }

        item.quantity += 1;
    }

    if (action === "decrease") {
        item.quantity -= 1;
        if (item.quantity <= 0) {
            cart.splice(index, 1);
        }
    }

    if (action === "remove") {
        cart.splice(index, 1);
    }

    window.darkOcean.setCart(cart);
    renderCart();
}

if (cartItemsContainer) {
    cartItemsContainer.addEventListener("click", (event) => {
        const button = event.target.closest("button[data-action]");

        if (!button) {
            return;
        }

        updateCartItem(Number(button.dataset.index), button.dataset.action);
    });

    window.addEventListener("cartUpdated", renderCart);
    renderCart();
    initCartSession();
}

if (clearCartBtn) {
    clearCartBtn.addEventListener("click", () => {
        window.darkOcean.setCart([]);
        renderCart();
        window.darkOcean.notify("Cart cleared.", "info");
        window.darkOcean.trackFunnelEvent("cart_cleared", {});
    });
}

if (checkoutBtn) {
    checkoutBtn.addEventListener("click", (event) => {
        const session = getSession();
        const cart = window.darkOcean.getCart();

        if (!cart.length) {
            event.preventDefault();
            return;
        }

        if (!session.active) {
            event.preventDefault();
            window.darkOcean.notify("Please login first to continue checkout.", "info");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 250);
            return;
        }

        window.darkOcean.trackFunnelEvent("checkout_click", { coupon: activeCoupon && activeCoupon.code ? activeCoupon.code : "" });
    });
}

if (applyCouponBtn && couponCodeInput) {
    applyCouponBtn.addEventListener("click", () => {
        const cart = window.darkOcean.getCart();
        const totalValue = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const code = String(couponCodeInput.value || "").trim().toUpperCase();
        const result = window.darkOcean.validateCoupon(code, totalValue);

        if (!couponStatus) {
            return;
        }

        couponStatus.classList.remove("is-error", "is-success");

        if (!result.valid) {
            activeCoupon = null;
            if (result.reason === "min_total") {
                couponStatus.innerText = `Minimum order should be ${window.darkOcean.formatCurrency(result.minTotal || 0)}.`;
            } else {
                couponStatus.innerText = "Invalid coupon code.";
            }
            couponStatus.classList.add("is-error");
            if (discountLine) {
                discountLine.hidden = true;
            }
            if (finalTotalLine) {
                finalTotalLine.hidden = true;
            }
            return;
        }

        activeCoupon = result;
        couponStatus.innerText = `Coupon ${result.code} applied successfully.`;
        couponStatus.classList.add("is-success");
        renderCouponDiscount(totalValue);
        window.darkOcean.trackFunnelEvent("coupon_applied", { code: result.code, discount: result.discount });
    });
}
