# Deploy (Cloudflare Workers)

One Worker (`apps/api/wrangler.jsonc`) serves both:
- the **web app**: the static export of `apps/app`, with SPA fallback;
- the **API**: `/graphql`, `/api/*` and `/healthz` (`apps/api/src/worker.ts`).

Web and API share one origin, so Better Auth cookies stay first-party and there is no CORS.

Postgres is Neon `production`, reached through **Hyperdrive**. Files are in Neon Object Storage (S3 API).

**CD:** every push to `main` that passes the `check` job runs the `deploy` job in `.github/workflows/ci.yml`:
1. Build the web app with `EXPO_PUBLIC_API_ORIGIN=same-origin`.
2. Run `drizzle-kit migrate` against production.
3. Run `wrangler deploy`.

The deploy job is skipped until the `HYPERDRIVE_ID` variable exists.

## One-time setup

1. **Cloudflare account**
   - Sign up (free plan).
   - In *Workers & Pages*, pick a `workers.dev` subdomain. The app will live at `https://brain.<subdomain>.workers.dev`.
   - Copy the **Account ID** (dashboard sidebar).
2. **API token**: go to *My Profile → API Tokens → Create Token*. Use the template **Edit Cloudflare Workers**, then add the permission **Account → Hyperdrive → Edit**.
3. **Hyperdrive**: on your machine, run
   ```bash
   npx wrangler login
   npx wrangler hyperdrive create brain-db --connection-string="<DATABASE_URL_UNPOOLED from .env.local>"
   ```
   Use the **direct** (unpooled) URL; Hyperdrive does the pooling. Copy the printed `id`. It is not a secret.
4. **GitHub**: go to *repo → Settings → Environments → New environment* and name it `production`.
   - **Variable**
     - `HYPERDRIVE_ID`: the id from step 3.
   - **Secrets**
     - `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
     - `DATABASE_URL_UNPOOLED`: for migrations.
     - `BETTER_AUTH_SECRET`: new, from `openssl rand -base64 32`.
     - `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
     - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` and `AWS_ENDPOINT_URL_S3`: Neon Object Storage, same values as `.env.local`.
5. **Google OAuth**: in Google Cloud Console → Credentials → your OAuth client:
   - Authorized JavaScript origin: `https://brain.<subdomain>.workers.dev`.
   - Redirect URI: `https://brain.<subdomain>.workers.dev/api/auth/callback/google`.
6. Push to `main`, or re-run the latest workflow. The `deploy` job prints the Worker URL.

Changing a secret means updating it in GitHub, then deploying again. The deploy job syncs the secrets on every run.

## Local check of the Worker runtime

```bash
pnpm --filter @brain/app build    # with EXPO_PUBLIC_API_ORIGIN=same-origin to test the hosted setup
cd apps/api && npx wrangler dev --env-file ../../.env.local --env-file .env.local --var NODE_ENV:development
```

`wrangler dev` needs `CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_HYPERDRIVE` set to a Postgres URL. A dry run of the bundle: `npx wrangler deploy --dry-run`.

## Notes

- Workers can't share I/O objects between requests, so the Worker creates DB + auth + app per request. Hyperdrive keeps the real connection pool. The GraphQL schema is built once per isolate.
- Runtime code must not use Node-only APIs at module load (e.g. `import.meta.resolve`). Codegen-only code lives in `apps/api/src/schema-path.ts`.
- The Node server (`apps/api/src/server.ts`) still works for local dev, and for Docker/Fly later.
