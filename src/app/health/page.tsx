import {
  getSupabaseAdmin,
  getSupabaseConfig,
  getDbErrorMessage,
  getEnvDiagnostics,
} from "@/lib/supabase";

export const dynamic = "force-dynamic";

const EnvRow = ({ name, ok }: { name: string; ok: boolean }) => (
  <div className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0">
    <code className="text-text-muted">{name}</code>
    <span className={ok ? "text-status-done" : "text-text-muted"}>
      {ok ? "✓ есть" : "— нет"}
    </span>
  </div>
);

const HealthPage = async () => {
  const env = getEnvDiagnostics();
  const config = getSupabaseConfig();

  if (!config.url || !config.serviceKey) {
    return (
      <main className="container-app py-12">
        <div className="card border-red-200 bg-red-50">
          <h1 className="mb-2 text-xl font-bold text-red-800">
            Ключи не найдены
          </h1>
          <p className="mb-4 text-red-700">
            Vercel должен добавить переменные автоматически. Если их нет —
            сделайте Redeploy после подключения Supabase.
          </p>
          <div className="rounded-xl bg-white p-4">
            {Object.entries(env).map(([key, ok]) => (
              <EnvRow key={key} name={key} ok={ok} />
            ))}
          </div>
        </div>
      </main>
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("tasks").select("id").limit(1);

    if (error) {
      const needsSchema =
        error.message.includes("does not exist") || error.code === "42P01";

      return (
        <main className="container-app py-12">
          <div className="card border-red-200 bg-red-50">
            <h1 className="mb-2 text-xl font-bold text-red-800">Ошибка БД</h1>
            <p className="text-red-700">{error.message}</p>
            {needsSchema && (
              <p className="mt-3 text-sm text-red-700">
                Выполните <code>supabase/schema.sql</code> в Supabase SQL Editor
              </p>
            )}
            {error.code === "42501" && (
              <p className="mt-3 text-sm text-red-700">
                Нет прав доступа — перезапустите schema.sql (отключает RLS)
              </p>
            )}
          </div>
        </main>
      );
    }

    return (
      <main className="container-app py-12">
        <div className="card border-green-200 bg-green-50">
          <h1 className="mb-2 text-xl font-bold text-green-800">Всё ок</h1>
          <p className="text-green-700">
            Supabase подключён, таблица tasks доступна.
          </p>
        </div>
        <div className="card mt-4">
          <h2 className="mb-3 font-semibold">Переменные окружения</h2>
          {Object.entries(env).map(([key, ok]) => (
            <EnvRow key={key} name={key} ok={ok} />
          ))}
        </div>
      </main>
    );
  } catch (error) {
    return (
      <main className="container-app py-12">
        <div className="card border-red-200 bg-red-50">
          <h1 className="mb-2 text-xl font-bold text-red-800">Ошибка</h1>
          <p className="text-red-700">{getDbErrorMessage(error)}</p>
        </div>
      </main>
    );
  }
};

export default HealthPage;
