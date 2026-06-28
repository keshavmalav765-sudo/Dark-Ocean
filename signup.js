const signupForm = document.getElementById("signupForm");
const signupStatus = document.getElementById("signupStatus");

function setSignupStatus(message, type) {
    if (!signupStatus) {
        return;
    }

    signupStatus.innerText = message;
    signupStatus.classList.remove("is-error", "is-success");

    if (type === "error") {
        signupStatus.classList.add("is-error");
    }

    if (type === "success") {
        signupStatus.classList.add("is-success");
    }
}

if (signupForm) {
    signupForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(signupForm);
        const name = String(formData.get("name") || "").trim();
        const email = String(formData.get("email") || "").trim().toLowerCase();
        const password = String(formData.get("password") || "").trim();

        if (name.length < 2) {
            setSignupStatus("Please enter your name.", "error");
            return;
        }

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            setSignupStatus("Please enter a valid email.", "error");
            return;
        }

        if (password.length < 8) {
            setSignupStatus("Password should be at least 8 characters.", "error");
            return;
        }

        const backendAvailable = await window.darkOcean.checkBackend();
        if (!backendAvailable) {
            setSignupStatus("Service is unavailable. Please try again shortly.", "error");
            return;
        }

        try {
            const res = await window.darkOcean.apiFetch("/auth/signup.php", {
                method: "POST",
                body: { name, email, password }
            });

            if (res && res.ok) {
                setSignupStatus("Account created successfully. Redirecting to login...", "success");
                setTimeout(() => {
                    window.location.href = "login.html";
                }, 600);
                return;
            }
        } catch (error) {
            setSignupStatus(error.message || "Signup failed. Please try again.", "error");
            return;
        }
    });
}
