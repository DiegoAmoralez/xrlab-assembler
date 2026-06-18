"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Task, TASK_STATUSES, PRIORITIES, TASK_TYPES } from "@/lib/types";
import { DashboardHeader } from "@/components/DashboardHeader";
import { TaskCard } from "@/components/TaskCard";

type TaskCounts = {
  new: number;
  in_progress: number;
  waiting_parts: number;
  done: number;
};

type DashboardClientProps = {
  email: string;
};

export const DashboardClient = ({ email }: DashboardClientProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [doneTasks, setDoneTasks] = useState<Task[]>([]);
  const [counts, setCounts] = useState<TaskCounts>({
    new: 0,
    in_progress: 0,
    waiting_parts: 0,
    done: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("new");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [deadlineFilter, setDeadlineFilter] = useState("");
  const [search, setSearch] = useState("");

  const buildParams = useCallback(
    (status?: string) => {
      const params = new URLSearchParams();
      const activeStatus = status ?? statusFilter;
      if (
        activeStatus &&
        activeStatus !== "done" &&
        activeStatus !== "all"
      ) {
        params.set("status", activeStatus);
      }
      if (priorityFilter) params.set("priority", priorityFilter);
      if (typeFilter) params.set("task_type", typeFilter);
      if (projectFilter) params.set("project", projectFilter);
      if (deadlineFilter) params.set("deadline", deadlineFilter);
      if (search) params.set("search", search);
      return params;
    },
    [
      statusFilter,
      priorityFilter,
      typeFilter,
      projectFilter,
      deadlineFilter,
      search,
    ]
  );

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);

    try {
      const [activeRes, doneRes] = await Promise.all([
        fetch(`/api/tasks?${buildParams().toString()}`),
        fetch(`/api/tasks?${buildParams("done").toString()}`),
      ]);

      if (activeRes.ok) {
        const data = await activeRes.json();
        setTasks(
          data.tasks.filter((task: Task) => task.status !== "done")
        );
        setCounts(data.counts);
      }

      if (doneRes.ok) {
        const data = await doneRes.json();
        setDoneTasks(data.tasks);
      }
    } finally {
      setIsLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTasks();
  };

  return (
    <>
      <DashboardHeader email={email} />
      <main className="py-6 sm:py-8">
        <div className="container-wide">
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { key: "new", label: "Новые", color: "text-status-new" },
              {
                key: "in_progress",
                label: "В работе",
                color: "text-status-progress",
              },
              {
                key: "waiting_parts",
                label: "Ждут детали",
                color: "text-status-waiting",
              },
              { key: "done", label: "Готово", color: "text-status-done", scrollToDone: true },
            ].map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  if ("scrollToDone" in item && item.scrollToDone) {
                    document
                      .getElementById("done-column")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                    return;
                  }
                  setStatusFilter(
                    statusFilter === item.key ? "new" : item.key
                  );
                }}
                className={`card text-left transition-transform duration-200 hover:-translate-y-0.5 ${
                  !("scrollToDone" in item && item.scrollToDone) &&
                  statusFilter === item.key
                    ? "ring-2 ring-accent"
                    : ""
                }`}
                aria-label={`Фильтр: ${item.label}`}
              >
                <p className={`text-2xl font-bold ${item.color}`}>
                  {counts[item.key as keyof TaskCounts]}
                </p>
                <p className="text-sm text-text-muted">{item.label}</p>
              </button>
            ))}
          </div>

          <div className="card mb-6 space-y-4">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по номеру, проекту или названию..."
                className="form-input flex-1"
                aria-label="Поиск задач"
              />
              <button type="submit" className="btn-secondary btn-sm">
                Найти
              </button>
            </form>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value || "new")}
                className="form-select"
                aria-label="Фильтр по статусу"
              >
                {TASK_STATUSES.filter((s) => s.value !== "done").map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
                <option value="all">Все активные</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="form-select"
                aria-label="Фильтр по приоритету"
              >
                <option value="">Все приоритеты</option>
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="form-select"
                aria-label="Фильтр по типу"
              >
                <option value="">Все типы</option>
                {TASK_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>

              <input
                type="text"
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                placeholder="Проект..."
                className="form-input"
                aria-label="Фильтр по проекту"
              />

              <input
                type="date"
                value={deadlineFilter}
                onChange={(e) => setDeadlineFilter(e.target.value)}
                className="form-input"
                aria-label="Дедлайн до"
              />
            </div>
          </div>

          {isLoading ? (
            <p className="py-12 text-center text-text-muted">Загрузка...</p>
          ) : tasks.length === 0 && doneTasks.length === 0 ? (
            <div className="card py-12 text-center">
              <p className="text-lg font-medium text-text">Задач пока нет</p>
              <p className="mt-1 text-text-muted">
                Новые заявки появятся здесь после отправки формы
              </p>
              <Link href="/" className="btn-secondary mt-4 inline-flex">
                Открыть форму заявки
              </Link>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_340px]">
              <section aria-label="Активные задачи">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-text-muted">
                    {statusFilter === "new"
                      ? "Новые задачи"
                      : statusFilter === "all"
                        ? "Все активные"
                        : TASK_STATUSES.find((s) => s.value === statusFilter)
                            ?.label ?? "Задачи"}
                  </h2>
                  <span className="text-sm text-text-muted">{tasks.length}</span>
                </div>

                {tasks.length === 0 ? (
                  <div className="card py-10 text-center">
                    <p className="text-text-muted">Нет задач по фильтру</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tasks.map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                )}
              </section>

              <section
                id="done-column"
                aria-label="Готовые задачи"
                className="lg:sticky lg:top-6 lg:self-start"
              >
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-status-done">
                    Готово
                  </h2>
                  <span className="text-sm text-text-muted">
                    {doneTasks.length}
                  </span>
                </div>

                <div className="rounded-2xl border border-status-done/20 bg-status-done-bg/40 p-3">
                  {doneTasks.length === 0 ? (
                    <p className="py-8 text-center text-sm text-text-muted">
                      Пока нет готовых
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {doneTasks.map((task) => (
                        <TaskCard key={task.id} task={task} compact />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
    </>
  );
};
