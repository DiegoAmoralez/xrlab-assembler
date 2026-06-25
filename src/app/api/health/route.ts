import { NextResponse } from "next/server";
import {
  getSupabaseAdmin,
  getSupabaseConfig,
  getDbErrorMessage,
  getEnvDiagnostics,
} from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const GET = async () => {
  const config = getSupabaseConfig();
  const env = getEnvDiagnostics();

  if (!config.url || !config.serviceKey) {
    return NextResponse.json({
      ok: false,
      error: "Не найден Supabase URL или API key",
      env,
    });
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("tasks").select("id").limit(1);

    if (error) {
      return NextResponse.json({
        ok: false,
        error: error.message,
        code: error.code,
        env,
        hint:
          error.message.includes("does not exist") || error.code === "42P01"
            ? "Выполните supabase/schema.sql в Supabase SQL Editor"
            : error.code === "42501"
              ? "Нет прав — выполните schema.sql (DISABLE ROW LEVEL SECURITY)"
              : undefined,
      });
    }

    return NextResponse.json({ ok: true, env });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: getDbErrorMessage(error),
      env,
    });
  }
};
