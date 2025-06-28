import { useCallback, useEffect, useState } from "react";
import { CustomerRepository } from "@/lib/repository/customer-repository";
import { CustomerInfo } from "@/types/customer";

const repo = new CustomerRepository();

export function useCustomers() {
  const [customers, setCustomers] = useState<CustomerInfo[]>([]);

  const load = useCallback(async () => {
    setCustomers(await repo.getAll());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = async (customer: CustomerInfo) => {
    await repo.add(customer);
    await load();
  };

  const update = async (mobile: string, updates: Partial<CustomerInfo>) => {
    await repo.update(mobile, updates);
    await load();
  };

  const remove = async (mobile: string) => {
    await repo.delete(mobile);
    await load();
  };

  const setAll = async (customers: CustomerInfo[]) => {
    await repo.setAll(customers);
    await load();
  };

  return { customers, add, update, remove, setAll, reload: load };
}
