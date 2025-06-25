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
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { allKeralaProducts } from "@/data/kerala-products"
import Image from "next/image"

interface Product {
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

interface CustomerInfo {
  name: string
  mobile: string
  place: string
  landmark: string
  loyaltyPoints: number
  orderCount: number
  createdAt?: string
  lastOrderAt?: string
}

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [credentials, setCredentials] = useState({ username: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<CustomerInfo[]>([])
  const [bannerText, setBannerText] = useState("")
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [isEditImageOpen, setIsEditImageOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const editFileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const [selectedAdminCategory, setSelectedAdminCategory] = useState<"all" | "vegetable" | "fruit" | "no-image">("all")

  // Filter products for admin view
  const filteredAdminProducts = products.filter((product) => {
    if (selectedAdminCategory === "all") return true
    if (selectedAdminCategory === "no-image") return !product.imageUrl
    return product.category === selectedAdminCategory
  })

  const [newProduct, setNewProduct] = useState({
    name: "",
    malayalamName: "",
    price: 0,
    marketPrice: 0,
    unit: "kg",
    category: "vegetable" as "vegetable" | "fruit",
    description: "",
    inStock: true,
    imageUrl: "",
  })

  // Load products from localStorage or use Kerala products
  const loadProducts = () => {
    const savedProducts = localStorage.getItem("grameenMartProducts")
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts))
    } else {
      // Convert Kerala products to the format expected by the app
      const convertedProducts = allKeralaProducts.map((product) => ({
        ...product,
        image: "/placeholder.svg?height=200&width=200",
        imageUrl: "/placeholder.svg?height=200&width=200",
        createdAt: new Date().toISOString(),
      }))
      setProducts(convertedProducts)
      localStorage.setItem("grameenMartProducts", JSON.stringify(convertedProducts))
    }
  }

  // Load data on component mount
  useEffect(() => {
    loadProducts()

    const savedCustomers = localStorage.getItem("grameenMartCustomers")
    const savedBanner = localStorage.getItem("grameenMartBanner")

    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers))
    }
    if (savedBanner) {
      setBannerText(savedBanner)
    }
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

  const saveData = () => {
    localStorage.setItem("grameenMartProducts", JSON.stringify(products))
    localStorage.setItem("grameenMartBanner", bannerText)
    localStorage.setItem("grameenMartCustomers", JSON.stringify(customers))
    toast({
      title: "Data Saved",
      description: "All changes have been saved successfully",
    })
  }

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

  const addProduct = () => {
    if (!newProduct.name || !newProduct.malayalamName || !newProduct.price) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const product: Product = {
      id: Date.now(),
      ...newProduct,
      image: "/placeholder.svg?height=200&width=200",
      createdAt: new Date().toISOString(),
    }

    const updatedProducts = [...products, product]
    setProducts(updatedProducts)
    localStorage.setItem("grameenMartProducts", JSON.stringify(updatedProducts))

    setNewProduct({
      name: "",
      malayalamName: "",
      price: 0,
      marketPrice: 0,
      unit: "kg",
      category: "vegetable",
      description: "",
      inStock: true,
      imageUrl: "",
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

  const updateProduct = (id: number, updates: Partial<Product>) => {
    const updatedProducts = products.map((p) =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p,
    )
    setProducts(updatedProducts)
    localStorage.setItem("grameenMartProducts", JSON.stringify(updatedProducts))

    toast({
      title: "Product Updated",
      description: "Product has been updated successfully",
    })
  }

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

  const deleteProduct = (id: number) => {
    const updatedProducts = products.filter((p) => p.id !== id)
    setProducts(updatedProducts)
    localStorage.setItem("grameenMartProducts", JSON.stringify(updatedProducts))
    toast({
      title: "Product Deleted",
      description: "Product has been deleted successfully",
    })
  }

  const toggleStock = (id: number) => {
    const product = products.find((p) => p.id === id)
    if (product) {
      updateProduct(id, { inStock: !product.inStock })
    }
  }

  const loadKeralaProducts = () => {
    const convertedProducts = allKeralaProducts.map((product) => ({
      ...product,
      image: "/placeholder.svg?height=200&width=200",
      imageUrl: "/placeholder.svg?height=200&width=200",
      createdAt: new Date().toISOString(),
    }))
    setProducts(convertedProducts)
    localStorage.setItem("grameenMartProducts", JSON.stringify(convertedProducts))
    toast({
      title: "Kerala Products Loaded",
      description: `Loaded ${convertedProducts.length} authentic Kerala products`,
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
              <Button variant="ghost" size="sm" onClick={loadProducts} className="text-white hover:bg-green-700">
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
                  value={bannerText}
                  onChange={(e) => setBannerText(e.target.value)}
                />
              </div>
              <div className="bg-red-600 text-white text-center py-2 px-4 rounded">
                <p className="text-sm font-medium">{bannerText || "Banner preview will appear here"}</p>
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
                <Button variant="outline" onClick={loadKeralaProducts} className="flex items-center space-x-2">
                  <span>Load Kerala Products</span>
                </Button>
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
                <Card key={product.id} className="overflow-hidden">
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
                      <Badge variant={product.category === "vegetable" ? "default" : "secondary"}>
                        {product.category}
                      </Badge>
                    </div>
                    {!product.inStock && (
                      <div className="absolute bottom-2 left-2">
                        <Badge variant="destructive">Out of Stock</Badge>
                      </div>
                    )}
                  </div>

                  <CardContent className="p-4">
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
                            onChange={(e) => updateProduct(product.id, { price: Number(e.target.value) })}
                            className="h-8 text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-xs">Market Price</Label>
                          <Input
                            type="number"
                            value={product.marketPrice}
                            onChange={(e) => updateProduct(product.id, { marketPrice: Number(e.target.value) })}
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
                  </CardContent>

                  <div className="p-4 pt-0 space-y-2">
                    {/* Stock Toggle */}
                    <Button
                      size="sm"
                      variant={product.inStock ? "default" : "destructive"}
                      onClick={() => toggleStock(product.id)}
                      className="w-full"
                    >
                      {product.inStock ? (
                        <>
                          <ToggleRight className="w-4 h-4 mr-1" />
                          In Stock
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4 mr-1" />
                          Out of Stock
                        </>
                      )}
                    </Button>

                    {/* Action Buttons */}
                    <div className="flex space-x-2">
                      <Dialog
                        open={isEditImageOpen && editingProduct?.id === product.id}
                        onOpenChange={setIsEditImageOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingProduct(product)}
                            className="flex-1"
                          >
                            <Upload className="w-4 h-4 mr-1" />
                            {product.imageUrl ? "Change" : "Add"} Photo
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>{editingProduct?.imageUrl ? "Change" : "Add"} Product Image</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>
                                Product: {editingProduct?.name} ({editingProduct?.malayalamName})
                              </Label>
                            </div>

                            <div>
                              <Label>Current Image</Label>
                              <div className="relative">
                                <Image
                                  src={editingProduct?.imageUrl || editingProduct?.image || "/placeholder.svg"}
                                  alt={editingProduct?.name || "Product"}
                                  width={300}
                                  height={200}
                                  className="w-full rounded-lg object-cover border"
                                />
                              </div>
                            </div>

                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                              <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                              <p className="text-sm text-gray-600 mb-2">Upload Product Image</p>
                              <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                              <Button
                                type="button"
                                variant="outline"
                                className="mt-2"
                                onClick={() => editFileInputRef.current?.click()}
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Choose File
                              </Button>
                              <input
                                ref={editFileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, true)}
                                className="hidden"
                              />
                            </div>

                            <div className="flex space-x-2">
                              <Button onClick={saveEditedProduct} className="flex-1">
                                Save Changes
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setEditingProduct(null)
                                  setIsEditImageOpen(false)
                                }}
                                className="flex-1"
                              >
                                Cancel
                              </Button>
                            </div>

                            {editingProduct?.imageUrl && (
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeImage(true)}
                                className="w-full"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Remove Image
                              </Button>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>

                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteProduct(product.id)}
                        className="px-3"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
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
                <div key={index} className="border rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-medium">{customer.name}</h4>
                      <p className="text-sm text-gray-600">📱 {customer.mobile}</p>
                      {customer.createdAt && (
                        <p className="text-xs text-gray-500">
                          Joined: {new Date(customer.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm">📍 {customer.place}</p>
                      {customer.landmark && <p className="text-sm text-gray-600">🏛️ {customer.landmark}</p>}
                      {customer.lastOrderAt && (
                        <p className="text-xs text-gray-500">
                          Last order: {new Date(customer.lastOrderAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center justify-end space-x-4">
                        <div className="text-center">
                          <p className="text-sm font-medium text-yellow-600">⭐ {customer.loyaltyPoints}</p>
                          <p className="text-xs text-gray-500">Points</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-green-600">📦 {customer.orderCount}</p>
                          <p className="text-xs text-gray-500">Orders</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
