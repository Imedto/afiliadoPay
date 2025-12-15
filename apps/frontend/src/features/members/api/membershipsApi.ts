import { supabase } from "../../../lib/supabaseClient";
import type { Course } from "./coursesApi";

export type MembershipStatus = "active" | "cancelled" | "expired";

export interface Membership {
  id: string;
  tenant_id: string;
  user_id: string;
  course_id: string;
  sale_id: string | null;
  status: MembershipStatus;
  started_at: string;
  expires_at: string | null;
  created_at: string;
  course?: Course;
}

export async function fetchMyMemberships(): Promise<Membership[]> {
  const { data, error } = await supabase
    .from("memberships")
    .select(
      `
      id,
      tenant_id,
      user_id,
      course_id,
      sale_id,
      status,
      started_at,
      expires_at,
      created_at,
      courses:course_id (
        id,
        tenant_id,
        title,
        description,
        is_published,
        created_at,
        updated_at
      )
    `,
    )
    .eq("status", "active");

  if (error) {
    throw new Error(error.message);
  }

  // Normaliza campo course
  return (data ?? []).map((row: any) => ({
    ...row,
    course: row.courses,
  })) as Membership[];
}

