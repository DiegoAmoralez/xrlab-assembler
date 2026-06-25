import { NextResponse } from "next/server";
import { getSupabaseAdmin, getSupabaseConfig, getDbErrorMessage } from "@/lib/supabase";

export const runtime = "nodejs";

export const GET = async () => {
  const { url, serviceKey } = getSupabaseConfig();

  if (!url || !serviceKey) {
    return NextResponse.json({
      ok: false,
      error: "Не заданы NEXT_PUBLIC_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY",
    });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("tasks").select("id").limit(1);

    if (error) {
      return NextResponse.json({
        ok: false,
        error: error.message,
        hint:
          error.message.includes("does not exist") ||
          error.code === "42P01"
            ? "Выполните supabase/schema.sql в Supabase SQL Editor"
            : undefined,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: getDbErrorMessage(error),
    });
  }
};
