import env from "dotenv";
env.config({ path: "../.env" });
import pg from "pg";
const db = new pg.Client({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password:process.env.PG_PASSWORD,
    port: process.env.PG_PORT,
  });
export default db