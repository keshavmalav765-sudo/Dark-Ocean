const checkoutForm = document.getElementById("checkoutForm");
const checkoutItems = document.getElementById("checkoutItems");
const checkoutTotal = document.getElementById("checkoutTotal");
const checkoutStatus = document.getElementById("checkoutStatus");
const submitOrderBtn = document.getElementById("submitOrderBtn");

function getCheckoutSession() {
    return window.darkOcean.getUserSession();
}

function disableCheckoutFormForGuests() {
    if (!checkoutForm) {
        return;
    }

    const fields = checkoutForm.querySelectorAll("input");
    fields.forEach((field) => {
        field.disabled = true;
    });

    if (submitOrderBtn) {
        submitOrderBtn.disabled = false;
        submitOrderBtn.innerText = "Login to Continue";
    }
}

function setStatus(message, type) {
    if (!checkoutStatus) {
        return;
    }

    checkoutStatus.innerText = message;
    checkoutStatus.classList.remove("is-error", "is-success");

    if (type === "error") {
        checkoutStatus.classList.add("is-error");
    }

    if (type === "success") {
        checkoutStatus.classList.add("is-success");
    }
}

function getFormValue(formData, key) {
    return String(formData.get(key) || "").trim();
}

function getCartTotals() {
    const cart = window.darkOcean.getCart();
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return { cart, total, itemCount };
}

function renderCheckoutSummary() {
    if (!checkoutItems || !checkoutTotal) {
        return;
    }

    const { cart, total } = getCartTotals();
    checkoutItems.innerHTML = "";

    if (!cart.length) {
        checkoutItems.innerHTML = `
            <div class="empty-state">
                <p>Your cart is empty. Add a product before checkout.</p>
                <a href="shop.html" class="lux-btn">Go To Shop</a>
            </div>
        `;
        checkoutTotal.innerText = window.darkOcean.formatCurrency(0);

        if (submitOrderBtn) {
            submitOrderBtn.disabled = true;
        }
        return;
    }

    cart.forEach((item) => {
        const itemElement = document.createElement("div");
        itemElement.className = "checkout-item";
        itemElement.innerHTML = `
            <div>
                <h4>${item.name}</h4>
                <p>${item.size ? `Size ${item.size} - ` : ""}Qty ${item.quantity}</p>
            </div>
            <strong>${window.darkOcean.formatCurrency(item.price * item.quantity)}</strong>
        `;
        checkoutItems.appendChild(itemElement);
    });

    checkoutTotal.innerText = window.darkOcean.formatCurrency(total);
}

function validateShipping(shipping) {
    if (!shipping.fullName || shipping.fullName.length < 3) {
        return "Enter your full name.";
    }

    if (!/^\S+@\S+\.\S+$/.test(shipping.email)) {
        return "Enter a valid email address.";
    }

    if (!/^\d{10}$/.test(shipping.phone.replace(/\D/g, ""))) {
        return "Enter a valid 10-digit phone number.";
    }

    if (!shipping.address || shipping.address.length < 6) {
        return "Enter a complete shipping address.";
    }

    if (!shipping.city) {
        return "Enter your city.";
    }

    if (!/^\d{6}$/.test(shipping.postalCode)) {
        return "Enter a valid 6-digit postal code.";
    }

    return "";
}

async function initCheckout() {
    await window.darkOcean.refreshSessionFromBackend();

    const session = getCheckoutSession();
    const emailInput = document.getElementById("email");

    if (session.active && session.email && emailInput && !emailInput.value) {
        emailInput.value = session.email;
    }

    const draft = window.darkOcean.getCheckoutDraft();
    if (draft && draft.shipping) {
        const { shipping } = draft;
        const map = {
            fullName: "fullName",
            email: "email",
            phone: "phone",
            address: "address",
            city: "city",
            postalCode: "postalCode"
        };

        Object.keys(map).forEach((key) => {
            const input = document.getElementById(map[key]);
            if (input && shipping[key]) {
                input.value = shipping[key];
            }
        });
    }

    if (!session.active) {
        setStatus("Please login first to continue.", "error");
        disableCheckoutFormForGuests();
    }

    checkoutForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const activeSession = getCheckoutSession();
        if (!activeSession.active) {
            setStatus("Please login first to continue.", "error");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 350);
            return;
        }

        const { cart, total, itemCount } = getCartTotals();
        if (!cart.length) {
            setStatus("Your cart is empty.", "error");
            return;
        }

        const formData = new FormData(checkoutForm);
        const shipping = {
            fullName: getFormValue(formData, "fullName"),
            email: getFormValue(formData, "email"),
            phone: getFormValue(formData, "phone"),
            address: getFormValue(formData, "address"),
            city: getFormValue(formData, "city"),
            postalCode: getFormValue(formData, "postalCode")
        };

        const validationError = validateShipping(shipping);
        if (validationError) {
            setStatus(validationError, "error");
            return;
        }

        window.darkOcean.saveCheckoutDraft({
            shipping,
            cart,
            total,
            itemCount,
            createdAt: new Date().toISOString()
        });

        setStatus("Shipping saved. Redirecting to payment...", "success");
        setTimeout(() => {
            window.location.href = "payment.html";
        }, 300);
    });
}

if (checkoutForm) {
    initCheckout();
}

renderCheckoutSummary();
