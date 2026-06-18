import bcrypt from "bcryptjs";
import {
  ensureSchema,
  getUserByEmail,
  createUser,
  DEFAULT_EXECUTOR_EMAILS,
} from "../src/lib/db";

const password =
  process.argv[2] || process.env.EXECUTOR_DEFAULT_PASSWORD || "qweasdzxc123";

const seed = async () => {
  await ensureSchema();

  const passwordHash = await bcrypt.hash(password, 12);

  for (const email of DEFAULT_EXECUTOR_EMAILS) {
    const existing = await getUserByEmail(email);
    if (existing) {
      console.log(`Уже есть: ${email}`);
      continue;
    }

    await createUser(email, passwordHash);
    console.log(`Создан: ${email}`);
  }

  const isTurso = Boolean(process.env.TURSO_DATABASE_URL);
  console.log(`Пароль: ${password}`);
  console.log(isTurso ? "База: Turso" : "База: data/app.db");
};

seed().catch((error) => {
  console.error("Ошибка seed:", error);
  process.exit(1);
});
