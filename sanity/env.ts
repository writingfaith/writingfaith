/**
 * Sanity project coordinates.
 *
 * Project id and dataset are public by design (they appear in every API URL
 * the browser calls), so committed defaults are safe. Environment variables
 * still take precedence so preview deployments can point at another dataset.
 */
export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "m5flo8s9";

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

/** Pin the API version so query behavior never shifts under us. */
export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2026-07-01";

/** The route where the embedded Studio is mounted. */
export const studioBasePath = "/studio";
