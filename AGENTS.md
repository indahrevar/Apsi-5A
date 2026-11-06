<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## API and database integration

- Treat PostgreSQL via Prisma as the source of truth for products, orders, payments, production, handovers, reports, reviews, feedback, and accounts. Do not reintroduce hardcoded business records or browser-local order history.
- Keep browser storage limited to customer cart and checkout draft data. Persist the order and its note, item snapshots, payment, and inventory decrement atomically through `/api/orders`.
- Every API handler must enforce the role server-side with `authorizeApi`; protect mutations with `assertSameOrigin`, validate request bodies, scope customer reads/writes to their own records, and return the established JSON error shape.
- Preserve workflow rules in the API, not only in disabled or hidden UI controls. Use Prisma transactions when a workflow updates related records or inventory.
- Update `prisma/schema.prisma` and add a migration for database shape changes. Regenerate Prisma Client, then test the relevant authenticated route and UI flow.
- Run `npm run lint` and `npm run build` after API/client changes.
