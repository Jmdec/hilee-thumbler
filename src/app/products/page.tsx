"use client"

import { useState, useEffect } from "react"
import type { MenuItem } from "@/types"
import MenuItemCard from "@/components/ui/menu-item-card"
import { Button } from "@/components/ui/button"
import { Loader2, Download, X } from "lucide-react"
import Image from "next/image"
import OppaLoader from "@/components/oppa-loader"

export default function MenuPage() {
  const [products, setProducts] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("All")

  // Install app states
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallPopup, setShowInstallPopup] = useState(false)
  const [showInstallButton, setShowInstallButton] = useState(false)

  // Handle PWA install prompt
  useEffect(() => {
    6
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallButton(true)

      // Show popup after 3 seconds on page load
      setTimeout(() => {
        setShowInstallPopup(true)
      }, 3000)
    }

    const handleAppInstalled = () => {
      setShowInstallPopup(false)
      setShowInstallButton(false)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstallApp = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setShowInstallPopup(false)
    }

    setDeferredPrompt(null)
  }

  const handleDismissPopup = () => {
    setShowInstallPopup(false)
  }

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/products?paginate=false")
        const data = await response.json()


        console.log("response", response);

        if (!response.ok) throw new Error("Failed to fetch products")


        const transformedProducts: MenuItem[] = data.map((product: any) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: typeof product.price === "string" ? Number.parseFloat(product.price) : product.price,
          quantity: product.quantity,
          image: product.image,
        }))

        setProducts(transformedProducts)
      } catch (err) {
        console.error(err)
        setError(err instanceof Error ? err.message : "Failed to fetch products")
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <OppaLoader />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-purple-900 flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-sm px-6 py-4 rounded-xl">
          <p className="text-yellow-100 font-medium mb-2">Failed to load menu</p>
          <p className="text-yellow-200/80 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-purple-50">
      {/* Install Button - Mobile Only */}
      {/* Temporarily always show for testing - remove 'true ||' when PWA is properly configured */}
      {(true || showInstallButton) && (
        <div className="fixed bottom-6 left-4 z-50 md:hidden">
          <Button
            onClick={handleInstallApp}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-2xl hover:shadow-xl transition-all duration-300 rounded-full px-5 py-3 border-2 border-white flex items-center gap-2"
            title="Install App"
          >
            <Download className="h-5 w-5" />
            <span className="text-sm font-semibold">Install App</span>
          </Button>
        </div>
      )}

      {/* Install App Popup */}
      {showInstallPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in zoom-in duration-300">
            {/* Close button */}
            <button
              onClick={handleDismissPopup}
              className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors bg-white/80 rounded-full p-1 hover:bg-white"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Top Section with Logo */}
            <div className="bg-gradient-to-br from-orange-500 to-red-500 pt-10 pb-8 px-6">
              <div className="flex justify-center mb-4">
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                  <Image
                    src="/logonew.png"
                    alt="Izakaya Logo"
                    width={140}
                    height={140}
                    className="object-cover"
                  />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white text-center mb-2">
                Install Izakaya App
              </h2>

              <p className="text-white/95 text-center text-sm leading-relaxed">
                Quick access • Faster ordering • Exclusive offers
              </p>
            </div>

            {/* Bottom Section with Buttons */}
            <div className="p-6 space-y-3">
              <Button
                onClick={handleInstallApp}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-6 text-base font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-300"
              >
                <Download className="h-5 w-5 mr-2" />
                Install Now
              </Button>

              <Button
                onClick={handleDismissPopup}
                variant="ghost"
                className="w-full text-gray-600 hover:bg-gray-100 py-3 rounded-xl"
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4">
        <div className="text-center my-6">
          <h1 className="text-4xl md:text-6xl font-bold text-purple-950 mb-4 drop-shadow-lg">Hilee Products</h1>
          <p className="text-purple-800 text-lg">Keep your drinks cold for 24 hours or hot for 12 — eco-friendly, reusable, and perfect for any lifestyle.</p>
        </div>

        {/* 
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={`${
                selectedCategory === category
                  ? "bg-yellow-400 text-black hover:bg-yellow-300"
                  : "bg-orange-600/30 text-yellow-100 border-orange-400/50 hover:bg-orange-600/50"
              } transition-all duration-200`}
            >
              {category}
            </Button>
          ))}
        </div>
        */}

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr mb-10">
          {products.map((product) => (
            <MenuItemCard key={product.id} item={product} />
          ))}
        </div>
      </div>
    </div>
  )
}
