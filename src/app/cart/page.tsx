"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus, X, ShoppingBag } from "lucide-react"
import { useCartStore } from "@/store/cartStore"
import { toast } from "@/hooks/use-toast"


const formatPrice = (price: number): string => {
  return price.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const Cart = () => {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore()
  const total = getTotal()

  const handleQuantityChange = (itemId: string | number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId)
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart.",
      })
    } else {
      updateQuantity(itemId, newQuantity)
    }
  }

  const handleRemoveItem = (itemId: string | number, itemName: string) => {
    removeItem(itemId)
    toast({
      title: "Item removed",
      description: `${itemName} has been removed from your cart.`,
    })
  }

  const handleClearCart = () => {
    clearCart()
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart.",
    })
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-purple-50 to-amber-50">
          <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-100/20 to-amber-200/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-purple-100/15 to-amber-200/10 rounded-full blur-lg animate-pulse delay-1000"></div>
          <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-br from-purple-100/10 to-amber-200/5 rounded-full blur-2xl animate-pulse delay-2000"></div>
          <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-gradient-to-br from-purple-100/15 to-amber-200/10 rounded-full blur-xl animate-pulse delay-500"></div>
        </div>

        <div className="relative z-10 py-8">
          <div className="container mx-auto px-4">
            <div className="text-center py-16">
              <div className="backdrop-blur-sm bg-white/95 rounded-3xl p-12 max-w-md mx-auto border border-purple-200 shadow-lg">
                <div className="relative">
                  <ShoppingBag className="w-24 h-24 text-purple-400 mx-auto mb-6" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center"></div>
                </div>
                <h1 className="text-3xl font-bold mb-4 text-gray-900 text-balance">Your Cart is Empty</h1>
                <p className="text-xl text-gray-700 mb-8 text-pretty"> 
                  Looks like you haven&apos;t added any delicious Japanese dishes yet!
                </p>
                <Button
                  asChild
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-bold"
                >
                  <Link href="/menu">Browse Our Menu</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-purple-50">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-purple-50 to-amber-50">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-100/20 to-amber-200/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-purple-100/15 to-amber-200/10 rounded-full blur-lg animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-br from-purple-100/10 to-amber-200/5 rounded-full blur-2xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-gradient-to-br from-purple-100/15 to-amber-200/10 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <h1 className="text-3xl font-bold text-gray-900 text-balance">
                    Your Cart ({items.length} {items.length === 1 ? "item" : "items"})
                  </h1>
                </div>
                <Button
                  variant="outline"
                  onClick={handleClearCart}
                  className="text-gray-700 hover:bg-purple-50 border-purple-300 hover:border-purple-400 backdrop-blur-sm bg-white/90"
                >
                  Clear Cart
                </Button>
              </div>

              <div className="space-y-4">
                {items.map((item) => {
                  const itemPrice = Number(item.price) || 0
                  const itemTotal = itemPrice * item.quantity

                  return (
                    <Card
                      key={item.id}
                      className="group hover:shadow-2xl transition-all duration-300 backdrop-blur-sm bg-white/98 border-purple-200 rounded-2xl overflow-hidden"
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="relative w-full sm:w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-purple-100 to-amber-100 shadow-md">
                            <Image
                              src={item.image || "/placeholder.svg?height=96&width=96&query=Japanese food"}
                              alt={item.name}
                              width={100}
                              height={100}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = "/japanese-food.jpg"
                              }}
                            />
                          </div>

                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                                <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveItem(item.id, item.name)}
                                className="text-gray-400 hover:text-gray-600 hover:bg-purple-100 rounded-full"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-purple-50 border-purple-300 text-gray-700"
                                >
                                  {item.category}
                                </Badge>
                                {item.isSpicy && <Badge className="text-xs bg-red-500 text-white">🌶️ Spicy</Badge>}
                                {item.isVegetarian && (
                                  <Badge className="text-xs bg-green-600 text-white">🌱 Veggie</Badge>
                                )}
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2 bg-purple-100 rounded-full p-1 border border-purple-300">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                    className="h-8 w-8 p-0 rounded-full hover:bg-purple-200 text-gray-700"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-8 text-center font-medium text-gray-900">{item.quantity}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                    className="h-8 w-8 p-0 rounded-full hover:bg-purple-200 text-gray-700"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>

                                <div className="text-right">
                                  <div className="text-sm text-gray-600">₱{formatPrice(itemPrice)} each</div>
                                  <div className="font-semibold text-lg text-gray-900">₱{formatPrice(itemTotal)}</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            <div className="lg:w-96">
              <Card className="sticky top-24 backdrop-blur-sm bg-white/98 border-purple-200 rounded-2xl shadow-lg overflow-hidden p-0">
                <div className="bg-purple-600 text-white px-6 py-4">
                  <h2 className="text-xl font-semibold flex items-center gap-2">🍱 Order Summary</h2>
                </div>
                <CardContent className="space-y-4 p-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="text-gray-600">₱{formatPrice(total)}</span>
                    </div>
                    <hr className="my-2 border-purple-200" />
                    <div className="flex justify-between font-semibold text-lg">
                      <span className="text-gray-900">Total</span>
                      <span className="text-gray-900">₱{formatPrice(total)}</span>
                    </div>
                  </div>

                  <Button
                    asChild
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 font-bold"
                    size="lg"
                  >
                    <Link href="/checkout">Proceed to Checkout</Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-purple-300 hover:bg-purple-50 rounded-xl bg-white text-gray-700 hover:text-gray-900"
                    size="lg"
                  >
                    <Link href="/products">Continue Shopping</Link>
                  </Button>

                  <div className="text-xs text-gray-600 text-center bg-purple-50 rounded-lg p-2 border border-purple-200">
                    🔒 Secure checkout • 日本料理 ❤️
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
