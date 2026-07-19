# WritingFaith production setup status

Last updated: 2026-07-19

## Completed

- Vercel project linked: `writingfaiths-projects/writingfaith`.
- Canonical production URL: `https://www.writingfaith.com.au`.
- Sanity project `m5flo8s9` configured for the production origin.
- Sanity production CORS origin is present for `https://writingfaith.vercel.app`.
- Sanity revalidation webhook is enabled for create/update/delete on `article`, `author`, `category`, and `page`.
- Neon `DATABASE_URL` is configured in Vercel and migrations have been applied.
- Resend API key is configured in Vercel.
- Resend sending domain `writingfaith.com.au` is verified in Tokyo and
  `EMAIL_FROM` uses `Writing Faith <letters@writingfaith.com.au>`.
- Resend's General Segment contains all 5 active subscribers; all 5 Postgres
  subscriptions are linked to reader accounts and marked synchronized.
- Upstash Redis database `writingfaith` is configured in Vercel for REST-based rate limiting.
- Required Vercel env var names are present in Production, Preview, and Development:
  - `DATABASE_URL`
  - `RESEND_API_KEY`
  - `AUTH_SECRET`
  - `NEXT_PUBLIC_SITE_URL`
  - `SANITY_API_READ_TOKEN`
  - `SANITY_REVALIDATE_SECRET`
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`
  - `EMAIL_FROM`
- Production was redeployed after the env vars were added.
- Public health endpoint added at `/api/health`.
- Dependency overrides were refreshed so the current install audits cleanly.
- Studio and draft-preview editing are restricted to
  `veruschkapestano@gmail.com` by default. `ADMIN_EMAILS` can override the
  allowlist if ownership ever needs to change.

## Verification Results

Local checks:

- `npm audit --audit-level=moderate` passes with `found 0 vulnerabilities`.
- `npm run lint` passes.
- `npm run typecheck` passes.
- `npm run build` passes.

Live checks after redeploy:

- `/` returns 200.
- `/essays` returns 200.
- `/feed` returns 200.
- `/feed.xml` returns 200.
- `/studio` returns 200.
- `/api/health` returns 200.
- Unauthenticated `/studio` renders the owner sign-in gate, not the Sanity
  editor.
- Unauthenticated `/api/draft-mode/enable` returns 401.
- Reader magic-link mail arrives from the verified site domain.
- Signed-in subscribers see their account state instead of the subscribe form.
- Account unsubscribe and resubscribe both synchronize with Resend.

## Production Readiness Notes

- Publishing essays through Sanity Studio is ready from the application/configuration side, and the embedded Studio exposes Essays, Pages, Categories, Authors, rich body content, scripture quotations, pull quotes, and accessible images.
- Subscriber collection uses double opt-in for the public form, verified-email
  account consent for signed-in readers, Neon storage, Resend Segment delivery,
  and Upstash rate limiting.
- `RESEND_AUDIENCE_ID` must contain the configured Resend Segment id for essay
  broadcasts and contact synchronization.
- `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are optional. Google OAuth stays hidden until both are configured.
- Privacy, Terms, and Disclaimer pages still contain legal-review markers and should be reviewed by a qualified person before a public launch using a custom domain.
