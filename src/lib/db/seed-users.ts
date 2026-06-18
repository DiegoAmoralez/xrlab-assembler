import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { getClient } from "./client";

export const DEFAULT_EXECUTOR_EMAILS = [
  "max.malukalo@gmail.com",
  "al.vasilyeve@atomgroup.io",
] as const;

let usersSeeded = false;

export const ensureDefaultUsers = async (): Promise<void> => {
  if (usersSeeded) return;

  const password = process.env.EXECUTOR_DEFAULT_PASSWORD;
  if (!password) {
    usersSeeded = true;
    return;
  }

  const db = getClient();
  const passwordHash = await bcrypt.hash(password, 12);

  for (const email of DEFAULT_EXECUTOR_EMAILS) {
    const normalizedEmail = email.toLowerCase().trim();
    const existing = await db.execute({
      sql: "SELECT id FROM users WHERE email = ?",
      args: [normalizedEmail],
    });

    if (existing.rows.length > 0) continue;

    const id = randomUUID();
    await db.execute({
      sql: "INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, 'executor')",
      args: [id, normalizedEmail, passwordHash],
    });
  }

  usersSeeded = true;
};
