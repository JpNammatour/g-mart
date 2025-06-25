"use client"

import { useState, useEffect } from "react"
import { ShoppingCart, Plus, Minus, Phone, MapPin, User, Landmark, Star, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

interface CartItem extends Product {
  quantity: number
  selectedUnit: string
  actualQuantity: number
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

export default function GrameenMart() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<"all" | "vegetable" | "fruit">("all")
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: "",
    mobile: "",
    place: "",
    landmark: "",
    loyaltyPoints: 0,
    orderCount: 0,
  })
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [bannerText, setBannerText] = useState("🎉 Special Offer: Free delivery on orders above ₹500! 🎉")
  const [customers, setCustomers] = useState<CustomerInfo[]>([])
  const [pointsToRedeem, setPointsToRedeem] = useState(0)
  const { toast } = useToast()

  // Load products from localStorage or use Kerala products
  const loadProducts = () => {
    const savedProducts = localStorage.getItem("grameenMartProducts")
    if (savedProducts) {
      const parsedProducts = JSON.parse(savedProducts)
      setProducts(parsedProducts)
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

  // Load customer info when mobile number changes
  useEffect(() => {
    if (customerInfo.mobile.length === 10) {
      const existingCustomer = customers.find((c) => c.mobile === customerInfo.mobile)
      if (existingCustomer) {
        setCustomerInfo(existingCustomer)
        toast({
          title: "Welcome back!",
          description: `Your saved address has been loaded. You have ${existingCustomer.loyaltyPoints} loyalty points.`,
        })
      }
    }
  }, [customerInfo.mobile, customers, toast])

  const filteredProducts =
    selectedCategory === "all" ? products : products.filter((product) => product.category === selectedCategory)

  const addToCart = (product: Product, selectedUnit: string, actualQuantity: number) => {
    if (!product.inStock) {
      toast({
        title: "Out of Stock",
        description: `${product.name} is currently out of stock.`,
        variant: "destructive",
      })
      return
    }

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id && item.selectedUnit === selectedUnit)
      if (existingItem) {
        toast({
          title: "Item Updated",
          description: `${product.name} quantity updated in cart.`,
        })
        return prevCart.map((item) =>
          item.id === product.id && item.selectedUnit === selectedUnit
            ? { ...item, quantity: item.quantity + 1, actualQuantity: item.actualQuantity + actualQuantity }
            : item,
        )
      }
      toast({
        title: "Added to Cart",
        description: `${product.name} (${product.malayalamName}) has been added to your cart.`,
      })
      return [...prevCart, { ...product, quantity: 1, selectedUnit, actualQuantity }]
    })
  }

  const removeFromCart = (productId: number, selectedUnit: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === productId && item.selectedUnit === selectedUnit)
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((item) =>
          item.id === productId && item.selectedUnit === selectedUnit
            ? {
                ...item,
                quantity: item.quantity - 1,
                actualQuantity: item.actualQuantity - item.actualQuantity / item.quantity,
              }
            : item,
        )
      }
      return prevCart.filter((item) => !(item.id === productId && item.selectedUnit === selectedUnit))
    })
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const unitMultiplier = item.selectedUnit === "gram" ? 0.001 : 1
      const effectivePrice =
        item.selectedUnit === "piece" ? item.price : item.price * item.actualQuantity * unitMultiplier
      return total + effectivePrice * item.quantity
    }, 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const generateWhatsAppMessage = () => {
    const orderDetails = cart
      .map((item) => {
        const unitMultiplier = item.selectedUnit === "gram" ? 0.001 : 1
        const effectivePrice =
          item.selectedUnit === "piece" ? item.price : item.price * item.actualQuantity * unitMultiplier
        const totalPrice = effectivePrice * item.quantity
        return `${item.name} (${item.malayalamName}) - ${item.quantity} x ${item.actualQuantity}${item.selectedUnit} @ ₹${effectivePrice.toFixed(2)} = ₹${totalPrice.toFixed(2)}`
      })
      .join("\n")

    const subtotal = getTotalPrice()
    const pointsDiscount = pointsToRedeem * 1
    const total = subtotal - pointsDiscount

    const message = `🛒 *Grameen Mart Order*

👤 *Customer Details:*
Name: ${customerInfo.name}
Mobile: ${customerInfo.mobile}
Place: ${customerInfo.place}
Landmark: ${customerInfo.landmark}
Loyalty Points: ${customerInfo.loyaltyPoints}

📦 *Order Details:*
${orderDetails}

💰 *Bill Summary:*
Subtotal: ₹${subtotal.toFixed(2)}
${pointsDiscount > 0 ? `Points Discount: -₹${pointsDiscount.toFixed(2)}` : ""}
*Total Amount: ₹${total.toFixed(2)}*

🎁 *Points Earned: +2 points*
🚚 *Delivery Time: Within 15 minutes*

Thank you for choosing Grameen Mart! 🌿`

    return encodeURIComponent(message)
  }

  const handleWhatsAppOrder = () => {
    if (!customerInfo.name || !customerInfo.mobile || !customerInfo.place) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required customer details",
        variant: "destructive",
      })
      return
    }

    if (cart.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Please add items to cart before placing order",
        variant: "destructive",
      })
      return
    }

    if (pointsToRedeem > customerInfo.loyaltyPoints) {
      toast({
        title: "Insufficient Points",
        description: "You don't have enough loyalty points to redeem",
        variant: "destructive",
      })
      return
    }

    const updatedCustomer = {
      ...customerInfo,
      loyaltyPoints: customerInfo.loyaltyPoints - pointsToRedeem + 2,
      orderCount: customerInfo.orderCount + 1,
      lastOrderAt: new Date().toISOString(),
    }

    const updatedCustomers = customers.filter((c) => c.mobile !== customerInfo.mobile)
    updatedCustomers.push(updatedCustomer)
    setCustomers(updatedCustomers)
    setCustomerInfo(updatedCustomer)
    localStorage.setItem("grameenMartCustomers", JSON.stringify(updatedCustomers))

    const message = generateWhatsAppMessage()
    const whatsappUrl = `https://wa.me/919744083698?text=${message}`
    window.open(whatsappUrl, "_blank")

    setCart([])
    setPointsToRedeem(0)
    setIsCheckoutOpen(false)

    toast({
      title: "Order Placed!",
      description: "Your order has been sent via WhatsApp. You earned 2 loyalty points!",
    })
  }

  return (
    <div className="min-h-screen bg-green-50">
      <Toaster />

      {/* Banner */}
      {bannerText && (
        <div className="bg-red-600 text-white text-center py-2 px-4">
          <p className="text-sm font-medium">{bannerText}</p>
        </div>
      )}

      {/* Header */}
      <header className="bg-green-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center space-x-2 hover:bg-green-700 rounded-lg p-2 transition-colors"
            >
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-green-600 font-bold text-xl">🌿</span>
              </div>
              <div className="text-left">
                <h1 className="text-2xl font-bold">Grameen Mart</h1>
                <p className="text-green-100 text-sm">Fresh Kerala Vegetables & Fruits</p>
              </div>
            </button>

            <div className="flex items-center space-x-2">
              {customerInfo.mobile && (
                <div className="text-right text-sm">
                  <p className="text-green-100">Welcome, {customerInfo.name || "Customer"}</p>
                  <div className="flex items-center text-yellow-300">
                    <Star className="w-4 h-4 mr-1" />
                    <span>{customerInfo.loyaltyPoints} points</span>
                  </div>
                </div>
              )}

              <Button variant="ghost" size="sm" onClick={loadProducts} className="text-white hover:bg-green-700">
                <RefreshCw className="w-4 h-4" />
              </Button>

              <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="relative">
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Cart
                    {getTotalItems() > 0 && (
                      <Badge className="absolute -top-2 -right-2 bg-red-500">{getTotalItems()}</Badge>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Your Order</DialogTitle>
                  </DialogHeader>

                  <div className="space-y-6">
                    {/* Customer Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Customer Information</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Name *</Label>
                          <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="name"
                              placeholder="Enter your name"
                              className="pl-10"
                              value={customerInfo.name}
                              onChange={(e) => setCustomerInfo((prev) => ({ ...prev, name: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="mobile">Mobile Number *</Label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="mobile"
                              placeholder="Enter mobile number"
                              className="pl-10"
                              value={customerInfo.mobile}
                              onChange={(e) => setCustomerInfo((prev) => ({ ...prev, mobile: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="place">Place *</Label>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="place"
                              placeholder="Enter your place"
                              className="pl-10"
                              value={customerInfo.place}
                              onChange={(e) => setCustomerInfo((prev) => ({ ...prev, place: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="landmark">Landmark</Label>
                          <div className="relative">
                            <Landmark className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                              id="landmark"
                              placeholder="Enter landmark"
                              className="pl-10"
                              value={customerInfo.landmark}
                              onChange={(e) => setCustomerInfo((prev) => ({ ...prev, landmark: e.target.value }))}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Loyalty Points */}
                      {customerInfo.loyaltyPoints >= 50 && (
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                          <h4 className="font-semibold text-yellow-800 mb-2">🎁 Redeem Loyalty Points</h4>
                          <p className="text-sm text-yellow-700 mb-2">
                            You have {customerInfo.loyaltyPoints} points. Redeem 50 points = ₹50 discount
                          </p>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              placeholder="Points to redeem"
                              min="0"
                              max={Math.floor(customerInfo.loyaltyPoints / 50) * 50}
                              step="50"
                              value={pointsToRedeem}
                              onChange={(e) => setPointsToRedeem(Number(e.target.value))}
                              className="w-32"
                            />
                            <span className="text-sm text-gray-600">= ₹{pointsToRedeem} discount</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cart Items */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Order Items</h3>
                      {cart.length === 0 ? (
                        <p className="text-gray-500">Your cart is empty</p>
                      ) : (
                        <div className="space-y-2">
                          {cart.map((item, index) => {
                            const unitMultiplier = item.selectedUnit === "gram" ? 0.001 : 1
                            const effectivePrice =
                              item.selectedUnit === "piece"
                                ? item.price
                                : item.price * item.actualQuantity * unitMultiplier
                            const totalPrice = effectivePrice * item.quantity
                            return (
                              <div
                                key={`${item.id}-${index}`}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center space-x-3">
                                  <Image
                                    src={item.imageUrl || item.image || "/placeholder.svg"}
                                    alt={item.name}
                                    width={50}
                                    height={50}
                                    className="rounded-lg object-cover"
                                  />
                                  <div>
                                    <h4 className="font-medium">
                                      {item.name} ({item.malayalamName})
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                      {item.actualQuantity}
                                      {item.selectedUnit} @ ₹{effectivePrice.toFixed(2)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => removeFromCart(item.id, item.selectedUnit)}
                                  >
                                    <Minus className="w-4 h-4" />
                                  </Button>
                                  <span className="w-8 text-center">{item.quantity}</span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => addToCart(item, item.selectedUnit, item.actualQuantity)}
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                  <span className="w-20 text-right font-medium">₹{totalPrice.toFixed(2)}</span>
                                </div>
                              </div>
                            )
                          })}
                          <div className="border-t pt-4 space-y-2">
                            <div className="flex justify-between items-center">
                              <span>Subtotal:</span>
                              <span>₹{getTotalPrice().toFixed(2)}</span>
                            </div>
                            {pointsToRedeem > 0 && (
                              <div className="flex justify-between items-center text-green-600">
                                <span>Points Discount:</span>
                                <span>-₹{pointsToRedeem.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                              <span>Total:</span>
                              <span>₹{(getTotalPrice() - pointsToRedeem).toFixed(2)}</span>
                            </div>
                            <p className="text-sm text-green-600 text-center">
                              🎁 You'll earn 2 loyalty points with this order!
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Delivery Information */}
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">🚚</span>
                        <div>
                          <h4 className="font-semibold text-green-800">Fast Delivery</h4>
                          <p className="text-sm text-green-700">Your order will be delivered within 15 minutes!</p>
                        </div>
                      </div>
                    </div>

                    {/* WhatsApp Order Button */}
                    <Button onClick={handleWhatsAppOrder} className="w-full bg-green-600 hover:bg-green-700" size="lg">
                      <Phone className="w-5 h-5 mr-2" />
                      Order via WhatsApp
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Category Filter */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            onClick={() => setSelectedCategory("all")}
            className={selectedCategory === "all" ? "bg-green-600" : ""}
          >
            All Products
          </Button>
          <Button
            variant={selectedCategory === "vegetable" ? "default" : "outline"}
            onClick={() => setSelectedCategory("vegetable")}
            className={selectedCategory === "vegetable" ? "bg-green-600" : ""}
          >
            Vegetables
          </Button>
          <Button
            variant={selectedCategory === "fruit" ? "default" : "outline"}
            onClick={() => setSelectedCategory("fruit")}
            className={selectedCategory === "fruit" ? "bg-green-600" : ""}
          >
            Fruits
          </Button>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-green-800 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-xl font-bold mb-2">Grameen Mart</h3>
          <p className="text-green-200">Fresh Kerala Vegetables & Fruits delivered to your doorstep</p>
          <p className="text-green-300 mt-2">📱 Order via WhatsApp for quick delivery</p>
          <div className="mt-4 text-sm text-green-200">
            <p>🎁 Earn 2 loyalty points with every order</p>
            <p>💰 Redeem 50 points = ₹50 discount</p>
            <p>🚚 Fast delivery within 15 minutes</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function ProductCard({
  product,
  onAddToCart,
}: {
  product: Product
  onAddToCart: (product: Product, unit: string, quantity: number) => void
}) {
  const [selectedUnit, setSelectedUnit] = useState(product.unit === "piece" ? "piece" : "kg")
  const [quantity, setQuantity] = useState(product.unit === "piece" ? 1 : 1)

  const getUnitOptions = () => {
    if (product.unit === "piece") return ["piece"]
    if (product.unit === "bunch") return ["bunch"]
    return ["gram", "kg"]
  }

  const handleAddToCart = () => {
    onAddToCart(product, selectedUnit, quantity)
  }

  const savings = product.marketPrice - product.price

  return (
    <Card className={`overflow-hidden hover:shadow-lg transition-shadow ${!product.inStock ? "opacity-60" : ""}`}>
      <CardHeader className="p-0 relative">
        <Image
          src={product.imageUrl || product.image || "/placeholder.svg"}
          alt={product.name}
          width={300}
          height={200}
          className="w-full h-48 object-cover"
        />
        {!product.inStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <Badge variant="destructive" className="text-lg px-4 py-2">
              Out of Stock
            </Badge>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-lg">
            {product.name}
            <div className="text-sm font-normal text-gray-600">{product.malayalamName}</div>
          </CardTitle>
          <Badge variant={product.category === "vegetable" ? "default" : "secondary"}>{product.category}</Badge>
        </div>
        <p className="text-sm text-gray-600 mb-3">{product.description}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold text-green-600">
                ₹{product.price}/{product.unit}
              </span>
              <div className="text-sm">
                <span className="line-through text-red-500">₹{product.marketPrice}</span>
                <span className="text-green-600 ml-2">Save ₹{savings}</span>
              </div>
            </div>
          </div>

          {product.unit !== "piece" && product.unit !== "bunch" && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Unit</Label>
                <Select value={selectedUnit} onValueChange={setSelectedUnit}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getUnitOptions().map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  max={selectedUnit === "gram" ? "1000" : "10"}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="h-8"
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={handleAddToCart}
          className="w-full bg-green-600 hover:bg-green-700"
          disabled={!product.inStock}
        >
          <Plus className="w-4 h-4 mr-2" />
          {product.inStock ? "Add to Cart" : "Out of Stock"}
        </Button>
      </CardFooter>
    </Card>
  )
}
