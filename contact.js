const contactForm = document.getElementById("contactForm");
const contactStatus = document.getElementById("contactStatus");

function setContactStatus(message, type) {
    if (!contactStatus) {
        return;
    }

    contactStatus.innerText = message;
    contactStatus.classList.remove("is-error", "is-success");

    if (type === "error") {
        contactStatus.classList.add("is-error");
    }

    if (type === "success") {
        contactStatus.classList.add("is-success");
    }
}

function validateInquiry(payload) {
    if (!payload.name || payload.name.length < 2) {
        return "Please enter your name.";
    }

    if (!/^\S+@\S+\.\S+$/.test(payload.email)) {
        return "Please enter a valid email.";
    }

    if (!payload.message || payload.message.length < 10) {
        return "Please add a short message (at least 10 characters).";
    }

    return "";
}

if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const formData = new FormData(contactForm);
        const inquiry = {
            id: `INQ-${Date.now()}`,
            createdAt: new Date().toISOString(),
            name: String(formData.get("name") || "").trim(),
            email: String(formData.get("email") || "").trim().toLowerCase(),
            message: String(formData.get("message") || "").trim()
        };

        const validationError = validateInquiry(inquiry);
        if (validationError) {
            setContactStatus(validationError, "error");
            return;
        }

        window.darkOcean.saveInquiry(inquiry);
        window.darkOcean.notify("Inquiry sent successfully.", "success");
        setContactStatus("Thank you. Our team will contact you shortly.", "success");
        contactForm.reset();
    });
}
