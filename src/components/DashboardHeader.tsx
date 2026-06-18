"use client";

import { useRouter } from "next/navigation";

type DashboardHeaderProps = {
  email: string;
};

export const DashboardHeader = ({ email }: DashboardHeaderProps) => {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/login", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="border-b border-border bg-surface-elevated">
      <div className="container-wide flex items-center justify-between py-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text">
            Панель исполнителя
          </h1>
          <p className="text-sm text-text-muted">{email}</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="btn-ghost btn-sm"
          aria-label="Выйти из системы"
        >
          Выйти
        </button>
      </div>
    </header>
  );
};
