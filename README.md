# Dark Ocean Backend (PHP + MySQL)

This is Phase 1 backend scaffolding for Dark Ocean.

## Included

- Session-based auth APIs
- Products APIs (public list/details, admin CRUD)
- Admin users APIs (admin CRUD for customer accounts)
- MySQL schema and optional seed script
- CSRF protection for state-changing requests
- Token-based password reset flow (dev token supported; email integration pending)

## Folder map

- `backend/config.php` app + database config
- `backend/lib/` shared helpers
- `backend/api/auth/` auth endpoints
- `backend/api/products/` products endpoints
- `backend/schema.sql` database schema
- `backend/seed.sql` optional starter product catalog

## Quick setup

1. Create a MySQL database (example: `dark_ocean`).
2. Import:
   - `backend/schema.sql`
   - optional `backend/seed.sql`
3. Update DB credentials in `backend/config.php`.
4. Serve project through PHP (XAMPP/WAMP/Laragon or `php -S`).

Optional env vars (override `backend/config.php`):

- Create a `.env` in the project root (copy from `.env.example`) or set OS env vars.
- `APP_ENV` (`dev` or `prod`)
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `COOKIE_SECURE` (`true` when using HTTPS)
- `CORS_ALLOWED_ORIGINS` (comma-separated allowlist; prefer same-origin deployments)

Example using PHP built-in server from project root:

```bash
php -S localhost:8080
```

Then API base can be used as:

- `http://localhost:8080/backend/api/auth/login.php`
- `http://localhost:8080/backend/api/auth/forgot.php` (POST `action=request|confirm`)
- `http://localhost:8080/backend/api/auth/csrf.php`
- `http://localhost:8080/backend/api/products/list.php`
- `http://localhost:8080/backend/api/orders/list.php`
- `http://localhost:8080/backend/api/admin/users/list.php`
- `http://localhost:8080/backend/api/orders/admin_update_status.php`

Notes:

- New signups use bcrypt password hashing.
- Ensure you import the latest `backend/schema.sql` (includes `password_resets` table).
- For cross-origin API calls (not recommended), set `CORS_ALLOWED_ORIGINS` env var to a comma-separated allowlist.

## Creating the first admin user

1. Sign up normally via `signup.html` (creates a `user` role).
2. Promote to admin in MySQL:

```sql
UPDATE users SET role = 'admin' WHERE email = 'you@example.com' LIMIT 1;
```
