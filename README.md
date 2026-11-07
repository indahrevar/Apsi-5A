# Dapur Abita

## Local development

1. Configure `DATABASE_URL` for the PostgreSQL database.
2. Install dependencies with `npm install`.
3. Generate the Prisma Client with `npx prisma generate`.
4. Add the demo records using `npm run db:seed`.
5. Start the app using `npm run dev`, then open `http://localhost:3000`.

The seed is additive and idempotent. It creates its demo records only when
they are missing; it does not delete or overwrite existing data.

## Development demo accounts

| Role | Username | Password |
| --- | --- | --- |
| Customer | `rizky` | `rizky123` |
| Admin | `admin` | `admin123` |
| Produksi | `produksi` | `produksi123` |
| Owner | `owner` | `owner123` |

These are development-only demo accounts. Demo login and registration are
disabled when `NODE_ENV=production`. Configure a strong `AUTH_SECRET` for
production session signing.

## Routes

- `/` — Dapur Abita cover page; login opens in Customer mode
- `/login` — demo login and role selection
- `/register` — customer profile registration
- `/customer` — menu, checkout, orders, and reviews
- `/admin` — operations, menu, payments, fulfillment, and sales
- `/produksi` — production order queue
- `/owner` — owner dashboard, reports, and reviews
- `/owner/stock` — stock monitoring

The customer cart is saved for the active browser session while navigating
between menu and payment. Admin menu edits use the authenticated workspace
`PATCH` handler and refresh the menu data after saving.

The demo catalog contains Brownies Kukus, Bolu Gulung, Risoles Ragout,
Pastel Isi, and Lapis Surabaya. Retired Pinukuik products are excluded from
workspace and checkout catalog responses. The seed removes them when they have
no order history; records referenced by historical order lines are retained
for referential integrity but remain hidden from the catalog.

## Current database boundaries

The existing Prisma schema has no account credential fields, product price, or
current-stock field. To keep the schema unchanged, login credentials and the
demo menu price/starting-stock catalog are development-only fixtures. Customer
registration saves the customer profile and starts a demo session, but cannot
persist a password for later login. New products can be saved, but need a
price-bearing order line before customer checkout can use them.

Checkout records cash/transfer method and a pending payment in PostgreSQL;
payment confirmation is manual in the Admin dashboard. No payment gateway is
connected.
