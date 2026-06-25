import { NextRequest, NextResponse } from "next/server";
import { createTask, listTasks, getTaskCounts } from "@/lib/db";
import { requireApiAuth } from "@/lib/server-utils";
import { CreateTaskInput } from "@/lib/types";
import { getDbErrorMessage } from "@/lib/supabase";

export const runtime = "nodejs";

export const POST = async (request: NextRequest) => {
  try {
    const body: CreateTaskInput = await request.json();

    if (
      !body.requester_name?.trim() ||
      !body.requester_contact?.trim() ||
      !body.project_name?.trim() ||
      !body.task_type ||
      !body.title?.trim()
    ) {
      return NextResponse.json(
        { error: "Заполните обязательные поля" },
        { status: 400 }
      );
    }

    const data = await createTask(body);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Create task error:", error);
    const message = getDbErrorMessage(error);
    const hint = message.includes("does not exist")
      ? "Выполните supabase/schema.sql в Supabase SQL Editor"
      : undefined;
    return NextResponse.json({ error: message, hint }, { status: 500 });
  }
};

export const GET = async (request: NextRequest) => {
  const auth = await requireApiAuth();
  if (!auth.authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);

    const tasks = await listTasks({
      status: searchParams.get("status"),
      priority: searchParams.get("priority"),
      taskType: searchParams.get("task_type"),
      project: searchParams.get("project"),
      deadline: searchParams.get("deadline"),
      search: searchParams.get("search"),
    });

    const counts = await getTaskCounts();

    return NextResponse.json({ tasks, counts });
  } catch (error) {
    console.error("List tasks error:", error);
    const message = getDbErrorMessage(error);
    const hint = message.includes("does not exist")
      ? "Выполните supabase/schema.sql в Supabase SQL Editor"
      : undefined;
    return NextResponse.json({ error: message, hint }, { status: 500 });
  }
};
