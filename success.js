const orderIdElement = document.getElementById("orderId");
const orderTotalElement = document.getElementById("orderTotal");
const orderCityElement = document.getElementById("orderCity");
const orderPaymentElement = document.getElementById("orderPayment");
const orderPaymentStatusElement = document.getElementById("orderPaymentStatus");
const orderTxnRefElement = document.getElementById("orderTxnRef");
const successCard = document.getElementById("successCard");

function formatPaymentMethod(value) {
    const labels = {
        upi: "UPI",
        card: "Card",
        cod: "Cash on Delivery"
    };

    return labels[value] || "Not specified";
}

function hydrateSuccessDetails() {
    const lastOrder = window.darkOcean.getLastOrder();

    if (!lastOrder || !successCard) {
        window.location.href = "checkout.html";
        return;
    }

    if (orderIdElement) {
        orderIdElement.innerText = lastOrder.id || "-";
    }

    if (orderTotalElement) {
        orderTotalElement.innerText = window.darkOcean.formatCurrency(lastOrder.total || 0);
    }

    if (orderCityElement) {
        orderCityElement.innerText = lastOrder.shipping && lastOrder.shipping.city ? lastOrder.shipping.city : "-";
    }

    if (orderPaymentElement) {
        const paymentMethod = lastOrder.payment && lastOrder.payment.method
            ? lastOrder.payment.method
            : lastOrder.paymentMethod;
        orderPaymentElement.innerText = formatPaymentMethod(paymentMethod);
    }

    if (orderPaymentStatusElement) {
        const status = lastOrder.payment && lastOrder.payment.status
            ? lastOrder.payment.status
            : "success";
        orderPaymentStatusElement.innerText = status.charAt(0).toUpperCase() + status.slice(1);
    }

    if (orderTxnRefElement) {
        const txnRef = lastOrder.payment && lastOrder.payment.txnRef
            ? lastOrder.payment.txnRef
            : "-";
        orderTxnRefElement.innerText = txnRef;
    }
}

hydrateSuccessDetails();
