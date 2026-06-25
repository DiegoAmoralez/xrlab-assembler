import { createClient, SupabaseClient } from "@supabase/supabase-js";

let adminClient: SupabaseClient | null = null;

const firstEnv = (...keys: string[]): string | undefined => {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
};

export const getEnvDiagnostics = () => ({
  NEXT_PUBLIC_SUPABASE_URL: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL),
  SUPABASE_URL: Boolean(process.env.SUPABASE_URL),
  SUPABASE_SERVICE_ROLE_KEY: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
  SUPABASE_SECRET_KEY: Boolean(process.env.SUPABASE_SECRET_KEY),
  SUPABASE_ANON_KEY: Boolean(process.env.SUPABASE_ANON_KEY),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ),
  SUPABASE_PUBLISHABLE_KEY: Boolean(process.env.SUPABASE_PUBLISHABLE_KEY),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ),
  SESSION_SECRET: Boolean(process.env.SESSION_SECRET),
  EXECUTOR_DEFAULT_PASSWORD: Boolean(process.env.EXECUTOR_DEFAULT_PASSWORD),
});

export const getSupabaseConfig = () => {
  const url = firstEnv(
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_URL"
  );

  // Vercel integration may sync service_role, secret, or only anon/publishable keys
  const serviceKey = firstEnv(
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_SERVICE_KEY",
    "SUPABASE_SECRET_KEY",
    "SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"
  );

  return { url, serviceKey };
};

export const getSupabaseAdmin = (): SupabaseClient => {
  if (adminClient) return adminClient;

  const { url, serviceKey } = getSupabaseConfig();

  if (!url || !serviceKey) {
    const diag = getEnvDiagnostics();
    throw new Error(
      `Supabase: не найден URL или ключ. Диагностика: ${JSON.stringify(diag)}`
    );
  }

  adminClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return adminClient;
};

export const getDbErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;

  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }

  return "Неизвестная ошибка базы данных";
};
