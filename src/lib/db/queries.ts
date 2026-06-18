import { randomUUID } from "crypto";
import {
  CreateTaskInput,
  Task,
  TaskComment,
  UpdateTaskInput,
  PRIORITY_ORDER,
} from "../types";
import { ensureSchema, getClient, toNumber } from "./client";

const rowToTask = (row: Record<string, unknown>): Task =>
  row as unknown as Task;

const rowToComment = (row: Record<string, unknown>): TaskComment =>
  row as unknown as TaskComment;

export const generateTaskNumber = async (): Promise<string> => {
  await ensureSchema();
  const db = getClient();
  const result = await db.execute("SELECT COUNT(*) as count FROM tasks");
  const nextNum = toNumber(result.rows[0]?.count) + 1;
  return `PCB-${String(nextNum).padStart(4, "0")}`;
};

export const createTask = async (
  input: CreateTaskInput
): Promise<{ id: string; task_number: string }> => {
  await ensureSchema();
  const db = getClient();
  const id = randomUUID();
  const taskNumber = await generateTaskNumber();

  await db.execute({
    sql: `INSERT INTO tasks (
      id, task_number, requester_name, requester_contact, project_name,
      task_type, title, description, work_needed, desired_deadline,
      priority, components_status, components_location, documentation_link,
      requester_comment, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'new')`,
    args: [
      id,
      taskNumber,
      input.requester_name.trim(),
      input.requester_contact.trim(),
      input.project_name.trim(),
      input.task_type,
      input.title.trim(),
      input.description?.trim() || null,
      input.work_needed?.trim() || null,
      input.desired_deadline || null,
      input.priority || "medium",
      input.components_status || null,
      input.components_location?.trim() || null,
      input.documentation_link?.trim() || null,
      input.requester_comment?.trim() || null,
    ],
  });

  return { id, task_number: taskNumber };
};

type TaskFilters = {
  status?: string | null;
  priority?: string | null;
  taskType?: string | null;
  project?: string | null;
  deadline?: string | null;
  search?: string | null;
};

export const listTasks = async (filters: TaskFilters): Promise<Task[]> => {
  await ensureSchema();
  const db = getClient();
  const conditions: string[] = [];
  const params: (string | null)[] = [];

  if (filters.status) {
    conditions.push("status = ?");
    params.push(filters.status);
  }
  if (filters.priority) {
    conditions.push("priority = ?");
    params.push(filters.priority);
  }
  if (filters.taskType) {
    conditions.push("task_type = ?");
    params.push(filters.taskType);
  }
  if (filters.project) {
    conditions.push("project_name LIKE ?");
    params.push(`%${filters.project}%`);
  }
  if (filters.deadline) {
    conditions.push("desired_deadline <= ?");
    params.push(filters.deadline);
  }
  if (filters.search) {
    conditions.push(
      "(task_number LIKE ? OR title LIKE ? OR project_name LIKE ?)"
    );
    const term = `%${filters.search}%`;
    params.push(term, term, term);
  }

  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await db.execute({
    sql: `SELECT * FROM tasks ${where} ORDER BY created_at DESC`,
    args: params,
  });

  const tasks = result.rows.map((row) =>
    rowToTask(row as unknown as Record<string, unknown>)
  );

  return tasks.sort((a, b) => {
    const priorityDiff =
      PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (priorityDiff !== 0) return priorityDiff;

    if (a.desired_deadline && b.desired_deadline) {
      return (
        new Date(a.desired_deadline).getTime() -
        new Date(b.desired_deadline).getTime()
      );
    }
    if (a.desired_deadline) return -1;
    if (b.desired_deadline) return 1;

    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
};

export const getTaskCounts = async () => {
  await ensureSchema();
  const db = getClient();
  const result = await db.execute(
    "SELECT status, COUNT(*) as count FROM tasks GROUP BY status"
  );

  const counts = {
    new: 0,
    in_progress: 0,
    waiting_parts: 0,
    done: 0,
  };

  for (const row of result.rows) {
    const status = String(row.status);
    if (status in counts) {
      counts[status as keyof typeof counts] = toNumber(row.count);
    }
  }

  return counts;
};

export const getTaskById = async (id: string): Promise<Task | null> => {
  await ensureSchema();
  const db = getClient();
  const result = await db.execute({
    sql: "SELECT * FROM tasks WHERE id = ?",
    args: [id],
  });

  if (result.rows.length === 0) return null;
  return rowToTask(result.rows[0] as unknown as Record<string, unknown>);
};

export const updateTask = async (
  id: string,
  input: UpdateTaskInput
): Promise<Task | null> => {
  await ensureSchema();
  const existing = await getTaskById(id);
  if (!existing) return null;

  const fields: string[] = [];
  const values: (string | null)[] = [];

  const setField = (key: string, value: string | null | undefined) => {
    if (value !== undefined) {
      fields.push(`${key} = ?`);
      values.push(value);
    }
  };

  setField("status", input.status);
  setField("priority", input.priority);
  setField("internal_notes", input.internal_notes ?? null);
  setField("used_components", input.used_components ?? null);
  setField("missing_components", input.missing_components ?? null);
  setField("purchase_needed", input.purchase_needed ?? null);
  setField("result_note", input.result_note ?? null);

  if (input.completed_at !== undefined) {
    setField("completed_at", input.completed_at || null);
  } else if (input.status === "done" && !existing.completed_at) {
    setField("completed_at", new Date().toISOString());
  }

  if (fields.length === 0) return existing;

  fields.push("updated_at = datetime('now')");
  values.push(id);

  const db = getClient();
  await db.execute({
    sql: `UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`,
    args: values,
  });

  return getTaskById(id);
};

export const getTaskComments = async (taskId: string): Promise<TaskComment[]> => {
  await ensureSchema();
  const db = getClient();
  const result = await db.execute({
    sql: "SELECT * FROM task_comments WHERE task_id = ? ORDER BY created_at ASC",
    args: [taskId],
  });

  return result.rows.map((row) =>
    rowToComment(row as unknown as Record<string, unknown>)
  );
};

export const addTaskComment = async (
  taskId: string,
  commentText: string
): Promise<TaskComment> => {
  await ensureSchema();
  const db = getClient();
  const id = randomUUID();

  await db.execute({
    sql: "INSERT INTO task_comments (id, task_id, comment_text) VALUES (?, ?, ?)",
    args: [id, taskId, commentText.trim()],
  });

  const result = await db.execute({
    sql: "SELECT * FROM task_comments WHERE id = ?",
    args: [id],
  });

  return rowToComment(
    result.rows[0] as unknown as Record<string, unknown>
  );
};

export type DbUser = {
  id: string;
  email: string;
  password_hash: string;
  role: string;
};

export const getUserByEmail = async (email: string): Promise<DbUser | null> => {
  await ensureSchema();
  const db = getClient();
  const result = await db.execute({
    sql: "SELECT * FROM users WHERE email = ?",
    args: [email.toLowerCase().trim()],
  });

  if (result.rows.length === 0) return null;
  return result.rows[0] as unknown as DbUser;
};

export const createUser = async (
  email: string,
  passwordHash: string,
  role = "executor"
): Promise<DbUser> => {
  await ensureSchema();
  const db = getClient();
  const id = randomUUID();
  const normalizedEmail = email.toLowerCase().trim();

  await db.execute({
    sql: "INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)",
    args: [id, normalizedEmail, passwordHash, role],
  });

  const result = await db.execute({
    sql: "SELECT * FROM users WHERE id = ?",
    args: [id],
  });

  return result.rows[0] as unknown as DbUser;
};
