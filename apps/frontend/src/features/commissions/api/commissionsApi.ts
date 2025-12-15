import { supabase } from "../../../lib/supabaseClient";

export type CommissionStatus = "pending" | "approved" | "paid" | "cancelled";

export interface Commission {
  id: string;
  tenant_id: string;
  sale_id: string;
  affiliate_id: string;
  amount: number;
  status: CommissionStatus;
  created_at: string;
  paid_at: string | null;
}

export interface CommissionsSummary {
  total: number;
  pending: number;
  approved: number;
  paid: number;
  cancelled: number;
}

export async function fetchCommissions(): Promise<Commission[]> {
  const { data, error } = await supabase
    .from("commissions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Commission[];
}

export async function updateCommissionStatus(
  id: string,
  status: CommissionStatus,
): Promise<Commission> {
  const payload: Partial<Commission> =
    status === "paid"
      ? { status, paid_at: new Date().toISOString() }
      : { status };

  const { data, error } = await supabase
    .from("commissions")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single<Commission>();

  if (error) {
    throw new Error(error.message);
  }

  return data as Commission;
}

export function summarizeCommissions(commissions: Commission[]): CommissionsSummary {
  return commissions.reduce<CommissionsSummary>(
    (acc, c) => {
      acc.total += Number(c.amount || 0);
      acc[c.status] += Number(c.amount || 0);
      return acc;
    },
    {
      total: 0,
      pending: 0,
      approved: 0,
      paid: 0,
      cancelled: 0,
    },
  );
}
