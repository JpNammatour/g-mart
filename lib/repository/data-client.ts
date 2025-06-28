// Abstract DataClient for CRUD operations
export abstract class DataClient<T> {
    abstract getAll(): Promise<T[]>;
    abstract getById(id: number | string): Promise<T | undefined>;
    abstract add(item: T): Promise<void>;
    abstract update(id: number | string, updates: Partial<T>): Promise<void>;
    abstract delete(id: number | string): Promise<void>;
}
