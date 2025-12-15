import { supabase } from "../../../lib/supabaseClient";

export interface CourseProgressSummary {
  course_id: string;
  tenant_id: string;
  students_with_progress: number;
  total_completed_lessons: number;
}

export async function fetchCourseProgressSummary(): Promise<CourseProgressSummary[]> {
  const { data, error } = await supabase
    .from("course_progress_summary")
    .select(
      "course_id, tenant_id, students_with_progress, total_completed_lessons",
    );

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CourseProgressSummary[];
}

