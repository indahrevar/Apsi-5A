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

Running `npm run db:seed` generates demo accounts for all four roles and writes their usernames and random passwords to `LOCAL-TEST-CREDENTIALS.md` in the project root. That file is Git-ignored and intended only for local development. **Every seed run rotates these demo passwords and replaces the file.** Do not use the demo accounts or seed script in production; provision production accounts and secrets through a secure, environment-appropriate process.

## Environment

`.env` is ignored by Git and contains local credentials. `.env.example` is a template only; replace its example password before use. The project database is mapped to host port `5433` to avoid changing or conflicting with PostgreSQL services on the default port `5432`.

## Application screens

- `/beranda`, `/`, `/register`: welcome, sign-in, and registration screens.
- `/menu`, `/pembayaran`, `/pesanan`, `/ulasan`: customer ordering flow.
- `/admin`, `/admin/menu`, `/admin/pesanan`, `/admin/penyerahan`, `/admin/akun`, `/admin/laporan`, `/transaksi`: administration screens.
- `/produksi` and `/produksi/<order-id>`: production queue and order details.
- `/owner`, `/owner/menu`, `/owner/akun`, `/owner/laporan`, `/owner/ulasan`: owner overview and reports.
