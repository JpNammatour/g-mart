import { Product } from "@/types/product";
import { DataClient } from "./data-client";
import { allKeralaProducts } from "@/data/kerala-products";


export class ProductRepository extends DataClient<Product> {
    private storageKey = "grameenMartProducts";

    async getAll(): Promise<Product[]> {
        // const data = localStorage.getItem(this.storageKey);
        // return data ? JSON.parse(data) : [];
        return allKeralaProducts as Product[];
    }

    async getById(id: number): Promise<Product | undefined> {
        const all = await this.getAll();
        return all.find((p) => p.id === id);
    }

    async add(item: Product): Promise<void> {
        const all = await this.getAll();
        all.push(item);
        localStorage.setItem(this.storageKey, JSON.stringify(all));
    }

    async update(id: number, updates: Partial<Product>): Promise<void> {
        const all = await this.getAll();
        const updated = all.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
        );
        localStorage.setItem(this.storageKey, JSON.stringify(updated));
    }

    async delete(id: number): Promise<void> {
        const all = await this.getAll();
        const filtered = all.filter((p) => p.id !== id);
        localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    }

    async setAll(products: Product[]): Promise<void> {
        localStorage.setItem(this.storageKey, JSON.stringify(products));
    }
}
