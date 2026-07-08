import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

/**
 * Neon over HTTP: no connection pool to manage, right fit for serverless
 * (ADR 0001 §3). The placeholder URL keeps module evaluation safe when the
 * env var is absent (e.g. building before infrastructure is configured) —
 * actual queries fail loudly instead.
 */
const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://placeholder:placeholder@placeholder.invalid/placeholder";

export const db = drizzle(neon(connectionString), { schema });

export * as tables from "./schema";
