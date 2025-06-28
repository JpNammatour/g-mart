import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Upload, X } from "lucide-react";
import { Product } from "@/types/product";

interface ProductFormProps {
  product: Product;
  onChange: (product: Product) => void;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onSubmit: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  isEdit?: boolean;
}

export function ProductForm({
  product,
  onChange,
  onImageUpload,
  onRemoveImage,
  onSubmit,
  fileInputRef,
  isEdit = false,
}: ProductFormProps) {
  return (
    <div className="space-y-4">
      {/* Image Upload Section */}
      <div>
        <Label>Product Image</Label>
        <div className="space-y-4">
          {product.imageUrl ? (
            <div className="relative">
              <Image
                src={product.imageUrl || "/placeholder.svg"}
                alt="Product preview"
                width={200}
                height={150}
                className="rounded-lg object-cover border"
              />
              <Button
                size="sm"
                variant="destructive"
                className="absolute top-2 right-2"
                onClick={onRemoveImage}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">Upload Product Image</p>
              <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              {product.imageUrl ? "Change Image" : "Upload Image"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              className="hidden"
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Product Name *</Label>
          <Input
            value={product.name}
            onChange={(e) => onChange({ ...product, name: e.target.value })}
            placeholder="e.g., Tomato"
          />
        </div>
        <div>
          <Label>Malayalam Name *</Label>
          <Input
            value={product.malayalamName}
            onChange={(e) => onChange({ ...product, malayalamName: e.target.value })}
            placeholder="e.g., തക്കാളി"
          />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>GM Price *</Label>
          <Input
            type="number"
            value={product.price}
            onChange={(e) => onChange({ ...product, price: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>Market Price *</Label>
          <Input
            type="number"
            value={product.marketPrice}
            onChange={(e) => onChange({ ...product, marketPrice: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label>Unit</Label>
          <Select
            value={product.unit}
            onValueChange={(value) => onChange({ ...product, unit: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="kg">kg</SelectItem>
              <SelectItem value="piece">piece</SelectItem>
              <SelectItem value="bunch">bunch</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label>Category</Label>
        <Select
          value={product.category}
          onValueChange={(value: "vegetable" | "fruit") => onChange({ ...product, category: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vegetable">Vegetable</SelectItem>
            <SelectItem value="fruit">Fruit</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          value={product.description}
          onChange={(e) => onChange({ ...product, description: e.target.value })}
          placeholder="Product description"
        />
      </div>
      <Button onClick={onSubmit} className="w-full">
        {isEdit ? "Save Changes" : "Add Product"}
      </Button>
    </div>
  );
}
