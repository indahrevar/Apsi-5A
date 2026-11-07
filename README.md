<<<<<<< HEAD
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
=======
# Apsi Deployment

## Local development

Requirements: Node.js 24, npm, and Docker Desktop with Docker Compose.

1. Copy `.env.example` to `.env` if you do not already have a `.env` file. Set a local-only `POSTGRES_PASSWORD` and use the same value in `DATABASE_URL`.
2. Run `npm install` if dependencies are not installed.
3. Run `npm run db:setup` to start PostgreSQL in Docker on `127.0.0.1:5433`, apply Prisma migrations, generate the Prisma Client, and load the sample records.
4. Run `npm run dev` and open [http://localhost:3000](http://localhost:3000).

The production build uses Next.js's supported Webpack bundler (`next build --webpack`). The default Turbopack build currently fails during source-map emission in this project; development still uses Next.js's default Turbopack bundler.

The database uses a named Docker volume, so `npm run db:down` stops and removes the container without deleting database data. To start it again, run `npm run db:up`.

## Database commands

- `npm run db:migrate -- --name <migration_name>` creates and applies a development migration.
- `npm run db:deploy` applies pending migrations in a deployment environment.
- `npm run db:generate` regenerates the Prisma Client after schema changes.
- `npm run db:seed` inserts sample records and generates local test accounts.
- `npm run db:seed:demo` adds repeatable, fictional report and workflow data to a local database.
- `npm run db:studio` opens Prisma Studio.
- `npm run db:logs` follows the PostgreSQL container logs.

`database.sql` is the original SQL script supplied with the project. It starts by dropping tables, so do not run it against a database containing data. Local setup uses Prisma migrations and the separate idempotent seed script instead.

## Authentication and roles

The application uses PostgreSQL-backed accounts and sessions. Passwords are stored as scrypt hashes; session cookies are HTTP-only and expire after eight hours. Customer registration is available at `/register`. Admins can create Production accounts at `/admin/akun`, and Owners can create Admin accounts at `/owner/akun`.

The permission checks are enforced by the server, including on API requests:

- **Customer**: manage their own orders, payments, reviews, and feedback.
- **Admin**: manage products and inventory, process orders and payments, coordinate production and handover, and create Production accounts.
- **Karyawan Produksi**: access assigned production work and update its production status.
- **Owner**: view reports and business data, and create Admin accounts.

## API and database integration

Business records are served from PostgreSQL through the role-protected handlers in `app/api`. Customer checkout saves the order note, item prices, payment, and stock changes together; the cart and unsent checkout note are browser-only drafts. The API revalidates available stock when an order is submitted, so browser state is never trusted for prices or inventory.

When changing the data model, update `prisma/schema.prisma`, create and apply a migration with `npm run db:migrate -- --name <migration_name>`, and regenerate the Prisma Client with `npm run db:generate`. Keep authorization and business-rule checks in the API as well as in the UI.

Running `npm run db:seed` generates demo accounts for all four roles and writes their usernames and random passwords to `LOCAL-TEST-CREDENTIALS.md` in the project root. That file is Git-ignored and intended only for local development. **Every seed run rotates these demo passwords and replaces the file.** Do not use the demo accounts or seed script in production; provision production accounts and secrets through a secure, environment-appropriate process.

To populate the reports with a richer sample business history, first run `npm run db:seed`, then `npm run db:seed:demo`. The demo-data command adds 12 clearly labeled fictional customers and 180 orders spread across the most recent 90 days, plus associated item, payment, production, handover, review, and feedback records. It is safe to rerun, only connects to a database on the local machine, does not alter product stock or rotate account passwords, and is not intended for production.

## Deploying with Vercel and Neon

The app is configured for Vercel with a Neon Postgres database. In Vercel, import this GitHub repository and add the Neon Postgres integration. Since a Neon project has not been created yet, use the Vercel-managed integration to provision one; connect it to the project’s Production and Preview environments and enable preview database branching. Vercel’s build runs `npm run vercel-build`, which generates Prisma Client, applies committed migrations, and builds the app.

The application uses `DATABASE_URL` at runtime. Prisma CLI commands prefer `DIRECT_URL`, then Neon’s `DATABASE_URL_UNPOOLED`, and finally `DATABASE_URL`; configure an unpooled/direct URL for migrations when the integration does not provide one. Keep each environment’s connection string scoped to its corresponding Neon branch. Never commit connection strings or place them in client-side `NEXT_PUBLIC_*` variables.

The production database starts without sample records. Do not run `npm run db:seed` or `npm run db:seed:demo` against Neon. After the first deployment has applied migrations, create the first production Owner exactly once with `npm run db:bootstrap-owner`. Set `DATABASE_URL` (or `DIRECT_URL`) and the `INITIAL_OWNER_USERNAME`, `INITIAL_OWNER_NAME`, `INITIAL_OWNER_GENDER`, `INITIAL_OWNER_PHONE`, and `INITIAL_OWNER_EMAIL` variables in the local process for that command; it prompts for the password without echoing it. Do not add credentials to source control or deployment logs. The script refuses to run if an owner already exists.

## Environment

`.env` is ignored by Git and contains local credentials. `.env.example` is a template only; replace its example password before use. The project database is mapped to host port `5433` to avoid changing or conflicting with PostgreSQL services on the default port `5432`.

## Application screens

- `/beranda`, `/`, `/register`: welcome, sign-in, and registration screens.
- `/menu`, `/pembayaran`, `/pesanan`, `/ulasan`: customer ordering flow.
- `/admin`, `/admin/menu`, `/admin/pesanan`, `/admin/penyerahan`, `/admin/akun`, `/admin/laporan`, `/transaksi`: administration screens.
- `/produksi` and `/produksi/<order-id>`: production queue and order details.
- `/owner`, `/owner/menu`, `/owner/akun`, `/owner/laporan`, `/owner/ulasan`: owner overview and reports.
>>>>>>> e7e7d4f070ccf9d866ce7788e13b8132a81d46ff
