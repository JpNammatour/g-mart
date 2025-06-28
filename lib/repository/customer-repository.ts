import { CustomerInfo } from "@/types/customer";
import { DataClient } from "./data-client";

export class CustomerRepository extends DataClient<CustomerInfo> {
  private table = "customers";

  async getAll(): Promise<CustomerInfo[]> {
    const res = await fetch('/api/supabase-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getAll', table: this.table })
    });
    const { result, error } = await res.json();
    if (error) throw new Error(error);
    return result as CustomerInfo[];
  }

  async getById(mobile: string): Promise<CustomerInfo | undefined> {
    const res = await fetch('/api/supabase-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'getById', table: this.table, mobile })
    });
    const { result, error } = await res.json();
    if (error) throw new Error(error);
    return result as CustomerInfo;
  }

  async add(item: CustomerInfo): Promise<void> {
    const res = await fetch('/api/supabase-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add', table: this.table, payload: item })
    });
    const { error } = await res.json();
    if (error) throw new Error(error);
  }

  async update(mobile: string, updates: Partial<CustomerInfo>): Promise<void> {
    const res = await fetch('/api/supabase-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', table: this.table, mobile, payload: { updates } })
    });
    const { error } = await res.json();
    if (error) throw new Error(error);
  }

  async delete(mobile: string): Promise<void> {
    const res = await fetch('/api/supabase-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', table: this.table, mobile })
    });
    const { error } = await res.json();
    if (error) throw new Error(error);
  }

  async setAll(customers: CustomerInfo[]): Promise<void> {
    await fetch('/api/supabase-proxy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'setAll', table: this.table, payload: customers })
    });
  }
}
