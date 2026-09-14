import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../../../Shared/Env";

const pool = new Pool({
  connectionString: env.DATABASE_URL,
});

export const db = drizzle(pool);

export type Db = typeof db;
