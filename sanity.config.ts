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
import { schemaTypes } from "./sanity/schemas";
import { structure } from "./sanity/structure";

export default defineConfig({
  name: "writingfaith",
  title: "WritingFaith",
  basePath: studioBasePath,

  projectId,
  dataset,

  plugins: [
    structureTool({ structure }),
    // Live preview of the real site, with draft mode + click-to-edit overlays.
    presentationTool({
      previewUrl: {
        previewMode: { enable: "/api/draft-mode/enable" },
      },
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],

  schema: {
    types: schemaTypes,
  },
});
