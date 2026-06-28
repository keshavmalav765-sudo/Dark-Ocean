const fadeElements = document.querySelectorAll(".fade-in");

function setupRevealAnimations() {
    if (!("IntersectionObserver" in window)) {
        fadeElements.forEach((element) => element.classList.add("show"));
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("show");
                    observer.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
    );

    fadeElements.forEach((element) => observer.observe(element));
}

window.addEventListener("load", () => {
    setupRevealAnimations();

    const loader = document.querySelector(".lux-loader");
    if (loader) {
        setTimeout(() => {
            loader.classList.add("hide");
        }, 700);
    }
});

document.addEventListener("click", (event) => {
    const link = event.target.closest("a");

    if (!link) {
        return;
    }

    const href = link.getAttribute("href");

    if (!href || href.startsWith("#") || link.target === "_blank" || link.hasAttribute("download") || link.classList.contains("is-disabled")) {
        return;
    }

    if (link.getAttribute("aria-disabled") === "true") {
        event.preventDefault();
        return;
    }

    if (link.origin !== window.location.origin) {
        return;
    }

    event.preventDefault();
    document.body.classList.add("fade-out");

    setTimeout(() => {
        window.location.href = href;
    }, 190);
});
