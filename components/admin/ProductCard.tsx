
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { ToggleLeft, ToggleRight, Upload, Trash2 } from "lucide-react";
import React from "react";
import { Product } from "@/types/product";

interface ProductCardProps {
    product: Product;
    onUpdate: (id: number, updates: Partial<Product>) => void;
    onToggleStock: (id: number) => void;
    onEditImage: (product: Product) => void;
    onDelete: (id: number) => void;
}

export function ProductCard({ product, onUpdate, onToggleStock, onEditImage, onDelete }: ProductCardProps) {
    return (
        <div className="overflow-hidden border rounded-lg bg-white shadow-sm">
            <div className="relative">
                <Image
                    src={product.imageUrl || product.image || "/placeholder.svg"}
                    alt={product.name}
                    width={300}
                    height={200}
                    className="w-full h-40 object-cover"
                />
                {!product.imageUrl && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white text-sm font-medium">No Image</span>
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <Badge variant={product.category === "vegetable" ? "default" : "secondary"}>{product.category}</Badge>
                </div>
                {!product.inStock && (
                    <div className="absolute bottom-2 left-2">
                        <Badge variant="destructive">Out of Stock</Badge>
                    </div>
                )}
            </div>
            <div className="p-4">
                <div className="space-y-3">
                    <div>
                        <h4 className="font-semibold text-lg">{product.name}</h4>
                        <p className="text-sm text-gray-600">{product.malayalamName}</p>
                        <p className="text-xs text-gray-500 mt-1">{product.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <Label className="text-xs">GM Price</Label>
                            <Input
                                type="number"
                                value={product.price}
                                onChange={(e) => onUpdate(product.id, { price: Number(e.target.value) })}
                                className="h-8 text-sm"
                            />
                        </div>
                        <div>
                            <Label className="text-xs">Market Price</Label>
                            <Input
                                type="number"
                                value={product.marketPrice}
                                onChange={(e) => onUpdate(product.id, { marketPrice: Number(e.target.value) })}
                                className="h-8 text-sm"
                            />
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                            ₹{product.price}/{product.unit}
                        </span>
                        <span className="text-xs text-gray-500">Save ₹{product.marketPrice - product.price}</span>
                    </div>
                </div>
                <div className="pt-4 space-y-2">
                    <Button
                        size="sm"
                        variant={product.inStock ? "default" : "destructive"}
                        onClick={() => onToggleStock(product.id)}
                        className="w-full"
                    >
                        {product.inStock ? (
                            <>
                                <ToggleRight className="w-4 h-4 mr-1" /> In Stock
                            </>
                        ) : (
                            <>
                                <ToggleLeft className="w-4 h-4 mr-1" /> Out of Stock
                            </>
                        )}
                    </Button>
                    <div className="flex space-x-2">
                        <Button size="sm" variant="outline" onClick={() => onEditImage(product)} className="flex-1">
                            <Upload className="w-4 h-4 mr-1" />
                            {product.imageUrl ? "Change" : "Add"} Photo
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => onDelete(product.id)} className="px-3">
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
