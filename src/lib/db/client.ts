import { createClient, Client } from "@libsql/client";
import fs from "fs";
import path from "path";
import { SCHEMA_SQL } from "./schema";
import { ensureDefaultUsers } from "./seed-users";

let client: Client | null = null;
let schemaReady = false;

export const getClient = (): Client => {
  if (client) return client;

  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN;

  if (tursoUrl) {
    client = createClient({
      url: tursoUrl,
      authToken: tursoToken,
    });
    return client;
  }

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  client = createClient({
    url: `file:${path.join(dataDir, "app.db")}`,
  });

  return client;
};

export const ensureSchema = async (): Promise<void> => {
  if (schemaReady) return;
  const db = getClient();
  await db.executeMultiple(SCHEMA_SQL);
  await ensureDefaultUsers();
  schemaReady = true;
};

export const toNumber = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string") return Number(value);
  return 0;
};
