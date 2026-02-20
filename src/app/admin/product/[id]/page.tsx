"use client"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import type React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, Upload, Save } from "lucide-react"
import { useState, useEffect, useRef, use } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/store/authStore"
import Image from "next/image"

interface Product {
    id: number
    name: string
    description: string
    price: number | string
    quantity: number
    image: string
    created_at: string
    updated_at: string
}

const categories = ["Tumblers", "Accessories", "Premium", "Limited Edition"]

// Helper function to get valid image URL
const getImageUrl = (imagePath: string): string => {
    if (!imagePath) {
        return "/placeholder-food.jpg"
    }

    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
        return imagePath
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    let fullPath = imagePath
    if (!imagePath.startsWith("images/products/")) {
        fullPath = `images/products/${imagePath}`
    }

    return `${API_BASE_URL}/${fullPath}`
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params) as { id: string }
    const [product, setProduct] = useState<Product | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const { toast } = useToast()
    const router = useRouter()
    const tokenFromStore = useAuthStore((state) => state.token)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        quantity: "",
    })
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    // Mobile detection
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }
        checkMobile()
        window.addEventListener("resize", checkMobile)
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    // Fetch product data
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true)
                const token = tokenFromStore || localStorage.getItem("auth_token")
                const response = await fetch(`/api/products/${resolvedParams.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: "application/json",
                    },
                })
                if (!response.ok) {
                    throw new Error("Failed to fetch product")
                }
                const responseData = await response.json()
                const productData = responseData.data || responseData
                setProduct(productData)

                // Populate form
                setFormData({
                    name: productData.name || "",
                    description: productData.description || "",
                    price: productData.price ? productData.price.toString() : "",
                    quantity: productData.quantity ? productData.quantity.toString() : "",
                })
            } catch (error) {
                console.error("Failed to fetch product:", error)
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to load product details",
                })
                router.push("/admin/product")
            } finally {
                setLoading(false)
            }
        }

        if (resolvedParams.id) {
            fetchProduct()
        }
    }, [resolvedParams.id, toast, router])

    // Handle form changes
    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleCheckboxChange = (name: string, checked: boolean) => {
        setFormData((prev) => ({ ...prev, [name]: checked }))
    }

    // Handle image selection
    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedImage(file)
            const reader = new FileReader()
            reader.onload = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            const formDataToSend = new FormData()
            formDataToSend.append("name", formData.name)
            formDataToSend.append("description", formData.description)
            formDataToSend.append("price", formData.price)
            formDataToSend.append("quantity", formData.quantity)

            if (selectedImage) {
                formDataToSend.append("image", selectedImage)
            }

            // Add _method for Laravel to handle PUT request
            formDataToSend.append("_method", "PUT")

            const token = tokenFromStore || localStorage.getItem("auth_token")
            const response = await fetch(`/api/products/${resolvedParams.id}`, {
                method: "POST", // Use POST with _method for file uploads
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json",
                },
                body: formDataToSend,
            })

            const result = await response.json()
            if (!response.ok) {
                throw new Error(result.message || "Failed to update product.")
            }

            toast({
                title: "Success",
                description: "Product updated successfully!",
            })

            router.push("/admin/product")
        } catch (error: any) {
            console.error("Error updating product:", error)
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "There was an error updating the product.",
            })
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <SidebarProvider defaultOpen={!isMobile}>
                <div className="flex min-h-screen w-full bg-gradient-to-br from-orange-50 to-red-50">
                    <AppSidebar />
                    <div className={`flex-1 min-w-0 ${isMobile ? "ml-0" : "ml-72"}`}>
                        <div className="flex items-center justify-center min-h-screen w-full">
                            <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg">
                                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                                <span className="text-gray-700 font-medium">Loading product details...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarProvider>
        )
    }

    if (!product) {
        return (
            <SidebarProvider defaultOpen={!isMobile}>
                <div className="flex min-h-screen w-full bg-gradient-to-br from-orange-50 to-red-50">
                    <AppSidebar />
                    <div className={`flex-1 min-w-0 ${isMobile ? "ml-0" : "ml-72"}`}>
                        <div className="flex items-center justify-center min-h-screen w-full">
                            <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg">
                                <h2 className="text-xl font-semibold mb-4 text-gray-800">Product not found</h2>
                                <Button
                                    onClick={() => router.push("/admin/product")}
                                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    Back to Products
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarProvider>
        )
    }

    return (
        <SidebarProvider defaultOpen={!isMobile}>
            <div className="flex min-h-screen w-full bg-gradient-to-br from-orange-50 to-red-50">
                <AppSidebar />
                <div className={`flex-1 min-w-0 ${isMobile ? "ml-0" : "ml-72"}`}>
                    {isMobile && (
                        <div className="sticky top-0 z-50 flex h-12 items-center gap-2 border-b bg-white/90 backdrop-blur-sm px-4 md:hidden shadow-sm">
                            <SidebarTrigger className="-ml-1" />
                            <span className="text-sm font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                Edit Product
                            </span>
                        </div>
                    )}
                    <main className="flex-1 overflow-auto p-4 md:p-6">
                        <div className="max-w-4xl mx-auto space-y-6">
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                <div className="flex items-center gap-4 bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-orange-100">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => router.push("/admin/product")}
                                        className="shrink-0 hover:bg-orange-100 text-orange-600"
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4" />
                                        Back
                                    </Button>
                                    <div>
                                        <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                                            Edit Product
                                        </h1>
                                        <p className="text-sm sm:text-base text-gray-600">Update product information</p>
                                    </div>
                                </div>
                            </div>

                            <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-orange-100">
                                <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
                                    <CardTitle className="text-xl font-bold">Product Details</CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 bg-white">
                                    {/* preview block styled more like an e‑commerce product card */}
                                    <div className="mb-6 bg-white rounded-xl shadow-lg p-6 flex flex-col lg:flex-row items-center lg:items-start gap-6">
                                        <div className="w-full lg:w-1/3">
                                            <Image
                                                src={imagePreview || getImageUrl(product.image)}
                                                alt={product?.name || "Product image"}
                                                width={400}
                                                height={400}
                                                className="rounded-lg object-cover w-full h-full"
                                            />
                                        </div>
                                        <div className="w-full lg:w-2/3">
                                            <h2 className="text-2xl font-bold text-gray-800 mb-2">{formData.name || product.name}</h2>
                                            <p className="text-xl text-red-600 font-semibold mb-2">₱{parseFloat(formData.price || product.price as any || 0).toFixed(2)}</p>
                                            <p className="text-sm text-gray-600 mb-2">Quantity: <span className="font-medium">{formData.quantity || product.quantity} pcs</span></p>
                                        </div>
                                    </div>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                            <div className="lg:col-span-1">
                                                <Label htmlFor="image" className="text-base font-medium text-gray-700">
                                                    Product Image
                                                </Label>
                                                <div className="mt-2 space-y-4">
                                                    <div className="w-full aspect-square max-w-xs mx-auto lg:mx-0 rounded-xl overflow-hidden border-2 border-dashed border-orange-300 bg-gradient-to-br from-orange-50 to-red-50 shadow-lg">
                                                        <Image
                                                            src={imagePreview || getImageUrl(product.image)}
                                                            alt={product?.name || "Product image"}
                                                            width={300}
                                                            height={300}
                                                            className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Input
                                                            ref={fileInputRef}
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleImageSelect}
                                                            disabled={saving}
                                                            className="hidden"
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={() => fileInputRef.current?.click()}
                                                            disabled={saving}
                                                            className="w-full border-orange-300 text-orange-600 hover:bg-orange-50 font-medium shadow-md"
                                                        >
                                                            <Upload className="w-4 h-4 mr-2" />
                                                            {selectedImage ? "Change Image" : "Upload New Image"}
                                                        </Button>
                                                        {selectedImage && (
                                                            <p className="text-xs text-gray-500 text-center bg-orange-50 p-2 rounded-lg">
                                                                New image selected: {selectedImage.name}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="lg:col-span-2 space-y-6">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="sm:col-span-2">
                                                        <Label htmlFor="name" className="text-gray-700 font-medium">
                                                            Product Name *
                                                        </Label>
                                                        <Input
                                                            id="name"
                                                            name="name"
                                                            value={formData.name}
                                                            onChange={handleFormChange}
                                                            required
                                                            disabled={saving}
                                                            placeholder="e.g., Premium Stainless Steel Tumbler"
                                                            className="mt-1 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                                                        />
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="price" className="text-gray-700 font-medium">
                                                            Price (₱) *
                                                        </Label>
                                                        <Input
                                                            id="price"
                                                            name="price"
                                                            type="number"
                                                            step="0.01"
                                                            min="0"
                                                            value={formData.price}
                                                            onChange={handleFormChange}
                                                            required
                                                            disabled={saving}
                                                            placeholder="0.00"
                                                            className="mt-1 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                                                        />
                                                    </div>

                                                    <div>
                                                        <Label htmlFor="quantity" className="text-gray-700 font-medium">
                                                            Quantity *
                                                        </Label>
                                                        <Input
                                                            id="quantity"
                                                            name="quantity"
                                                            type="number"
                                                            min="0"
                                                            value={formData.quantity}
                                                            onChange={handleFormChange}
                                                            required
                                                            disabled={saving}
                                                            placeholder="0"
                                                            className="mt-1 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <Label htmlFor="description" className="text-gray-700 font-medium">
                                                        Description *
                                                    </Label>
                                                    <Textarea
                                                        id="description"
                                                        name="description"
                                                        value={formData.description}
                                                        onChange={handleFormChange}
                                                        required
                                                        rows={3}
                                                        disabled={saving}
                                                        placeholder="Describe the product, material, features..."
                                                        className="mt-1 resize-none border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-orange-200">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => router.push("/admin/product")}
                                                disabled={saving}
                                                className="w-full sm:w-auto order-2 sm:order-1 border-orange-300 text-orange-600 hover:bg-orange-50"
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                type="submit"
                                                disabled={saving}
                                                className="w-full sm:w-auto sm:ml-auto order-1 sm:order-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg"
                                            >
                                                {saving ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Updating Product...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="mr-2 h-4 w-4" />
                                                        Update Product
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>

                            <Card className="bg-gradient-to-r from-orange-100 to-red-100 border-orange-200 shadow-lg">
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                                        <div>
                                            <Label className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Product ID</Label>
                                            <p className="font-mono text-gray-800 font-medium">{product.id}</p>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Created</Label>
                                            <p className="text-gray-800 font-medium">
                                                {new Date(product.created_at).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "2-digit",
                                                    year: "numeric",
                                                })}
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
                                                Last Updated
                                            </Label>
                                            <p className="text-gray-800 font-medium">
                                                {new Date(product.updated_at).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "2-digit",
                                                    year: "numeric",
                                                })}
                                            </p>
                                        </div>
                                        <div>
                                            <Label className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Status</Label>
                                            <p className="text-green-600 font-bold">Active</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}