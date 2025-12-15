import { supabase } from "../../../lib/supabaseClient";

export interface Product {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  description: string | null;
  status: "draft" | "active" | "archived";
  created_at: string;
  updated_at: string;
}

export interface CreateProductInput {
  tenantId: string;
  createdBy: string;
  code: string;
  name: string;
  description?: string;
}

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Product[];
}

export async function createProduct(input: CreateProductInput): Promise<Product> {
  const { data, error } = await supabase
    .from("products")
    .insert({
      tenant_id: input.tenantId,
      created_by: input.createdBy,
      code: input.code,
      name: input.name,
      description: input.description ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Product;
}
