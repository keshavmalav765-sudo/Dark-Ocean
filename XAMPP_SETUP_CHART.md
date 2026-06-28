# Dark Ocean: XAMPP Setup + Full Feature Check Chart

This chart assumes you are running on Windows with XAMPP.

## A) Installation / Setup Chart (XAMPP)

| Step | What to do | Where | Expected |
|---|---|---|---|
| 1 | Copy project folder into htdocs | `C:\xampp\htdocs\DarkOcean\` | Project accessible via `http://localhost/DarkOcean/` |
| 2 | Start services | XAMPP Control Panel | Apache = Running, MySQL = Running |
| 3 | Open phpMyAdmin | `http://localhost/phpmyadmin/` | DB UI loads |
| 4 | Create database | phpMyAdmin | Create DB named `dark_ocean` |
| 5 | Import schema | phpMyAdmin -> Import | Import `backend/schema.sql` |
| 6 | Import seed (optional) | phpMyAdmin -> Import | Import `backend/seed.sql` |
| 7 | Configure DB creds | `backend/config.php` | `host/user/password/name` match your MySQL |
| 8 | Health check | Browser | `http://localhost/DarkOcean/backend/api/health.php` returns `{"ok":true...}` |
| 9 | Products API check | Browser | `http://localhost/DarkOcean/backend/api/products/list.php` returns products JSON |
| 10 | Auth session check | Browser | `http://localhost/DarkOcean/login.html` loads login page (no console errors) |

## B) API Quick Test Chart (PowerShell)

Replace `$base` if your folder name differs.

```powershell
$base="http://localhost/DarkOcean/backend/api"

# Health
Invoke-RestMethod "$base/health.php"

# Products (public)
Invoke-RestMethod "$base/products/list.php"

# Login (session cookie stored in $s)
# Use an admin account you created via the signup flow (or your own DB setup).
Invoke-RestMethod "$base/auth/login.php" -Method Post -Body @{email="YOUR_ADMIN_EMAIL";password="YOUR_ADMIN_PASSWORD"} -SessionVariable s
Invoke-RestMethod "$base/auth/me.php" -WebSession $s

# Admin: create product
Invoke-RestMethod "$base/products/create.php" -Method Post -WebSession $s -ContentType "application/json" -Body (@{
  name="Test Product"; category="jacket"; price=9999; image="assets/images/logo/logo-black.png";
  description="Test description"; gallery=@("assets/images/logo/logo-black.png")
} | ConvertTo-Json)

# Admin: list again
Invoke-RestMethod "$base/products/list.php"
```

## C) Website Feature Check Chart (End-to-End)

### Legend
- Guest = not logged in
- User = logged in as normal account
- Admin = logged in as admin account

| Feature | Role | Page | Steps | Expected |
|---|---|---|---|---|
| Shop browse | Guest | `shop.html` | Open shop | Products load (DB-backed if backend up) |
| Search + filters | Guest | `shop.html` | Search + apply filters | URL updates, results update |
| Product details | Guest | `product.html?id=1` | Open any product | Gallery + details render |
| Wishlist | Guest | `shop.html` / `product.html` | Toggle wishlist | Saved locally; wishlist page shows items |
| Add to cart | Guest | `product.html` | Choose size -> Add | Item appears in cart |
| Checkout blocked | Guest | `cart.html` | Click checkout | Redirect/login message (no order without login) |
| Signup | Guest | `signup.html` | Create account | If backend available: account saved in MySQL; redirect login |
| Login (user) | Guest | `login.html` | Enter user creds | Session active, redirect to `index.html` |
| Checkout shipping | User | `checkout.html` | Fill shipping -> Continue | Goes to `payment.html` |
| Payment method UI | User | `payment.html` | Switch UPI/Card/COD | Correct fields show/hide |
| Payment failure + retry | User | `payment.html` | Card last digit odd -> pay | Fails + Retry button works |
| Place order (DB) | User | `payment.html` | Pay successfully | Order saved in MySQL + success page loads |
| Success page | User | `success.html` | After successful pay | Shows last order id/total/payment |
| Account orders | User | `account.html` | Open account | Orders list shows MySQL orders (if backend up) |
| Admin login | Guest | `login.html?admin=1` | Admin creds | Redirect to `admin.html` |
| Admin product CRUD | Admin | `admin.html` | Create/Edit/Delete product | Changes persist in MySQL |
| Admin orders view | Admin | `admin.html` | Scroll orders panel | Shows all orders from MySQL |
| Logout | User/Admin | `account.html` / `admin.html` | Logout | Session cleared; protected pages redirect to login |

## D) Common Fixes

| Problem | Fix |
|---|---|
| APIs return 500 / DB error | Check `backend/config.php` credentials + DB imported |
| `orders/create.php` says product not found | Make sure products exist in DB (`seed.sql` imported) |
| Session not working | Ensure you are using `http://localhost/...` (not `file://`) |
| CORS/cookie issues | Keep frontend + backend on same host (`localhost`) under XAMPP Apache |

