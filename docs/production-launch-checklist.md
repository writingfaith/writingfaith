# WritingFaith — production launch checklist

Everything needed to take the site from this repository to a live, public
publication. Work top to bottom; each section is independent but the order
minimises rework. Companion docs: [sanity-setup.md](./sanity-setup.md),
[readers-setup.md](./readers-setup.md), ADR:
[0001-writingfaith-architecture.md](./adr/0001-writingfaith-architecture.md).

## 1. Accounts required

| Service | Purpose | Tier |
|---|---|---|
| Vercel | Hosting, image optimization, analytics | Hobby/free to start |
| Sanity (project `m5flo8s9`) | Content + embedded Studio | Free |
| Neon | Postgres (accounts, newsletter list) | Free |
| Resend | Sign-in links, confirmations, broadcasts | Free to start |
| Upstash | Redis for rate limiting | Free |
| Google Cloud (optional) | Google sign-in OAuth client | Free |
| Domain registrar | writingfaith.com (or chosen domain) | ~$10–15/yr |

## 2. Environment variables (Vercel → Settings → Environment Variables)

Copy from `.env.local.example`; set for Production and Preview:

- `NEXT_PUBLIC_SITE_URL` — `https://<domain>` (production value)
- `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`
- `SANITY_API_READ_TOKEN` (Viewer token), `SANITY_REVALIDATE_SECRET`
- `AUTH_SECRET` (`openssl rand -base64 32` — generate a fresh one for prod)
- `ADMIN_EMAILS` — owner/editor allowlist. Keep as
  `veruschkapestano@gmail.com` unless ownership changes.
- `DATABASE_URL` (Neon pooled connection string)
- `RESEND_API_KEY`, `EMAIL_FROM`, `RESEND_AUDIENCE_ID` (optional)
- `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` (optional)
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` (required in prod)

## 3. Deployment steps

1. Push the `main` branch to GitHub.
2. Vercel project `writingfaiths-projects/writingfaith` builds from `main`.
3. Confirm env vars (above), deploy.
4. Apply the database schema once: `DATABASE_URL=<prod url> npm run db:migrate`.
5. Smoke-test the deployment URL before pointing the domain at it
   (see §8 verification list).

## 4. Domain

1. Add the domain in Vercel → Domains; follow the DNS instructions.
2. Set `NEXT_PUBLIC_SITE_URL` to the final `https://` origin and redeploy
   (metadata, sitemap, RSS and JSON-LD all derive from it).
3. Confirm the apex/www redirect behaviour you want in Vercel.

## 5. Sanity

- CORS origins: add the production origin (with credentials) — plus
  `http://localhost:3000` for development. sanity.io/manage → API.
- Webhook: `https://<domain>/api/revalidate`, filter
  `_type in ["article","author","category","page"]`, projection
  `{_type, "slug": slug.current}`, secret = `SANITY_REVALIDATE_SECRET`.
- Create the Author document and first essay in `/studio`.
- `/studio` and Studio draft preview are gated by the site session and only
  load for `ADMIN_EMAILS`; Sanity project membership still controls Sanity's
  own document permissions after the owner gate passes.
- Optional: create a `page` document with slug `about` to take editorial
  ownership of the About page (a crafted default renders until then).

## 6. Resend

- Verify the sending domain (SPF + DKIM records at the registrar); set
  `EMAIL_FROM` to a matching address, e.g. `WritingFaith <hello@domain>`.
- Optional: create an Audience, set `RESEND_AUDIENCE_ID`; confirmed
  subscribers mirror into it for broadcasts. Include the site's
  `/newsletter/unsubscribe?token=…` link in broadcast footers.
- Update the placeholder contact address in
  `app/(site)/contact/page.tsx` once the mailbox exists.

## 7. Legal

- `privacy`, `terms`, `disclaimer` pages carry `LEGAL REVIEW REQUIRED`
  markers — have jurisdiction-specific wording (controller identity,
  governing law) confirmed by a qualified professional.

## 8. Pre-launch verification

- `npm run build` passes; `npx tsc --noEmit` and `npm run lint` clean.
- Manually walk: home → essay → category → search → subscribe (real email,
  confirm, unsubscribe) → sign in (magic link) → account → sign out.
- `/studio` loads on production; publish an edit and confirm it appears on
  the site within seconds (webhook working).
- `curl -I https://<domain>` shows the security headers (CSP, HSTS, etc.).
- `/sitemap.xml`, `/robots.txt`, `/feed.xml` respond correctly.
- Lighthouse (mobile) on home + one essay: aim ≥95 performance,
  100 accessibility/SEO/best-practices.
- Search Console: add the property, submit the sitemap.

## 9. Backups & exit paths

- **Neon**: enable the automated backups/PITR available on your plan; a
  monthly `pg_dump` kept off-platform is a cheap extra safety net.
- **Sanity**: monthly `npx sanity dataset export production` (full JSON,
  includes assets manifest) kept off-platform.
- **Code**: GitHub is the canonical copy once pushed.
- Subscriber list lives in Neon (not only Resend) by design.

## 10. Maintenance

- Enable Dependabot/Renovate (grouped minor updates) once on GitHub;
  the dependency count is deliberately small enough to review by hand.
- After dependency updates: `npm run build` + the §8 manual walk.
- Watch Vercel Analytics/logs occasionally; consider Sentry (free tier,
  per ADR §Additions) as a follow-up.
- Keep the ADR and docs current when decisions change.
