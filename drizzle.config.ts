import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Only needed for `db:migrate`/`db:push`; `db:generate` works offline.
    url: process.env.DATABASE_URL ?? "",
  },
});
