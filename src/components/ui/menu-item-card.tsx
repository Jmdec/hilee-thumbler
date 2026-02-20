"use client"
import Image from "next/image"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Flame, Leaf, ShoppingCart } from "lucide-react"
import { useCartStore } from "@/store/cartStore"
import { useAuthStore } from "@/store/authStore"
import { toast } from "@/hooks/use-toast"
import type { MenuItem } from "@/types"
import { useRouter } from "next/navigation"

const CartPlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 576 512"
    fill="currentColor"
    className="w-3.5 h-3.5"
  >
    <path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96zM252 160c0 11 9 20 20 20h44v44c0 11 9 20 20 20s20-9 20-20V180h44c11 0 20-9 20-20s-9-20-20-20H356V96c0-11-9-20-20-20s-20 9-20 20v44H272c-11 0-20 9-20 20z" />
  </svg>
)

interface MenuItemCardProps {
  item: MenuItem
}

export default function MenuItemCard({ item }: MenuItemCardProps) {
  const addItem = useCartStore((state) => state.addItem)
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const router = useRouter()

  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === "number" ? price : Number.parseFloat(String(price))
    return numPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  const getImageUrl = (imagePath: string): string => {
    if (!imagePath) return "/placeholder.svg"
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath
    const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const fullPath = imagePath.startsWith("images/products/") ? imagePath : `images/products/${imagePath}`
    return `${BASE}/${fullPath}`
  }
  const handleAddToCart = () => {
    if (!isLoggedIn) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to add items to your cart.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    addItem(item)
    toast({
      title: "Added to cart!",
      description: `${item.name} has been added to your cart.`,
    })
  }

  return (
    <>
      <Card className="overflow-hidden bg-white border border-gray-200 shadow-md hover:shadow-xl transition-all duration-300 relative flex flex-col h-full hover:border-purple-400 p-0">
        <div className="absolute top-1.5 right-1.5 z-20 sm:hidden">
          <Button
            onClick={handleAddToCart}
            size="sm"
            className="w-6 h-6 rounded-full bg-purple-500 text-white hover:bg-purple-600 font-bold shadow-lg border border-white transition-all duration-300 p-0 flex items-center justify-center"
          >
            <CartPlusIcon />
          </Button>
        </div>

        <CardContent className="p-0 text-center flex-1 flex flex-col">
          <div className="flex justify-center flex-shrink-0">
            <div className="w-full h-48 sm:h-56 md:h-64 overflow-hidden">
              <Image
                src={getImageUrl(item.image) || "/placeholder.svg"}
                alt={item.name}
                width={300}
                height={180}
                className="object-cover w-full h-full transition-transform duration-300 hover:scale-110"
              />
            </div>
          </div>

          <div className="p-3">
            <div className="flex-shrink-0 mb-0.5 min-h-[1.5rem] sm:min-h-[1.8rem] flex items-center justify-center px-1 mt-1 sm:mt-1.5">
              <h3 className={`font-bold text-black uppercase leading-tight line-clamp-1 
              ${item.name.length > 35 ? 'text-[7px] md:text-[11px] tracking-tighter' :
                  item.name.length > 25 ? 'text-[8px] md:text-[12px] tracking-tight' :
                    item.name.length > 20 ? 'text-[10px] md:text-xs tracking-tight' :
                      'text-xs sm:text-sm md:text-base tracking-wide'
                }`}>
                {item.name}
              </h3>
            </div>

            <div className="flex-shrink-0 px-2">
              <div className="flex justify-center items-center gap-0.5 sm:gap-0 flex-shrink-0 mb-2">
                <span className="text-sm sm:text-base md:text-lg font-bold text-purple-900">
                  ₱ {formatPrice(item.price)}
                </span>
              </div>
              <Dialog>
                <div className="flex justify-between">
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-4 border rounder-md bg-purple-300 text-purple-500 hover:bg-purple-500 hover:text-purple-200"
                    >
                      View Details
                    </Button>
                  </DialogTrigger>

                  <Button
                    onClick={handleAddToCart}
                    className="p-4 border rounder-md bg-purple-500 text-purple-200 hover:bg-purple-300 hover:text-purple-500"
                    size="sm"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                </div>
                <DialogContent
                  className="
                    w-full h-[60vh] md:h-[80vh] max-w-2xl sm:rounded-2xl lg:max-w-3xl p-4 sm:p-6
                    bg-purple-50 flex flex-col sm:flex-row overflow-y-auto
                    "
                >
                  {/* Image */}
                  <div className="flex-1 mb-4 sm:mb-0 sm:mr-4 flex items-center justify-center">
                    {item.image && (
                      <div className="relative w-full h-64 sm:h-full rounded-lg overflow-hidden">
                        <Image
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          fill
                          className="object-contain rounded-lg"
                          placeholder="blur"
                          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RlZGVkZSIvPjwvc3ZnPg=="
                        />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h2 className="text-xl lg:text-3xl font-bold text-purple-700 mb-2">
                        {item.name}
                      </h2>
                      <p className="text-gray-700 text-sm sm:text-base mb-4">
                        <span className="font-bold">Details: </span>
                        {item.description}
                      </p>
                      <p className="text-lg lg:text-2xl font-bold text-purple-600 mb-4">
                        ₱{Number(item.price).toLocaleString()}
                      </p>
                    </div>

                    <Button
                      onClick={handleAddToCart}
                      className="w-full bg-purple-500 hover:bg-purple-600 text-white font-bold border border-purple-600 text-sm sm:text-base py-2 sm:py-2.5"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}


