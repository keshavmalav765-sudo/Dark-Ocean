# Dark Ocean (Frontend + PHP Backend Phase 1)

Dark Ocean is a premium multi-page ecommerce frontend built with vanilla HTML, CSS, and JavaScript.

## What is included

- Responsive storefront pages (`index`, `shop`, `product`, `cart`, `checkout`, `success`)
- Member authentication flow (`signup`, `login`) with localStorage fallback
- Admin-side product management (create/edit/delete local catalog)
- URL-synced shop filters and search
- Mini cart, cart quantity controls, and checkout validation
- Local order creation and order confirmation summary
- Contact form with local inquiry storage
- Toast notifications and animated page transitions
- PHP + MySQL backend scaffolding (`backend/`) with auth and products APIs

## Project structure

- `assets/` static images and logos
- `css/` page and shared styles
- `js/` page logic and shared app state
- `*.html` multipage frontend entry points
- `backend/` PHP API layer + schema + seed scripts

## Local development

For full functionality (auth, admin, checkout), serve the project through PHP so `backend/` endpoints work.

Example from the project root:

```bash
php -S localhost:8080
```

Create a `.env` (copy `.env.example`) to set database credentials.

## Static deployment (Netlify / Vercel / GitHub Pages)

Dark Ocean works as a static site out of the box.

- Ensure the site is deployed from the project root (where `index.html` lives).
- All page routing is file-based (e.g. `/shop.html`, `/product.html?id=1`).
- The frontend uses localStorage for products, cart, users, and orders by default.
- The `backend/` folder is optional scaffolding; the frontend checks for it safely and falls back to localStorage when it is not available.

### Netlify

- Build command: none
- Publish directory: project root (the folder that contains `index.html`)

### Vercel

- Framework preset: Other
- Build command: none
- Output directory: `.` (project root)

### GitHub Pages

- Push this folder to a repo.
- Enable Pages for the `main` branch and set the root (`/`) as the source.

## Notes

- Frontend keeps small UI caches in localStorage, but authentication + checkout now require the PHP backend.
- Backend Phase 1 is in `backend/` and is intended to be served from the same origin as the frontend (no CORS needed by default).

## Admin controls

The admin panel (`admin.html`) can manage:

- Products (create/edit/delete) via PHP APIs (cached client-side for rendering)
- Users (create/update/deactivate) via PHP APIs
- Orders (view/update status/delete) via PHP APIs
