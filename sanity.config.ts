/**
 * Configuration for the Sanity Studio embedded at /studio.
 *
 * The Studio and the site share this repo so schemas, preview wiring and
 * deploys stay in lockstep (ADR 0001 §Review). If the Studio ever needs its
 * own release cadence, everything it needs lives in `sanity/` and this file.
 */
import { defineConfig } from "sanity";
import { presentationTool } from "sanity/presentation";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";

import { apiVersion, dataset, projectId, studioBasePath } from "./sanity/env";
import { resolve } from "./sanity/presentation";
import { schemaTypes } from "./sanity/schemas";
import { structure } from "./sanity/structure";

export default defineConfig({
  name: "writingfaith",
  title: "WritingFaith",
  basePath: studioBasePath,

  projectId,
  dataset,

  plugins: [
    structureTool({ structure, title: "Write" }),
    // Live preview of the real site, with draft mode + click-to-edit overlays.
    // `resolve` gives every document a "Used on…" banner that jumps straight
    // into the preview, and lets clicks on the preview open the right document.
    presentationTool({
      title: "Preview",
      resolve,
      previewUrl: {
        previewMode: { enable: "/api/draft-mode/enable" },
      },
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],

  schema: {
    types: schemaTypes,
    // The settings singleton is reached from the structure pane, never
    // created ad hoc from the "new document" menu.
    templates: (templates) =>
      templates.filter(({ schemaType }) => schemaType !== "siteSettings"),
  },

  document: {
    // The settings singleton must never be deleted, duplicated, or
    // unpublished from the Studio — only edited and published.
    actions: (actions, { schemaType }) =>
      schemaType === "siteSettings"
        ? actions.filter(({ action }) =>
            ["publish", "discardChanges", "restore"].includes(action ?? ""),
          )
        : actions,
  },
});
