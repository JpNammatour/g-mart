import { Product } from "./product"

export interface CartItem extends Product {
    quantity: number
    selectedUnit: string
    actualQuantity: number
}
