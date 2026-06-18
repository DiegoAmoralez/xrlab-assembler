import { getIronSession, SessionOptions } from "iron-session";
import { cookies } from "next/headers";

export type SessionData = {
  userId?: string;
  email?: string;
  isLoggedIn: boolean;
};

export const getSessionOptions = (): SessionOptions => {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error(
      "SESSION_SECRET не задан. Скопируйте .env.example в .env.local и укажите строку ≥ 32 символов."
    );
  }

  return {
    password: secret,
    cookieName: "xrlab-assembler-session",
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    },
  };
};

export const getSession = async () => {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, getSessionOptions());
};

export const requireAuth = async () => {
  const session = await getSession();
  if (!session.isLoggedIn || !session.userId) {
    return null;
  }
  return session;
};
