/**
 * Find — and optionally remove — the owner's personal name from the Sanity
 * dataset. Code defaults cannot do this: `lib/site-settings.ts` only falls
 * back to a default when a stored field is *empty*, so any name still saved
 * in Sanity keeps rendering on the live site.
 *
 * Report what would change (safe, read-only):
 *
 *   npx sanity exec scripts/scrub-author-name.ts --with-user-token
 *
 * Apply the changes:
 *
 *   npx sanity exec scripts/scrub-author-name.ts --with-user-token -- --apply
 *
 * What --apply does:
 *  - Author documents named after the owner are renamed to the site name, and
 *    a bio mentioning the owner is cleared. Renaming (rather than deleting)
 *    keeps every essay's `author` reference intact — Sanity refuses to delete
 *    a document that other documents still point at.
 *  - The retired `authorName` field is unset from Site Settings (published and
 *    draft), since the schema no longer defines it.
 *
 * Anything else containing the name — an essay body, the About page — is
 * reported but never touched: that is your prose, and only you should rewrite it.
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient();

/** The strings we treat as the owner's identity. */
const NEEDLES = [/veruschka/i, /pestano/i];
const REPLACEMENT_NAME = "WritingFaith";

const apply = process.argv.includes("--apply");

function mentionsOwner(value: unknown): boolean {
  return NEEDLES.some((needle) => needle.test(JSON.stringify(value ?? "")));
}

/** Every string field on a document that mentions the owner, for reporting. */
function offendingFields(doc: Record<string, unknown>): string[] {
  return Object.entries(doc)
    .filter(([, v]) => typeof v === "string" && mentionsOwner(v))
    .map(([k, v]) => `${k} → ${(v as string).slice(0, 80)}`);
}

async function run() {
  const docs = await client.fetch<Record<string, unknown>[]>("*[]");
  const hits = docs.filter(mentionsOwner);

  if (hits.length === 0) {
    console.log("✓ No document in the dataset mentions the owner's name.");
    return;
  }

  console.log(
    `Found ${hits.length} document(s) mentioning the owner's name:\n`,
  );

  const handled: string[] = [];
  const manual: string[] = [];

  for (const doc of hits) {
    const id = doc._id as string;
    const type = doc._type as string;
    console.log(`  ${type}  ${id}`);
    for (const field of offendingFields(doc)) console.log(`      ${field}`);

    if (type === "author") {
      handled.push(id);
      if (apply) {
        const patch = client.patch(id).set({ name: REPLACEMENT_NAME });
        if (mentionsOwner(doc.bio)) patch.unset(["bio"]);
        await patch.commit();
        console.log(`      ✎ renamed to "${REPLACEMENT_NAME}"`);
      }
    } else if (type !== "siteSettings") {
      manual.push(`${type} ${id}`);
    }
  }

  // The `authorName` field was removed from the schema; clear any stored value
  // so it cannot resurface via a future query or an exported dataset.
  for (const id of ["siteSettings", "drafts.siteSettings"]) {
    const doc = await client.getDocument(id);
    if (doc && "authorName" in doc) {
      console.log(`\n  siteSettings  ${id} — retired field \`authorName\``);
      if (apply) {
        await client.patch(id).unset(["authorName"]).commit();
        console.log("      ✎ unset");
      }
    }
  }

  if (manual.length > 0) {
    console.log(
      `\n⚠ Left untouched — these hold your own prose, edit them in the Studio:`,
    );
    manual.forEach((entry) => console.log(`   • ${entry}`));
  }

  console.log(
    apply
      ? "\nDone. Publish nothing — patches apply immediately. Purge the cache by republishing any document, or wait for the webhook."
      : "\nDry run. Nothing was changed. Re-run with `-- --apply` to write.",
  );
}

run().catch((error) => {
  console.error("Scrub failed:", error);
  process.exit(1);
});
