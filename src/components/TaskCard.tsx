import Link from "next/link";
import { Task } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import { getTaskTypeLabel } from "@/lib/types";

type TaskCardProps = {
  task: Task;
  compact?: boolean;
};

export const TaskCard = ({ task, compact = false }: TaskCardProps) => {
  const isUrgent = task.priority === "urgent";

  return (
    <Link
      href={`/tasks/${task.id}`}
      className={`card block transition-transform duration-200 ease-out hover:-translate-y-0.5 ${
        isUrgent ? "task-card-urgent" : ""
      } ${compact ? "p-3.5" : ""}`}
      tabIndex={0}
      aria-label={`Задача ${task.task_number}: ${task.title}`}
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono-app text-sm font-bold text-accent">
            {task.task_number}
          </span>
          {isUrgent && (
            <span className="priority-urgent" aria-label="Срочная задача">
              ⚡ Срочно
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge status={task.status} />
          <PriorityBadge priority={task.priority} />
        </div>
      </div>

      <h3
        className={`mb-2 font-semibold text-text ${
          compact ? "text-base line-clamp-2" : "text-lg"
        }`}
      >
        {task.title}
      </h3>

      {!compact && task.description && (
        <p className="mb-3 line-clamp-2 text-sm text-text-muted">
          {task.description}
        </p>
      )}

      <div
        className={`grid gap-x-4 gap-y-2 text-sm ${
          compact ? "grid-cols-1" : "grid-cols-2 sm:grid-cols-3"
        }`}
      >
        <div>
          <span className="text-text-muted">Проект</span>
          <p className="font-medium">{task.project_name}</p>
        </div>
        {!compact && (
          <>
            <div>
              <span className="text-text-muted">Заявитель</span>
              <p className="font-medium">{task.requester_name}</p>
            </div>
            <div>
              <span className="text-text-muted">Тип</span>
              <p className="font-medium">{getTaskTypeLabel(task.task_type)}</p>
            </div>
          </>
        )}
        <div>
          <span className="text-text-muted">
            {compact ? "Готово" : "Дедлайн"}
          </span>
          <p className="font-medium">
            {formatDate(
              compact ? task.completed_at ?? task.updated_at : task.desired_deadline
            )}
          </p>
        </div>
        {!compact && (
          <div>
            <span className="text-text-muted">Создана</span>
            <p className="font-medium">{formatDate(task.created_at)}</p>
          </div>
        )}
      </div>
    </Link>
  );
};
