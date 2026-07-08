# Reader accounts & newsletter — manual steps

Phase 4 added reader accounts (Auth.js v5: magic-link email + optional
Google) and double-opt-in newsletter subscriptions. Postgres is the system
of record for the subscriber list; Resend delivers the email.

## 1. Neon Postgres

1. Create a project at [neon.tech](https://neon.tech) (free tier).
2. Copy the **pooled** connection string into `DATABASE_URL`.
3. Apply the schema: `npm run db:migrate`
   (migrations live in `drizzle/`; regenerate after schema changes with
   `npm run db:generate`).

## 2. Auth.js

- `AUTH_SECRET` — generate with `openssl rand -base64 32`.
- Google (optional): create an OAuth client at
  console.cloud.google.com → Credentials, authorized redirect URI
  `https://<domain>/api/auth/callback/google` (and the localhost variant for
  dev). Set `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`. The Google button only
  appears when both are set.

## 3. Resend

1. Create an API key at [resend.com](https://resend.com) → `RESEND_API_KEY`.
2. Verify the sending domain, then set `EMAIL_FROM`
   (e.g. `WritingFaith <hello@writingfaith.com>`). Until a domain is
   verified, the `onboarding@resend.dev` fallback works for testing only.
3. Optional: create an **Audience** and set `RESEND_AUDIENCE_ID` — confirmed
   subscribers are mirrored there so broadcasts can be sent from Resend's
   UI. Resend adds List-Unsubscribe headers and its own unsubscribe handling
   to broadcasts; our `/newsletter/unsubscribe?token=…` link should also be
   included in every broadcast footer so Postgres stays authoritative.

## 4. Upstash rate limiting

Create a Redis database at [upstash.com](https://upstash.com) (free tier)
and set `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`. Sign-in and
subscribe endpoints are limited to 5 attempts/hour per IP and per email.
Without the env vars, limiting is skipped (dev convenience) — configure it
in production.

## 5. Vercel

Add every variable above to the Vercel project (all environments), plus the
Phase 2/3 ones (`SANITY_*`, `NEXT_PUBLIC_SITE_URL`).

## Flows implemented

- **Sign in** `/signin` → magic link (24 h, single-use) → `/account`.
- **Newsletter (public)**: home-page form → pending row + confirmation email
  → `/newsletter/confirm?token` → subscribed (double opt-in, RFC-friendly).
- **Newsletter (signed in)**: one-click subscribe/unsubscribe on `/account`
  (address already verified by sign-in).
- **Unsubscribe**: `/newsletter/unsubscribe?token` — one click, no login.
