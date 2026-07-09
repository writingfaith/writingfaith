/**
 * Seed the editable content documents into the Sanity dataset so the Studio
 * shows real, populated content the moment it is opened — and so the live
 * site reads its copy from Sanity rather than from code defaults.
 *
 * Run once (safe to re-run; it only fills gaps):
 *
 *   npx sanity exec scripts/seed-content.ts --with-user-token
 *
 * `--with-user-token` uses your signed-in Sanity account's credentials, so no
 * write token needs to live in the repo or your environment.
 *
 * Behaviour:
 *  - Site Settings: created if absent, and any stale empty draft is cleared so
 *    the editor opens on the populated, published document. Existing content
 *    is never overwritten.
 *  - About page: created only if no page with slug "about" already exists.
 */
import { getCliClient } from "sanity/cli";

const client = getCliClient();

let keyCounter = 0;
const key = () => `seed${(keyCounter++).toString(36)}`;

const siteSettings = {
  _id: "siteSettings",
  _type: "siteSettings",
  siteName: "WritingFaith",
  fontTheme: "newsreader",
  accentTheme: "bronze",
  tagline:
    "Thoughtful long-form writing on Christian faith, hope, and everyday life.",
  authorName: "Veruschka Pestano",
  postLabelSingular: "essay",
  postLabelPlural: "essays",
  aboutLabel: "About",
  searchLabel: "Search",
  heroEyebrow: "Essays on faith",
  heroHeading: "Quiet reflections on following Christ in an unquiet world.",
  heroIntro:
    "Long-form writing on Christian faith — scripture, prayer, doubt, and hope — by Veruschka Pestano. Free to read, with every new essay delivered by email to subscribers.",
  topicsHeading: "What you’ll find here",
  topics: [
    {
      _key: key(),
      _type: "topic",
      title: "Scripture, read closely",
      text: "Careful readings that sit with a passage long enough to hear it — taking the text seriously without flattening it into a slogan.",
    },
    {
      _key: key(),
      _type: "topic",
      title: "Honest questions",
      text: "Doubt is not the opposite of faith. This writing makes room for uncertainty, grief, and the questions most sermons skip.",
    },
    {
      _key: key(),
      _type: "topic",
      title: "Ordinary life",
      text: "Faith as it is actually lived — at kitchen tables and bus stops, where belief is tested and, sometimes quietly, renewed.",
    },
  ],
  scriptureQuote: "Be still, and know that I am God.",
  scriptureReference: "Psalm 46:10",
  writerBio:
    "Veruschka Pestano writes about the life of faith from the middle of it — not from above it. This writing is one reader’s slow walk through scripture, doubt, and grace, offered in the hope that it keeps you company on yours.",
  newsletterHeading: "Never miss a word",
  newsletterText:
    "Subscribe to be notified whenever a new essay is published — one considered email, nothing else. Free, no spam, and every email ends with a one-click unsubscribe.",
  archiveEyebrow: "The archive",
  archiveHeading: "Writing on scripture, doubt, hope, and grace.",
  footerBlurb:
    "Independent writing on Christian faith by Veruschka Pestano — scripture, doubt, hope, and grace, explored with honesty and care.",
};

/** A paragraph block for the About page's starting content. */
function paragraph(text: string) {
  return {
    _key: key(),
    _type: "block",
    style: "normal",
    markDefs: [],
    children: [{ _key: key(), _type: "span", marks: [], text }],
  };
}

function heading(text: string) {
  return {
    _key: key(),
    _type: "block",
    style: "h2",
    markDefs: [],
    children: [{ _key: key(), _type: "span", marks: [], text }],
  };
}

const aboutPage = {
  _type: "page",
  title: "About",
  slug: { _type: "slug", current: "about" },
  description:
    "About this site — why the writing exists and what it hopes to offer.",
  body: [
    paragraph(
      "This is the About page. Every word of it is yours to edit from the Studio — replace this text with whatever you would like readers to know.",
    ),
    heading("What to expect"),
    paragraph(
      "Describe the writing here: the subjects it returns to, the spirit it is offered in, and who it is for.",
    ),
    heading("How to follow"),
    paragraph(
      "The simplest way to keep up is the free newsletter — one email whenever something new is published. A full-content RSS feed is available too.",
    ),
  ],
};

async function run() {
  // 1. Site Settings — ensure the document exists, then fill every missing
  //    field. `setIfMissing` never overwrites a value you've already set, so
  //    re-running is safe and your own edits always win.
  await client.createIfNotExists(siteSettings);
  const { _id, _type, ...fields } = siteSettings;
  void _id;
  void _type;
  await client.patch("siteSettings").setIfMissing(fields).commit();
  console.log("✓ Site Settings ensured and every empty field populated.");

  // A stale draft would hide the published content in the editor; if one
  // exists, backfill its empty fields too so the editor opens fully populated.
  const draft = await client.getDocument("drafts.siteSettings");
  if (draft) {
    await client.patch("drafts.siteSettings").setIfMissing(fields).commit();
    console.log("✓ Backfilled the open Site Settings draft.");
  }

  // 2. About page — only if one doesn't already exist for slug "about".
  const aboutExists = await client.fetch(
    `count(*[_type == "page" && slug.current == "about"]) > 0`,
  );
  if (aboutExists) {
    console.log("• An About page already exists — leaving it as is.");
  } else {
    await client.create(aboutPage);
    console.log("✓ About page created (slug: about).");
  }

  console.log("\nDone. Open /studio to see and edit the content.");
}

run().catch((error) => {
  console.error("Seeding failed:", error);
  process.exit(1);
});
