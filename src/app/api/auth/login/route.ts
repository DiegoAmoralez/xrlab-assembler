import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getDbErrorMessage } from "@/lib/supabase";

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

    if (error instanceof Error) {
      if (error.message.includes("SESSION_SECRET")) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      if (error.message.includes("Supabase")) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    const message = getDbErrorMessage(error);
    const hint = message.includes("does not exist")
      ? "Выполните supabase/schema.sql в Supabase SQL Editor"
      : undefined;

    return NextResponse.json({ error: message, hint }, { status: 500 });
  }
};

export const DELETE = async () => {
  const session = await getSession();
  session.destroy();
  return NextResponse.json({ success: true });
};
