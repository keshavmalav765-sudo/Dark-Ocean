const loginForm = document.getElementById("loginForm");
const loginStatus = document.getElementById("loginStatus");
const secretNote = document.getElementById("secretNote");

let loginMode = "user";

function setLoginMode(mode) {
    loginMode = mode;

    const contentMap = {
        user: {
            title: "Sign in to your Dark Ocean account.",
            intro: "Track your orders, save your preferred pieces, and move through checkout faster on your next visit.",
            modeLabel: "User Login",
            cardTitle: "Welcome back.",
            submit: "Enter Account"
        },
        admin: {
            title: "Administrative access unlocked.",
            intro: "This hidden sign-in is reserved for store management, product editing, and order review.",
            modeLabel: "Admin Login",
            cardTitle: "Control room access.",
            submit: "Enter Admin Panel"
        }
    };

    const content = contentMap[mode];
    document.getElementById("loginTitle").innerText = content.title;
    document.getElementById("loginIntro").innerText = content.intro;
    document.getElementById("loginModeLabel").innerText = content.modeLabel;
    document.getElementById("loginCardTitle").innerText = content.cardTitle;
    document.getElementById("loginSubmit").innerText = content.submit;

    if (secretNote) {
        secretNote.innerText = "";
    }
    loginStatus.innerText = "";
}

function setStatus(message, type) {
    loginStatus.innerText = message;
    loginStatus.classList.remove("is-error", "is-success");

    if (type === "error") {
        loginStatus.classList.add("is-error");
    }

    if (type === "success") {
        loginStatus.classList.add("is-success");
    }
}

document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "a") {
        setLoginMode("admin");
    }

    if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === "u") {
        setLoginMode("user");
    }

    if (event.key === "Escape" && loginMode === "admin") {
        setLoginMode("user");
    }
});

if (new URLSearchParams(window.location.search).get("admin") === "1") {
    setLoginMode("admin");
} else {
    setLoginMode("user");
}

if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = new FormData(loginForm);
        const email = String(formData.get("email") || "").trim().toLowerCase();
        const password = String(formData.get("password") || "").trim();

        if (!/^\S+@\S+\.\S+$/.test(email)) {
            setStatus("Please enter a valid email.", "error");
            return;
        }

        if (!password) {
            setStatus("Please enter your password.", "error");
            return;
        }

        const backendAvailable = await window.darkOcean.checkBackend();
        if (!backendAvailable) {
            setStatus("Service is unavailable. Please try again shortly.", "error");
            return;
        }

        try {
            const res = await window.darkOcean.apiFetch("/auth/login.php", {
                method: "POST",
                body: { email, password }
            });

            if (res && res.ok && res.user) {
                if (res.user.role === "admin") {
                    setStatus("Access granted. Redirecting to the admin panel...", "success");
                    setTimeout(() => {
                        window.location.href = "admin.html";
                    }, 500);
                    return;
                }

                setStatus("Signed in successfully. Redirecting to the storefront...", "success");
                setTimeout(() => {
                    window.location.href = "index.html";
                }, 500);
                return;
            }
        } catch (error) {
            setStatus(error.message || "Login failed. Please try again.", "error");
            return;
        }

        setStatus("Invalid email or password.", "error");
    });
}
