# Technical revival — local acceptance repairs, October 20, 2026

Scope: restore the existing application after Manus retirement. James selected **Cloud SQL (Option A)** and separately approved the prerequisite provisioning, DB bootstrap/migrations, and Firebase Auth/runtime IAM phases. Rebrand, adopter track, Jev and shelter dashboard remain separate work. The InterpWhat UI and GitHub history are preserved.

**Earlier acceptance snapshot (superseded by the private checkpoint):** repair commit `95afb1b` was pushed and deployed to staging on October 20. Hosted retests passed owner analytics and regular-user admin denial, then stopped at disabled-session recovery: the message appeared, but the URL stayed on the protected page. The separately approved automatic sign-in redirect below is local only; it has not been pushed or deployed. Read the private checkpoint and acceptance report for exact hosted evidence. Earlier provisioning sections below are historical snapshots; their not-yet-deployed/owner-unverified/six-binding statements are superseded by the checkpoint. Runtime currently has seven scoped bindings; no IAM change is part of these repairs. No DNS/public-read/Stripe change is authorized.

## Local session redirect repair

Rejected sessions clear the cached identity and replace the protected route with `/login?reason=session-unavailable`. The sign-in page shows the fixed message “Your session is unavailable. Please sign in again.” across reloads; successful sign-in replaces that URL with `/dashboard`. The query carries a fixed reason only, with no credential or reflected user content. Both HTTP401 invalidation and `auth.me` returning200/null take this path. Account-service errors retain Retry; regular users retain explicit admin access denial without being signed out.

Local browser regressions assert the actual URL, visible message and form, reload persistence, successful subsequent sign-in, null-identity rejection, retryable503, unchanged admin-denial route and ordinary sign-in without a banner. All external services are intercepted with fictional fixtures; hosted verification of this redirect remains **UNVERIFIED** until a separately approved release/retest.

## Local acceptance repair design

- GCS remains private. Stored GCS URLs are stable locators, not display URLs. GET `/api/media/:filename` verifies Firebase/revocation/email status through the existing auth boundary, derives the UID namespace, reads bounded validated image bytes with the existing `storage.objects.get` grant and returns `private, no-store`. No public-read, signed URL, new secret, bucket CORS, service account or IAM grant.
- Browser `PrivateImage` loads via `authFetch`, displays a Blob URL and aborts/revokes it on identity/locator change or unmount. Analysis results, timeline, profile displays and uploaded preview use it. Existing canonical media URLs remain compatible without a database migration. Legacy external/other-identity locators are not reassociated.
- Quality/vision/breed image calls use server-read in-memory Base64 data URLs. No prompt/image/credential logging or temporary AI upload file. Provider failures produce safe errors, never a fabricated acceptable quality score. Model-stage outputs are schema-checked; incomplete output cannot complete a pipeline. Existing persisted-completion/credit reservation/refund behavior is retained.
- Admin aggregation removes the unused status projection that caused PostgreSQL42803. The existing owner screen shows actual counts and clearly labeled estimated subscription value; fabricated growth/activity/churn/shelter results are no longer presented. This is not a new shelter dashboard.
- Protected pages wait for Firebase and server identity. Rejected sessions produce a sign-in state rather than blank pages; 401 and disabled token refresh clear identity caches, while403/503/network errors do not trigger blanket sign-out. The initial auth restoration does not cancel mounted queries through cache clearing. Owner analytics has bounded fetch/retry/back states; regular users see denial.
- Billing capability is a non-secret boolean based on TEST checkout and webhook configuration. Absent/unavailable configuration disables all paid CTAs and stops server checkout mutations before contacting Stripe. No Stripe call is required to check capability. Configuration readiness is not payment-provider acceptance.
- `/health` is the new external liveness path; `/healthz` remains a compatibility alias, `/readyz` checks SQL. Deployed probes remain unchanged until separately approved deployment. Touched UI copy identifies unavailable video, live monitoring, notification delivery and donation functionality; no deferred product feature is built.

Local verification commands (no real providers): `python3 scripts/revive-rehearsal.py` creates/migrates/stops an isolated localhost PostgreSQL database and runs unit/HTTP/integration tests. `pnpm exec playwright test --config e2e/repair.config.ts` uses installed Chrome and localhost Vite; Firebase/AI/storage/billing endpoints are intercepted with fictional fixtures and every other remote request is blocked. `pnpm check` and `pnpm build` check types/build. The browser fixture is not proof of hosted Firebase or OpenAI success. Do not use a hosted database for the rehearsal.

Production gates remain: actual staged repair acceptance, Stripe TEST inputs/acceptance, domain cutover, and the prior internal Firebase hashing-key-output security review. Container process-death credit recovery is still deferred. Any push, cloud build, API/Hosting deployment, IAM, DNS, public-media or Stripe mutation needs separate live approval.

## Historical provisioning snapshot (before staging deployment)

## Verified Firebase and runtime configuration

Project `foreverhome-reclaimware-2026` / `726465463592` is ACTIVE with billing linked to the approved account (Firebase Blaze; standard Auth subtype `FIREBASE_AUTH`, no Identity Platform upgrade). Cloud SQL `foreverhome-postgres` is RUNNABLE; database `foreverhome` and restricted owner/login `foreverhome_app` are created. All five migrations through `0004` and all 13 app tables/RLS settings were verified through Auth Proxy. The private media bucket and project-only $20 monthly alert exist.

Firebase Web app **ForeverHome Web** is ACTIVE. These are public build inputs, including the Firebase API key; they are not server secrets:

```dotenv
VITE_FIREBASE_API_KEY=AIzaSyCsMIt-zUA8cvr45rJeh3vAA409jauEv5k
VITE_FIREBASE_AUTH_DOMAIN=foreverhome-reclaimware-2026.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=foreverhome-reclaimware-2026
VITE_FIREBASE_APP_ID=1:726465463592:web:3d63e9c45f93bf87f4bc1d
```

Email/Password is enabled with `passwordRequired=true`. Authorized domains are exactly `localhost`, `foreverhome-reclaimware-2026.web.app`, and `foreverhome-reclaimware-2026.firebaseapp.com`; `interpwhat.com` is not added. Verification/reset use Firebase's managed `https://foreverhome-reclaimware-2026.firebaseapp.com/__/auth/action` handler and the existing client SDK flow. Reset and verification links were generated and checked only in memory, with the staging `/auth/callback` continue URL. No action code, link, or email was sent/saved. Actual email delivery and complete browser flows remain **UNVERIFIED**.

Owner `ops@reclaimware.com` was created through the Admin SDK with UID **`5NX6T4XBIUZbKSy0nX7pgPLdj3l2`**. Password exists only in macOS Keychain service `ForeverHome`, account `OWNER_PASSWORD`. The owner is enabled but **emailVerified=false**; the existing client/server verification gate remains active. This UID is the runtime `OWNER_OPEN_ID`; it does not bypass verification.

Proposed deploy-time non-secret runtime values (recorded, not deployed):

```dotenv
NODE_ENV=production
GOOGLE_CLOUD_PROJECT=foreverhome-reclaimware-2026
GCS_BUCKET=foreverhome-reclaimware-2026-media
CLOUD_SQL_CONNECTION_NAME=foreverhome-reclaimware-2026:us-central1:foreverhome-postgres
OWNER_OPEN_ID=5NX6T4XBIUZbKSy0nX7pgPLdj3l2
APP_URL=https://foreverhome-reclaimware-2026.web.app
CORS_ALLOWED_ORIGINS=https://foreverhome-reclaimware-2026.web.app,https://foreverhome-reclaimware-2026.firebaseapp.com
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4.1-mini
```

Cloud Run supplies `PORT`. Its future service identity is **`foreverhome-run@foreverhome-reclaimware-2026.iam.gserviceaccount.com`**, configured as `serviceAccountName`, not a secret/env credential. `VITE_API_BASE_URL` is still **UNVERIFIED** until a separately approved Run deployment returns an origin. Analytics and notification variables remain omitted.

| Runtime secret | Resource | Current version |
| --- | --- | --- |
| DATABASE_URL | `projects/726465463592/secrets/foreverhome-database-url` | 1, ENABLED |
| OPENAI_API_KEY | `projects/726465463592/secrets/foreverhome-openai-api-key` | 1, ENABLED |
| STRIPE_SECRET_KEY | `projects/726465463592/secrets/foreverhome-stripe-test-secret-key` | Empty; TEST input missing |
| STRIPE_WEBHOOK_SECRET | `projects/726465463592/secrets/foreverhome-stripe-test-webhook-secret` | Empty; TEST input missing |

Runtime IAM has exactly the requested bindings: `roles/secretmanager.secretAccessor` on each named secret individually; `roles/cloudsql.client` on the ForeverHome project; and custom role `projects/foreverhome-reclaimware-2026/roles/foreverhomeMediaObjects` on the media bucket only. That role contains only `storage.objects.create` and `storage.objects.get`, matching create-with-generation-precondition and metadata/read calls; no list, overwrite, delete or IAM permission. No project editor/owner role, user-managed service-account key, anonymous member, impersonation/deployer binding, or additional Firebase role was granted. Bucket public access prevention remains enforced. No workload runs as this identity yet; effective runtime access is **UNVERIFIED**.

**Runtime blocker:** `verifyIdToken(token, true)` calls Firebase `getUser` for revoked/disabled-user checks and requires `firebaseauth.users.get`. That permission is outside the approved “no other bindings” set and was **not granted**. Separately approve an additional minimal user-read role/binding before hosted auth acceptance; retain the revocation check. [Firebase permissions](https://docs.cloud.google.com/iam/docs/roles-permissions/firebaseauth).

## Frontend, TLS and routing proposal

```text
interpwhat.com (Google-managed TLS) -> Firebase Hosting CDN -> React SPA
  /auth/callback, /auth/reset-password -> SPA email action handlers
  /api/stripe/webhook -> short Hosting rewrite -> Cloud Run Express
  /api/* otherwise -> static configuration-error response

Browser API requests -> https://<approved-service>.run.app/api/*
  Firebase bearer token + exact-origin CORS
  -> firebase-admin verification -> Drizzle/Cloud SQL, GCS, OpenAI, test Stripe
```

Use ordinary Firebase Hosting, not Firebase App Hosting and not a load balancer. `firebase.json.example` serves `dist/public`, sends SPA routes to `index.html`, and rewrites only the Stripe webhook to Run. Keep static assets out of `/api/stripe/webhook`: Hosting serves an existing matching static file before a rewrite. `VITE_API_BASE_URL` selects the exact managed HTTPS Run origin. API uploads, tRPC and fetch-based SSE go directly there, avoiding Hosting's **60-second proxy timeout**. Run's proposed timeout is 300 seconds; this is still a bounded synchronous analysis path, not a durable job system. No custom Run domain or separate API DNS record is required. [Hosting/Run behavior](https://firebase.google.com/docs/hosting/cloud-run).

After separate approvals, register apex and www with Hosting. Use its **Advanced Setup** and DNS ownership/ACME challenge while existing traffic remains on Vercel. Google issues and renews the frontend certificate. Verify both names before making www redirect to the apex using Hosting's custom-domain redirect setting; redirect configuration is not yet created. Use only the records supplied by the actual wizard, including any CAA requirements; do not guess IPs. Run's default HTTPS endpoint has its own Google-managed certificate. [Custom domain workflow](https://firebase.google.com/docs/hosting/custom-domain).

## DNS recommendation and cutover order

Phase 0 public evidence found **Namecheap registration, Vercel authoritative nameservers** (`ns1.vercel-dns.com`, `ns2.vercel-dns.com`), not Porkbun DNS. Those are Oct 19 observations; recheck before cutover. Full private zone inventory, registrar login and DNSSEC/DS state are **UNVERIFIED**.

**Keep Vercel DNS for staging and the first application cutover.** DNS hosting and web hosting can be separated. This changes the fewest things at once. Prepare Hosting's certificate first, prove staging, obtain approval for a rollback plan and exact domain/record changes, then update only the web records. Preserve mail, SPF, DKIM, DMARC, other subdomains and verification records. The earlier request to detach the web domain from Vercel first must be scheduled at the approved final cutover: detaching early can interrupt current traffic and weakens rollback. A no-interruption guarantee under that constraint is **UNVERIFIED**; do not detach while merely preparing certificates or moving nameservers. Never delete the authoritative Vercel zone while delegation still points there.

To complete the exit from Vercel later, recommend **Namecheap free BasicDNS**, subject to account/eligibility verification. Export the entire Vercel zone, verify every destination record and DNSSEC handling, preserve the now-working Firebase web records, and move nameservers in a separate approved window. Namecheap says records are **not copied automatically**. Its public instructions describe manual entry after the nameserver switch; ability to pre-stage/import this particular zone needs verification or Namecheap support before promising continuity. If pre-staging cannot be established, retain Vercel DNS temporarily and return with a concrete alternative for approval. No registrar transfer or paid Cloud DNS is currently proposed. [Namecheap procedure](https://www.namecheap.com/support/knowledgebase/article.aspx/767/10/how-to-change-dns-for-a-domain/).

## Runtime changes

- Firebase Web SDK handles signup, password login, refresh, verification resend and reset emails. A signed-in but unverified account cannot access application data. Query caches clear on identity changes/logout. Production rejects Auth emulator configuration.
- The server uses a project-pinned `firebase-admin` app with ADC and `verifyIdToken(token, true)` (signature/audience/issuer/expiry, revoked/disabled-user checks). Only verified UID/email/name are synchronized; metadata cannot grant roles. Owner access is pinned by server `OWNER_OPEN_ID`. Existing Supabase cookies/tokens and Manus callbacks cannot authorize requests. Verification outages are service errors rather than successful anonymous identities.
- Configure Firebase email/password auth, authorized domains and the custom email action URL `https://interpwhat.com/auth/callback` for verification/reset templates after approval. The SPA consumes only supported action modes using the configured project, ignores caller-supplied API keys/redirects, verifies reset codes before accepting a new password, and never sends passwords to the application server. Cross-device verification can finish with a normal sign-in. Email delivery and these flows in a real Firebase project are **UNVERIFIED**.
- Cloud SQL remains Postgres/Drizzle. `CLOUD_SQL_CONNECTION_NAME` selects Run's Auth Proxy Unix socket; the secret URI supplies the database/user/password. No authorized-network `0.0.0.0/0`, VPC connector or JSON service-account key is proposed. Pool maximum is 5 per process (proposed Run maximum 2 instances; allow rolling-revision overlap). Prepared statements remain disabled. Direct local TCP Postgres still works.
- Migration `0004_firebase_identity.sql` widens `users.id` and its nine referencing identity columns to 128 characters. It was generated by Drizzle with matching snapshot/journal; never applied to hosted data. All four prior migrations remain intact. Migration 0003 uses ordinary Postgres RLS and contains **no** `auth.jwt()`, `auth.uid()` or Supabase policy dependency to rewrite. The server role must own tables; browser roles receive no policies. Authorization remains enforced by server ownership checks. An imported old database must have its policies/data/roles reviewed independently.
- Cloud Storage uses ADC and a dedicated public-media bucket. Authenticated image uploads remain JPEG/PNG/GIF/WebP, maximum 4 MiB, with MIME/header checks and random filenames under `uploads/<sha256(uid)>/`. Public read is a separately approved bucket IAM policy; the adapter never makes ACL/IAM changes. Object create uses a generation precondition to avoid overwrites. AI entry points accept only canonical image URLs in the caller's bucket namespace. This is a namespace guard, not proof of object existence or a full image decoder. Legacy Blob URLs or old user identities require an approved data/identity migration; no automatic reassociation by email is performed.
- Direct OpenAI transport/model configuration is retained. No live AI calls were made in this migration. The real behavior pipeline, persisted completion, atomic credit reservation and provider-failure refund behavior remain.
- Stripe is forcibly test-only: configured secret keys must start `sk_test_`, and signed live events are rejected before fulfillment. Raw-body signature checks and transactional receipt idempotency remain. The webhook URL can stay `https://interpwhat.com/api/stripe/webhook` after domain cutover, but actual registration/test credentials are **UNVERIFIED**. No live account or webhook changes occurred.
- Production entry bundles no Vite development runtime, listens on `0.0.0.0:$PORT`, and drains HTTP/DB connections on shutdown. `/healthz` proves process liveness; `/readyz` runs `select 1` only. Neither proves complete hosted acceptance. Forced container termination can still strand an in-flight credit reservation; durable recovery is a remaining gap.

Active auth files: `client/src/contexts/AuthContext.tsx`, `client/src/lib/firebase.ts`, `client/src/lib/api.ts`, `client/src/_core/hooks/useAuth.ts`, `client/src/main.tsx`, `client/src/App.tsx`, pages `Login`, `AuthCallback`, `ResetPassword`, `Dashboard`, `AdminDashboard`, `Home`, `ForDevotedParents`, `ForMultiPet`, `ForNewOwners`, `ForRescueAdopters`, `ForShelters`, and components `MainNavigation`, `ExitIntentPopup`, `StickyCTA`. Server boundaries: `_core/firebase.ts`, `_core/auth.ts`, `_core/context.ts`, `_core/trpc.ts`, `routers.ts`, upload/admin/streaming routes. `client/src/lib/supabase.ts` and `contexts/SupabaseAuthContext.tsx` retain compatibility-path exports only, with no Supabase SDK dependency. Historical Vercel files remain as inert source; do not use their deployment instructions. No `.github/workflows` edits.

## Build and deployment review templates

- `Dockerfile`: Node 24, pinned pnpm/frozen lockfile, check/test/build, pruned runtime dependencies, non-root runtime. Public Firebase browser settings are build arguments; no runtime secrets or ADC credentials enter the build. `.dockerignore` excludes env files, credentials, Git and local outputs.
- `cloudbuild.yaml`: checks/tests/builds the image through Docker, publishes an immutable build-ID tag to an approved Artifact Registry. **No deploy step.** GitHub connection, trigger creation and build execution require approval. Recommend a manually invoked/approval-required trigger, not automatic deployments. Image digest and frontend build configuration must be recorded for each separately approved release.
- `deploy/cloud-run.yaml.example`: proposal only, placeholders, min 0/max 2, 1 vCPU/512 MiB, concurrency 4, 300-second timeout, pinned Secret Manager versions, Cloud SQL attachment and process probes. No VPC/LB/Cloud DNS. Public invoker access is required for browser/Stripe traffic and needs explicit approval; app endpoints still enforce Firebase identity.
- `firebase.json.example`: no project binding or active `firebase.json` is created. Review substitutions and release config, then copy/bind/deploy only after approval. Build Hosting assets with the same reviewed public variables as the API image; its frontend config changes need a rebuild. Do not use `pinTag` to silently couple Hosting rollback to a Run revision; API and frontend rollback approvals stay explicit.

## Environment and secret inventory

The project, Firebase Web app/Auth configuration, database, private bucket, four secret containers and runtime IAM now exist as recorded above. DATABASE_URL and OPENAI_API_KEY version 1 were imported with memory-only round-trip checks. Both Stripe containers remain empty. No registry, build trigger or application service has been deployed. Secret payloads never belong in this document.

| Variable                                                                                                 | Intended location / status                                                                                                                                                                                                                                            |
| -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`                                                                                           | Secret Manager `foreverhome-database-url`, version 1 ENABLED. Percent-encoded URI credentials for the dedicated app database/user; runtime socket supplied separately.                                                                                                     |
| `OPENAI_API_KEY`                                                                                         | Secret Manager `foreverhome-openai-api-key`, version 1 ENABLED. Imported from Keychain service `ForeverHome`, account `OPENAI_API_KEY`, with memory-only equality verification. Live provider validity remains UNVERIFIED. |
| `STRIPE_SECRET_KEY`                                                                                      | Secret Manager `foreverhome-stripe-test-secret-key`; container exists but has no version; TEST input missing. Test key only.                                                                                                                                                                       |
| `STRIPE_WEBHOOK_SECRET`                                                                                  | Secret Manager `foreverhome-stripe-test-webhook-secret`; container exists but has no version; TEST input missing. Approved test endpoint's signing secret only.                                                                                                                                    |
| `GOOGLE_CLOUD_PROJECT`, `GCS_BUCKET`, `CLOUD_SQL_CONNECTION_NAME`                                        | Non-secret Run environment; verified values listed above. Firebase Admin uses the same project.                                                                                                                                                              |
| `APP_URL`, `CORS_ALLOWED_ORIGINS`                                                                        | Non-secret Run environment. Canonical frontend plus explicit staging/preview origins only; no wildcards/cookies.                                                                                                                                                      |
| `OWNER_OPEN_ID`                                                                                          | Non-secret Run environment; exact verified Firebase owner UID, not the old Supabase ID.                                                                                                                                                                               |
| `OPENAI_BASE_URL`, `OPENAI_MODEL`                                                                        | Run env; defaults `https://api.openai.com/v1`, `gpt-4.1-mini`.                                                                                                                                                                                                        |
| `PORT`, `NODE_ENV`                                                                                       | Run injects `PORT`; production image sets `NODE_ENV=production`.                                                                                                                                                                                                      |
| `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID` | Public browser config from the approved Firebase Web app; build inputs, not Secret Manager credentials. Missing app config displays a sign-in error.                                                                                                                  |
| `VITE_API_BASE_URL`                                                                                      | Public build input: exact deployed Run HTTPS origin; empty only for same-origin local development.                                                                                                                                                                    |
| `VITE_APP_TITLE`, `VITE_APP_LOGO`                                                                        | Existing optional public build settings, rebrand deferred.                                                                                                                                                                                                            |
| `VITE_ANALYTICS_ENDPOINT`, `VITE_ANALYTICS_WEBSITE_ID`                                                   | Optional public build config; leave omitted unless selected.                                                                                                                                                                                                          |
| `NOTIFICATION_WEBHOOK_URL`, `NOTIFICATION_WEBHOOK_TOKEN`                                                 | Disabled by omission. If later authorized, both go to separate reviewed Secret Manager secrets; external sends need approval.                                                                                                                                         |

Runtime SA has the scoped SQL, media create/get and per-secret access listed above. Firebase user-read for revocation verification is still missing and needs separate authorization. Build SA must have no runtime secret access. Database migration identity/DDL is separate from the browser. No service-account JSON keys. Obsolete `SUPABASE_*`, `VITE_SUPABASE_*`, `BLOB_READ_WRITE_TOKEN`, Manus/Forge variables and `JWT_SECRET` are unused. Historical Keychain `ForeverHome / BLOB_READ_WRITE_TOKEN` and `SUPABASE_DB_PASSWORD` stay untouched.

## Verification and remaining gates

```sh
pnpm install --frozen-lockfile
pnpm check
pnpm test
python3 scripts/revive-rehearsal.py
pnpm build
```

Current local rehearsal: **85/85 tests passed**, real disposable Postgres migrations and HTTP routes, fictional Firebase/AI/GCS/Stripe responses. Ordinary suite has 74 passing tests with 11 integration cases skipped unless its dedicated database is supplied. Loopback listeners must be permitted. The script accepts only `127.0.0.1/foreverhome_rehearsal`, starts/stops Postgres and makes zero live provider calls. Existing baseline was 53 ordinary + 10 integration tests; 22 boundary regressions added. Type check and production build pass; existing large-JS-bundle warning remains.

Local production bundle startup and `/healthz` were checked on Node 25.9.0 with fictional runtime configuration and env-file loading disabled. Playwright confirmed login rendering, zero JavaScript errors and the visible missing-Firebase-configuration error after fictional sign-in inputs. This is shell/configuration evidence, not a real Firebase login. The temporary app and browser were stopped.

**Docker image build is UNVERIFIED**: Docker is not installed on this Mac. Node 24 image execution, Cloud Build, Hosting rewrites/CDN/TLS, ADC/effective access as the new runtime SA, the deployed Run SQL socket, browser signup/email/reset/revocation flows, public GCS access, hosted SSE/CORS, Stripe test delivery and complete hosted acceptance are **UNVERIFIED**. Hosted DB migrations/queries through this Mac’s Auth Proxy, Firebase setup, and IAM policy metadata were verified separately. Local mocked-provider tests do not establish any of them.

Next approvals remain separate: the missing Firebase user-read runtime binding; any verification/reset email send or end-to-end action; registry/build/trigger; staging Run deploy/public access; Hosting deploy; public GCS policy; Stripe test endpoint changes; domain/DNS cutover. Existing empty Stripe-container imports remain approved once the selected TEST inputs are securely available. No push or deployment approval is inferred from prerequisite completion. The private checkpoint is the current provisioning handoff.

Still missing/deferred: old user/data/media recovery and UID mapping, backup/restore drill, resource spending caps (the configured budget alert is not a cap), storage lifecycle/egress limits, request/AI spend/rate limits, durable analysis-credit recovery after process death, external uptime alerting, GitHub connection/trigger controls and disabling legacy Vercel auto-deploy before any push, test-mode billing acceptance, admin stats real-data wiring, video frame extraction, scheduled user reminder delivery and notification provider configuration. Do not market unbuilt realtime/video/reminder claims as working.


## Local security repair batch — October 21, 2026

This code is a **local release candidate**, not a deployment. The private checkpoint records the exact local SHA, verification receipts and hosted baseline. No push, Cloud Build, hosted migration, deployment, IAM, DNS, Stripe or real AI action is part of this batch.

### Shared AI admission and accounting

Migration `0005_ai_admission` adds only `ai_usage_daily` and `ai_requests`, with constraints, indexes and server-only RLS. It has been exercised only on disposable local PostgreSQL. Before any later release, separately approve applying it to Cloud SQL. An absent/unavailable table denies AI work; there is no process-counter fallback.

Authenticated HTTP middleware establishes a server-side identity context. Both tRPC and SSE converge on `withAiOperation`; every `invokeLLM` and the currently unrouted speech function require its live admission context before provider transport. Database transactions use one short shared advisory lock plus persisted counters/leases, released before provider I/O. Provider attempts are counted before transport and never refunded on provider errors. Implicit speech retries are disabled; text transport has no automatic retries. Leases expire after 120 seconds and renew before each bounded 40-second transport attempt. Old lease tokens cannot release a replacement lease.

**Accounting:** a normal full analysis reserves exactly one analysis credit as before. Quality and breed use a separate daily helper allowance, not an additional analysis credit. Every operation requires a verified identity and a positive current balance. Beta/unlimited accounts retain their existing analysis no-decrement entitlement but do not bypass positive-balance eligibility, user limits or the project ceiling. Zero-balance users are denied even for a cached quality result.

Defaults/hard maxima (optional environment overrides may only lower them):

| Variable | Default |
| --- | --- |
| `AI_DISABLED` | `false`; `true` or malformed values deny all AI operations/cache delivery |
| `AI_USER_IN_FLIGHT` | 1 admitted operation |
| `AI_USER_DAILY_ANALYSES` | 10 admissions per UTC day |
| `AI_USER_DAILY_HELPERS` | 10 quality/breed admissions combined per UTC day |
| `AI_USER_DAILY_PROVIDER_CALLS` | 50 attempts per UTC day |
| `AI_PROJECT_DAILY_PROVIDER_CALLS` | 100 attempts per UTC day |

A successful schema-valid quality response (including an image rejection) is cached for 24 hours, keyed by owner, image-content digest, model/provider endpoint and validator-policy revision. Cache hits consume no new helper allowance or provider attempt; auth/kill/balance checks still apply. Concurrent same-image misses receive an explicit retryable in-flight denial rather than duplicating provider work; a subsequent retry receives the saved result. Failed/invalid provider responses are not successful cache entries. TTL controls reuse, not a promise to erase all historical rows. Cache expiry and user/provider ceilings use database UTC time.

These are **call/allowance ceilings, not a dollar spend cap**. Failed admissions/provider attempts can consume their allowance; completed results do not refund provider counts. General analysis retry idempotency and process-death paid-credit recovery (F07) remain separate work. Lease expiry does not refund a stranded analysis credit.

### Browser headers and request contracts

`firebase.json.example` and the Express production static server share an **enforcing** CSP. Scripts are same-origin with no inline/eval exception; Firebase Auth/refresh and the deterministic staging Run origin are exact connection targets. Private photos use authenticated fetch + Blob URLs, not anonymous GCS image loads. Existing Google Fonts sources are explicit; dormant showcase image hosts are not allowed. Framing is denied; `nosniff` and `strict-origin-when-cross-origin` apply to Hosting/API responses. React/Radix/chart inline styles remain permitted. Development alone permits Vite's inline refresh and loopback WebSocket connections. No report-only production fallback was needed in the local browser flows.

The Hosting change is a **template change only**; an operator must carry/review it in the actual release configuration under separate deployment approval. Actual Firebase edge headers are not changed or re-verified by local tests.

Text JSON is limited to 64KiB, 16Ki characters/string, 128 total object fields, 20 items/array and depth 8 (512 total nodes). This accommodates the 5000-character analysis-context contract and bounded tRPC batching. Flat URL-encoded bodies are limited to 8KiB/20 parameters; compressed text bodies are rejected. Express query parsing is simple, not nested `qs`. Photo multipart is separate: exactly one photo, no extra fields, maximum **4MiB inclusive**. Malformed/oversized inputs return bounded 400/413/415 errors without reflecting bodies. Existing raw Stripe webhook parsing is unchanged.

### Local verification

`python3 scripts/revive-rehearsal.py` creates/stops a dedicated local database, applies through 0005 and runs the full suite. Provider transport is mocked and default outbound fetch rejects non-loopback requests. The DB tests use independent pools to verify shared concurrency/ceilings, helper cache/owner isolation, failed-call accounting, lease replacement, zero-credit and kill-switch denial, normal last-credit persistence/refund behavior, and RLS. Local browser fixtures separately intercept Firebase/API/storage responses; they prove rendering/navigation under the production header policy, not hosted delivery or a single joined real UI/database session.

To build and run that local production-browser fixture (all Firebase settings fictional; empty API base means same-origin):
```sh
VITE_FIREBASE_API_KEY=fictional-local-api-key VITE_FIREBASE_AUTH_DOMAIN=foreverhome-local-only.firebaseapp.com VITE_FIREBASE_PROJECT_ID=foreverhome-local-only VITE_FIREBASE_APP_ID=1:123:web:local VITE_API_BASE_URL= VITE_ANALYTICS_ENDPOINT= VITE_ANALYTICS_WEBSITE_ID= pnpm build
SECURITY_BROWSER_PRODUCTION=1 DOTENV_CONFIG_PATH=/dev/null pnpm exec playwright test --config e2e/security.config.ts
```
Do not set an explicit HTTP API origin in a production build; the client correctly rejects that configuration. A later hosted release uses the separately recorded HTTPS Run origin. Review the private batch closeout for the exact audit delta and reachability notes; a nonzero production audit remains expected for conditional unused library features.
