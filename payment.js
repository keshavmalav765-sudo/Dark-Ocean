const paymentForm = document.getElementById("paymentForm");
const paymentItems = document.getElementById("paymentItems");
const paymentTotal = document.getElementById("paymentTotal");
const paymentStatus = document.getElementById("paymentStatus");
const paymentMethodSelect = document.getElementById("paymentMethod");
const submitOrderBtn = document.getElementById("submitOrderBtn");
const retryPaymentBtn = document.getElementById("retryPaymentBtn");
const paymentModal = document.getElementById("paymentModal");
const paymentModalTitle = document.getElementById("paymentModalTitle");
const paymentModalText = document.getElementById("paymentModalText");
const shipName = document.getElementById("shipName");
const shipEmail = document.getElementById("shipEmail");
const shipPhone = document.getElementById("shipPhone");
const shipAddress = document.getElementById("shipAddress");
const shipEta = document.getElementById("shipEta");

const paymentSections = {
    upi: document.getElementById("upiFields"),
    card: document.getElementById("cardFields"),
    cod: document.getElementById("codFields")
};

const paymentInputs = {
    upiId: document.getElementById("upiId"),
    cardName: document.getElementById("cardName"),
    cardNumber: document.getElementById("cardNumber"),
    cardExpiry: document.getElementById("cardExpiry"),
    cardCvv: document.getElementById("cardCvv")
};

let pendingPaymentPayload = null;
let checkoutDraft = null;

function setStatus(message, type) {
    if (!paymentStatus) {
        return;
    }

    paymentStatus.innerText = message;
    paymentStatus.classList.remove("is-error", "is-success");

    if (type === "error") {
        paymentStatus.classList.add("is-error");
    }

    if (type === "success") {
        paymentStatus.classList.add("is-success");
    }
}

function setFieldError(fieldKey, message) {
    const target = document.getElementById(`${fieldKey}Error`);

    if (!target) {
        return;
    }

    target.innerText = message || "";
}

function clearPaymentErrors() {
    ["paymentMethod", "upiId", "cardName", "cardNumber", "cardExpiry", "cardCvv"].forEach((key) => setFieldError(key, ""));
}

function toggleRetryButton(show) {
    if (!retryPaymentBtn) {
        return;
    }

    retryPaymentBtn.hidden = !show;
    retryPaymentBtn.disabled = !show;
    retryPaymentBtn.style.display = show ? "inline-flex" : "";
}

function getFormValue(formData, key) {
    return String(formData.get(key) || "").trim();
}

function showPaymentFields(method) {
    Object.values(paymentSections).forEach((section) => {
        if (section) {
            section.hidden = true;
        }
    });

    if (method && paymentSections[method]) {
        paymentSections[method].hidden = false;
    }

    clearPaymentErrors();
    updateSubmitLabel();
}

function formatCardNumberInput(value) {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiryInput(value) {
    const digits = value.replace(/\D/g, "").slice(0, 4);

    if (digits.length <= 2) {
        return digits;
    }

    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function isValidLuhn(cardNumber) {
    let sum = 0;
    let shouldDouble = false;

    for (let i = cardNumber.length - 1; i >= 0; i -= 1) {
        let digit = Number(cardNumber[i]);

        if (shouldDouble) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }

        sum += digit;
        shouldDouble = !shouldDouble;
    }

    return sum % 10 === 0;
}

function setPaymentModal(visible, title, text) {
    if (!paymentModal) {
        return;
    }

    paymentModal.hidden = !visible;

    if (paymentModalTitle && title) {
        paymentModalTitle.innerText = title;
    }

    if (paymentModalText && text) {
        paymentModalText.innerText = text;
    }
}

function updateSubmitLabel() {
    if (!submitOrderBtn || !paymentMethodSelect || !checkoutDraft) {
        return;
    }

    const method = paymentMethodSelect.value;

    if (!method) {
        submitOrderBtn.innerText = "Complete Purchase";
        return;
    }

    if (method === "cod") {
        submitOrderBtn.innerText = "Place COD Order";
        return;
    }

    const methodLabel = method === "upi" ? "UPI" : "Card";
    submitOrderBtn.innerText = `Pay ${window.darkOcean.formatCurrency(checkoutDraft.total || 0)} via ${methodLabel}`;
}

function renderDraftSummary() {
    if (!paymentItems || !paymentTotal) {
        return;
    }

    paymentItems.innerHTML = "";

    if (!checkoutDraft || !Array.isArray(checkoutDraft.cart) || !checkoutDraft.cart.length) {
        paymentItems.innerHTML = `
            <div class="empty-state">
                <p>Shipping step missing. Please complete address first.</p>
                <a href="checkout.html" class="lux-btn">Go To Checkout</a>
            </div>
        `;
        paymentTotal.innerText = window.darkOcean.formatCurrency(0);

        if (submitOrderBtn) {
            submitOrderBtn.disabled = true;
        }
        return;
    }

    checkoutDraft.cart.forEach((item) => {
        const itemElement = document.createElement("div");
        itemElement.className = "checkout-item";
        itemElement.innerHTML = `
            <div>
                <h4>${item.name}</h4>
                <p>${item.size ? `Size ${item.size} - ` : ""}Qty ${item.quantity}</p>
            </div>
            <strong>${window.darkOcean.formatCurrency(item.price * item.quantity)}</strong>
        `;
        paymentItems.appendChild(itemElement);
    });

    paymentTotal.innerText = window.darkOcean.formatCurrency(checkoutDraft.total || 0);
    updateSubmitLabel();
}

function renderShippingPreview() {
    if (!checkoutDraft || !checkoutDraft.shipping) {
        return;
    }

    const shipping = checkoutDraft.shipping;

    if (shipName) {
        shipName.innerText = shipping.fullName || "-";
    }

    if (shipEmail) {
        shipEmail.innerText = shipping.email || "-";
    }

    if (shipPhone) {
        shipPhone.innerText = shipping.phone || "-";
    }

    if (shipAddress) {
        const addressLine = [shipping.address, shipping.city, shipping.postalCode]
            .filter(Boolean)
            .join(", ");
        shipAddress.innerText = addressLine || "-";
    }

    if (shipEta) {
        shipEta.innerText = getEstimatedDelivery(shipping.postalCode);
    }
}

function getEstimatedDelivery(postalCode) {
    const pin = String(postalCode || "").replace(/\D/g, "");

    if (pin.length !== 6) {
        return "3-6 business days";
    }

    const firstDigit = Number(pin[0]);

    if ([4, 5].includes(firstDigit)) {
        return "2-4 business days";
    }

    if ([6, 7].includes(firstDigit)) {
        return "3-5 business days";
    }

    if ([1, 2, 3].includes(firstDigit)) {
        return "4-6 business days";
    }

    return "5-7 business days";
}

function validatePayment(payload) {
    clearPaymentErrors();

    if (!payload.payment.method) {
        setFieldError("paymentMethod", "Please choose a payment method.");
        return "Choose a payment method.";
    }

    if (!payload.termsAccepted) {
        return "Please confirm shipping details.";
    }

    if (payload.payment.method === "upi") {
        if (!/^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test(payload.payment.upiId)) {
            setFieldError("upiId", "Enter a valid UPI ID, for example name@bank.");
            return "Enter valid UPI details.";
        }
    }

    if (payload.payment.method === "card") {
        if (!payload.payment.cardName || payload.payment.cardName.length < 3) {
            setFieldError("cardName", "Enter cardholder name.");
            return "Enter valid card details.";
        }

        const cardDigits = payload.payment.cardNumber.replace(/\D/g, "");
        if (cardDigits.length < 16) {
            setFieldError("cardNumber", "Card number must be 16 digits.");
            return "Enter valid card details.";
        }

        if (!isValidLuhn(cardDigits)) {
            setFieldError("cardNumber", "Card number is invalid.");
            return "Enter valid card details.";
        }

        if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(payload.payment.cardExpiry)) {
            setFieldError("cardExpiry", "Expiry must be in MM/YY format.");
            return "Enter valid card details.";
        }

        if (!/^\d{3,4}$/.test(payload.payment.cardCvv)) {
            setFieldError("cardCvv", "CVV must be 3 or 4 digits.");
            return "Enter valid card details.";
        }
    }

    if (payload.payment.method === "cod") {
        if (!/^[4-7]/.test(payload.shipping.postalCode)) {
            setFieldError("paymentMethod", "COD is unavailable for this PIN code.");
            return "COD is unavailable for this PIN code.";
        }
    }

    return "";
}

function simulatePayment(payment) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (payment.method === "upi" && payment.upiId.toLowerCase().includes("fail")) {
                reject(new Error("UPI transaction declined. Try another UPI ID."));
                return;
            }

            if (payment.method === "card") {
                const cardDigits = payment.cardNumber.replace(/\D/g, "");
                const lastDigit = Number(cardDigits.slice(-1) || 0);

                if (lastDigit % 2 !== 0) {
                    reject(new Error("Card payment failed. Try another card."));
                    return;
                }
            }

            resolve(`TXN-${Date.now()}`);
        }, 1200);
    });
}

function createOrderPayload(formData) {
    const cardDigits = getFormValue(formData, "cardNumber").replace(/\D/g, "");

    return {
        id: "PENDING",
        status: "Payment processing",
        createdAt: new Date().toISOString(),
        total: checkoutDraft.total || 0,
        itemCount: checkoutDraft.itemCount || 0,
        items: checkoutDraft.cart || [],
        shipping: checkoutDraft.shipping,
        payment: {
            method: getFormValue(formData, "paymentMethod"),
            status: "processing",
            upiId: getFormValue(formData, "upiId"),
            cardName: getFormValue(formData, "cardName"),
            cardNumber: getFormValue(formData, "cardNumber"),
            cardExpiry: getFormValue(formData, "cardExpiry"),
            cardCvv: getFormValue(formData, "cardCvv"),
            last4: cardDigits.slice(-4),
            txnRef: ""
        },
        timeline: [
            { label: "Placed", at: new Date().toISOString() },
            { label: "Payment Processing", at: new Date().toISOString() }
        ],
        termsAccepted: Boolean(formData.get("terms"))
    };
}

async function processPayment(payload) {
    setPaymentModal(true, "Processing Payment", "Please wait while we process your payment.");

    try {
        const backendAvailable = await window.darkOcean.checkBackend();
        if (!backendAvailable) {
            throw new Error("Checkout is temporarily unavailable. Please try again shortly.");
        }

        const txnRef = await simulatePayment(payload.payment);
        payload.payment.txnRef = txnRef;
        payload.payment.status = "success";
        payload.status = "Payment confirmed";
        payload.timeline = [
            { label: "Placed", at: payload.createdAt || new Date().toISOString() },
            { label: "Payment Confirmed", at: new Date().toISOString() },
            { label: "Packed", at: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString() },
            { label: "Shipped", at: new Date(Date.now() + 1000 * 60 * 60 * 30).toISOString() },
            { label: "Out for Delivery", at: new Date(Date.now() + 1000 * 60 * 60 * 54).toISOString() },
            { label: "Delivered", at: new Date(Date.now() + 1000 * 60 * 60 * 78).toISOString() }
        ];

        const res = await window.darkOcean.apiFetch("/orders/create.php", {
            method: "POST",
            body: {
                items: payload.items || [],
                shipping: payload.shipping,
                payment: {
                    method: payload.payment.method,
                    status: payload.payment.status
                }
            }
        });

        if (res && res.ok && res.order) {
            payload.id = res.order.orderCode || payload.id;
            payload.total = res.order.total || payload.total;
            payload.itemCount = res.order.itemCount || payload.itemCount;
            payload.items = res.order.items || payload.items;
            payload.timeline = res.order.timeline || payload.timeline;
            payload.createdAt = res.order.createdAt || payload.createdAt;
        } else {
            throw new Error("Order creation failed. Please try again.");
        }

        await window.darkOcean.refreshOrdersFromBackend(false);

        window.darkOcean.saveAddress(payload.shipping);
        window.darkOcean.clearCheckoutDraft();
        window.darkOcean.setCart([]);
        window.darkOcean.trackFunnelEvent("payment_success", { orderId: payload.id, method: payload.payment.method });
        setStatus("Payment successful. Redirecting...", "success");
        setPaymentModal(true, "Payment Success", "Your payment is confirmed.");

        pendingPaymentPayload = null;
        toggleRetryButton(false);

        setTimeout(() => {
            window.location.href = "success.html";
        }, 700);
    } catch (error) {
        payload.payment.status = "failed";
        payload.status = "Payment failed";
        pendingPaymentPayload = payload;
        window.darkOcean.trackFunnelEvent("payment_failed", { method: payload.payment.method });
        setStatus(error.message || "Payment failed. Please retry.", "error");
        setPaymentModal(true, "Payment Failed", "Please check your payment details and try again.");
        toggleRetryButton(true);

        setTimeout(() => {
            setPaymentModal(false);
        }, 900);
    }
}

async function initPayment() {
    await window.darkOcean.refreshSessionFromBackend();

    const session = window.darkOcean.getUserSession();
    if (!session.active) {
        setStatus("Please login first to continue.", "error");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 350);
        return;
    }

    checkoutDraft = window.darkOcean.getCheckoutDraft();
    if (!checkoutDraft || !checkoutDraft.shipping) {
        setStatus("Please complete shipping details first.", "error");
        setTimeout(() => {
            window.location.href = "checkout.html";
        }, 350);
        return;
    }

    if (paymentMethodSelect) {
        paymentMethodSelect.addEventListener("change", () => {
            showPaymentFields(paymentMethodSelect.value);
        });
    }

    if (paymentInputs.cardNumber) {
        paymentInputs.cardNumber.addEventListener("input", (event) => {
            event.target.value = formatCardNumberInput(event.target.value);
        });
    }

    if (paymentInputs.cardExpiry) {
        paymentInputs.cardExpiry.addEventListener("input", (event) => {
            event.target.value = formatExpiryInput(event.target.value);
        });
    }

    if (paymentInputs.cardCvv) {
        paymentInputs.cardCvv.addEventListener("input", (event) => {
            event.target.value = event.target.value.replace(/\D/g, "").slice(0, 4);
        });
    }

    paymentForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const activeSession = window.darkOcean.getUserSession();
        if (!activeSession.active) {
            setStatus("Please login first to continue.", "error");
            setTimeout(() => {
                window.location.href = "login.html";
            }, 350);
            return;
        }

        checkoutDraft = window.darkOcean.getCheckoutDraft();
        if (!checkoutDraft || !checkoutDraft.shipping) {
            setStatus("Shipping details missing. Please go back.", "error");
            return;
        }

        const formData = new FormData(paymentForm);
        const payload = createOrderPayload(formData);
        const validationError = validatePayment(payload);

        if (validationError) {
            setStatus(validationError, "error");
            return;
        }

        await processPayment(payload);
    });

    if (retryPaymentBtn) {
        retryPaymentBtn.addEventListener("click", async () => {
            if (!pendingPaymentPayload) {
                return;
            }

            await processPayment(pendingPaymentPayload);
        });
    }

    toggleRetryButton(false);
    showPaymentFields(paymentMethodSelect ? paymentMethodSelect.value : "");
    renderDraftSummary();
    renderShippingPreview();
}

if (paymentForm) {
    initPayment();
}
