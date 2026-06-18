import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { DashboardHeader } from "@/components/DashboardHeader";
import { TaskDetailClient } from "@/components/TaskDetailClient";

type TaskPageProps = {
  params: Promise<{ id: string }>;
};

const TaskPage = async ({ params }: TaskPageProps) => {
  const session = await requireAuth();
  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  return (
    <>
      <DashboardHeader email={session.email ?? ""} />
      <TaskDetailClient taskId={id} />
    </>
  );
};

export default TaskPage;
