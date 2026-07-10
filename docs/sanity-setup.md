# Sanity setup — manual steps

Phase 2 embedded Sanity Studio at `/studio` (project `m5flo8s9`, dataset
`production`). The code is complete; the following one-time steps must be done
by a project admin at [sanity.io/manage](https://sanity.io/manage).

## 1. Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

| Variable | Where to get it |
|---|---|
| `SANITY_API_READ_TOKEN` | sanity.io/manage → API → Tokens → **Add API token**, role **Viewer**. Needed for draft preview (presentation tool). |
| `SANITY_REVALIDATE_SECRET` | Generate any long random string (e.g. `openssl rand -hex 32`). Used to sign the publish webhook. |

On Vercel, add the same variables in the project's Environment Variables
settings (all environments).

## 2. CORS origins

sanity.io/manage → API → **CORS origins**. Add:

- `http://localhost:3000` (allow credentials) — local development
- the production URL once deployed (allow credentials)

Without this, the embedded Studio at `/studio` cannot authenticate.

## 3. Publish webhook (instant revalidation)

sanity.io/manage → API → **Webhooks** → Create:

- **URL:** `https://<production-domain>/api/revalidate`
- **Trigger on:** Create, Update, Delete
- **Filter:** `_type in ["article", "author", "category", "page"]`
- **Projection:** `{_type, "slug": slug.current}`
- **HTTP method:** POST
- **Secret:** the value of `SANITY_REVALIDATE_SECRET`

Published edits then appear on the site within seconds (`revalidateTag` with
immediate expiry). Note: webhooks can't reach localhost — during development,
content freshness comes from dev-mode rendering instead.

## 4. First content

Open `/studio`, sign in with the project's Sanity account, and create:

1. An **Author** document (optional — the site no longer renders bylines).
2. A first **Essay**.

Drafts can be previewed live via the Studio's **Presentation** tab
(requires `SANITY_API_READ_TOKEN`).

## Housekeeping

The standalone `../studio-writingfaith/` scaffold is superseded by the
embedded Studio and can be archived or deleted — schemas now live in
`sanity/schemas/` in this repo.
