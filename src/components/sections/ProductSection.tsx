"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

interface Product {
    id: number
    name: string
    description: string
    price: number
    category: string
    image: string
    is_featured: boolean
}

export default function ProductSection() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                const response = await fetch("/api/products?paginate=false")
                if (!response.ok) throw new Error(`Failed to fetch products: ${response.status}`)

                const data = await response.json()
                const products = Array.isArray(data) ? data : []
                setProducts(products)
            } catch (err) {
                console.error("Error fetching products:", err)
                setError(err instanceof Error ? err.message : "Unknown error")
            } finally {
                setLoading(false)
            }
        }

        fetchAllProducts()
    }, [])

    if (loading) {
        return (
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl font-bold">
                            Our <span className="text-purple-700">Collection</span>
                        </h2>
                        <p className="text-gray-600 max-w-xl mx-auto">
                            Discover Hilee products built for everyday carry and outdoor adventures.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-72 bg-gray-200 animate-pulse rounded-xl" />
                        ))}
                    </div>
                </div>
            </section>
        )
    }

    if (error) {
        return (
            <section className="py-20">
                <p className="text-center text-red-500">{error}</p>
            </section>
        )
    }

    return (
        <section className="relative bg-white/95 py-16 overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-gray-900">
                        Our <span className="text-purple-700">Collection</span>
                    </h2>
                    <p className="text-md md:text-lg lg:text-xl text-gray-700 max-w-lg lg:max-w-2xl mx-auto">
                        From everyday carry to outdoor adventures — find the perfect Hilee for your lifestyle.
                    </p>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.length > 0 ? (
                        products.map((product) => (
                            <Card
                                key={product.id}
                                className="rounded-xl overflow-hidden hover:shadow-lg transition"
                            >
                                {/* Product image */}
                                <div className="relative h-56 w-full">
                                    <Image
                                        src={product.image || "/placeholder.svg"} // fallback to placeholder
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                        placeholder="blur"
                                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RlZGVkZSIvPjwvc3ZnPg=="
                                    />
                                </div>

                                <CardContent className="px-4">
                                    <h3 className="font-semibold text-xl">{product.name}</h3>
                                    {product.description && (
                                        <p className="text-md text-gray-500 line-clamp-2">
                                            {product.description}
                                        </p>
                                    )}
                                    <p className="mt-2 text-lg font-bold text-purple-700">
                                        ₱{Number(product.price).toLocaleString()}
                                    </p>

                                    {/* Modal trigger */}
                                    <div className="mt-4">
                                        <ProductModal product={product} />
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 col-span-full">
                            No products available at the moment.
                        </p>
                    )}
                </div>

                {/* Optional: Button to view more products outside the grid */}
                <div className="mt-8 text-center">
                    <Link href="/products">
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3">
                        View More Products
                    </Button>
                    </Link>
                </div>

            </div>
        </section>
    )
}

// ----- Product Modal component -----
function ProductModal({ product }: { product: Product }) {
    const [adding, setAdding] = useState(false)
    const router = useRouter()

    const handleAddToCart = async () => {
        setAdding(true)
        try {
            const response = await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: product.id, quantity: 1 }),
            })

            if (response.status === 401) {
                // User not logged in → redirect to login
                toast.error("You must be logged in to add items to the cart.")
                router.push("/login")
                return
            }

            const data = await response.json()
            if (!response.ok) throw new Error(data.message || "Failed to add to cart")

            toast.success(`${product.name} added to cart!`)
        } catch (err) {
            console.error(err)
            toast.error("Failed to add product to cart")
        } finally {
            setAdding(false)
        }
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">View Details</Button>
            </DialogTrigger>

            <DialogContent className="max-w-xl w-full p-6">
                <div className="flex flex-col gap-4">
                    {product.image && (
                        <div className="relative h-64 w-full">
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover rounded-lg"
                                placeholder="blur"
                                blurDataURL="/placeholder.svg"
                            />
                        </div>
                    )}

                    <h2 className="text-2xl font-bold text-purple-700">{product.name}</h2>
                    <p className="text-gray-700">{product.description}</p>
                    <p className="text-lg font-bold text-purple-600">
                        ₱{Number(product.price).toLocaleString()}
                    </p>

                    <Button
                        onClick={handleAddToCart}
                        disabled={adding}
                        className="mt-4 w-full bg-purple-500 hover:bg-purple-600 text-white"
                    >
                        {adding ? "Adding..." : "Add to Cart"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
