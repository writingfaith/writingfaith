import { loadEnvConfig } from "@next/env";
import { defineConfig } from "drizzle-kit";

loadEnvConfig(process.cwd());

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Only needed for `db:migrate`/`db:push`; `db:generate` works offline.
    url: process.env.DATABASE_URL ?? "",
  },
});
