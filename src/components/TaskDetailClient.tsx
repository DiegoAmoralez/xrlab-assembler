"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Task,
  TaskComment,
  TASK_STATUSES,
  PRIORITIES,
  UpdateTaskInput,
} from "@/lib/types";
import {
  getTaskTypeLabel,
  getComponentsStatusLabel,
} from "@/lib/types";
import { formatDate, formatDateTime } from "@/lib/utils";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";

type TaskDetailClientProps = {
  taskId: string;
};

export const TaskDetailClient = ({ taskId }: TaskDetailClientProps) => {
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState<UpdateTaskInput>({});

  const fetchTask = useCallback(async () => {
    const res = await fetch(`/api/tasks/${taskId}`);
    if (!res.ok) {
      router.push("/dashboard");
      return;
    }
    const data = await res.json();
    setTask(data.task);
    setComments(data.comments);
    setForm({
      status: data.task.status,
      priority: data.task.priority,
      internal_notes: data.task.internal_notes ?? "",
      used_components: data.task.used_components ?? "",
      missing_components: data.task.missing_components ?? "",
      purchase_needed: data.task.purchase_needed ?? "",
      result_note: data.task.result_note ?? "",
      completed_at: data.task.completed_at ?? "",
    });
    setIsLoading(false);
  }, [taskId, router]);

  useEffect(() => {
    fetchTask();
  }, [fetchTask]);

  const handleUpdate = async (updates: UpdateTaskInput) => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        setTask(updated);
        setForm({
          status: updated.status,
          priority: updated.priority,
          internal_notes: updated.internal_notes ?? "",
          used_components: updated.used_components ?? "",
          missing_components: updated.missing_components ?? "",
          purchase_needed: updated.purchase_needed ?? "",
          result_note: updated.result_note ?? "",
          completed_at: updated.completed_at ?? "",
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveForm = async () => {
    await handleUpdate(form);
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    const res = await fetch(`/api/tasks/${taskId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ comment_text: commentText }),
    });
    if (res.ok) {
      const newComment = await res.json();
      setComments((prev) => [...prev, newComment]);
      setCommentText("");
    }
  };

  const handleTakeToWork = () => handleUpdate({ status: "in_progress" });
  const handleMarkDone = () =>
    handleUpdate({ status: "done", completed_at: new Date().toISOString() });

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading || !task) {
    return (
      <div className="container-wide py-12 text-center text-text-muted">
        Загрузка...
      </div>
    );
  }

  return (
    <main className="py-6 sm:py-8">
      <div className="container-wide">
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="text-sm font-medium text-text-muted transition-colors hover:text-accent"
          >
            ← Все задачи
          </Link>
        </div>

        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="font-mono-app text-lg font-bold text-accent">
                {task.task_number}
              </span>
              <StatusBadge status={task.status} />
              <PriorityBadge priority={task.priority} />
            </div>
            <h1 className="text-2xl font-bold text-text sm:text-3xl">
              {task.title}
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="btn-secondary btn-sm"
              aria-label="Скопировать ссылку на заявку"
            >
              {copied ? "Скопировано!" : "Скопировать ссылку"}
            </button>
            {task.status !== "in_progress" && task.status !== "done" && (
              <button
                type="button"
                onClick={handleTakeToWork}
                className="btn-primary btn-sm"
              >
                Взять в работу
              </button>
            )}
            {task.status !== "done" && (
              <button
                type="button"
                onClick={handleMarkDone}
                className="btn-success btn-sm"
              >
                Отметить как готово
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="card space-y-4">
              <h2 className="text-lg font-semibold">Информация из заявки</h2>
              <dl className="grid gap-4 sm:grid-cols-2">
                <InfoItem label="Заявитель" value={task.requester_name} />
                <InfoItem label="Контакт" value={task.requester_contact} />
                <InfoItem label="Проект" value={task.project_name} />
                <InfoItem
                  label="Тип задачи"
                  value={getTaskTypeLabel(task.task_type)}
                />
                <InfoItem
                  label="Дедлайн"
                  value={formatDate(task.desired_deadline)}
                />
                <InfoItem
                  label="Создана"
                  value={formatDate(task.created_at)}
                />
                {task.components_status && (
                  <InfoItem
                    label="Комплектующие"
                    value={getComponentsStatusLabel(task.components_status)}
                  />
                )}
                {task.components_location && (
                  <InfoItem
                    label="Где лежат детали"
                    value={task.components_location}
                  />
                )}
              </dl>

              {task.description && (
                <div>
                  <p className="mb-1 text-sm text-text-muted">Описание</p>
                  <p className="whitespace-pre-wrap">{task.description}</p>
                </div>
              )}

              {task.work_needed && (
                <div>
                  <p className="mb-1 text-sm text-text-muted">
                    Что нужно сделать
                  </p>
                  <p className="whitespace-pre-wrap">{task.work_needed}</p>
                </div>
              )}

              {task.documentation_link && (
                <div>
                  <p className="mb-1 text-sm text-text-muted">Документация</p>
                  <a
                    href={task.documentation_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent underline-offset-2 hover:underline"
                  >
                    {task.documentation_link}
                  </a>
                </div>
              )}

              {task.requester_comment && (
                <div>
                  <p className="mb-1 text-sm text-text-muted">
                    Комментарий заявителя
                  </p>
                  <p className="whitespace-pre-wrap">{task.requester_comment}</p>
                </div>
              )}
            </section>

            <section className="card space-y-4">
              <h2 className="text-lg font-semibold">Комментарии</h2>
              <p className="text-sm text-text-muted">
                Внутренние заметки — видны только исполнителю
              </p>

              {comments.length === 0 ? (
                <p className="text-sm text-text-muted">Комментариев пока нет</p>
              ) : (
                <ul className="space-y-3">
                  {comments.map((c) => (
                    <li
                      key={c.id}
                      className="rounded-xl bg-surface px-4 py-3"
                    >
                      <p className="whitespace-pre-wrap text-sm">
                        {c.comment_text}
                      </p>
                      <p className="mt-1 text-xs text-text-muted">
                        {formatDateTime(c.created_at)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex gap-2">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="form-textarea flex-1"
                  placeholder="Добавить комментарий..."
                  rows={2}
                  aria-label="Новый комментарий"
                />
                <button
                  type="button"
                  onClick={handleAddComment}
                  className="btn-secondary btn-sm self-end"
                  disabled={!commentText.trim()}
                >
                  Добавить
                </button>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="card space-y-4">
              <h2 className="text-lg font-semibold">Управление</h2>

              <div>
                <label htmlFor="status" className="form-label">
                  Статус
                </label>
                <select
                  id="status"
                  value={form.status ?? task.status}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      status: e.target.value as Task["status"],
                    }))
                  }
                  className="form-select"
                >
                  {TASK_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="form-label">
                  Приоритет
                </label>
                <select
                  id="priority"
                  value={form.priority ?? task.priority}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      priority: e.target.value as Task["priority"],
                    }))
                  }
                  className="form-select"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="completed_at" className="form-label">
                  Дата выполнения
                </label>
                <input
                  id="completed_at"
                  type="datetime-local"
                  value={
                    form.completed_at
                      ? new Date(form.completed_at).toISOString().slice(0, 16)
                      : ""
                  }
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      completed_at: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : "",
                    }))
                  }
                  className="form-input"
                />
              </div>

              <div>
                <label htmlFor="result_note" className="form-label">
                  Результат работы
                </label>
                <textarea
                  id="result_note"
                  value={form.result_note ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, result_note: e.target.value }))
                  }
                  className="form-textarea"
                  rows={3}
                  placeholder="Что сделано, что проверено..."
                />
              </div>

              <div>
                <label htmlFor="internal_notes" className="form-label">
                  Внутренняя заметка
                </label>
                <textarea
                  id="internal_notes"
                  value={form.internal_notes ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, internal_notes: e.target.value }))
                  }
                  className="form-textarea"
                  rows={2}
                />
              </div>

              <button
                type="button"
                onClick={handleSaveForm}
                disabled={isSaving}
                className="btn-primary w-full"
              >
                {isSaving ? "Сохраняем..." : "Сохранить изменения"}
              </button>
            </section>

            <section className="card space-y-4">
              <h2 className="text-lg font-semibold">Комплектующие</h2>

              <div>
                <label htmlFor="used_components" className="form-label">
                  Что использовали
                </label>
                <textarea
                  id="used_components"
                  value={form.used_components ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, used_components: e.target.value }))
                  }
                  className="form-textarea"
                  rows={2}
                />
              </div>

              <div>
                <label htmlFor="missing_components" className="form-label">
                  Чего не хватило
                </label>
                <textarea
                  id="missing_components"
                  value={form.missing_components ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      missing_components: e.target.value,
                    }))
                  }
                  className="form-textarea"
                  rows={2}
                />
              </div>

              <div>
                <label htmlFor="purchase_needed" className="form-label">
                  Что нужно докупить
                </label>
                <textarea
                  id="purchase_needed"
                  value={form.purchase_needed ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, purchase_needed: e.target.value }))
                  }
                  className="form-textarea"
                  rows={2}
                />
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
};

const InfoItem = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <div>
    <dt className="text-sm text-text-muted">{label}</dt>
    <dd className="font-medium">{value}</dd>
  </div>
);
