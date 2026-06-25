import bcrypt from "bcryptjs";
import { getSupabaseAdmin } from "../supabase";

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

  const supabase = getSupabaseAdmin();
  const passwordHash = await bcrypt.hash(password, 12);

  for (const email of DEFAULT_EXECUTOR_EMAILS) {
    const normalizedEmail = email.toLowerCase().trim();

    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existing) continue;

    await supabase.from("users").insert({
      email: normalizedEmail,
      password_hash: passwordHash,
      role: "executor",
    });
  }

  usersSeeded = true;
};
