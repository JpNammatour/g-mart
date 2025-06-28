import { Product } from "@/types/product";
import { DataClient } from "./data-client";
import { supabase } from "@/lib/supabase";


export class ProductRepository extends DataClient<Product> {
    private table = "products";

    async getAll(): Promise<Product[]> {
        const { data, error } = await supabase.from(this.table).select();
        if (error) throw new Error(error.message);
        return data as Product[];
    }

    async getById(id: number): Promise<Product | undefined> {
        const { data, error } = await supabase.from(this.table).select("*").eq("id", id).single();
        if (error) throw new Error(error.message);
        return data as Product;
    }

    async add(item: Product): Promise<void> {
        const { error } = await supabase.from(this.table).insert([item]);
        if (error) throw new Error(error.message);
    }

    async update(id: number, updates: Partial<Product>): Promise<void> {
        const { error } = await supabase.from(this.table).update(updates).eq("id", id);
        if (error) throw new Error(error.message);
    }

    async delete(id: number): Promise<void> {
        const { error } = await supabase.from(this.table).delete().eq("id", id);
        if (error) throw new Error(error.message);
    }

    async setAll(products: Product[]): Promise<void> {
        // Optional: implement bulk upsert if needed
        await supabase.from(this.table).upsert(products);
    }
}
