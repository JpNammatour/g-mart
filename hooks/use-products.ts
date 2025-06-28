import { useCallback, useEffect, useState } from "react";
import { ProductRepository } from "@/lib/repository/product-repository";
import { Product } from "@/types/product";

const repo = new ProductRepository();

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  const load = useCallback(async () => {
    setProducts(await repo.getAll());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = async (product: Product) => {
    await repo.add(product);
    await load();
  };

  const update = async (id: number, updates: Partial<Product>) => {
    await repo.update(id, updates);
    await load();
  };

  const remove = async (id: number) => {
    await repo.delete(id);
    await load();
  };

  const setAll = async (products: Product[]) => {
    await repo.setAll(products);
    await load();
  };

  return { products, add, update, remove, setAll, reload: load };
}
