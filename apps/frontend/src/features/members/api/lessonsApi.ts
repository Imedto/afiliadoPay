import { supabase } from "../../../lib/supabaseClient";

export type LessonStatus = "draft" | "published";

export interface Lesson {
  id: string;
  tenant_id: string;
  course_id: string;
  title: string;
  content_url: string | null;
  status: LessonStatus;
  order_index: number;
  created_at: string;
}

export interface CreateLessonInput {
  tenantId: string;
  courseId: string;
  title: string;
  contentUrl?: string;
  status?: LessonStatus;
  orderIndex?: number;
}

export interface UpdateLessonInput {
  id: string;
  title?: string;
  contentUrl?: string | null;
  status?: LessonStatus;
  orderIndex?: number;
}

export async function fetchLessons(courseId: string): Promise<Lesson[]> {
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", courseId)
    .order("order_index", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Lesson[];
}

export async function createLesson(input: CreateLessonInput): Promise<Lesson> {
  const { data, error } = await supabase
    .from("lessons")
    .insert({
      tenant_id: input.tenantId,
      course_id: input.courseId,
      title: input.title,
      content_url: input.contentUrl ?? null,
      status: input.status ?? "draft",
      order_index: input.orderIndex ?? 0,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Lesson;
}

export async function updateLesson(input: UpdateLessonInput): Promise<Lesson> {
  const payload: Record<string, unknown> = {};
  if (typeof input.title === "string") payload.title = input.title;
  if (input.contentUrl !== undefined) payload.content_url = input.contentUrl;
  if (input.status) payload.status = input.status;
  if (typeof input.orderIndex === "number") payload.order_index = input.orderIndex;

  const { data, error } = await supabase
    .from("lessons")
    .update(payload)
    .eq("id", input.id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Lesson;
}
