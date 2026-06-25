import { getSupabaseAdmin, getSupabaseConfig, getDbErrorMessage } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const HealthPage = async () => {
  const { url, serviceKey } = getSupabaseConfig();

  if (!url || !serviceKey) {
    return (
      <main className="container-app py-12">
        <div className="card border-red-200 bg-red-50">
          <h1 className="mb-2 text-xl font-bold text-red-800">
            База не настроена
          </h1>
          <p className="text-red-700">
            Не заданы{" "}
            <code className="rounded bg-red-100 px-1">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
            и{" "}
            <code className="rounded bg-red-100 px-1">
              SUPABASE_SERVICE_ROLE_KEY
            </code>
          </p>
          <p className="mt-3 text-sm text-red-700">
            Добавьте их в Vercel → Settings → Environment Variables → Redeploy
          </p>
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
          </div>
        </main>
      );
    }

    return (
      <main className="container-app py-12">
        <div className="card border-green-200 bg-green-50">
          <h1 className="mb-2 text-xl font-bold text-green-800">Всё ок</h1>
          <p className="text-green-700">Supabase подключён, таблица tasks доступна.</p>
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
