# ADR 0001 — WritingFaith Platform Architecture

- **Status:** **Accepted — architecture frozen** (after independent review, see §Review below)
- **Date:** 2026-07-07
- **Deciders:** Site owner, Claude (engineering)

## Context

WritingFaith is a long-lived, production-quality publishing platform for a single
Christian writer, deployed to Vercel. The constitution demands: longevity,
reading-first design, effortless publishing for a non-technical author, free reader
accounts, newsletter support, WCAG AA accessibility, excellent Core Web Vitals,
low operational cost, and headroom for future growth (multiple authors, podcasts,
donations, premium memberships) without rewrites.

The repository is a fresh Next.js **16.2.10** app (App Router, React 19.2,
Tailwind CSS v4, TypeScript). Next 16 introduces the **Cache Components** model
(`cacheComponents: true` with the `use cache` directive and `cacheLife`), which
supersedes the older ISR/route-segment-config mental model. All caching decisions
below are made against this model, per the bundled docs in
`node_modules/next/dist/docs/`.

## Decision

### 1. Framework: keep Next.js 16 App Router on Vercel

No reason to fight the platform. Server Components + Cache Components give us a
statically-cached, CDN-served reading experience with near-zero client
JavaScript on article pages, while still allowing dynamic islands (auth state,
comments later) via Suspense streaming. Vercel deployment, image optimization
(`next/image`), font optimization (`next/font`), and OG-image generation
(`ImageResponse`) are first-class.

**Caching strategy:** enable `cacheComponents: true`. Article pages and index
pages are `'use cache'` with a generous `cacheLife`, invalidated by CMS webhooks
(`revalidateTag`) so published edits appear within seconds. Personalized
fragments (signed-in header state) stream inside `<Suspense>`. This yields
static-page performance with live-content freshness.

### 2. Content: Sanity (hosted CMS) — not markdown, not a self-hosted CMS

The author is not an engineer, so the editorial experience is the deciding
criterion. Options evaluated:

| Option | Author UX | Ops cost | Longevity | Verdict |
|---|---|---|---|---|
| Markdown/MDX in git | Poor (git, code editor) | zero | high | Rejected — violates author-experience mandate |
| Keystatic / git-based CMS | Fair | zero | medium | Rejected — git conflicts, weak media handling |
| Payload (self-hosted) | Good | DB + upkeep on us | medium | Rejected — we become the CMS operators |
| WordPress headless | Good | hosting + security upkeep | medium | Rejected — operational burden, security surface |
| **Sanity** | **Excellent** (hosted Studio, real-time, drafts, scheduled publishing, visual editing/live preview) | **Free tier fits for years** | high (structured content, full export, open-source Studio) | **Chosen** |

Sanity specifics:
- **Portable Text** for body content — structured, not HTML blobs, so future
  renderers (RSS, email, apps) reuse the same content. Custom blocks for
  scripture quotations (with reference metadata for beautiful typographic
  treatment), pull quotes, and images with required alt text (accessibility
  enforced at the schema level).
- **Studio** embedded at `/studio` in this same repo (single deploy, author logs
  into one URL) with live preview of the actual site.
- **Webhooks → `revalidateTag`** for instant publish.
- Schema designed day one with `author` as a reference (multi-author-ready) and
  document types kept open for future `podcast`, `book`, `event` types.
- Lock-in risk is acceptable: content is fully exportable as JSON, Studio is
  open-source, and Portable Text is an open spec.

### 3. Reader accounts: Auth.js (next-auth v5) + Neon Postgres + Drizzle ORM

Free accounts today; premium membership must be possible later without rewrite.

- **Auth.js** — mature, open-source, no per-user pricing ever, magic-link email
  sign-in (passwordless — right for a non-technical audience and removes
  password-breach liability) plus Google OAuth.
- **Neon Postgres** (serverless, generous free tier, Vercel-native integration)
  holds users, sessions, newsletter subscription state, and — later —
  membership/entitlement tables. A real relational store is the correct
  foundation for future memberships, reading plans, and community features.
- **Drizzle ORM** — lightweight, SQL-first, typed migrations, no runtime bloat.

Rejected: Clerk/Auth0 (per-MAU pricing conflicts with low-cost longevity;
vendor dependency for the most sensitive data we hold), Supabase Auth (fine,
but couples auth to a second platform when Neon+Auth.js is thinner).

### 4. Email & newsletter: Resend

One vendor for both transactional email (magic links) and newsletter broadcasts
(Resend Broadcasts + Audiences). React Email templates keep newsletter design in
the same design system as the site. Double opt-in, one-click unsubscribe, and
List-Unsubscribe headers are mandatory. Subscription state mirrors into our
Postgres so we own the list (export path if we ever leave Resend).

### 5. Design system: Tailwind v4 + handcrafted tokens, no UI kit

- No component library (no shadcn, no MUI) — the constitution forbids generic
  UI, and a reading site needs perhaps a dozen bespoke components.
- Design tokens as CSS custom properties in `@theme`: a warm paper-like light
  palette, a true dark theme, a serif text face for reading (self-hosted via
  `next/font`, e.g. Source Serif 4 or Newsreader) paired with a quiet
  sans/small-caps for UI, fluid type scale (`clamp()`), measure capped at
  ~68ch, generous leading.
- Motion: subtle, CSS-first (View Transitions API where supported), always
  behind `prefers-reduced-motion`.
- WCAG AA enforced: semantic HTML, focus-visible styles, contrast-checked
  tokens, skip links, `eslint-plugin-jsx-a11y` in CI.

### 6. SEO & syndication

Per-article metadata from CMS fields, dynamic OG images via `ImageResponse`
(typographic, on-brand), JSON-LD (`Article`, `Person`, `WebSite`), `sitemap.ts`,
`robots.ts`, canonical URLs, and full-content **RSS/Atom feed** rendered from
Portable Text (long-form readers expect it).

### 7. Legal & production pages

Privacy policy, terms, cookie/consent posture (aim: no tracking cookies at all —
use Vercel Analytics, cookieless), accessibility statement, contact page.
Jurisdiction-specific wording will be marked `<!-- LEGAL REVIEW REQUIRED -->`.

### 8. Security

Auth.js CSRF protections; strict Content-Security-Policy per the Next 16 CSP
guide; all secrets in Vercel env vars; rate limiting on auth/newsletter
endpoints (Upstash Ratelimit, free tier); no admin surface of our own — Sanity
handles editorial auth. Dependency count deliberately minimal.

## Risks

1. **Next 16 Cache Components is new** — mitigated by following the bundled docs
   (not memory) and keeping caching usage simple (page-level `use cache` +
   tag revalidation).
2. **Sanity free-tier limits** (API requests) — content is cached at the edge;
   the site reads Sanity only on revalidation, so usage stays tiny.
3. **Vendor spread** (Sanity, Neon, Resend, Vercel) — each chosen with an
   explicit export path; all have free tiers so cost stays ~$0 until scale.
4. **Auth adds complexity before it adds value** — accounts ship behind an
   unobtrusive UI; the reading experience never depends on them.

## Implementation plan (phased)

1. **Foundation** — config (`cacheComponents`), design tokens, typography,
   base layout, home page shell.
2. **Content** — Sanity project + schemas (article, author, page, category),
   embedded Studio, Portable Text renderer, article + index pages, webhook
   revalidation, live preview.
3. **Discovery** — metadata, OG images, JSON-LD, sitemap, RSS, 404/error pages.
4. **Readers** — Neon + Drizzle, Auth.js magic-link + Google, account page,
   newsletter subscribe (Resend, double opt-in).
5. **Polish & legal** — legal pages, accessibility audit, Lighthouse/CWV pass,
   reduced-motion audit, production checklist from the Next 16 docs.

Each phase lands independently deployable; the site is publishable after
phase 3 even if accounts slip.

---

## Review — independent principal-engineer pass (2026-07-07)

Every major choice was re-challenged against the strongest realistic
alternative. Outcomes: **no reversals**, four **additions** (search, images,
testing, observability were under-specified), and one decision re-examined in
depth (Studio hosting).

### Re-evaluated, unchanged

- **CMS — Sanity** vs Contentful / Storyblok / Payload 3 (now Next-native).
  Payload 3 embeds in Next.js and is the strongest challenger, but it makes us
  the database/media/upgrade operators for the editorial system, and its admin
  UX still trails Sanity Studio for a non-technical writer (drafts, real-time,
  scheduled publishing, presence). Contentful/Storyblok lose on cost ceilings
  and export ergonomics. Sanity wins on the deciding criterion: author
  experience at ~$0 with a full-export exit path.
- **Studio hosting — embedded at `/studio`**, reconsidered seriously against
  Sanity-hosted (`*.sanity.studio`) and a separate deploy. Embedded wins for
  this project: one URL and one login surface for the author, Studio and site
  schemas/preview config share one repo and version together, and the route is
  code-split so reader pages ship none of it. Costs acknowledged: Studio
  dependency upgrades ride site deploys (acceptable at solo scale) and a
  broken deploy takes both down (mitigated by Vercel instant rollback). If
  multiple editors or a separate release cadence arrive, extracting Studio to
  its own deploy is a mechanical move — the config is already isolated in
  `sanity/`.
- **Auth — Auth.js v5** vs Better Auth and Clerk. Better Auth is the credible
  modern challenger (excellent DX, active development); Auth.js wins on
  maturity, audit history, and ecosystem for the narrow feature set we need
  (magic link + Google). Clerk still rejected on per-MAU pricing and custody
  of the most sensitive data. Auth is also deliberately isolated behind one
  module boundary (`lib/auth`) so a future swap touches one directory.
- **Database — Neon** vs Supabase / Turso / PlanetScale. Real Postgres,
  serverless pricing, Vercel-native, `pg_dump` exit path. Supabase would
  couple auth+DB to one vendor; Turso (SQLite) complicates future relational
  features (memberships, entitlements).
- **ORM — Drizzle** vs Prisma. Prisma has closed the gap (client engine,
  TypedSQL) but Drizzle remains thinner at runtime, SQL-transparent, and
  edge-friendly. Migrations are plain SQL — the ultimate exit path.
- **Email — Resend** vs Buttondown / Postmark+Mailchimp. One vendor for
  transactional + broadcasts, React Email templates share the design system.
  Mitigation for lock-in: subscriber list lives in our Postgres; Resend is a
  delivery mechanism, not the system of record.
- **Styling — Tailwind v4 + bespoke tokens**, no component library. Confirmed;
  vanilla CSS was the only serious alternative and loses on maintenance
  discipline over years. All theme values are standard CSS custom properties —
  portable by construction.
- **Deployment — Vercel**, confirmed. Lock-in surface is `next/image`,
  ImageResponse and analytics — all replaceable; Next self-hosting is a
  documented fallback (docs: `self-hosting.md`).
- **Caching — Cache Components**, verified against the Next 16.2 docs (not
  legacy patterns): `cacheComponents: true` (stable in 16, subsumes PPR/ISR
  flags), `use cache` + `cacheLife` + `cacheTag` for content,
  `revalidateTag` from the Sanity webhook, Suspense for dynamic islands. No
  route-segment `revalidate` configs, no `unstable_cache`, no legacy ISR.
- **Security** — unchanged (CSP per Next 16 guide, Auth.js CSRF, Upstash rate
  limiting, secrets in env, minimal dependencies), plus: Sanity webhook
  signature verification, and no service-role keys in the browser bundle ever.

### Additions (previously under-specified)

- **Search:** phase-appropriate. At launch, a server route running a GROQ
  full-text query against Sanity (cached, rate-limited) — zero new vendors,
  fine for hundreds of essays. If the corpus or requirements grow: Pagefind
  (static, free, private) before any hosted search vendor. Decision point
  recorded, no premature infrastructure.
- **Images:** all editorial images live in Sanity's asset pipeline (CDN,
  focal-point crops, LQIP metadata) rendered through `next/image` with a
  custom Sanity loader — one optimization pipeline, no double-processing.
  Alt text required at the schema level.
- **Analytics:** Vercel Analytics + Speed Insights — cookieless, no consent
  banner needed, which is itself a design feature for a site meant to feel
  calm and trustworthy.
- **Testing:** Vitest + React Testing Library for units/components; Playwright
  for the critical reader journeys (home → essay → subscribe) including
  `@axe-core/playwright` accessibility assertions; run in GitHub Actions on
  every PR. No coverage theatre — tests concentrate on rendering Portable
  Text correctly, auth flows, and a11y regressions.
- **Observability:** Vercel structured logs for request-level visibility plus
  Sentry (free tier) for error tracking on server and client, wired through
  `instrumentation.ts` per the Next 16 guide. Alerting: Sentry email on new
  issues — proportionate to a solo-operated site.

### Future-features audit

Multiple authors (author is already a reference type), books / podcasts /
videos / downloadable resources / events (new Sanity document types + routes;
no schema migration of existing content), donations (isolated route + Stripe
later; no coupling to auth), premium memberships (entitlement tables in
Postgres, gating via server components — the reason a real relational DB was
chosen). Nothing in the current design blocks any of these; none are built now.

### Hidden risks & mitigations (beyond §Risks)

1. **Portable Text rendering drift** (site vs email vs RSS) — one shared
   renderer module with per-target serializers, tested.
2. **Solo-maintainer bus factor** — boring, documented technology everywhere;
   this ADR and per-directory READMEs kept current.
3. **Dependency rot** — Renovate/Dependabot with grouped minor updates; the
   dependency count is deliberately small enough to review by hand.
4. **Free-tier policy changes** (Neon/Sanity/Resend) — each vendor has a
   tested export path (SQL dump, JSON export, list mirrored in our DB); cost
   exposure is migration effort, not data loss.

**Verdict: the architecture is frozen.** Implementation begins with Phase 1.
