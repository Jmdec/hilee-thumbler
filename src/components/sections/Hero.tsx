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

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        // Fetch ALL products from the Next.js API route
        const response = await fetch('/api/products?paginate=false')

        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status}`)
        }

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

  return (
    <>
      <section className="relative min-h-[70vh] lg:min-h-[70vh] flex items-center justify-center bg-purple-900 overflow-hidden py-8 lg:py-0">
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
              <div className="flex-1 text-center lg:text-left lg:ml-12 text-white order-1 max-w-xl lg:w-full">
                <p className="text-6xl font-semibold text-purple-100 mb-4">
                  Stay Hydrated,<br /> <span className="text-purple-400 font-bold">Stay Fresh</span>
                </p>

                <p className="max-w-md lg:max-w-lg text-xl mb-6 text-purple-50 italic leading-relaxed px-4 lg:px-0">
                  Insulated stainless steel tumblers that keep your drinks cold for 24 hours — crafted for style, built for life.
                </p>

                {/* Buttons */}
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
                    {/* Carousel Navigation Arrows - Outside the carousel */}
                    {products.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentSlide(prev => prev === 0 ? products.length - 1 : prev - 1)}
                          className="absolute -left-4 lg:left-0 top-1/2 -translate-y-1/2 z-[100] bg-black/70 hover:bg-black/90 text-purple-400 p-2 lg:p-3 rounded-full shadow-xl transition-all hover:scale-110 touch-manipulation"
                          aria-label="Previous slide"
                        >
                          <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6" />
                        </button>

                        <button
                          onClick={() => setCurrentSlide(prev => (prev + 1) % products.length)}
                          className="absolute -right-4 lg:right-0 top-1/2 -translate-y-1/2 z-[100] bg-black/70 hover:bg-black/90 text-purple-400 p-2 lg:p-3 rounded-full shadow-xl transition-all hover:scale-110 touch-manipulation"
                          aria-label="Next slide"
                        >
                          <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6" />
                        </button>
                      </>
                    )}

                    <div
                      className="relative w-72 h-80 lg:w-80 lg:h-96 mx-auto mb-4 lg:mb-8"
                      style={{ perspective: "1000px" }}
                    >
                      {products.map((product, i) => {
                        const offset = i - currentSlide
                        const isActive = offset === 0
                        const isNext = offset === 1 || offset === -(products.length - 1)
                        const isPrev = offset === -1 || offset === products.length - 1

                        // Hide cards that are too far away
                        if (Math.abs(offset) > 1 && offset !== products.length - 1 && offset !== -(products.length - 1)) {
                          return null
                        }

                        return (
                          <div
                            key={product.id}
                            className={`absolute inset-0 transition-all duration-700 ease-in-out transform-gpu ${isActive
                              ? "z-30 scale-100 opacity-100 translate-x-0 cursor-pointer"
                              : isNext
                                ? "z-20 scale-75 opacity-60 translate-x-24"
                                : isPrev
                                  ? "z-20 scale-75 opacity-60 -translate-x-24"
                                  : "z-10 scale-50 opacity-20 translate-x-0"
                              }`}
                            style={{
                              transform: `
                                translateX(${offset * 100}px) 
                                rotateY(${offset * 35}deg) 
                                scale(${isActive ? 1 : 0.8})
                                translateZ(${isActive ? 0 : -80}px)
                              `,
                              filter: isActive ? 'brightness(1)' : 'brightness(0.6)',
                            }}
                            onClick={() => handleCardClick(product, offset, i)}
                          >
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 shadow-2xl h-full hover:bg-white/15 transition-colors">
                              <div className="relative h-48 lg:h-64 overflow-hidden">
                                <Image
                                  src={product.image}
                                  alt={product.name}
                                  fill
                                  className="object-cover"
                                  placeholder="blur"
                                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RlZGVkZSIvPjwvc3ZnPg=="
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              </div>
                              <div className="px-3 pt-1 pb-3 lg:px-4 lg:pt-1.5 lg:pb-4 text-left">
                                <h3 className="text-lg lg:text-xl font-semibold mb-1 text-purple-400">
                                  {product.name}
                                </h3>
                                {product.price > 0 && (
                                  <p className="text-lg lg:text-xl font-bold mb-2 text-purple-300">
                                    ₱{Number(product.price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                  </p>
                                )}
                                <p className="text-purple-100 text-xs lg:text-sm leading-relaxed line-clamp-3 lg:line-clamp-4">
                                  {product.description}
                                </p>

                                {isActive && (
                                  <button
                                    className="mt-2 text-purple-400 text-sm lg:text-base font-medium hover:text-purple-300 transition-colors flex items-center gap-1"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedproduct(product)
                                      setSelectedproductIndex(i)
                                    }}
                                  >
                                    Read More →
                                  </button>
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

      {/* Modal Popup with Navigation */}
      {selectedproduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setSelectedproduct(null)}
        >
          {/* Navigation Arrows - Outside the card */}
          {products.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleModalPrev()
                }}
                className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 z-[60] bg-black/70 hover:bg-black/90 text-purple-400 rounded-full p-2 md:p-3 transition-all hover:scale-110 shadow-xl border border-purple-400/30 touch-manipulation"
                aria-label="Previous item"
              >
                <ChevronLeft className="w-6 h-6 md:w-7 md:h-7" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handleModalNext()
                }}
                className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 z-[60] bg-black/70 hover:bg-black/90 text-purple-400 rounded-full p-2 md:p-3 transition-all hover:scale-110 shadow-xl border border-purple-400/30 touch-manipulation"
                aria-label="Next item"
              >
                <ChevronRight className="w-6 h-6 md:w-7 md:h-7" />
              </button>
            </>
          )}

          <div
            className="relative bg-gradient-to-br from-black to-purple-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-purple-400/30 animate-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedproduct(null)}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors touch-manipulation"
              aria-label="Close"
            >
              <X size={24} />
            </button>

            <div className="relative h-64 md:h-80 overflow-hidden rounded-t-2xl">
              <Image
                src={selectedproduct.image}
                alt={selectedproduct.name}
                fill
                className="object-cover"
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RlZGVkZSIvPjwvc3ZnPg=="
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

              {/* Item counter */}
              {products.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/70 text-purple-400 px-3 py-1 rounded-full text-sm font-medium">
                  {selectedproductIndex + 1} / {products.length}
                </div>
              )}
            </div>

            <div className="p-6 md:p-8">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-purple-700/50 text-purple-200 text-sm rounded-full mb-3">
                  {selectedproduct.category}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">{selectedproduct.name}</h2>
                {selectedproduct.price > 0 && (
                  <p className="text-2xl md:text-3xl font-bold text-purple-300 mt-2">
                    ₱{Number(selectedproduct.price).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </p>
                )}
              </div>

              <div className="text-purple-100 text-base md:text-lg leading-relaxed space-y-4">
                {selectedproduct.description}
              </div>

              <div className="mt-6">
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-gradient-to-r from-purple-700 to-purple-600 hover:from-purple-800 hover:to-purple-700 text-white"
                >
                  <Link href="/menu">View Full Menu</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
