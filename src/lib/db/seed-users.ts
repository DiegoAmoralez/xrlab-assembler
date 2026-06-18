import bcrypt from "bcryptjs";
import { createUser, getUserByEmail } from "./queries";

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

  const passwordHash = await bcrypt.hash(password, 12);

  for (const email of DEFAULT_EXECUTOR_EMAILS) {
    const existing = await getUserByEmail(email);
    if (!existing) {
      await createUser(email, passwordHash);
    }
  }

  usersSeeded = true;
};
