import { supabase } from "../../../lib/supabaseClient";

export interface CourseProduct {
  id: string;
  tenant_id: string;
  course_id: string;
  product_id: string;
  created_at: string;
  product?: {
    name: string;
    code: string;
  } | null;
}

export async function fetchCourseProductsByCourse(
  courseId: string,
): Promise<CourseProduct[]> {
  const { data, error } = await supabase
    .from("course_products")
    .select("id, tenant_id, course_id, product_id, created_at, product:product_id(name, code)")
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as CourseProduct[];
}

export async function addCourseProduct(
  tenantId: string,
  courseId: string,
  productId: string,
): Promise<CourseProduct> {
  const { data, error } = await supabase
    .from("course_products")
    .insert({
      tenant_id: tenantId,
      course_id: courseId,
      product_id: productId,
    })
    .select("id, tenant_id, course_id, product_id, created_at, product:product_id(name, code)")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as CourseProduct;
}

export async function removeCourseProduct(id: string): Promise<void> {
  const { error } = await supabase.from("course_products").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }
}

