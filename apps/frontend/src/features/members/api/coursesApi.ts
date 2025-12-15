import { supabase } from "../../../lib/supabaseClient";

export interface Course {
  id: string;
  tenant_id: string;
  title: string;
  description: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCourseInput {
  tenantId: string;
  title: string;
  description?: string;
}

export async function fetchCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Course[];
}

export async function createCourse(input: CreateCourseInput): Promise<Course> {
  const { data, error } = await supabase
    .from("courses")
    .insert({
      tenant_id: input.tenantId,
      title: input.title,
      description: input.description ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Course;
}

