import { CustomerInfo } from "@/types/customer";
import { DataClient } from "./data-client";
import { supabase } from "@/lib/supabase";

export class CustomerRepository extends DataClient<CustomerInfo> {
  private table = "customers";

  async getAll(): Promise<CustomerInfo[]> {
    const { data, error } = await supabase.from(this.table).select("*");
    if (error) throw new Error(error.message);
    return data as CustomerInfo[];
  }

  async getById(mobile: string): Promise<CustomerInfo | undefined> {
    const { data, error } = await supabase
      .from(this.table)
      .select("*")
      .eq("mobile", mobile)
      .single();
    if (error) throw new Error(error.message);
    return data as CustomerInfo;
  }

  async add(item: CustomerInfo): Promise<void> {
    const { error } = await supabase.from(this.table).insert([item]);
    if (error) throw new Error(error.message);
  }

  async update(mobile: string, updates: Partial<CustomerInfo>): Promise<void> {
    const { error } = await supabase
      .from(this.table)
      .update(updates)
      .eq("mobile", mobile);
    if (error) throw new Error(error.message);
  }

  async delete(mobile: string): Promise<void> {
    const { error } = await supabase.from(this.table).delete().eq("mobile", mobile);
    if (error) throw new Error(error.message);
  }

  async setAll(customers: CustomerInfo[]): Promise<void> {
    // Optional: implement bulk upsert if needed
    await supabase.from(this.table).upsert(customers);
  }
}
