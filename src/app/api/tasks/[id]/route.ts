import { NextRequest, NextResponse } from "next/server";
import {
  getTaskById,
  getTaskComments,
  updateTask,
} from "@/lib/db";
import { requireApiAuth } from "@/lib/server-utils";
import { UpdateTaskInput } from "@/lib/types";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

export const GET = async (_request: NextRequest, { params }: RouteParams) => {
  const auth = await requireApiAuth();
  if (!auth.authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const task = await getTaskById(id);
    if (!task) {
      return NextResponse.json({ error: "Задача не найдена" }, { status: 404 });
    }

    const comments = await getTaskComments(id);
    return NextResponse.json({ task, comments });
  } catch (error) {
    console.error("Get task error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
};

export const PATCH = async (request: NextRequest, { params }: RouteParams) => {
  const auth = await requireApiAuth();
  if (!auth.authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body: UpdateTaskInput = await request.json();
    const data = await updateTask(id, body);

    if (!data) {
      return NextResponse.json({ error: "Задача не найдена" }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
};
