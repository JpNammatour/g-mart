import { Product } from "@/types/product";
import { DataClient } from "./data-client";


export class ProductRepository extends DataClient<Product> {
    private table = "products";

    async getAll(): Promise<Product[]> {
        const res = await fetch('/api/supabase-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'getAll', table: this.table })
        });
        const { result, error } = await res.json();
        if (error) throw new Error(error);
        return result as Product[];
    }

    async getById(id: number): Promise<Product | undefined> {
        const res = await fetch('/api/supabase-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'getById', table: this.table, id })
        });
        const { result, error } = await res.json();
        if (error) throw new Error(error);
        return result as Product;
    }

    async add(item: Product): Promise<void> {
        const res = await fetch('/api/supabase-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'add', table: this.table, payload: item })
        });
        const { error } = await res.json();
        if (error) throw new Error(error);
    }

    async update(id: number, updates: Partial<Product>): Promise<void> {
        const res = await fetch('/api/supabase-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'update', table: this.table, id, payload: { updates } })
        });
        const { error } = await res.json();
        if (error) throw new Error(error);
    }

    async delete(id: number): Promise<void> {
        const res = await fetch('/api/supabase-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', table: this.table, id })
        });
        const { error } = await res.json();
        if (error) throw new Error(error);
    }

    async setAll(products: Product[]): Promise<void> {
        await fetch('/api/supabase-proxy', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'setAll', table: this.table, payload: products })
        });
    }
}
