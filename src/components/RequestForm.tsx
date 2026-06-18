"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  TASK_TYPES,
  PRIORITIES,
  COMPONENTS_STATUS,
  CreateTaskInput,
  TaskType,
  Priority,
  ComponentsStatus,
} from "@/lib/types";
import { PublicHeader } from "@/components/PublicHeader";

export const RequestForm = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const payload: CreateTaskInput = {
      requester_name: form.get("requester_name") as string,
      project_name: form.get("project_name") as string,
      requester_contact: form.get("requester_contact") as string,
      task_type: form.get("task_type") as TaskType,
      title: form.get("title") as string,
      description: (form.get("description") as string) || undefined,
      work_needed: (form.get("work_needed") as string) || undefined,
      desired_deadline: (form.get("desired_deadline") as string) || undefined,
      priority: (form.get("priority") as Priority) || "medium",
      components_status:
        (form.get("components_status") as ComponentsStatus) || undefined,
      components_location:
        (form.get("components_location") as string) || undefined,
      documentation_link:
        (form.get("documentation_link") as string) || undefined,
      requester_comment: (form.get("requester_comment") as string) || undefined,
    };

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Не удалось отправить заявку");
        return;
      }

      router.push(`/success?number=${encodeURIComponent(data.task_number)}`);
    } catch {
      setError("Ошибка сети. Попробуйте ещё раз.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PublicHeader />
      <main className="py-8 sm:py-12">
        <div className="container-app">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-text sm:text-4xl">
              Новая заявка
            </h1>
            <p className="text-text-muted">
              Опишите задачу — монтаж, пайку, сборку или доработку прототипа.
              Регистрация не нужна.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <section className="card space-y-4">
              <h2 className="text-lg font-semibold">Кто вы</h2>

              <div>
                <label htmlFor="requester_name" className="form-label">
                  Имя заявителя *
                </label>
                <input
                  id="requester_name"
                  name="requester_name"
                  type="text"
                  required
                  className="form-input"
                  placeholder="Иван Иванов"
                />
              </div>

              <div>
                <label htmlFor="project_name" className="form-label">
                  Команда / проект *
                </label>
                <input
                  id="project_name"
                  name="project_name"
                  type="text"
                  required
                  className="form-input"
                  placeholder="XRlab / Проект Alpha"
                />
              </div>

              <div>
                <label htmlFor="requester_contact" className="form-label">
                  Контакт: Telegram, email или телефон *
                </label>
                <input
                  id="requester_contact"
                  name="requester_contact"
                  type="text"
                  required
                  className="form-input"
                  placeholder="@username или +7..."
                />
              </div>
            </section>

            <section className="card space-y-4">
              <h2 className="text-lg font-semibold">О задаче</h2>

              <div>
                <label htmlFor="task_type" className="form-label">
                  Тип задачи *
                </label>
                <select
                  id="task_type"
                  name="task_type"
                  required
                  className="form-select"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Выберите тип
                  </option>
                  {TASK_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="title" className="form-label">
                  Название задачи *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  className="form-input"
                  placeholder="Собрать прототип датчика v2"
                />
              </div>

              <div>
                <label htmlFor="description" className="form-label">
                  Краткое описание
                </label>
                <textarea
                  id="description"
                  name="description"
                  className="form-textarea"
                  placeholder="Что это за задача и зачем она нужна"
                  rows={3}
                />
              </div>

              <div>
                <label htmlFor="work_needed" className="form-label">
                  Что нужно сделать?
                </label>
                <textarea
                  id="work_needed"
                  name="work_needed"
                  className="form-textarea"
                  placeholder="Установить компоненты, проверить питание, протестировать..."
                  rows={3}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="desired_deadline" className="form-label">
                    Когда желательно получить результат?
                  </label>
                  <input
                    id="desired_deadline"
                    name="desired_deadline"
                    type="date"
                    className="form-input"
                  />
                </div>

                <div>
                  <label htmlFor="priority" className="form-label">
                    Приоритет
                  </label>
                  <select
                    id="priority"
                    name="priority"
                    className="form-select"
                    defaultValue="medium"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <section className="card space-y-4">
              <h2 className="text-lg font-semibold">Комплектующие</h2>

              <div>
                <label htmlFor="components_status" className="form-label">
                  Есть ли все комплектующие?
                </label>
                <select
                  id="components_status"
                  name="components_status"
                  className="form-select"
                  defaultValue=""
                >
                  <option value="">Не указано</option>
                  {COMPONENTS_STATUS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="components_location" className="form-label">
                  Где лежат детали?
                </label>
                <input
                  id="components_location"
                  name="components_location"
                  type="text"
                  className="form-input"
                  placeholder="Стеллаж 3, полка B / у меня на столе"
                />
              </div>

              <div>
                <label htmlFor="documentation_link" className="form-label">
                  Ссылка на схему, BOM, фото или документацию
                </label>
                <input
                  id="documentation_link"
                  name="documentation_link"
                  type="url"
                  className="form-input"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label htmlFor="requester_comment" className="form-label">
                  Комментарий
                </label>
                <textarea
                  id="requester_comment"
                  name="requester_comment"
                  className="form-textarea"
                  placeholder="Всё, что важно знать исполнителю"
                  rows={3}
                />
              </div>
            </section>

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
              disabled={isSubmitting}
              className="btn-primary w-full sm:w-auto"
            >
              {isSubmitting ? "Отправляем..." : "Отправить заявку"}
            </button>
          </form>
        </div>
      </main>
    </>
  );
};
