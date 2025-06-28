import { CustomerInfo } from "@/types/customer";
import { DataClient } from "./data-client";

export class CustomerRepository extends DataClient<CustomerInfo> {
  private storageKey = "grameenMartCustomers";

  async getAll(): Promise<CustomerInfo[]> {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  async getById(mobile: string): Promise<CustomerInfo | undefined> {
    const all = await this.getAll();
    return all.find((c) => c.mobile === mobile);
  }

  async add(item: CustomerInfo): Promise<void> {
    const all = await this.getAll();
    all.push(item);
    localStorage.setItem(this.storageKey, JSON.stringify(all));
  }

  async update(mobile: string, updates: Partial<CustomerInfo>): Promise<void> {
    const all = await this.getAll();
    const updated = all.map((c) =>
      c.mobile === mobile ? { ...c, ...updates } : c
    );
    localStorage.setItem(this.storageKey, JSON.stringify(updated));
  }

  async delete(mobile: string): Promise<void> {
    const all = await this.getAll();
    const filtered = all.filter((c) => c.mobile !== mobile);
    localStorage.setItem(this.storageKey, JSON.stringify(filtered));
  }

  async setAll(customers: CustomerInfo[]): Promise<void> {
    localStorage.setItem(this.storageKey, JSON.stringify(customers));
  }
}
