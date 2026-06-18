import bcrypt from "bcryptjs";
import { ensureSchema, getUserByEmail, createUser } from "../src/lib/db";

const email = process.argv[2] || "executor@xrlab.local";
const password = process.argv[3] || "changeme123";

const seed = async () => {
  await ensureSchema();

  const existing = await getUserByEmail(email);
  if (existing) {
    console.log(`Пользователь ${email} уже существует`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await createUser(email, passwordHash);

  const isTurso = Boolean(process.env.TURSO_DATABASE_URL);
  console.log(`Создан исполнитель: ${email}`);
  console.log(`Пароль: ${password}`);
  console.log(
    isTurso
      ? "База: Turso (облако)"
      : "База: data/app.db (локальный файл)"
  );
};

seed().catch((error) => {
  console.error("Ошибка seed:", error);
  process.exit(1);
});
