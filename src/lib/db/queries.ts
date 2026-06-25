import {
  CreateTaskInput,
  Task,
  TaskComment,
  UpdateTaskInput,
  PRIORITY_ORDER,
} from "../types";
import { getSupabaseAdmin } from "../supabase";
import { ensureDefaultUsers } from "./seed-users";

const ensureReady = async () => {
  await ensureDefaultUsers();
};

export const generateTaskNumber = async (): Promise<string> => {
  await ensureReady();
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("tasks")
    .select("*", { count: "exact", head: true });

  if (error) throw error;

  const nextNum = (count ?? 0) + 1;
  return `PCB-${String(nextNum).padStart(4, "0")}`;
};

export const createTask = async (
  input: CreateTaskInput
): Promise<{ id: string; task_number: string }> => {
  await ensureReady();
  const supabase = getSupabaseAdmin();
  const taskNumber = await generateTaskNumber();

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      task_number: taskNumber,
      requester_name: input.requester_name.trim(),
      requester_contact: input.requester_contact.trim(),
      project_name: input.project_name.trim(),
      task_type: input.task_type,
      title: input.title.trim(),
      description: input.description?.trim() || null,
      work_needed: input.work_needed?.trim() || null,
      desired_deadline: input.desired_deadline || null,
      priority: input.priority || "medium",
      components_status: input.components_status || null,
      components_location: input.components_location?.trim() || null,
      documentation_link: input.documentation_link?.trim() || null,
      requester_comment: input.requester_comment?.trim() || null,
      status: "new",
    })
    .select("id, task_number")
    .single();

  if (error) throw error;
  return data;
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
  await ensureReady();
  const supabase = getSupabaseAdmin();

  let query = supabase.from("tasks").select("*");

  if (filters.status) query = query.eq("status", filters.status);
  if (filters.priority) query = query.eq("priority", filters.priority);
  if (filters.taskType) query = query.eq("task_type", filters.taskType);
  if (filters.project) query = query.ilike("project_name", `%${filters.project}%`);
  if (filters.deadline) query = query.lte("desired_deadline", filters.deadline);
  if (filters.search) {
    query = query.or(
      `task_number.ilike.%${filters.search}%,title.ilike.%${filters.search}%,project_name.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) throw error;

  const tasks = (data as Task[]).sort((a, b) => {
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

  return tasks;
};

export const getTaskCounts = async () => {
  await ensureReady();
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.from("tasks").select("status");
  if (error) throw error;

  const counts = {
    new: 0,
    in_progress: 0,
    waiting_parts: 0,
    done: 0,
  };

  for (const row of data ?? []) {
    if (row.status in counts) {
      counts[row.status as keyof typeof counts]++;
    }
  }

  return counts;
};

export const getTaskById = async (id: string): Promise<Task | null> => {
  await ensureReady();
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  return data as Task | null;
};

export const updateTask = async (
  id: string,
  input: UpdateTaskInput
): Promise<Task | null> => {
  await ensureReady();
  const existing = await getTaskById(id);
  if (!existing) return null;

  const updateData: Record<string, unknown> = {};

  if (input.status !== undefined) updateData.status = input.status;
  if (input.priority !== undefined) updateData.priority = input.priority;
  if (input.internal_notes !== undefined)
    updateData.internal_notes = input.internal_notes;
  if (input.used_components !== undefined)
    updateData.used_components = input.used_components;
  if (input.missing_components !== undefined)
    updateData.missing_components = input.missing_components;
  if (input.purchase_needed !== undefined)
    updateData.purchase_needed = input.purchase_needed;
  if (input.result_note !== undefined)
    updateData.result_note = input.result_note;

  if (input.completed_at !== undefined) {
    updateData.completed_at = input.completed_at || null;
  } else if (input.status === "done" && !existing.completed_at) {
    updateData.completed_at = new Date().toISOString();
  }

  if (Object.keys(updateData).length === 0) return existing;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("tasks")
    .update(updateData)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data as Task;
};

export const getTaskComments = async (taskId: string): Promise<TaskComment[]> => {
  await ensureReady();
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("task_comments")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as TaskComment[];
};

export const addTaskComment = async (
  taskId: string,
  commentText: string
): Promise<TaskComment> => {
  await ensureReady();
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("task_comments")
    .insert({
      task_id: taskId,
      comment_text: commentText.trim(),
    })
    .select()
    .single();

  if (error) throw error;
  return data as TaskComment;
};

export type DbUser = {
  id: string;
  email: string;
  password_hash: string;
  role: string;
};

export const getUserByEmail = async (email: string): Promise<DbUser | null> => {
  await ensureReady();
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email.toLowerCase().trim())
    .maybeSingle();

  if (error) throw error;
  return data as DbUser | null;
};

export const createUser = async (
  email: string,
  passwordHash: string,
  role = "executor"
): Promise<DbUser> => {
  await ensureReady();
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from("users")
    .insert({
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      role,
    })
    .select()
    .single();

  if (error) throw error;
  return data as DbUser;
};
