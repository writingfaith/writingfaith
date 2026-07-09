import { defineCliConfig } from "sanity/cli";

import { dataset, projectId } from "./sanity/env";

/**
 * CLI config for the embedded Studio. The Studio itself is configured in
 * sanity.config.ts; this file only exists so Sanity CLI commands (dataset
 * tooling, `sanity exec`) know which project and dataset to target.
 */
export default defineCliConfig({
  api: { projectId, dataset },
});
