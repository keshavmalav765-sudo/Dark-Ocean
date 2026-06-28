const forgotForm = document.getElementById("forgotForm");
const forgotStatus = document.getElementById("forgotStatus");

function setForgotStatus(message, type) {
    if (!forgotStatus) {
        return;
    }

    forgotStatus.innerText = message;
    forgotStatus.classList.remove("is-error", "is-success");

    if (type === "error") {
        forgotStatus.classList.add("is-error");
    }

    if (type === "success") {
        forgotStatus.classList.add("is-success");
    }
}

if (forgotForm) {
    forgotForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(forgotForm);
        const email = String(formData.get("email") || "").trim().toLowerCase();
        const token = String(formData.get("token") || "").trim();
        const newPassword = String(formData.get("newPassword") || "").trim();

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            setForgotStatus("Please enter a valid email.", "error");
            return;
        }

        const backendAvailable = await window.darkOcean.checkBackend();
        if (!backendAvailable) {
            setForgotStatus("Service is unavailable. Please try again shortly.", "error");
            return;
        }

        if (!token) {
            try {
                const res = await window.darkOcean.apiFetch("/auth/forgot.php", {
                    method: "POST",
                    body: { action: "request", email }
                });

                if (res && res.ok) {
                    if (res.devOnlyToken) {
                        const tokenInput = document.getElementById("resetToken");
                        if (tokenInput) {
                            tokenInput.value = res.devOnlyToken;
                        }
                        setForgotStatus("Dev token generated. Paste it into the Reset Token field to continue.", "success");
                        return;
                    }

                    setForgotStatus("If an account exists, a reset link will be sent shortly.", "success");
                    return;
                }
            } catch (error) {
                setForgotStatus(error.message || "Reset request failed.", "error");
                return;
            }
        }

        if (newPassword.length < 8) {
            setForgotStatus("Password should be at least 8 characters.", "error");
            return;
        }

        try {
            const res = await window.darkOcean.apiFetch("/auth/forgot.php", {
                method: "POST",
                body: { action: "confirm", token, newPassword }
            });

            if (res && res.ok) {
                setForgotStatus("Password updated. Redirecting to login...", "success");
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 600);
                return;
            }
        } catch (error) {
            setForgotStatus(error.message || "Password reset failed.", "error");
            return;
        }
    });
}
