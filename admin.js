const productRows = document.getElementById("productRows");
const cartSummary = document.getElementById("cartSummary");
const ordersList = document.getElementById("ordersList");
const logoutBtn = document.getElementById("logoutBtn");
const adminGreeting = document.getElementById("adminGreeting");
const productForm = document.getElementById("productForm");
const addProductBtn = document.getElementById("addProductBtn");
const resetFormBtn = document.getElementById("resetFormBtn");
const productFormStatus = document.getElementById("productFormStatus");
const editorTitle = document.getElementById("editorTitle");
const userRows = document.getElementById("userRows");
const userForm = document.getElementById("userForm");
const addUserBtn = document.getElementById("addUserBtn");
const resetUserBtn = document.getElementById("resetUserBtn");
const userFormStatus = document.getElementById("userFormStatus");
const userEditorTitle = document.getElementById("userEditorTitle");

let backendUsers = [];

function setFormStatus(message, type) {
    productFormStatus.innerText = message;
    productFormStatus.classList.remove("is-error", "is-success");

    if (type === "error") {
        productFormStatus.classList.add("is-error");
    }

    if (type === "success") {
        productFormStatus.classList.add("is-success");
    }
}

function ensureAdminAccess() {
    const session = window.darkOcean.getUserSession();
    if (!session.active || session.role !== "admin") {
        return false;
    }

    const adminName = session.name || "Dark Ocean Admin";
    if (adminGreeting) {
        adminGreeting.innerText = `${adminName}, this dashboard summarizes your current storefront catalog, cart activity, and recent orders.`;
    }

    return true;
}

function getCatalog() {
    return window.darkOcean.getCatalog();
}

function getCartData() {
    return window.darkOcean.getCart();
}

function getOrderData() {
    return window.darkOcean.getOrders();
}

function formatDate(isoString) {
    if (!isoString) {
        return "-";
    }

    const date = new Date(isoString);
    if (Number.isNaN(date.getTime())) {
        return "-";
    }

    return date.toLocaleString("en-IN", {
        year: "numeric",
        month: "short",
        day: "2-digit"
    });
}

function renderStats() {
    const cart = getCartData();
    const catalog = getCatalog();
    const categories = new Set(catalog.map((product) => product.category));
    const cartUnits = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartValue = cart.reduce((sum, item) => sum + item.quantity * item.price, 0);

    document.getElementById("statProducts").innerText = catalog.length;
    document.getElementById("statCategories").innerText = categories.size;
    document.getElementById("statCartItems").innerText = cartUnits;
    document.getElementById("statCartValue").innerText = window.darkOcean.formatCurrency(cartValue);
}

function renderUsers() {
    if (!userRows) {
        return;
    }

    const users = Array.isArray(backendUsers) ? backendUsers : [];

    if (!users.length) {
        userRows.innerHTML = `
            <tr>
                <td colspan="4">No users found.</td>
            </tr>
        `;
        return;
    }

    userRows.innerHTML = users.map((user) => `
        <tr>
            <td>${user.name || "Dark Ocean Member"}</td>
            <td>${user.email || "-"}</td>
            <td>${formatDate(user.createdAt)}</td>
            <td>
                <button class="table-btn" type="button" data-user-edit="${user.id}">Edit</button>
                <button class="table-btn" type="button" data-user-delete="${user.id}">Deactivate</button>
            </td>
        </tr>
    `).join("");
}

function renderProducts() {
    if (!productRows) {
        return;
    }

    productRows.innerHTML = getCatalog().map((product) => `
        <tr>
            <td>${product.name}</td>
            <td>${product.category}</td>
            <td>${window.darkOcean.formatCurrency(product.price)}</td>
            <td>
                <button class="table-btn" type="button" data-edit-id="${product.id}">Edit</button>
                <button class="table-btn" type="button" data-delete-id="${product.id}">Delete</button>
            </td>
        </tr>
    `).join("");
}

function renderCartSummary() {
    if (!cartSummary) {
        return;
    }

    const cart = getCartData();

    if (!cart.length) {
        cartSummary.innerHTML = '<div class="admin-list-item"><strong>No active carts</strong><p>The cart is currently empty on this device.</p></div>';
        return;
    }

    cartSummary.innerHTML = cart.map((item) => `
        <div class="admin-list-item">
            <strong>${item.name}</strong>
            <p>${item.size ? `Size ${item.size} - ` : ""}Qty ${item.quantity}</p>
            <p>${window.darkOcean.formatCurrency(item.price * item.quantity)}</p>
        </div>
    `).join("");
}

function renderOrders() {
    if (!ordersList) {
        return;
    }

    const orders = getOrderData();

    if (!orders.length) {
        ordersList.innerHTML = '<div class="admin-list-item"><strong>No orders yet</strong><p>Orders placed from checkout will appear here.</p></div>';
        return;
    }

    ordersList.innerHTML = orders.map((order) => {
        const clientName = order.shipping && order.shipping.fullName ? order.shipping.fullName : "Website Customer";
        const orderId = order.id || "DO-0000";
        const currentStatus = String(order.status || "placed").toLowerCase();

        return `
            <div class="admin-list-item" data-order-id="${orderId}">
                <strong>${orderId}</strong>
                <p>${clientName}</p>
                <p>${window.darkOcean.formatCurrency(order.total || 0)}</p>
                <div class="order-actions">
                    <select class="order-status" data-order-status="${orderId}">
                        <option value="placed" ${currentStatus === "placed" ? "selected" : ""}>Placed</option>
                        <option value="confirmed" ${currentStatus === "confirmed" ? "selected" : ""}>Confirmed</option>
                        <option value="packed" ${currentStatus === "packed" ? "selected" : ""}>Packed</option>
                        <option value="shipped" ${currentStatus === "shipped" ? "selected" : ""}>Shipped</option>
                        <option value="delivered" ${currentStatus === "delivered" ? "selected" : ""}>Delivered</option>
                        <option value="cancelled" ${currentStatus === "cancelled" ? "selected" : ""}>Cancelled</option>
                        <option value="deleted" ${currentStatus === "deleted" ? "selected" : ""}>Deleted</option>
                    </select>
                    <button class="table-btn" type="button" data-order-delete="${orderId}">Delete</button>
                </div>
            </div>
        `;
    }).join("");
}

function resetProductForm() {
    productForm.reset();
    document.getElementById("productId").value = "";
    editorTitle.innerText = "Create a new product";
    setFormStatus("", "");
}

function setUserFormStatus(message, type) {
    if (!userFormStatus) {
        return;
    }

    userFormStatus.innerText = message;
    userFormStatus.classList.remove("is-error", "is-success");

    if (type === "error") {
        userFormStatus.classList.add("is-error");
    }

    if (type === "success") {
        userFormStatus.classList.add("is-success");
    }
}

function resetUserForm() {
    if (!userForm) {
        return;
    }

    userForm.reset();
    const userId = document.getElementById("userId");
    if (userId) {
        userId.value = "";
    }

    if (userEditorTitle) {
        userEditorTitle.innerText = "Create a user";
    }

    setUserFormStatus("", "");
}

function fillUserForm(userId) {
    if (!userForm) {
        return;
    }

    const user = (Array.isArray(backendUsers) ? backendUsers : []).find((u) => String(u.id) === String(userId));
    if (!user) {
        return;
    }

    document.getElementById("userId").value = user.id || "";
    document.getElementById("userNameInput").value = user.name || "";
    document.getElementById("userEmailInput").value = user.email || "";
    document.getElementById("userRoleInput").value = user.role || "user";
    document.getElementById("userActiveInput").value = user.isActive ? "1" : "0";
    document.getElementById("userPasswordInput").value = "";

    if (userEditorTitle) {
        userEditorTitle.innerText = `Edit ${user.email}`;
    }

    setUserFormStatus("", "");
}

async function refreshUsersFromBackend() {
    const backendAvailable = await window.darkOcean.checkBackend();
    if (!backendAvailable) {
        throw new Error("Backend is unavailable.");
    }

    const res = await window.darkOcean.apiFetch("/admin/users/list.php", { method: "GET", headers: {} });
    backendUsers = res && Array.isArray(res.users) ? res.users : [];
    return backendUsers;
}

async function deleteUser(userId) {
    const id = Number(userId);
    if (!id) {
        return;
    }

    const target = (Array.isArray(backendUsers) ? backendUsers : []).find((u) => Number(u.id) === id);
    const label = target && target.email ? target.email : `User #${id}`;
    const confirmed = window.confirm(`Deactivate ${label}?`);
    if (!confirmed) {
        return;
    }

    try {
        await window.darkOcean.apiFetch("/admin/users/delete.php", {
            method: "POST",
            body: { id }
        });
        await refreshUsersFromBackend();
        renderUsers();
        resetUserForm();
        setUserFormStatus("User deactivated successfully.", "success");
    } catch (error) {
        setUserFormStatus(error.message || "Unable to deactivate user.", "error");
    }
}

async function saveUser(event) {
    event.preventDefault();

    const formData = new FormData(userForm);
    const userId = Number(formData.get("userId") || 0);
    const name = String(formData.get("userName") || "").trim();
    const email = String(formData.get("userEmail") || "").trim().toLowerCase();
    const password = String(formData.get("userPassword") || "").trim();
    const role = String(formData.get("userRole") || "user").trim().toLowerCase();
    const isActive = String(formData.get("userActive") || "1") === "1";

    if (!name || !email) {
        setUserFormStatus("Please complete all user fields.", "error");
        return;
    }

    try {
        if (!userId) {
            if (!password) {
                setUserFormStatus("Password is required for new users.", "error");
                return;
            }
            await window.darkOcean.apiFetch("/admin/users/create.php", {
                method: "POST",
                body: { name, email, password, role }
            });
            await refreshUsersFromBackend();
            renderUsers();
            resetUserForm();
            setUserFormStatus("User created successfully.", "success");
            return;
        }

        await window.darkOcean.apiFetch("/admin/users/update.php", {
            method: "POST",
            body: {
                id: userId,
                name,
                email,
                role,
                isActive,
                password: password || ""
            }
        });

        await refreshUsersFromBackend();
        renderUsers();
        resetUserForm();
        setUserFormStatus("User updated successfully.", "success");
    } catch (error) {
        setUserFormStatus(error.message || "Unable to save user.", "error");
    }
}

function fillProductForm(productId) {
    const product = getCatalog().find((item) => String(item.id) === String(productId));

    if (!product) {
        return;
    }

    document.getElementById("productId").value = product.id;
    document.getElementById("productNameInput").value = product.name;
    document.getElementById("productCategoryInput").value = product.category;
    document.getElementById("productPriceInput").value = product.price;
    document.getElementById("productImageInput").value = product.image;
    document.getElementById("productGalleryInput").value = (product.gallery || []).join("\n");
    document.getElementById("productDescriptionInput").value = product.description;
    editorTitle.innerText = `Edit ${product.name}`;
    setFormStatus("", "");
}

function deleteProduct(productId) {
    const id = Number(productId);
    if (!id) {
        return;
    }

    window.darkOcean.checkBackend().then(async (available) => {
        if (!available) {
            setFormStatus("Backend is unavailable. Product changes are disabled.", "error");
            return;
        }

        try {
            await window.darkOcean.apiFetch("/products/delete.php", {
                method: "POST",
                body: { id }
            });
            await window.darkOcean.refreshCatalogFromBackend();
            renderStats();
            renderProducts();
            setFormStatus("Product deleted successfully.", "success");
        } catch (error) {
            setFormStatus(error.message || "Delete failed.", "error");
        }
    });
}

function saveProduct(event) {
    event.preventDefault();

    const formData = new FormData(productForm);
    const productId = String(formData.get("productId") || "").trim();
    const galleryInput = String(formData.get("productGallery") || "").trim();
    const imagePath = String(formData.get("productImage") || "").trim();

    const productPayload = {
        id: productId ? Number(productId) : null,
        name: String(formData.get("productName") || "").trim(),
        category: String(formData.get("productCategory") || "").trim(),
        price: Number(formData.get("productPrice") || 0),
        image: imagePath,
        gallery: galleryInput ? galleryInput.split(/\r?\n/).map((item) => item.trim()).filter(Boolean) : [imagePath],
        description: String(formData.get("productDescription") || "").trim()
    };

    if (!productPayload.name || !productPayload.category || !productPayload.image || !productPayload.description) {
        setFormStatus("Please complete all product fields.", "error");
        return;
    }

    if (productPayload.price <= 0) {
        setFormStatus("Price must be greater than 0.", "error");
        return;
    }

    window.darkOcean.checkBackend().then(async (available) => {
        if (!available) {
            setFormStatus("Backend is unavailable. Product changes are disabled.", "error");
            return;
        }

        try {
            if (productPayload.id) {
                await window.darkOcean.apiFetch("/products/update.php", {
                    method: "POST",
                    body: {
                        id: productPayload.id,
                        ...productPayload
                    }
                });
                setFormStatus("Product updated successfully.", "success");
            } else {
                await window.darkOcean.apiFetch("/products/create.php", {
                    method: "POST",
                    body: productPayload
                });
                setFormStatus("New product added successfully.", "success");
            }

            await window.darkOcean.refreshCatalogFromBackend();
            renderStats();
            renderProducts();
            resetProductForm();
        } catch (error) {
            setFormStatus(error.message || "Save failed.", "error");
        }
    });
}

async function initAdminDashboard() {
    await window.darkOcean.refreshSessionFromBackend();

    const backendAvailable = await window.darkOcean.checkBackend();
    if (!backendAvailable) {
        window.darkOcean.clearUserSession();
        window.location.href = "login.html?admin=1";
        return;
    }

    await window.darkOcean.refreshSessionFromBackend();
    if (!ensureAdminAccess()) {
        window.darkOcean.clearUserSession();
        return;
    }

    await window.darkOcean.refreshCatalogFromBackend();
    await window.darkOcean.refreshOrdersFromBackend(true);
    await refreshUsersFromBackend();

    renderStats();
    renderProducts();
    renderCartSummary();
    renderOrders();
    renderUsers();
}

initAdminDashboard();

if (productRows) {
    productRows.addEventListener("click", (event) => {
        const editButton = event.target.closest("[data-edit-id]");
        const deleteButton = event.target.closest("[data-delete-id]");

        if (editButton) {
            fillProductForm(editButton.dataset.editId);
        }

        if (deleteButton) {
            deleteProduct(deleteButton.dataset.deleteId);
        }
    });
}

if (productForm) {
    productForm.addEventListener("submit", saveProduct);
}

if (addProductBtn) {
    addProductBtn.addEventListener("click", resetProductForm);
}

if (resetFormBtn) {
    resetFormBtn.addEventListener("click", resetProductForm);
}

if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        window.darkOcean.clearUserSession();
        window.location.href = "login.html";
    });
}

if (ordersList) {
    ordersList.addEventListener("change", (event) => {
        const statusSelect = event.target.closest("[data-order-status]");
        if (!statusSelect) {
            return;
        }

        const orderId = statusSelect.dataset.orderStatus;
        const nextStatus = statusSelect.value;
        window.darkOcean.apiFetch("/orders/admin_update_status.php", {
            method: "POST",
            body: { orderCode: orderId, status: nextStatus }
        }).then(async () => {
            await window.darkOcean.refreshOrdersFromBackend(true);
            renderOrders();
        }).catch((error) => {
            setFormStatus(error.message || "Failed to update order status.", "error");
            window.darkOcean.refreshOrdersFromBackend(true).then(renderOrders);
        });
    });

    ordersList.addEventListener("click", (event) => {
        const deleteButton = event.target.closest("[data-order-delete]");
        if (!deleteButton) {
            return;
        }

        const orderId = deleteButton.dataset.orderDelete;
        const confirmed = window.confirm(`Delete order ${orderId}?`);
        if (!confirmed) {
            return;
        }

        window.darkOcean.apiFetch("/orders/admin_delete.php", {
            method: "POST",
            body: { orderCode: orderId }
        }).then(async () => {
            await window.darkOcean.refreshOrdersFromBackend(true);
            renderOrders();
        }).catch((error) => {
            setFormStatus(error.message || "Failed to delete order.", "error");
        });
    });
}

if (userRows) {
    userRows.addEventListener("click", (event) => {
        const editButton = event.target.closest("[data-user-edit]");
        const deleteButton = event.target.closest("[data-user-delete]");

        if (editButton) {
            fillUserForm(editButton.dataset.userEdit);
        }

        if (deleteButton) {
            deleteUser(deleteButton.dataset.userDelete);
        }
    });
}

if (userForm) {
    userForm.addEventListener("submit", saveUser);
}

if (addUserBtn) {
    addUserBtn.addEventListener("click", resetUserForm);
}

if (resetUserBtn) {
    resetUserBtn.addEventListener("click", resetUserForm);
}
