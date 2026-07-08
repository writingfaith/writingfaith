# WritingFaith production setup status

Last updated: 2026-07-08

## Completed

- Vercel project linked: `writingfaiths-projects/writingfaith`.
- Canonical production URL: `https://writingfaith.vercel.app`.
- Sanity project `m5flo8s9` configured for the production origin.
- Sanity production CORS origin is present for `https://writingfaith.vercel.app`.
- Sanity revalidation webhook is enabled for create/update/delete on `article`, `author`, `category`, and `page`.
- Neon `DATABASE_URL` is configured in Vercel and migrations have been applied.
- Resend API key is configured in Vercel.
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
- `/api/health` should return 200 after the next deployment that includes the route added in this update.

## Remaining Production Blocker

Resend has no verified sending domain yet. Until a domain is added in Resend and its DNS records verify, production newsletter delivery is not fully ready.

Required manual DNS step:

1. Open Resend -> Domains.
2. Add a domain that is owned and controlled for WritingFaith.
3. Add the DNS records Resend provides.
4. Wait for Resend to mark the domain verified.
5. Set `EMAIL_FROM` to a sender address on that verified domain.
6. Redeploy Vercel.

## Production Readiness Notes

- Publishing essays through Sanity Studio is ready from the application/configuration side.
- Subscriber collection is implemented with double opt-in, Neon storage, Resend email, and Upstash rate limiting, but production email delivery remains blocked by the missing verified Resend domain.
- `RESEND_AUDIENCE_ID` is optional. Without it, confirmed subscribers remain in Neon, but they are not mirrored into a Resend Audience for broadcast management.
- `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET` are optional. Google OAuth stays hidden until both are configured.
- Privacy, Terms, and Disclaimer pages still contain legal-review markers and should be reviewed by a qualified person before a public launch using a custom domain.
