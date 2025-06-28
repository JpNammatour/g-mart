"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Eye, EyeOff, Plus, Trash2, ToggleLeft, ToggleRight, Upload, X, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Toaster } from "@/components/ui/toaster"
import { ProductCard } from "@/components/admin/ProductCard"
import { CustomerCard } from "@/components/admin/CustomerCard"

import { Product } from "@/types/product"

import { useProducts } from "@/hooks/use-products"
import { useCustomers } from "@/hooks/use-customers"
import { useBanner } from "@/hooks/use-banner"
import { useToast } from "@/hooks/use-toast"

import Image from "next/image"


export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(true)
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isEditImageOpen, setIsEditImageOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const [selectedAdminCategory, setSelectedAdminCategory] = useState<"all" | "vegetable" | "fruit" | "no-image">("all")

  // Use repositories/hooks for data
  const { products, add, update, remove, setAll, reload: reloadProducts } = useProducts()
  const { customers, reload: reloadCustomers } = useCustomers()
  const { banner, setBanner, reload: reloadBanner } = useBanner()

  // Filter products for admin view
  const filteredAdminProducts = products.filter((product) => {
    if (selectedAdminCategory === "all") return true
    if (selectedAdminCategory === "no-image") return !product.imageUrl
    return product.category === selectedAdminCategory
  })

  // New product state
  const [newProduct, setNewProduct] = useState<Product>({
    id: 0,
    name: "",
    malayalamName: "",
    price: 0,
    marketPrice: 0,
    unit: "kg",
    category: "vegetable",
    description: "",
    inStock: true,
    image: "/placeholder.svg?height=200&width=200",
    imageUrl: "",
    createdAt: undefined,
    updatedAt: undefined,
  })

  // Load data on component mount
  useEffect(() => {
    reloadProducts()
    reloadCustomers()
    reloadBanner()
  }, [])

  const handleLogin = () => {
    if (credentials.username === "gm@123" && credentials.password === "gMcherakkara@123") {
      setIsLoggedIn(true)
      toast({
        title: "Login Successful",
        description: "Welcome to Grameen Mart Admin Panel",
      })
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid credentials!",
        variant: "destructive",
      })
    }
  }

  // Image upload logic (shared for add/edit)
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      })
      return
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File Type",
        description: "Please select an image file",
        variant: "destructive",
      })
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      if (isEdit && editingProduct) {
        setEditingProduct({
          ...editingProduct,
          imageUrl,
          updatedAt: new Date().toISOString(),
        })
      } else {
        setNewProduct((prev) => ({
          ...prev,
          imageUrl,
        }))
      }
      toast({
        title: "Image Uploaded",
        description: "Image has been uploaded successfully",
      })
    }
    reader.readAsDataURL(file)
  }

  const removeImage = (isEdit = false) => {
    if (isEdit && editingProduct) {
      setEditingProduct({
        ...editingProduct,
        imageUrl: "",
        updatedAt: new Date().toISOString(),
      })
    } else {
      setNewProduct((prev) => ({
        ...prev,
        imageUrl: "",
      }))
    }
    toast({
      title: "Image Removed",
      description: "Image has been removed",
    })
  }

  // Add product using repository
  const addProduct = async () => {
    if (!newProduct.name || !newProduct.malayalamName || !newProduct.price) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const product: Product = {
      ...newProduct,
      id: Date.now(),
      image: "/placeholder.svg?height=200&width=200",
      createdAt: new Date().toISOString(),
    }

    await add(product)
    setNewProduct({
      id: 0,
      name: "",
      malayalamName: "",
      price: 0,
      marketPrice: 0,
      unit: "kg",
      category: "vegetable",
      description: "",
      inStock: true,
      image: "/placeholder.svg?height=200&width=200",
      imageUrl: "",
      createdAt: undefined,
      updatedAt: undefined,
    })
    setIsAddProductOpen(false)

    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }

    toast({
      title: "Product Added",
      description: `${product.name} has been added successfully`,
    })
  }

  // Update product using repository
  const updateProduct = async (id: number, updates: Partial<Product>) => {
    await update(id, updates)
    toast({
      title: "Product Updated",
      description: "Product has been updated successfully",
    })
  }

  // Save edited product
  const saveEditedProduct = () => {
    if (editingProduct) {
      updateProduct(editingProduct.id, editingProduct)
      setEditingProduct(null)
      setIsEditImageOpen(false)

      if (editFileInputRef.current) {
        editFileInputRef.current.value = ""
      }
    }
  }

  // Delete product using repository
  const deleteProduct = async (id: number) => {
    await remove(id)
    toast({
      title: "Product Deleted",
      description: "Product has been deleted successfully",
    })
  }

  // Toggle stock
  const toggleStock = async (id: number) => {
    const product = products.find((p) => p.id === id)
    if (product) {
      await update(id, { inStock: !product.inStock })
    }
  }


  // Save all data
  const saveData = async () => {
    await setAll(products)
    setBanner(banner)
    // Customers are managed by their own repository
    toast({
      title: "Data Saved",
      description: "All changes have been saved successfully",
    })
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center">
        <Toaster />
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">🌿</span>
              </div>
              Grameen Mart Admin
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={credentials.username}
                onChange={(e) => setCredentials((prev) => ({ ...prev, username: e.target.value }))}
                placeholder="Enter username"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={(e) => setCredentials((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <Button onClick={handleLogin} className="w-full bg-green-600 hover:bg-green-700">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-green-50">
      <Toaster />

      {/* Header */}
      <header className="bg-green-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => (window.location.href = "/")}
              className="flex items-center space-x-2 hover:bg-green-700 rounded-lg p-2 transition-colors"
            >
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-xl">🌿</span>
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold">Grameen Mart Admin</h1>
                <p className="text-green-100 text-sm">Product & Customer Management</p>
              </div>
            </button>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={reloadProducts} className="text-white hover:bg-green-700">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button onClick={saveData} variant="secondary">
                Save All Changes
              </Button>
              <Button onClick={() => setIsLoggedIn(false)} variant="outline">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-8">
        {/* Banner Management */}
        <Card>
          <CardHeader>
            <CardTitle>Banner Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="banner">Banner Text</Label>
                <Textarea
                  id="banner"
                  placeholder="Enter banner text for offers"
                  value={banner}
                  onChange={(e) => setBanner(e.target.value)}
                />
              </div>
              <div className="bg-red-600 text-white text-center py-2 px-4 rounded">
                <p className="text-sm font-medium">{banner || "Banner preview will appear here"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Product Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Product Management ({products.length} products)</CardTitle>
              <div className="flex items-center space-x-2">
                <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Add New Product</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {/* Image Upload Section */}
                      <div>
                        <Label>Product Image</Label>
                        <div className="space-y-4">
                          {newProduct.imageUrl ? (
                            <div className="relative">
                              <Image
                                src={newProduct.imageUrl || "/placeholder.svg"}
                                alt="Product preview"
                                width={200}
                                height={150}
                                className="rounded-lg object-cover border"
                              />
                              <Button
                                size="sm"
                                variant="destructive"
                                className="absolute top-2 right-2"
                                onClick={() => removeImage(false)}
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
                              {newProduct.imageUrl ? "Change Image" : "Upload Image"}
                            </Button>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, false)}
                              className="hidden"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Product Name *</Label>
                          <Input
                            value={newProduct.name}
                            onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g., Tomato"
                          />
                        </div>
                        <div>
                          <Label>Malayalam Name *</Label>
                          <Input
                            value={newProduct.malayalamName}
                            onChange={(e) => setNewProduct((prev) => ({ ...prev, malayalamName: e.target.value }))}
                            placeholder="e.g., തക്കാളി"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label>GM Price *</Label>
                          <Input
                            type="number"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct((prev) => ({ ...prev, price: Number(e.target.value) }))}
                          />
                        </div>
                        <div>
                          <Label>Market Price *</Label>
                          <Input
                            type="number"
                            value={newProduct.marketPrice}
                            onChange={(e) =>
                              setNewProduct((prev) => ({ ...prev, marketPrice: Number(e.target.value) }))
                            }
                          />
                        </div>
                        <div>
                          <Label>Unit</Label>
                          <Select
                            value={newProduct.unit}
                            onValueChange={(value) => setNewProduct((prev) => ({ ...prev, unit: value }))}
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
                          value={newProduct.category}
                          onValueChange={(value: "vegetable" | "fruit") =>
                            setNewProduct((prev) => ({ ...prev, category: value }))
                          }
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
                          value={newProduct.description}
                          onChange={(e) => setNewProduct((prev) => ({ ...prev, description: e.target.value }))}
                          placeholder="Product description"
                        />
                      </div>
                      <Button onClick={addProduct} className="w-full">
                        Add Product
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Category Filter for Admin */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAdminCategory("all")}
                className={selectedAdminCategory === "all" ? "bg-green-100" : ""}
              >
                All ({products.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAdminCategory("vegetable")}
                className={selectedAdminCategory === "vegetable" ? "bg-green-100" : ""}
              >
                Vegetables ({products.filter((p) => p.category === "vegetable").length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAdminCategory("fruit")}
                className={selectedAdminCategory === "fruit" ? "bg-green-100" : ""}
              >
                Fruits ({products.filter((p) => p.category === "fruit").length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedAdminCategory("no-image")}
                className={selectedAdminCategory === "no-image" ? "bg-red-100" : ""}
              >
                No Images ({products.filter((p) => !p.imageUrl).length})
              </Button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAdminProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onUpdate={() => {
                    setEditingProduct(product)
                    setIsEditImageOpen(true)
                  }}
                  onDelete={() => deleteProduct(product.id)}
                  onToggleStock={() => toggleStock(product.id)}
                  onEditImage={() => { }}
                />
              ))}
            </div>

            {filteredAdminProducts.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No products found in this category.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Customer Management */}
        <Card>
          <CardHeader>
            <CardTitle>Customer Database ({customers.length} customers)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {customers.map((customer, index) => (
                <CustomerCard key={index} customer={customer} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
