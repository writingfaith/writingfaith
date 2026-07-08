import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { parseBody } from "next-sanity/webhook";

/**
 * Sanity → Next.js publish webhook.
 *
 * Configure in sanity.io/manage with projection `{_type, "slug": slug.current}`
 * and the shared secret in SANITY_REVALIDATE_SECRET (docs/sanity-setup.md).
 * Signature verification is mandatory (ADR 0001 §Security).
 *
 * `{expire: 0}` expires tags immediately — the documented pattern for
 * webhook-driven revalidation — so published edits appear within seconds.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return Response.json(
      { error: "SANITY_REVALIDATE_SECRET is not configured" },
      { status: 500 },
    );
  }

  try {
    const { isValidSignature, body } = await parseBody<{
      _type: string;
      slug?: string;
    }>(req, secret);

    if (!isValidSignature) {
      return Response.json({ error: "Invalid signature" }, { status: 401 });
    }
    if (!body?._type) {
      return Response.json({ error: "Missing _type in body" }, { status: 400 });
    }

    const tags = new Set<string>([body._type]);
    if (body.slug) {
      tags.add(`${body._type}:${body.slug}`);
    }
    // Articles embed author and category data, so edits to those
    // documents must also refresh cached article output.
    if (body._type === "author" || body._type === "category") {
      tags.add("article");
    }

    for (const tag of tags) {
      revalidateTag(tag, { expire: 0 });
    }

    return Response.json({ revalidated: true, tags: [...tags] });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
