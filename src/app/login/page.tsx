"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Ошибка входа");
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("Ошибка сети");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border bg-surface-elevated">
        <div className="container-app py-4">
          <Link
            href="/"
            className="text-sm font-medium text-text-muted transition-colors hover:text-accent"
          >
            ← К форме заявки
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center py-12">
        <div className="container-app w-full max-w-md">
          <div className="card">
            <h1 className="mb-1 text-2xl font-bold text-text">Вход</h1>
            <p className="mb-6 text-sm text-text-muted">
              Только для исполнителей
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="form-input"
                  placeholder="executor@xrlab.local"
                  autoComplete="email"
                />
              </div>

              <div>
                <label htmlFor="password" className="form-label">
                  Пароль
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="form-input"
                  autoComplete="current-password"
                />
              </div>

              {error && (
                <div
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full"
              >
                {isLoading ? "Входим..." : "Войти"}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
