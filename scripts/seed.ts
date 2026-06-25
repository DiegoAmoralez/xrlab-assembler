import bcrypt from "bcryptjs";
import { ensureDefaultUsers, DEFAULT_EXECUTOR_EMAILS } from "../src/lib/db";

const password =
  process.argv[2] || process.env.EXECUTOR_DEFAULT_PASSWORD || "qweasdzxc123";

const seed = async () => {
  await ensureDefaultUsers();
  console.log("Исполнители в Supabase:");
  for (const email of DEFAULT_EXECUTOR_EMAILS) {
    console.log(`  - ${email}`);
  }
  console.log(`Пароль: ${password}`);
};

seed().catch((error) => {
  console.error("Ошибка seed:", error);
  process.exit(1);
});
