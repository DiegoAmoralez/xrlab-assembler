import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export const GET = async () => {
  const session = await getSession();
  return NextResponse.json({
    isLoggedIn: session.isLoggedIn ?? false,
    email: session.email ?? null,
  });
};
