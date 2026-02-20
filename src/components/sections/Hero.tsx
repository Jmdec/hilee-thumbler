"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

interface Product {
  id: number
  name: string
  description: string
  price: number
  category: string
  image: string
  is_featured: boolean
}

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedproduct, setSelectedproduct] = useState<Product | null>(null)
  const [selectedproductIndex, setSelectedproductIndex] = useState<number>(0)
  const getImageUrl = (imagePath: string): string => {
    if (!imagePath) return "/placeholder.svg"
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath
    const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const fullPath = imagePath.startsWith("images/products/") ? imagePath : `images/products/${imagePath}`
    return `${BASE}/${fullPath}`
  }

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const response = await fetch("/api/products?paginate=false")
        if (!response.ok) throw new Error(`Failed to fetch products: ${response.status}`)

        const data = await response.json()
        const products = Array.isArray(data) ? data : []
        setProducts(products)
      } catch (error) {
        console.error("Error fetching all products:", error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchAllProducts()
  }, [])

  useEffect(() => {
    if (products.length === 0 || selectedproduct !== null) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % products.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [products.length, selectedproduct])

  const handleCardClick = (product: Product, offset: number, index: number) => {
    if (offset === 0) {
      setSelectedproduct(product)
      setSelectedproductIndex(index)
    }
  }

  const handleModalNext = () => {
    const nextIndex = (selectedproductIndex + 1) % products.length
    setSelectedproductIndex(nextIndex)
    setSelectedproduct(products[nextIndex])
  }

  const handleModalPrev = () => {
    const prevIndex = selectedproductIndex === 0 ? products.length - 1 : selectedproductIndex - 1
    setSelectedproductIndex(prevIndex)
    setSelectedproduct(products[prevIndex])
  }

  const handleAddToCart = (product: Product) => {
    // Check if user is logged in
    const isLoggedIn = !!localStorage.getItem("userToken") // replace with your auth logic
    if (!isLoggedIn) {
      window.location.href = "/login"
    } else {
      // Add to cart API call
      fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      })
        .then((res) => {
          if (res.ok) {
            alert(`${product.name} added to cart!`)
          } else {
            alert("Failed to add product to cart.")
          }
        })
        .catch(() => alert("Error adding product to cart."))
    }
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[70vh] lg:min-h-[70vh] flex items-center justify-center bg-purple-900 overflow-hidden py-8 lg:py-0">
        {/* Gradient Backgrounds */}
        <div className="absolute top-20 left-16 w-64 h-64 bg-gradient-to-br from-purple-400/30 to-purple-400/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-24 w-48 h-48 bg-gradient-to-br from-purple-500/25 to-purple-500/25 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-80 h-80 bg-gradient-to-br from-purple-300/20 to-purple-300/20 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute bottom-20 right-1/3 w-56 h-56 bg-gradient-to-br from-purple-400/30 to-purple-400/30 rounded-full blur-2xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-gradient-to-br from-purple-400/15 to-purple-400/15 rounded-full blur-3xl animate-pulse delay-300"></div>
        <div className="absolute top-10 right-10 w-40 h-40 bg-gradient-to-br from-purple-500/35 to-purple-500/35 rounded-full blur-xl animate-pulse delay-200"></div>

        <div className="container mx-auto px-4 py-8 lg:py-20 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-16">
              {/* Left side - Text content */}
              <div className="flex-1 text-center lg:text-left lg:mx-12 text-white order-1 max-w-xl lg:w-full">
                <p className="text-6xl font-semibold text-purple-100 mb-4">
                  Stay Hydrated,<br /> <span className="text-purple-400 font-bold">Stay Fresh</span>
                </p>
                <p className="max-w-md lg:max-w-lg text-xl mb-6 text-purple-50 italic leading-relaxed px-4 lg:px-0">
                  Insulated stainless steel tumblers that keep your drinks cold for 24 hours — crafted for style, built for life.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center lg:justify-start px-4 lg:px-0">
                  <Button
                    asChild
                    size="lg"
                    className="bg-purple-500 hover:from-purple-800 hover:to-purple-700 text-base lg:text-lg px-6 lg:px-8 py-5 lg:py-6 shadow-xl text-white border-0"
                  >
                    <Link href="/menu">Explore Products</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="text-base lg:text-lg px-6 lg:px-8 py-5 lg:py-6 border-2 border-purple-100 text-purple-100 hover:bg-purple-100 hover:text-black bg-transparent"
                  >
                    <Link href="/reservations">Learn More</Link>
                  </Button>
                </div>
              </div>

              {/* Right side - 3D Carousel */}
              <div className="flex-1 flex flex-col items-center order-1 lg:order-2 w-full px-12 lg:px-0">
                {loading ? (
                  <div className="w-72 h-80 lg:w-80 lg:h-96 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
                  </div>
                ) : products.length === 0 ? (
                  <div className="w-72 h-80 lg:w-80 lg:h-96 flex items-center justify-center text-purple-100 text-center px-4">
                    <p>No products available at the moment.</p>
                  </div>
                ) : (
                  <div className="relative w-full">
                    {/* Carousel Navigation */}
                    {products.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentSlide(prev => prev === 0 ? products.length - 1 : prev - 1)}
                          className="absolute -left-4 lg:left-0 top-1/2 -translate-y-1/2 z-[100] bg-black/70 hover:bg-black/90 text-purple-400 p-2 lg:p-3 rounded-full shadow-xl transition-all hover:scale-110"
                          aria-label="Previous slide"
                        >
                          <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
                        </button>

                        <button
                          onClick={() => setCurrentSlide(prev => (prev + 1) % products.length)}
                          className="absolute -right-4 lg:right-0 top-1/2 -translate-y-1/2 z-[100] bg-black/70 hover:bg-black/90 text-purple-400 p-2 lg:p-3 rounded-full shadow-xl transition-all hover:scale-110"
                          aria-label="Next slide"
                        >
                          <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
                        </button>
                      </>
                    )}

                    <div className="relative w-72 h-80 lg:w-80 lg:h-96 mx-auto mb-4 lg:mb-8" style={{ perspective: "1000px" }}>
                      {products.map((product, i) => {
                        if (products.length === 0) return null

                        // ⭐ Apple style circular offset (key part)
                        let offset = i - currentSlide
                        const half = Math.floor(products.length / 2)

                        if (offset > half) offset -= products.length
                        if (offset < -half) offset += products.length

                        const isActive = offset === 0
                        const abs = Math.abs(offset)

                        // ⭐ Apple style transforms
                        const translateX = offset * 220
                        const scale = isActive ? 1 : 0.82
                        const rotate = offset * 18
                        const zIndex = 50 - abs

                        // hide far cards (Apple style)
                        if (abs > 2) return null

                        return (
                          <div
                            key={product.id}
                            onClick={() => handleCardClick(product, offset, i)}
                            className="absolute inset-0 flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(.22,1,.36,1)]"
                            style={{
                              transform: `
                                translateX(${translateX}px)
                                scale(${scale})
                                rotateY(${rotate}deg)
                              `,
                              zIndex,
                              backfaceVisibility: "hidden",
                              WebkitBackfaceVisibility: "hidden",
                              transformStyle: "preserve-3d",
                              filter: isActive ? "none" : "brightness(.75)",
                              opacity: abs > 2 ? 0 : 1,
                              pointerEvents: isActive ? "auto" : "auto",
                            }}
                          >
                            <div className="bg-white rounded-2xl overflow-hidden border border-purple-200 shadow-2xl h-full w-full max-w-[320px] cursor-pointer">
                              <div className="relative h-48 lg:h-64 overflow-hidden">
                                <Image
                                  src={getImageUrl(product.image)}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                  sizes="320px"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              </div>

                              <div className="px-4 pt-2 pb-4 text-left">
                                <h3 className="text-lg lg:text-xl font-semibold mb-1 text-purple-700">
                                  {product.name}
                                </h3>

                                {product.price > 0 && (
                                  <p className="text-lg font-bold mb-2 text-purple-600">
                                    ₱{Number(product.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </p>
                                )}

                                {isActive && (
                                  <Button
                                    className="w-full bg-purple-500 hover:bg-purple-600 text-white mt-auto"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedproduct(product)
                                      setSelectedproductIndex(i)
                                    }}
                                  >
                                    Read More →
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}

                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Popup */}
      {selectedproduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setSelectedproduct(null)}
        >
          {/* Navigation Arrows */}
          {products.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); handleModalPrev() }} className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-[60] bg-black/70 hover:bg-black/90 text-purple-400 rounded-full p-2 md:p-3 transition-all hover:scale-110 shadow-xl border border-purple-400/30"> <ChevronLeft className="w-6 h-6 md:w-7 md:h-7" /> </button>
              <button onClick={(e) => { e.stopPropagation(); handleModalNext() }} className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-[60] bg-black/70 hover:bg-black/90 text-purple-400 rounded-full p-2 md:p-3 transition-all hover:scale-110 shadow-xl border border-purple-400/30"> <ChevronRight className="w-6 h-6 md:w-7 md:h-7" /> </button>
            </>
          )}

          <div
            className="relative bg-gradient-to-br from-black to-purple-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-purple-400/30 animate-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={() => setSelectedproduct(null)} className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors">
              <X size={24} />
            </button>

            <div className="relative h-64 md:h-80 overflow-hidden rounded-t-2xl">
              <Image src={getImageUrl(selectedproduct.image)} alt={selectedproduct.name} fill className="object-cover" placeholder="blur" blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RlZGVkZSIvPjwvc3ZnPg==" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              {products.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/70 text-purple-400 px-3 py-1 rounded-full text-sm font-medium">
                  {selectedproductIndex + 1} / {products.length}
                </div>
              )}
            </div>

            <div className="p-6 md:p-8">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-purple-700/50 text-purple-200 text-sm rounded-full mb-3">{selectedproduct.category}</span>
                <h2 className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">{selectedproduct.name}</h2>
                {selectedproduct.price > 0 && (
                  <p className="text-2xl md:text-3xl font-bold text-purple-300 mt-2">₱{Number(selectedproduct.price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>
                )}
              </div>

              <div className="text-purple-100 text-base md:text-lg leading-relaxed space-y-4">{selectedproduct.description}</div>

              {/* Add to Cart Button */}
              <div className="mt-6">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-800 hover:to-purple-700 text-white"
                  onClick={() => handleAddToCart(selectedproduct)}
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
