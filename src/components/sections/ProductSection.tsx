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
    const [adding, setAdding] = useState(false)
    const router = useRouter()

    // Fetch products
    useEffect(() => {
        const fetchAllProducts = async () => {
            try {
                const response = await fetch("/api/products?paginate=false")
                if (!response.ok) throw new Error(`Failed to fetch products: ${response.status}`)

                const data = await response.json()
                setProducts(Array.isArray(data) ? data : [])
            } catch (err) {
                console.error("Error fetching products:", err)
                setError(err instanceof Error ? err.message : "Unknown error")
            } finally {
                setLoading(false)
            }
        }
        fetchAllProducts()
    }, [])

    // Add single product to cart
    const handleAddToCart = async (product: Product, setAdding: (value: boolean) => void) => {
        setAdding(true)
        try {
            const response = await fetch("/api/cart", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ productId: product.id, quantity: 1 }),
            })

            if (response.status === 401) {
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.length > 0 ? (
                        products.map((product) => (
                            <Card
                                key={product.id}
                                className="rounded-xl overflow-hidden hover:shadow-lg transition bg-purple-50"
                            >
                                {/* Product image */}
                                <div className="relative h-80 w-full -mt-10">
                                    <Image
                                        src={product.image}
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
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                                                    View Details
                                                </Button>
                                            </DialogTrigger>

                                            <DialogContent
                                                className="
                                                        w-full h-[60vh] md:h-[80vh] max-w-2xl sm:rounded-2xl lg:max-w-3xl p-4 sm:p-6
                                                        bg-purple-50 flex flex-col sm:flex-row overflow-y-auto
                                                    "
                                            >
                                                {/* Left side - Image */}
                                                <div className="flex-1 mb-4 sm:mb-0 sm:mr-4 flex items-center justify-center">
                                                    {product.image && (
                                                        <div className="relative w-full h-64 sm:h-full rounded-lg overflow-hidden">
                                                            <Image
                                                                src={product.image}
                                                                alt={product.name}
                                                                fill
                                                                className="object-contain rounded-lg"
                                                                placeholder="blur"
                                                                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2RlZGVkZSIvPjwvc3ZnPg=="
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Right side - Details */}
                                                <div className="flex-1 flex flex-col justify-between">
                                                    <div>
                                                        <h2 className="text-xl lg:text-3xl font-bold text-purple-700 mb-2">
                                                            {product.name}
                                                        </h2>
                                                        <p className="text-gray-700 text-sm sm:text-base mb-4">
                                                            <span className="font-bold">Details: </span>
                                                                {product.description}
                                                        </p>
                                                        <p className="text-lg lg:text-2xl font-bold text-purple-600 mb-4">
                                                            ₱{Number(product.price).toLocaleString()}
                                                        </p>
                                                    </div>

                                                    <Button
                                                        onClick={() => handleAddToCart(product, setAdding)}
                                                        disabled={adding}
                                                        className="w-full bg-purple-500 hover:bg-purple-600 text-white mt-auto"
                                                    >
                                                        {adding ? "Adding..." : "Add to Cart"}
                                                    </Button>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
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

                {/* View More Products */}
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
