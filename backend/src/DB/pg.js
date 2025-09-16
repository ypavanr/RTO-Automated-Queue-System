import pg from "pg";

let client;

function getClient() {
  if (client) return client;

  const { PG_USER, PG_HOST, PG_DATABASE, PG_PASSWORD, PG_PORT } = process.env;
  if (!PG_USER || !PG_HOST || !PG_DATABASE) {
    throw new Error("Database env vars missing: PG_USER, PG_HOST, PG_DATABASE are required");
  }
  if (PG_PASSWORD === undefined || PG_PASSWORD === null) {
    throw new Error("Database env var missing: PG_PASSWORD is required");
  }

  client = new pg.Client({
    user: String(PG_USER),
    host: String(PG_HOST),
    database: String(PG_DATABASE),
    password: String(PG_PASSWORD),
    port: PG_PORT ? Number(PG_PORT) : 5432,
  });
  return client;
}

const db = {
  connect: (...args) => getClient().connect(...args),
  query: (...args) => getClient().query(...args),
  end: (...args) => getClient().end(...args),
};

export default db