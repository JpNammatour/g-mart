export interface Product {
    id: number
    name: string
    malayalamName: string
    price: number
    marketPrice: number
    unit: string
    image: string
    imageUrl?: string
    category: "vegetable" | "fruit"
    description: string
    inStock: boolean
    createdAt?: string
    updatedAt?: string
}
