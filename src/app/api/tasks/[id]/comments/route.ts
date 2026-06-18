import { NextRequest, NextResponse } from "next/server";
import { addTaskComment, getTaskById } from "@/lib/db";
import { requireApiAuth } from "@/lib/server-utils";

export const runtime = "nodejs";

type RouteParams = { params: Promise<{ id: string }> };

export const POST = async (request: NextRequest, { params }: RouteParams) => {
  const auth = await requireApiAuth();
  if (!auth.authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const { comment_text } = await request.json();

    if (!comment_text?.trim()) {
      return NextResponse.json(
        { error: "Комментарий не может быть пустым" },
        { status: 400 }
      );
    }

    if (!(await getTaskById(id))) {
      return NextResponse.json({ error: "Задача не найдена" }, { status: 404 });
    }

    const data = await addTaskComment(id, comment_text);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Add comment error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
};
