import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/Infrastructure/Database/Schemas",
  out: "./src/Infrastructure/Database/Drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
