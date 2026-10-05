# Technical revival — October 5, 2026

Scope: restore the existing application after Manus retirement. The repository was renamed to `zganich/foreverhome`; its existing history and InterpWhat UI are preserved. Rebrand, first-30-days adopter track, Jev, and shelter dashboard work are deferred.

## Runtime contract

- Browser login, signup, email confirmation and password recovery use Supabase.
- tRPC, multipart uploads and fetch-based analysis streams carry the current Supabase access token in the Authorization header. The server verifies it with the configured project's `auth.getUser(token)` and syncs only the verified identity. Browser IDs, user metadata roles, legacy cookies and old Manus callbacks cannot authorize requests.
- Direct Postgres access uses Drizzle with prepared statements disabled for pooler compatibility. Apply committed migrations with `pnpm exec drizzle-kit migrate`, using a reviewed database connection. The application role must own its tables or have BYPASSRLS. All application tables have RLS enabled; the browser uses the application API, so no Data API access policies are supplied. Inspect existing policies before deploying to an established database.
- AI uses `OPENAI_API_KEY`, `OPENAI_BASE_URL` (default `https://api.openai.com/v1`) and `OPENAI_MODEL` (default `gpt-4.1-mini`). Strict output schemas require every declared property. Provider-specific Forge parameters and Gemini model names are removed.
- The behavior pipeline generates an actual personality interpretation, saves it with the result, and emits one final completion event containing the persisted analysis ID. Provider or save failures refund a reserved credit. Credit reservation updates the balance atomically; beta and active unlimited subscribers are not charged.
- Image uploads use Vercel Blob and require `BLOB_READ_WRITE_TOKEN`. Supported formats are JPEG, PNG, GIF and WebP, up to 4 MB. Uploads require authentication and are public under the existing storage design. Videos are explicitly unavailable: the former code passed video URLs to an image-only model. Frame extraction is not implemented in this revival.
- `/api/stripe/webhook` verifies the raw request signature before any fulfillment. Credit purchases are fulfilled once per checkout session; subscriptions use paid invoices and current subscription periods. Fulfillment receipts and account changes share a database transaction. Account configuration, webhook registration and any live purchase remain operator actions.
- The generic data API proxy had no application callers. Its compatibility entry now fails explicitly instead of contacting the retired service. No replacement generic proxy is built.
- Owner notifications use an optional direct JSON webhook (`NOTIFICATION_WEBHOOK_URL` and optional token). An omitted webhook produces an explicit configuration error. No external notification was sent. Scheduled user reminder delivery was not present in the old runtime and is not introduced here; reminder CRUD retains ownership checks.
- Vercel serves built static files directly and routes `/api/*` to the API function. The function imports the Express factory without starting a local server or importing the Vite development runtime. Standalone local production serving still uses `pnpm start`.

## Configuration and recovery findings

The existing Vercel team contains `interpwhat` (`prj_KiEaivajSX8c3GPjTMKuoOfRFOpK`, production domain `interpwhat.com`) and `interpwhat-deployment` (`prj_FLl4VZNGCDdF7zGmnKo60uzotj4N`). The first has saved environment configuration; the second has none. Both project records still name `zganich/interpwhat` on `main`. No settings were changed and no deployment was made. Pushing a branch may cause a preview deployment, so the revival branch must stay local until James authorizes that action.

The public deployed browser bundle identifies Supabase project `ujcfnygugdargmtlbarq`. A read-only request to its auth health endpoint could not resolve/reach it. It is absent from the Supabase projects visible to the current CLI login. Recover the original account/project or explicitly choose a replacement before production acceptance. Do not assume a replacement preserves old users or data.

Locally, database, Supabase, Blob and Stripe credentials were absent. The session's existing OpenAI key was reused with James's live authorization; it was not saved to files or printed. A live structured-output connection test returned model `gpt-4.1-mini-2025-04-14`, valid JSON, in 2,831 ms. This proves the direct model connection, not live photo analysis or the complete hosted product.

## Verification

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
```

The baseline had 40 passing tests. The revival adds 13 unit regressions and a 10-case opt-in local Postgres/HTTP rehearsal. The ordinary suite passes 53 tests and skips the 10 integration cases unless `REVIVE_TEST_DATABASE_URL` is supplied. The integration suite accepts only `127.0.0.1` with database name `foreverhome_rehearsal`, migrates that dedicated database, and creates unique fictional fixtures on each run.

```sh
python3 scripts/revive-rehearsal.py
```

Expected: 63 passing tests and `Rehearsal PostgreSQL stopped`. The script creates and stops a disposable local PostgreSQL instance, overrides provider credentials with fictional test values, and retains only fictional data in the system temporary directory. Set `REVIVE_PG_BIN` if PostgreSQL binaries are not on the normal path. The rehearsal uses real PostgreSQL, Drizzle, Express, HTTP multipart uploads, the AI request builder and pipeline, signed raw Stripe webhook fixtures, and actual persistence. Supabase identity verification responses, AI responses, Blob storage and subscription lookup are replaced with fictional local fixtures. It makes zero live Supabase, AI, Blob, Stripe or notification calls. Its checks cover authorization, completed-result persistence, failed-analysis refunds, concurrent last-credit reservation, duplicate webhook delivery, subscription expiry and RLS.

The production build's login page was checked in a real browser: it rendered without JavaScript errors. Missing Supabase configuration remains a warning and produces a user-visible sign-in configuration error. This is not a live signup or sign-in acceptance test.

## Remaining acceptance work

1. Recover/select Supabase and review existing schema, data and access policies. Apply migrations only to the explicitly selected database.
2. Select the `interpwhat` Vercel project (recommended based on saved configuration and domain), provision Blob, set the reviewed runtime variables, and verify repository linkage.
3. With live authorization, configure Stripe in test mode and its webhook subscriptions. Exercise payment fulfillment against the selected database.
4. With live deployment authorization, verify signup/confirmation, login/refresh/logout, pet creation, image upload, breed/quality checks, analysis streaming, saved history/feedback, reminder ownership and payment fulfillment in the actual hosted app.
5. Decide whether video support and scheduled reminder delivery are required before release. Neither has been falsely represented as restored.

## Primary API references

- [Supabase server-verified user identity](https://supabase.com/docs/reference/javascript/auth-getuser)
- [OpenAI structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs)
- [OpenAI GPT-4.1 mini](https://developers.openai.com/api/docs/models/gpt-4.1-mini)
- [Stripe raw webhook signature verification](https://docs.stripe.com/webhooks/signature)
- [Vercel function limits](https://vercel.com/docs/functions/limitations)
