import { supabase } from "../../../lib/supabaseClient";

export interface LessonProgress {
  id: string;
  tenant_id: string;
  user_id: string;
  course_id: string;
  lesson_id: string;
  completed_at: string;
  created_at: string;
}

export async function fetchLessonProgressForCourse(
  courseId: string,
): Promise<LessonProgress[]> {
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("*")
    .eq("course_id", courseId);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as LessonProgress[];
}

export async function markLessonCompleted(
  tenantId: string,
  courseId: string,
  lessonId: string,
): Promise<LessonProgress> {
  const { data, error } = await supabase
    .from("lesson_progress")
    .insert({
      tenant_id: tenantId,
      course_id: courseId,
      lesson_id: lessonId,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as LessonProgress;
}

export async function unmarkLessonCompleted(
  courseId: string,
  lessonId: string,
): Promise<void> {
  const { error } = await supabase
    .from("lesson_progress")
    .delete()
    .eq("course_id", courseId)
    .eq("lesson_id", lessonId);

  if (error) {
    throw new Error(error.message);
  }
}

