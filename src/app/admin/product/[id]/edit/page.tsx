"use client"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2, Upload, Save, Package, Tag, Archive, Calendar, Clock } from "lucide-react"
import { useState, useEffect, useRef, use } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuthStore } from "@/store/authStore"
import Image from "next/image"

// ── Types ──────────────────────────────────────────────────────────────────────

interface Product {
    id: number
    name: string
    description: string
    price: number | string
    stock: number          // ✅ stock (not quantity)
    image: string
    is_active: boolean
    created_at: string
    updated_at: string
}

// ── Constants ──────────────────────────────────────────────────────────────────

const purpleGrad = "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)"

// ── Helpers ────────────────────────────────────────────────────────────────────

const getImageUrl = (imagePath: string): string => {
    if (!imagePath) return "/placeholder.svg"
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath
    const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const fullPath = imagePath.startsWith("images/products/") ? imagePath : `images/products/${imagePath}`
    return `${BASE}/${fullPath}`
}

const formatPrice = (price: number | string): string => {
    const n = typeof price === "string" ? parseFloat(price) : price
    return isNaN(n) ? "0.00" : n.toFixed(2)
}

// ── Info Row ──────────────────────────────────────────────────────────────────

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3 py-3 border-b border-purple-50 last:border-0">
            <div className="w-7 h-7 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-3.5 h-3.5 text-purple-500" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-0.5">{label}</p>
                <div className="text-sm font-medium text-gray-800">{value}</div>
            </div>
        </div>
    )
}

// ── Page ──────────────────────────────────────────────────────────────────────

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
        stock: "",   // ✅ stock (not quantity)
    })
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)

    // ── Effects ────────────────────────────────────────────────────────────────

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768)
        check()
        window.addEventListener("resize", check)
        return () => window.removeEventListener("resize", check)
    }, [])

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true)
                const token = tokenFromStore || localStorage.getItem("auth_token")
                const response = await fetch(`/api/products/${resolvedParams.id}`, {
                    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
                })
                if (!response.ok) throw new Error("Failed to fetch product")

                const responseData = await response.json()
                const productData: Product = responseData.data || responseData
                setProduct(productData)

                setFormData({
                    name: productData.name || "",
                    description: productData.description || "",
                    price: productData.price ? productData.price.toString() : "",
                    stock: productData.stock != null ? productData.stock.toString() : "",
                })
            } catch (error) {
                toast({ variant: "destructive", title: "Error", description: "Failed to load product details" })
                router.push("/admin/products")  // ✅ correct path
            } finally {
                setLoading(false)
            }
        }

        if (resolvedParams.id) fetchProduct()
    }, [resolvedParams.id, toast, router, tokenFromStore])

    // ── Handlers ───────────────────────────────────────────────────────────────

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setSelectedImage(file)
            const reader = new FileReader()
            reader.onload = () => setImagePreview(reader.result as string)
            reader.readAsDataURL(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        try {
            const formDataToSend = new FormData()
            formDataToSend.append("name", formData.name)
            formDataToSend.append("description", formData.description)
            formDataToSend.append("price", formData.price)
            formDataToSend.append("stock", formData.stock)   // ✅ stock
            if (selectedImage) formDataToSend.append("image", selectedImage)
            formDataToSend.append("_method", "PUT")

            const token = tokenFromStore || localStorage.getItem("auth_token")
            const response = await fetch(`/api/products/${resolvedParams.id}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
                body: formDataToSend,
            })

            const result = await response.json()
            if (!response.ok) throw new Error(result.message || "Failed to update product.")

            toast({ title: "Success", description: "Product updated successfully!" })
            router.push("/admin/products")  // ✅ correct path
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message || "Error updating the product." })
        } finally {
            setSaving(false)
        }
    }

    // ── Loading ────────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <SidebarProvider defaultOpen={!isMobile}>
                <div className="flex min-h-screen w-full"
                    style={{ background: "linear-gradient(135deg, #f5f3ff 0%, #fdf4ff 50%, #f3e8ff 100%)" }}>
                    <AppSidebar />
                    <div className={`flex-1 min-w-0 ${isMobile ? "ml-0" : "ml-64"}`}>
                        <div className="flex items-center justify-center min-h-screen">
                            <div className="flex items-center gap-3 bg-white/90 px-8 py-5 rounded-2xl shadow-xl border border-purple-100">
                                <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
                                <span className="text-purple-800 font-semibold">Loading product details...</span>
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
                <div className="flex min-h-screen w-full"
                    style={{ background: "linear-gradient(135deg, #f5f3ff 0%, #fdf4ff 50%, #f3e8ff 100%)" }}>
                    <AppSidebar />
                    <div className={`flex-1 min-w-0 ${isMobile ? "ml-0" : "ml-64"}`}>
                        <div className="flex items-center justify-center min-h-screen">
                            <div className="text-center bg-white/90 p-10 rounded-2xl shadow-xl border border-purple-100">
                                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                                    style={{ background: purpleGrad }}>
                                    <Package className="w-8 h-8 text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800 mb-2">Product not found</h2>
                                <p className="text-gray-500 text-sm mb-6">The product you're looking for doesn't exist.</p>
                                <Button onClick={() => router.push("/admin/products")}
                                    className="text-white font-semibold rounded-xl shadow-lg"
                                    style={{ background: purpleGrad }}>
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Products
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarProvider>
        )
    }

    // ── Page ───────────────────────────────────────────────────────────────────

    const currentImage = imagePreview || getImageUrl(product.image)

    return (
        <SidebarProvider defaultOpen={!isMobile}>
            <div className="flex min-h-screen w-full"
                style={{ background: "linear-gradient(135deg, #f5f3ff 0%, #fdf4ff 50%, #f3e8ff 100%)" }}>
                <AppSidebar />
                <div className={`flex-1 min-w-0 ${isMobile ? "ml-0" : "ml-64"}`}>

                    {isMobile && (
                        <div className="sticky top-0 z-50 flex h-12 items-center gap-2 border-b px-4 shadow-sm"
                            style={{ background: "rgba(124,58,237,0.97)", borderColor: "rgba(168,85,247,0.3)" }}>
                            <SidebarTrigger className="-ml-1 text-white" />
                            <span className="text-sm font-bold text-white">Edit Product</span>
                        </div>
                    )}

                    <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
                        <div className="max-w-5xl mx-auto space-y-6">

                            {/* Header */}
                            <div className="flex items-center gap-4 rounded-2xl px-6 py-5 shadow-xl"
                                style={{ background: purpleGrad }}>
                                <button
                                    onClick={() => router.push("/admin/products")}
                                    className="w-9 h-9 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors flex-shrink-0"
                                >
                                    <ArrowLeft className="w-4 h-4 text-white" />
                                </button>
                                <div className="absolute right-4 top-4 w-20 h-20 rounded-full opacity-10 pointer-events-none hidden"
                                    style={{ background: "radial-gradient(circle, white, transparent)" }} />
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">Edit Product</h1>
                                    <p className="text-violet-200 text-sm mt-0.5">#{product.id} · {product.name}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                                {/* Left: Image + Meta */}
                                <div className="space-y-5">
                                    {/* Image card */}
                                    <div className="rounded-2xl overflow-hidden shadow-xl border"
                                        style={{ background: "rgba(255,255,255,0.95)", borderColor: "rgba(139,92,246,0.15)" }}>
                                        <div className="px-5 py-4 border-b" style={{ background: purpleGrad }}>
                                            <h3 className="text-white font-bold text-sm">Product Image</h3>
                                        </div>
                                        <div className="p-5 space-y-4">
                                            <div className="aspect-square rounded-xl overflow-hidden border-2 border-dashed border-purple-200 bg-purple-50">
                                                <Image
                                                    src={currentImage}
                                                    alt={product.name}
                                                    width={400} height={400}
                                                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                                                />
                                            </div>
                                            <input ref={fileInputRef} type="file" accept="image/*"
                                                onChange={handleImageSelect} disabled={saving} className="hidden" />
                                            <Button type="button" variant="outline"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={saving}
                                                className="w-full border-purple-200 text-purple-600 hover:bg-purple-50 font-semibold rounded-xl">
                                                <Upload className="w-4 h-4 mr-2" />
                                                {selectedImage ? "Change Image" : "Upload New Image"}
                                            </Button>
                                            {selectedImage && (
                                                <p className="text-xs text-center text-purple-500 bg-purple-50 px-3 py-2 rounded-lg">
                                                    ✓ {selectedImage.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Meta info card */}
                                    <div className="rounded-2xl overflow-hidden shadow-lg border"
                                        style={{ background: "rgba(255,255,255,0.95)", borderColor: "rgba(139,92,246,0.15)" }}>
                                        <div className="px-5 py-4 border-b"
                                            style={{ background: "rgba(245,243,255,0.9)", borderColor: "rgba(139,92,246,0.1)" }}>
                                            <p className="text-xs font-bold text-purple-600 uppercase tracking-widest">Product Info</p>
                                        </div>
                                        <div className="px-5 pb-2">
                                            <InfoRow icon={Tag} label="Product ID" value={`#${product.id}`} />
                                            <InfoRow icon={Calendar} label="Created"
                                                value={new Date(product.created_at).toLocaleDateString("en-US", {
                                                    month: "long", day: "2-digit", year: "numeric",
                                                })} />
                                            <InfoRow icon={Clock} label="Last Updated"
                                                value={new Date(product.updated_at).toLocaleDateString("en-US", {
                                                    month: "short", day: "2-digit", year: "numeric",
                                                })} />
                                            <InfoRow icon={Archive} label="Status"
                                                value={
                                                    product.is_active ? (
                                                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 font-semibold">Inactive</span>
                                                    )
                                                } />
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Form */}
                                <div className="lg:col-span-2">
                                    <div className="rounded-2xl overflow-hidden shadow-xl border"
                                        style={{ background: "rgba(255,255,255,0.95)", borderColor: "rgba(139,92,246,0.15)" }}>
                                        <div className="px-6 py-5 border-b" style={{ background: purpleGrad }}>
                                            <h2 className="text-white font-bold text-base">Product Details</h2>
                                            <p className="text-violet-200 text-xs mt-0.5">Update the fields below and save</p>
                                        </div>

                                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                            {/* Name */}
                                            <div className="space-y-1.5">
                                                <Label htmlFor="name" className="text-xs font-bold text-purple-600 uppercase tracking-widest">
                                                    Product Name *
                                                </Label>
                                                <Input id="name" name="name"
                                                    value={formData.name} onChange={handleFormChange}
                                                    required disabled={saving}
                                                    placeholder="e.g., Premium Stainless Steel Tumbler"
                                                    className="border-purple-200 focus:border-purple-400 focus-visible:ring-purple-300 rounded-xl h-11" />
                                            </div>

                                            {/* Price + Stock */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="price" className="text-xs font-bold text-purple-600 uppercase tracking-widest">
                                                        Price (₱) *
                                                    </Label>
                                                    <Input id="price" name="price" type="number" step="0.01" min="0"
                                                        value={formData.price} onChange={handleFormChange}
                                                        required disabled={saving} placeholder="0.00"
                                                        className="border-purple-200 focus:border-purple-400 focus-visible:ring-purple-300 rounded-xl h-11" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    {/* ✅ stock field (not quantity) */}
                                                    <Label htmlFor="stock" className="text-xs font-bold text-purple-600 uppercase tracking-widest">
                                                        Stock *
                                                    </Label>
                                                    <Input id="stock" name="stock" type="number" min="0"
                                                        value={formData.stock} onChange={handleFormChange}
                                                        required disabled={saving} placeholder="0"
                                                        className="border-purple-200 focus:border-purple-400 focus-visible:ring-purple-300 rounded-xl h-11" />
                                                </div>
                                            </div>

                                            {/* Description */}
                                            <div className="space-y-1.5">
                                                <Label htmlFor="description" className="text-xs font-bold text-purple-600 uppercase tracking-widest">
                                                    Description *
                                                </Label>
                                                <Textarea id="description" name="description"
                                                    value={formData.description} onChange={handleFormChange}
                                                    required rows={5} disabled={saving}
                                                    placeholder="Describe the tumbler, material, capacity, features..."
                                                    className="resize-none border-purple-200 focus:border-purple-400 focus-visible:ring-purple-300 rounded-xl" />
                                            </div>

                                            {/* Live preview strip */}
                                            <div className="rounded-xl p-4 border"
                                                style={{ background: "rgba(245,243,255,0.6)", borderColor: "rgba(139,92,246,0.12)" }}>
                                                <p className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-3">Live Preview</p>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 border-purple-100 shadow-sm">
                                                        <Image src={currentImage} alt="preview"
                                                            width={56} height={56} className="object-cover w-full h-full" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-gray-900 truncate">{formData.name || product.name}</p>
                                                        <p className="text-purple-700 font-bold text-lg">
                                                            ₱{formatPrice(formData.price || product.price)}
                                                        </p>
                                                    </div>
                                                    <div className="text-right flex-shrink-0">
                                                        <p className="text-xs text-gray-500">Stock</p>
                                                        <p className="font-bold text-gray-800">{formData.stock || product.stock} pcs</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-purple-100">
                                                <Button type="button" variant="outline"
                                                    onClick={() => router.push("/admin/product")}
                                                    disabled={saving}
                                                    className="flex-1 sm:flex-none border-purple-200 text-purple-600 hover:bg-purple-50 rounded-xl">
                                                    Cancel
                                                </Button>
                                                <Button type="submit" disabled={saving}
                                                    className="flex-1 sm:ml-auto text-white font-semibold shadow-lg rounded-xl"
                                                    style={{ background: purpleGrad }}>
                                                    {saving ? (
                                                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Updating...</>
                                                    ) : (
                                                        <><Save className="mr-2 h-4 w-4" />Update Product</>
                                                    )}
                                                </Button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}