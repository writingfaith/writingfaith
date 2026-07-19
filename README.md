# WritingFaith

A quiet, long-form Christian publication built with Next.js 16, Sanity, Neon,
Auth.js, Resend, and Upstash.

## Local development

```bash
npm install
npm run db:migrate
npm run dev
```

Copy the required environment variables from Vercel into `.env.local`. See
[`docs/readers-setup.md`](docs/readers-setup.md) for account/newsletter setup
and [`docs/sanity-setup.md`](docs/sanity-setup.md) for editorial configuration.

## Verification

```bash
npm run lint
npm run typecheck
npm run build
npm audit --audit-level=moderate
```

## Production architecture

- Sanity stores publication content and triggers signed revalidation webhooks.
- Neon stores Auth.js sessions, reader accounts, newsletter consent, and essay
  notification reservations.
- Resend delivers magic links, confirmations, and idempotent new-essay
  broadcasts to the configured Segment.
- Vercel hosts the site and runs the scheduled notification safety sweep.
- Upstash rate-limits public sign-in and subscribe actions.

Production: [writingfaith.com.au](https://www.writingfaith.com.au)
