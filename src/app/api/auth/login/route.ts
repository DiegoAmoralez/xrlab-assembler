import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/lib/db";
import { getSession } from "@/lib/auth";

export const runtime = "nodejs";

export const POST = async (request: NextRequest) => {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Введите email и пароль" },
        { status: 400 }
      );
    }

    const user = await getUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: "Неверный email или пароль" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json(
        { error: "Неверный email или пароль" },
        { status: 401 }
      );
    }

    const session = await getSession();
    session.userId = user.id;
    session.email = user.email;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({ success: true, email: user.email });
  } catch (error) {
    console.error("Login error:", error);
    const message =
      error instanceof Error &&
      error.message.includes("SESSION_SECRET")
        ? error.message
        : "Ошибка сервера";
    return NextResponse.json({ error: message }, { status: 500 });
  }
};

export const DELETE = async () => {
  const session = await getSession();
  session.destroy();
  return NextResponse.json({ success: true });
};
