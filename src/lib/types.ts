export const TASK_TYPES = [
  { value: "pcb_assembly", label: "Монтаж платы" },
  { value: "soldering", label: "Пайка компонентов" },
  { value: "prototype_assembly", label: "Сборка прототипа" },
  { value: "prototype_modification", label: "Доработка прототипа" },
  { value: "repair", label: "Ремонт / диагностика" },
  { value: "other", label: "Другое" },
] as const;

export const PRIORITIES = [
  { value: "low", label: "Низкий" },
  { value: "medium", label: "Средний" },
  { value: "high", label: "Высокий" },
  { value: "urgent", label: "Срочно" },
] as const;

export const COMPONENTS_STATUS = [
  { value: "all", label: "Да, все есть" },
  { value: "partial", label: "Частично" },
  { value: "none", label: "Нет / нужно уточнить" },
] as const;

export const TASK_STATUSES = [
  { value: "new", label: "Новая", color: "neutral" },
  { value: "in_progress", label: "В работе", color: "blue" },
  { value: "waiting_parts", label: "Ожидает комплектующие", color: "orange" },
  { value: "needs_clarification", label: "Нужно уточнение", color: "yellow" },
  { value: "done", label: "Готово", color: "green" },
  { value: "cancelled", label: "Отменена", color: "gray" },
] as const;

export type TaskType = (typeof TASK_TYPES)[number]["value"];
export type Priority = (typeof PRIORITIES)[number]["value"];
export type ComponentsStatus = (typeof COMPONENTS_STATUS)[number]["value"];
export type TaskStatus = (typeof TASK_STATUSES)[number]["value"];

export type Task = {
  id: string;
  task_number: string;
  requester_name: string;
  requester_contact: string;
  project_name: string;
  task_type: TaskType;
  title: string;
  description: string | null;
  work_needed: string | null;
  desired_deadline: string | null;
  priority: Priority;
  components_status: ComponentsStatus | null;
  components_location: string | null;
  documentation_link: string | null;
  requester_comment: string | null;
  status: TaskStatus;
  internal_notes: string | null;
  used_components: string | null;
  missing_components: string | null;
  purchase_needed: string | null;
  result_note: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type TaskComment = {
  id: string;
  task_id: string;
  comment_text: string;
  created_at: string;
};

export type User = {
  id: string;
  email: string;
  role: string;
};

export type CreateTaskInput = {
  requester_name: string;
  requester_contact: string;
  project_name: string;
  task_type: TaskType;
  title: string;
  description?: string;
  work_needed?: string;
  desired_deadline?: string;
  priority: Priority;
  components_status?: ComponentsStatus;
  components_location?: string;
  documentation_link?: string;
  requester_comment?: string;
};

export type UpdateTaskInput = Partial<
  Pick<
    Task,
    | "status"
    | "priority"
    | "internal_notes"
    | "used_components"
    | "missing_components"
    | "purchase_needed"
    | "result_note"
    | "completed_at"
  >
>;

export const getTaskTypeLabel = (value: string): string =>
  TASK_TYPES.find((t) => t.value === value)?.label ?? value;

export const getPriorityLabel = (value: string): string =>
  PRIORITIES.find((p) => p.value === value)?.label ?? value;

export const getStatusLabel = (value: string): string =>
  TASK_STATUSES.find((s) => s.value === value)?.label ?? value;

export const getComponentsStatusLabel = (value: string): string =>
  COMPONENTS_STATUS.find((c) => c.value === value)?.label ?? value;

export const PRIORITY_ORDER: Record<Priority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};
