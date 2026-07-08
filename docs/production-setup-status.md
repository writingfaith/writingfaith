# WritingFaith production setup status

Last updated: 2026-07-08

## Completed in this pass

- Repository architecture inspected: Next.js 16 App Router, Sanity content, Auth.js v5, Drizzle/Neon reader data, Resend email, Upstash rate limiting, Vercel deployment target.
- Drizzle CLI env loading fixed. `drizzle.config.ts` now loads Next env files before reading `DATABASE_URL`, so `.env.local` works with `npm run db:migrate`.
- Neon migration applied successfully. Confirmed tables in `public`: `user`, `account`, `session`, `verificationToken`, `newsletter_subscription`.
- Added `npm run typecheck` for repeatable TypeScript verification.
- Auth.js host trust made explicit for the Vercel deployment model and local production smoke tests.
- Draft-mode UI moved behind a Suspense boundary so the root layout keeps a cleaner static shell.
- Header auth island now uses `connection()` to mark the request-time boundary intentionally under Cache Components/PPR.
- Newsletter subscribe now checks that the Resend client is configured before mutating the database.
- `X-Powered-By` disabled in `next.config.ts`.
- Added a Node engine floor matching Next.js 16 (`>=20.9.0`) for Vercel/local compatibility.
- Updated Sanity/React patch versions and added dependency overrides where safe. `npm audit fix --force` was intentionally not used because npm would install breaking/downgraded packages.
- Added tracked env templates: `.env.example` and `.env.local.example` are now explicitly allowed by `.gitignore`.
- Moved reader-facing header/footer chrome into the `(site)` route group so `/studio` no longer inherits the public website shell after the next deploy.
- Linked the local repository to the Vercel project `writingfaiths-projects/writingfaith`.
- Added available Vercel env vars to Production, Preview, and Development: `NEXT_PUBLIC_SITE_URL`, public Sanity coordinates, `AUTH_SECRET`, `DATABASE_URL`, `EMAIL_FROM`, and `SANITY_REVALIDATE_SECRET`.

## Current local environment status

Set locally:

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_SITE_URL` - currently `http://localhost:3000`; set this to the final production origin in Vercel.
- `EMAIL_FROM`
- `SANITY_REVALIDATE_SECRET`

Empty locally:

- `RESEND_API_KEY` - blocks magic-link sign-in email and newsletter confirmation email.
- `SANITY_API_READ_TOKEN` - blocks draft preview / Presentation tool draft reads.

Missing or not listed locally:

- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `RESEND_AUDIENCE_ID` - optional, needed only to mirror confirmed subscribers into a Resend Audience for broadcasts.
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`

Public Sanity coordinates are safe to expose and have code defaults: project `m5flo8s9`, dataset `production`, API version `2026-07-01`.

Current Vercel project environment status:

- Project: `writingfaiths-projects/writingfaith`
- Present in Production, Preview, and Development: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION`, `AUTH_SECRET`, `DATABASE_URL`, `EMAIL_FROM`, `SANITY_REVALIDATE_SECRET`.
- Still missing in Vercel: `RESEND_API_KEY`, `SANITY_API_READ_TOKEN`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`.
- Optional still missing: `RESEND_AUDIENCE_ID`, `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`.
- A redeploy is required before the newly added Vercel env vars affect the live site.

## Verification results

Succeeded:

- `npm run db:migrate`
- database table verification query against Neon
- `npm run lint`
- `npm run typecheck`
- `npm run build`
- local production smoke test at mobile width for `/`, `/signin`, `/search`
- unauthenticated `/account` redirects to `/signin`
- local `/api/auth/session` returns `null` without Auth.js host errors
- local `/sitemap.xml` and `/robots.txt` return 200
- live `https://writingfaith.vercel.app/` returns 200 with security headers
- live `https://writingfaith-quf4.vercel.app/` returns `404 DEPLOYMENT_NOT_FOUND`
- live `/`, `/essays`, `/search`, and `/signin` render without browser console errors
- Sanity public dataset is reachable
- local production `/studio` returns 200 without the public header/footer after the route-layout fix

Note: `next build` prints a `DYNAMIC_SERVER_USAGE` digest for the streamed `AccountNav` auth boundary. `next build --debug-prerender` traces it to the intentional request-time header auth island. The build exits successfully and routes are emitted as Partial Prerendered where expected.

Known verification caveats:

- `npm audit --audit-level=moderate` still reports 13 moderate advisories in nested `sanity`/`next` dependency chains: `js-yaml` under `@vercel/frameworks`, `postcss` bundled by `next`, and `uuid` under `@sanity/preview-url-secret`. The only npm-proposed fix is `npm audit fix --force`, which would install breaking/downgraded package versions. Track upstream package releases and upgrade normally when fixed.
- Newsletter browser submission was not fully completed because the browser-control session timed out, but a database check confirmed the smoke email was not inserted while `RESEND_API_KEY` is absent. This confirms the no-email/no-mutation guard.

## Live deployment status

The provided URL is stale and does not resolve to an active Vercel deployment:

- `https://writingfaith-quf4.vercel.app/` returns `404 DEPLOYMENT_NOT_FOUND`.
- The same result appears for `/signin`, `/feed.xml`, `/sitemap.xml`, `/robots.txt`, and `/api/auth/session`.

The active Vercel project is:

- Team/account: `writingfaiths-projects`
- Project: `writingfaith`
- Canonical production domain: `https://writingfaith.vercel.app/`
- Current production deployment: `writingfaith-hy81v8n0u-writingfaiths-projects.vercel.app`
- Status: `Ready`
- Source: `main`, commit `919db9d`, "Complete Phase 6 art direction and design polish"

Current live blocker:

- `https://writingfaith.vercel.app/api/auth/session` still returns 500 on the current deployment because it was built before the Vercel env vars were added.
- `https://writingfaith.vercel.app/sitemap.xml` and `/robots.txt` currently contain `http://localhost:3000` URLs until the next deployment picks up `NEXT_PUBLIC_SITE_URL`.
- `https://writingfaith.vercel.app/studio` loads Sanity's registration screen: "Connect this studio to your project." The production host must be registered in Sanity before editors can use Studio there.

## Production readiness audit

Mobile responsiveness:

- Local production render checked at 390px width.
- Home, sign-in, and search forms had no horizontal overflow.
- Header navigation wraps cleanly.

Authentication:

- Auth.js route exists at `/api/auth/[...nextauth]`.
- Database adapter tables are migrated.
- Magic-link provider is configured in code but cannot send until `RESEND_API_KEY` is set.
- Google OAuth is optional and hidden until both Google env vars are set.
- Live Auth.js should be retested after redeploy now that `AUTH_SECRET` and `DATABASE_URL` are present in Vercel.

Newsletter:

- Public subscribe form is present.
- Double opt-in confirm/unsubscribe routes are implemented.
- Email sending is blocked until `RESEND_API_KEY` is set.
- Resend Audience sync is optional and disabled until `RESEND_AUDIENCE_ID` is set.
- The subscribe action now checks Resend configuration before inserting/updating `newsletter_subscription`.

Sanity:

- Published content reads use public project/dataset defaults.
- Public dataset query succeeds, but currently returns zero `article`, `author`, `category`, and `page` documents.
- Live `/studio` loads Sanity's registration screen and requires project admin action.
- Draft preview requires `SANITY_API_READ_TOKEN`.
- Instant publish revalidation requires `SANITY_REVALIDATE_SECRET` and a Sanity webhook.

Security:

- Security headers are configured: CSP, HSTS, nosniff, referrer policy, frame policy, permissions policy.
- `/studio` is intentionally excluded from the reader-facing CSP.
- Rate limiting is disabled until Upstash env vars are configured. This is acceptable for local development, not production.
- The live deployment exposes no `X-Powered-By` header.
- Legal pages still need qualified legal review before launch.

## Exact next steps

1. Vercel env vars:
   - Open `https://vercel.com/writingfaiths-projects/writingfaith/settings/environment-variables`.
   - Click **Add Environment Variable**.
   - Already added to Production, Preview, and Development:
     - `NEXT_PUBLIC_SITE_URL` = `https://writingfaith.vercel.app`
     - `NEXT_PUBLIC_SANITY_PROJECT_ID` = `m5flo8s9`
     - `NEXT_PUBLIC_SANITY_DATASET` = `production`
     - `NEXT_PUBLIC_SANITY_API_VERSION` = `2026-07-01`
     - `AUTH_SECRET`
     - `DATABASE_URL`
     - `EMAIL_FROM`
     - `SANITY_REVALIDATE_SECRET`
   - Still add these to `Production`, `Preview`, and `Development`:
     - `RESEND_API_KEY` = Resend production API key.
     - `SANITY_API_READ_TOKEN` = Sanity Viewer token.
     - `UPSTASH_REDIS_REST_URL` = Upstash Redis REST URL.
     - `UPSTASH_REDIS_REST_TOKEN` = Upstash Redis REST token.
   - Confirm `EMAIL_FROM` uses a verified production sender before launch. The current configured value may still be a development/testing sender.
   - Optional:
     - `RESEND_AUDIENCE_ID` = Resend Audience ID for broadcast syncing.
     - `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` = Google OAuth client credentials.
   - Redeploy the latest `main` deployment after adding env vars.

2. Resend:
   - Open Resend dashboard -> Domains.
   - Add and verify the sending domain.
   - Add the SPF/DKIM DNS records Resend gives you.
   - Create a production API key and use it for `RESEND_API_KEY`.
   - Do not use `WritingFaith <onboarding@resend.dev>` for launch; it is testing-only.

3. Sanity:
   - Open `https://sanity.io/manage`, project `m5flo8s9`, dataset `production`.
   - Register the Studio host:
     - If `https://writingfaith.vercel.app` is the production editor URL, open `https://writingfaith.vercel.app/studio` and click **Register this studio**.
     - If this is only a temporary Vercel URL, click **Add development host** instead and register the final custom domain later.
   - API -> CORS origins: add `https://writingfaith.vercel.app` with credentials enabled. Add the custom domain later when attached.
   - API -> Tokens: create a Viewer token and add it to Vercel as `SANITY_API_READ_TOKEN`.
   - API -> Webhooks -> Create webhook:
     - URL: `https://writingfaith.vercel.app/api/revalidate`
     - Method: `POST`
     - Trigger: Create, Update, Delete
     - Filter: `_type in ["article", "author", "category", "page"]`
     - Projection: `{_type, "slug": slug.current}`
     - Secret: the `SANITY_REVALIDATE_SECRET` value from Vercel.
   - Open `https://writingfaith.vercel.app/studio` after env vars are deployed and create the first author/page/article content.

4. Upstash:
   - Create a Redis database.
   - Copy the REST URL and REST token into Vercel.
   - After redeploy, confirm sign-in/newsletter attempts no longer log the local-development rate-limit warning.

5. Google OAuth, optional:
   - Google Cloud Console -> APIs & Services -> Credentials -> OAuth client.
   - Authorized redirect URI: `https://writingfaith.vercel.app/api/auth/callback/google`.
   - Add the custom-domain callback URI later if/when the domain changes.

6. After Vercel redeploy:
   - Confirm `https://writingfaith.vercel.app/api/auth/session` returns `200` and `null` when signed out.
   - Smoke-test magic-link sign-in.
   - Smoke-test newsletter subscribe, confirm, and unsubscribe.
   - Check `/studio`, `/sitemap.xml`, `/robots.txt`, `/feed.xml`.
   - Re-run local gates before any follow-up deploy: `npm run db:migrate`, `npm run lint`, `npm run typecheck`, `npm run build`.

## Deployment checklist

- Vercel project points at the `writing-faith` root.
- All required env vars are present in Vercel Production, Preview, and Development.
- Neon schema has been migrated. Current local migration check passed.
- Resend sending domain is verified.
- Upstash rate limiting is active in production.
- Sanity CORS and webhook are configured.
- `NEXT_PUBLIC_SITE_URL` matches the final public origin.
- Live deployment URL returns 200. Current canonical Vercel URL does; the old `writingfaith-quf4` URL does not.
- `/api/auth/session` returns 200 after Vercel env vars are deployed.
- Magic-link sign-in sends and completes.
- Newsletter subscribe email sends, confirm link subscribes, unsubscribe link unsubscribes.
- Lighthouse mobile pass on home and an essay.
- Search Console property created and sitemap submitted.
- Legal wording reviewed.
