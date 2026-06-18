export {
  createTask,
  listTasks,
  getTaskCounts,
  getTaskById,
  updateTask,
  getTaskComments,
  addTaskComment,
  getUserByEmail,
  createUser,
  generateTaskNumber,
} from "./queries";

export type { DbUser } from "./queries";

export { ensureSchema } from "./client";
