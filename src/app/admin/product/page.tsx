"use client"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/authStore"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    MoreHorizontal, Eye, Plus, Search, Loader2, ArrowUpDown,
    Edit, Trash2, Upload, Package, AlertTriangle, CheckCircle2,
    XCircle, ChevronLeft, ChevronRight, TrendingUp, ShoppingBag,
    Tag, Archive, Calendar, Clock,
} from "lucide-react"
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog, DialogContent, DialogDescription, DialogHeader,
    DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader,
    AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState, useEffect, useRef, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import {
    type ColumnDef, type ColumnFiltersState, type RowSelectionState, type SortingState,
    useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel,
} from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"

// ── Types ──────────────────────────────────────────────────────────────────────

interface Product {
    id: number
    name: string
    description: string
    price: number | string
    stock: number
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

// ── Sub-components ─────────────────────────────────────────────────────────────

function StockBadge({ stock }: { stock: number }) {
    if (stock === 0)
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
                <XCircle className="w-3 h-3" /> Out of Stock
            </span>
        )
    if (stock < 10)
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
                <AlertTriangle className="w-3 h-3" /> Low — {stock} left
            </span>
        )
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> In Stock
        </span>
    )
}

function InfoRow({
    icon: Icon, label, value,
}: {
    icon: React.ElementType; label: string; value: React.ReactNode
}) {
    return (
        <div className="flex items-start gap-3 py-3.5 border-b border-purple-50 last:border-0">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-purple-500" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-0.5">{label}</p>
                <div className="text-sm font-medium text-gray-800">{value}</div>
            </div>
        </div>
    )
}

// ── Product Detail Sheet ───────────────────────────────────────────────────────

function ProductDetailSheet({
    product,
    onEdit,
}: {
    product: Product | null
    onEdit: (id: number) => void
}) {
    if (!product) return null

    const createdDate = new Date(product.created_at).toLocaleDateString("en-US", {
        month: "long", day: "2-digit", year: "numeric",
    })
    const updatedDate = new Date(product.updated_at).toLocaleDateString("en-US", {
        month: "long", day: "2-digit", year: "numeric",
    })
    const updatedTime = new Date(product.updated_at).toLocaleTimeString("en-US", {
        hour: "2-digit", minute: "2-digit",
    })

    return (
        <SheetContent
            className="w-full sm:max-w-lg overflow-y-auto p-0 border-l border-purple-100"
            style={{ background: "linear-gradient(180deg, #faf5ff 0%, #ffffff 30%)" }}
        >
            {/* ── Hero banner ── */}
            <div
                className="relative h-52 flex-shrink-0 overflow-hidden"
                style={{ background: purpleGrad }}
            >
                {/* Decorative orbs */}
                <div className="absolute top-4 right-4 w-32 h-32 rounded-full opacity-10 pointer-events-none"
                    style={{ background: "radial-gradient(circle, white, transparent)" }} />
                <div className="absolute -top-6 -left-6 w-28 h-28 rounded-full opacity-10 pointer-events-none"
                    style={{ background: "radial-gradient(circle, white, transparent)" }} />
                <div className="absolute bottom-8 right-16 w-16 h-16 rounded-full opacity-5 pointer-events-none"
                    style={{ background: "radial-gradient(circle, white, transparent)" }} />

                {/* Status badge — top left */}
                <div className="absolute top-5 left-5">
                    {product.is_active ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" /> Active
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/10 text-white/70 border border-white/20 backdrop-blur-sm">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> Inactive
                        </span>
                    )}
                </div>

                {/* Price — bottom right */}
                <div className="absolute bottom-5 right-6 text-right">
                    <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-0.5">Price</p>
                    <p className="text-3xl font-black text-white tracking-tight">₱{formatPrice(product.price)}</p>
                </div>

                {/* Product image — overlapping banner */}
                <div className="absolute bottom-0 left-6 translate-y-1/2 z-10">
                    <div
                        className="w-28 h-28 rounded-2xl overflow-hidden border-4 border-white"
                        style={{ boxShadow: "0 8px 32px rgba(124,58,237,0.40)" }}
                    >
                        <Image
                            src={getImageUrl(product.image) || "/placeholder.svg"}
                            alt={product.name}
                            width={112}
                            height={112}
                            className="object-cover w-full h-full"
                        />
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
            <div className="pt-20 px-6 pb-8 space-y-5">

                {/* Name + stock row */}
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 leading-tight">{product.name}</h2>
                        <p className="text-xs text-purple-400 font-semibold mt-1 uppercase tracking-widest">
                            Product ID #{product.id}
                        </p>
                    </div>
                    <div className="flex-shrink-0 mt-1">
                        <StockBadge stock={product.stock} />
                    </div>
                </div>

                {/* Description */}
                {product.description ? (
                    <div
                        className="rounded-xl p-4 border"
                        style={{ background: "rgba(245,243,255,0.6)", borderColor: "rgba(139,92,246,0.12)" }}
                    >
                        <p className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                            <Package className="w-3.5 h-3.5" /> Description
                        </p>
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{product.description}</p>
                    </div>
                ) : (
                    <div
                        className="rounded-xl p-4 border text-center"
                        style={{ background: "rgba(245,243,255,0.4)", borderColor: "rgba(139,92,246,0.08)" }}
                    >
                        <p className="text-xs text-purple-300 italic">No description provided</p>
                    </div>
                )}

                {/* Details list */}
                <div className="rounded-xl border overflow-hidden" style={{ borderColor: "rgba(139,92,246,0.12)" }}>
                    <div
                        className="px-4 py-3 border-b"
                        style={{ background: "rgba(245,243,255,0.9)", borderColor: "rgba(139,92,246,0.1)" }}
                    >
                        <p className="text-xs font-bold text-purple-600 uppercase tracking-widest">Product Details</p>
                    </div>
                    <div className="px-4 bg-white divide-y divide-purple-50">
                        <InfoRow
                            icon={Tag}
                            label="Price"
                            value={<span className="text-purple-700 font-bold text-base">₱{formatPrice(product.price)}</span>}
                        />
                        <InfoRow
                            icon={Archive}
                            label="Stock Quantity"
                            value={
                                <div className="flex items-center gap-2 flex-wrap mt-0.5">
                                    <span className="font-bold text-gray-900">{product.stock} pcs</span>
                                    <StockBadge stock={product.stock} />
                                </div>
                            }
                        />
                        <InfoRow icon={Calendar} label="Created" value={createdDate} />
                        <InfoRow
                            icon={Clock}
                            label="Last Updated"
                            value={
                                <span>
                                    {updatedDate}{" "}
                                    <span className="text-gray-400 font-normal">at {updatedTime}</span>
                                </span>
                            }
                        />
                    </div>
                </div>

                {/* Edit CTA */}
                <Button
                    className="w-full font-semibold rounded-xl text-white h-11 shadow-lg shadow-purple-200/60 mt-2"
                    style={{ background: purpleGrad }}
                    onClick={() => onEdit(product.id)}
                >
                    <Edit className="w-4 h-4 mr-2" /> Edit Product
                </Button>
            </div>
        </SheetContent>
    )
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function ProductsAdminPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [isMobile, setIsMobile] = useState(false)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [newFormData, setNewFormData] = useState({ name: "", description: "", price: "", stock: "" })
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [isCreating, setIsCreating] = useState(false)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [sorting, setSorting] = useState<SortingState>([])
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
    const [globalFilter, setGlobalFilter] = useState("")
    const [itemsPerPage, setItemsPerPage] = useState<number>(10)
    const [currentPage, setCurrentPage] = useState<number>(1)

    const { toast } = useToast()
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const tokenFromStore = useAuthStore((state) => state.token)

    // ── Effects ────────────────────────────────────────────────────────────────

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768)
        check()
        window.addEventListener("resize", check)
        return () => window.removeEventListener("resize", check)
    }, [])

    useEffect(() => { fetchProducts() }, [])
    useEffect(() => { setCurrentPage(1) }, [itemsPerPage, globalFilter])

    // ── API ────────────────────────────────────────────────────────────────────

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const response = await fetch("/api/products?paginate=false")
            const result = await response.json()
            if (response.ok) setProducts(result)
            else throw new Error(result.message || "Failed to fetch products")
        } catch {
            toast({ variant: "destructive", title: "Error", description: "Failed to load products" })
        } finally {
            setLoading(false)
        }
    }

    const handleCreateSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setIsCreating(true)
        try {
            const token = tokenFromStore || localStorage.getItem("auth_token")
            const formData = new FormData()
            formData.append("name", newFormData.name)
            formData.append("description", newFormData.description)
            formData.append("price", newFormData.price)
            formData.append("stock", newFormData.stock)
            if (selectedImage) formData.append("image", selectedImage)
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
                body: formData,
            })
            const result = await response.json()
            if (!response.ok) throw new Error(result.message)
            toast({ title: "Success", description: "Product created successfully!" })
            setIsCreateModalOpen(false)
            resetForm()
            fetchProducts()
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message })
        } finally {
            setIsCreating(false)
        }
    }

    const handleDelete = async (id: number) => {
        setDeletingId(id)
        try {
            const token = tokenFromStore || localStorage.getItem("auth_token") || localStorage.getItem("token")
            if (!token) throw new Error("You must be logged in to delete products.")
            const response = await fetch(`/api/products/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}`, Accept: "application/json", "Content-Type": "application/json" },
            })
            if (response.status === 204) {
                toast({ title: "Success", description: "Product deleted successfully!" })
                fetchProducts()
                return
            }
            let result: any = {}
            const text = await response.text()
            if (text) { try { result = JSON.parse(text) } catch { } }
            if (!response.ok) throw new Error(result.message || `Delete failed: ${response.status}`)
            toast({ title: "Success", description: "Product deleted successfully!" })
            fetchProducts()
        } catch (error: any) {
            toast({ variant: "destructive", title: "Error", description: error.message })
        } finally {
            setDeletingId(null)
        }
    }

    const resetForm = () => {
        setNewFormData({ name: "", description: "", price: "", stock: "" })
        setSelectedImage(null)
        setImagePreview(null)
        if (fileInputRef.current) fileInputRef.current.value = ""
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

    const handleNewFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setNewFormData((prev) => ({ ...prev, [name]: value }))
    }

    // ── Stats ──────────────────────────────────────────────────────────────────

    const activeCount = products.filter((p) => p.is_active).length
    const outOfStockCount = products.filter((p) => p.stock === 0).length
    const lowStockCount = products.filter((p) => p.stock > 0 && p.stock < 10).length

    const statCards = [
        { label: "Total Products", value: products.length, icon: ShoppingBag },
        { label: "Active", value: activeCount, icon: CheckCircle2 },
        { label: "Low Stock", value: lowStockCount, icon: AlertTriangle },
        { label: "Out of Stock", value: outOfStockCount, icon: XCircle },
    ]

    // ── Table columns ──────────────────────────────────────────────────────────

    const columns: ColumnDef<Product>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
                    onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
                    aria-label="Select all"
                    className="border-purple-300"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(v) => row.toggleSelected(!!v)}
                    aria-label="Select row"
                    className="border-purple-300"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "image",
            header: () => <span className="text-xs font-semibold text-purple-800">Image</span>,
            cell: ({ row }) => (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden flex-shrink-0 border-2 border-purple-100 bg-purple-50 shadow-sm">
                    <Image
                        src={getImageUrl(row.original.image) || "/placeholder.svg"}
                        alt={row.original.name}
                        width={48} height={48}
                        className="object-cover w-full h-full"
                    />
                </div>
            ),
        },
        {
            accessorKey: "name",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="p-0 h-auto font-semibold text-purple-900 hover:text-purple-700">
                    Product Name <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="font-semibold text-gray-900 truncate max-w-[180px]">{row.original.name}</div>
            ),
        },
        {
            accessorKey: "price",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="p-0 h-auto font-semibold text-purple-900 hover:text-purple-700">
                    Price <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="font-bold text-purple-700">₱{formatPrice(row.original.price)}</div>
            ),
        },
        {
            accessorKey: "stock",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="p-0 h-auto font-semibold text-purple-900 hover:text-purple-700 hidden sm:flex">
                    Stock <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="hidden sm:flex flex-col gap-1.5">
                    <span className="font-semibold text-sm text-gray-700">{row.original.stock} pcs</span>
                    <StockBadge stock={row.original.stock} />
                </div>
            ),
        },
        {
            accessorKey: "is_active",
            header: () => <span className="text-xs font-semibold text-purple-800">Status</span>,
            cell: ({ row }) =>
                row.original.is_active ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" /> Active
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" /> Inactive
                    </span>
                ),
        },
        {
            accessorKey: "created_at",
            header: ({ column }) => (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    className="p-0 h-auto font-semibold text-purple-900 hover:text-purple-700 hidden lg:flex">
                    Created <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => (
                <div className="text-sm text-gray-500 hidden lg:block whitespace-nowrap">
                    {new Date(row.original.created_at).toLocaleDateString("en-US", {
                        month: "short", day: "2-digit", year: "numeric",
                    })}
                </div>
            ),
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const product = row.original
                return (
                    <div className="flex items-center gap-1">
                        {/* View Sheet */}
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button
                                    variant="ghost" size="sm"
                                    onClick={() => setSelectedProduct(product)}
                                    className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-3 rounded-lg text-purple-600 hover:text-purple-800 hover:bg-purple-50"
                                >
                                    <Eye className="h-4 w-4" />
                                    <span className="ml-1.5 sr-only sm:not-sr-only hidden sm:inline text-xs font-medium">View</span>
                                </Button>
                            </SheetTrigger>
                            <ProductDetailSheet
                                product={selectedProduct?.id === product.id ? selectedProduct : null}
                                onEdit={(id) => router.push(`/admin/product/${id}/edit`)}
                            />
                        </Sheet>

                        {/* Actions dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm"
                                    className="h-8 w-8 p-0 rounded-lg text-purple-500 hover:bg-purple-50 hover:text-purple-700">
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44 shadow-xl border-purple-100">
                                <DropdownMenuLabel className="text-purple-700 text-xs font-bold uppercase tracking-wide">Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-purple-100" />
                                <DropdownMenuItem
                                    onClick={() => router.push(`/admin/product/${product.id}/edit`)}
                                    className="cursor-pointer gap-2 focus:bg-purple-50 focus:text-purple-900"
                                >
                                    <Edit className="h-4 w-4 text-purple-400" /> Edit Product
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-purple-100" />
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem
                                            onSelect={(e) => e.preventDefault()}
                                            className="cursor-pointer gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" /> Delete Product
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="max-w-md border-red-100">
                                        <AlertDialogHeader>
                                            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3 border border-red-100">
                                                <Trash2 className="w-6 h-6 text-red-500" />
                                            </div>
                                            <AlertDialogTitle className="text-center text-gray-900">Delete Product?</AlertDialogTitle>
                                            <AlertDialogDescription className="text-center text-gray-500">
                                                This will permanently delete{" "}
                                                <span className="font-semibold text-gray-800">"{product.name}"</span>{" "}
                                                and cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter className="gap-2">
                                            <AlertDialogCancel className="flex-1 border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl">
                                                Cancel
                                            </AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => handleDelete(product.id)}
                                                disabled={deletingId === product.id}
                                                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl"
                                            >
                                                {deletingId === product.id
                                                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</>
                                                    : "Delete"}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )
            },
        },
    ]

    // ── Table instance ─────────────────────────────────────────────────────────

    const table = useReactTable({
        data: products, columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getSortedRowModel: getSortedRowModel(),
        state: { columnFilters, globalFilter, rowSelection, sorting },
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
    })

    const filteredRows = table.getFilteredRowModel().rows
    const totalItems = filteredRows.length
    const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(totalItems / itemsPerPage)
    const startIndex = itemsPerPage === -1 ? 0 : (currentPage - 1) * itemsPerPage
    const paginatedRows = itemsPerPage === -1 ? filteredRows : filteredRows.slice(startIndex, startIndex + itemsPerPage)

    // ── Loading screen ─────────────────────────────────────────────────────────

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
                                <span className="text-purple-800 font-semibold">Loading products...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </SidebarProvider>
        )
    }

    // ── Page ───────────────────────────────────────────────────────────────────

    return (
        <SidebarProvider defaultOpen={!isMobile}>
            <div
                className="flex min-h-screen w-full"
                style={{ background: "linear-gradient(135deg, #f5f3ff 0%, #fdf4ff 50%, #f3e8ff 100%)" }}
            >
                <AppSidebar />
                <div className={`flex-1 min-w-0 ${isMobile ? "ml-0" : "ml-64"}`}>

                    {/* Mobile topbar */}
                    {isMobile && (
                        <div
                            className="sticky top-0 z-50 flex h-12 items-center gap-2 border-b px-4 shadow-sm"
                            style={{ background: "rgba(124,58,237,0.97)", borderColor: "rgba(168,85,247,0.3)" }}
                        >
                            <SidebarTrigger className="-ml-1 text-white" />
                            <span className="text-sm font-bold text-white">Products</span>
                        </div>
                    )}

                    <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
                        <div className="max-w-full space-y-6">

                            {/* Header */}
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-stretch justify-between">
                                <div
                                    className="rounded-2xl px-7 py-6 shadow-xl relative overflow-hidden"
                                    style={{ background: purpleGrad }}
                                >
                                    <div className="absolute right-4 top-4 w-20 h-20 rounded-full opacity-10 pointer-events-none"
                                        style={{ background: "radial-gradient(circle, white, transparent)" }} />
                                    <div className="flex items-center gap-3">
                                        <ShoppingBag className="w-7 h-7 text-white opacity-90" />
                                        <div>
                                            <h1 className="text-2xl font-bold text-white tracking-tight">Products Management</h1>
                                            <p className="text-violet-200 text-sm mt-0.5">Manage your tumbler products</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Total counter */}
                                <div
                                    className="rounded-2xl px-6 py-5 shadow-xl flex items-center gap-4 bg-white/90 border"
                                    style={{ borderColor: "rgba(139,92,246,0.15)" }}
                                >
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
                                        style={{ background: purpleGrad }}
                                    >
                                        <TrendingUp className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-purple-500 uppercase tracking-widest">Total Products</p>
                                        <p className="text-3xl font-bold text-purple-900 leading-tight">{products.length}</p>
                                    </div>
                                </div>
                            </div>

                            {/* ── Stat cards ── */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                {statCards.map((stat) => {
                                    const Icon = stat.icon
                                    return (
                                        <div
                                            key={stat.label}
                                            className="rounded-2xl bg-white/90 p-5 shadow-lg border flex items-center gap-4 hover:shadow-xl transition-shadow duration-200"
                                            style={{ borderColor: "rgba(139,92,246,0.15)" }}
                                        >
                                            <div
                                                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
                                                style={{ background: purpleGrad }}
                                            >
                                                <Icon className="w-6 h-6 text-white" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-purple-500 uppercase tracking-widest leading-none mb-1">
                                                    {stat.label}
                                                </p>
                                                <p className="text-3xl font-bold text-gray-900 leading-tight">{stat.value}</p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* ── Table card ── */}
                            <div
                                className="rounded-2xl shadow-2xl overflow-hidden border"
                                style={{ background: "rgba(255,255,255,0.95)", borderColor: "rgba(139,92,246,0.15)" }}
                            >
                                {/* Table header bar */}
                                <div className="px-6 py-5" style={{ background: purpleGrad }}>
                                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                                        <div>
                                            <h2 className="text-white font-bold text-base">All Products</h2>
                                            <p className="text-violet-200 text-xs mt-0.5">
                                                {table.getFilteredRowModel().rows.length} of {products.length} products
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2 flex-1 sm:flex-none sm:max-w-sm">
                                            {/* Search */}
                                            <div className="relative flex-1">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-300" />
                                                <Input
                                                    placeholder="Search products..."
                                                    value={globalFilter || ""}
                                                    onChange={(e) => setGlobalFilter(e.target.value)}
                                                    className="pl-9 text-white placeholder:text-purple-300 border-white/20 rounded-xl focus-visible:ring-white/30 h-9"
                                                    style={{ background: "rgba(255,255,255,0.15)" }}
                                                />
                                            </div>

                                            {/* Add Product dialog */}
                                            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                                                <DialogTrigger asChild>
                                                    <Button
                                                        size="sm"
                                                        className="shrink-0 bg-white text-purple-700 hover:bg-purple-50 font-semibold shadow-lg rounded-xl h-9 px-4"
                                                    >
                                                        <Plus className="mr-1.5 h-4 w-4" />
                                                        <span className="hidden sm:inline">Add Product</span>
                                                        <span className="sm:hidden">Add</span>
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto border-purple-200">
                                                    <DialogHeader className="pb-5 border-b border-purple-100">
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                                                style={{ background: purpleGrad }}
                                                            >
                                                                <Plus className="w-5 h-5 text-white" />
                                                            </div>
                                                            <div>
                                                                <DialogTitle className="text-purple-900 text-lg">Add New Product</DialogTitle>
                                                                <DialogDescription className="text-purple-400 text-xs mt-0.5">
                                                                    Fill in the details for the new tumbler.
                                                                </DialogDescription>
                                                            </div>
                                                        </div>
                                                    </DialogHeader>

                                                    <form onSubmit={handleCreateSubmit} className="space-y-5 pt-5">
                                                        <div className="space-y-1.5">
                                                            <Label htmlFor="name" className="text-xs font-bold text-purple-600 uppercase tracking-widest">
                                                                Product Name
                                                            </Label>
                                                            <Input
                                                                id="name" name="name"
                                                                value={newFormData.name} onChange={handleNewFormChange}
                                                                required disabled={isCreating}
                                                                placeholder="e.g., Premium Tumbler 500ml"
                                                                className="border-purple-200 focus:border-purple-400 focus-visible:ring-purple-300 rounded-xl"
                                                            />
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            <Label htmlFor="description" className="text-xs font-bold text-purple-600 uppercase tracking-widest">
                                                                Description
                                                            </Label>
                                                            <Textarea
                                                                id="description" name="description"
                                                                value={newFormData.description} onChange={handleNewFormChange}
                                                                rows={3} disabled={isCreating}
                                                                placeholder="Describe the tumbler, material, capacity..."
                                                                className="resize-none border-purple-200 focus:border-purple-400 focus-visible:ring-purple-300 rounded-xl"
                                                            />
                                                        </div>

                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-1.5">
                                                                <Label htmlFor="price" className="text-xs font-bold text-purple-600 uppercase tracking-widest">
                                                                    Price (₱)
                                                                </Label>
                                                                <Input
                                                                    id="price" name="price" type="number" step="0.01" min="0"
                                                                    value={newFormData.price} onChange={handleNewFormChange}
                                                                    required disabled={isCreating} placeholder="0.00"
                                                                    className="border-purple-200 focus:border-purple-400 focus-visible:ring-purple-300 rounded-xl"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <Label htmlFor="stock" className="text-xs font-bold text-purple-600 uppercase tracking-widest">
                                                                    Stock
                                                                </Label>
                                                                <Input
                                                                    id="stock" name="stock" type="number" min="0"
                                                                    value={newFormData.stock} onChange={handleNewFormChange}
                                                                    required disabled={isCreating} placeholder="0"
                                                                    className="border-purple-200 focus:border-purple-400 focus-visible:ring-purple-300 rounded-xl"
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            <Label className="text-xs font-bold text-purple-600 uppercase tracking-widest">
                                                                Product Image
                                                            </Label>
                                                            <div
                                                                className="rounded-xl border-2 border-dashed border-purple-200 hover:border-purple-400 transition-colors cursor-pointer p-5 text-center"
                                                                onClick={() => fileInputRef.current?.click()}
                                                            >
                                                                {imagePreview ? (
                                                                    <div className="flex items-center gap-4">
                                                                        <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-purple-200 flex-shrink-0">
                                                                            <Image src={imagePreview} alt="Preview" width={64} height={64} className="object-cover w-full h-full" />
                                                                        </div>
                                                                        <div className="text-left">
                                                                            <p className="text-sm font-semibold text-purple-700">{selectedImage?.name}</p>
                                                                            <p className="text-xs text-gray-400 mt-0.5">Click to change image</p>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <div className="py-2">
                                                                        <Upload className="w-8 h-8 text-purple-300 mx-auto mb-2" />
                                                                        <p className="text-sm font-medium text-purple-500">Click to upload image</p>
                                                                        <p className="text-xs text-gray-400 mt-0.5">PNG, JPG, WEBP up to 10MB</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <input
                                                                ref={fileInputRef} type="file" accept="image/*"
                                                                onChange={handleImageSelect} disabled={isCreating}
                                                                className="hidden"
                                                            />
                                                        </div>

                                                        <DialogFooter className="gap-2 pt-2">
                                                            <Button
                                                                type="button" variant="outline"
                                                                onClick={() => { setIsCreateModalOpen(false); resetForm() }}
                                                                disabled={isCreating}
                                                                className="flex-1 sm:flex-none border-purple-200 text-purple-600 hover:bg-purple-50 rounded-xl"
                                                            >
                                                                Cancel
                                                            </Button>
                                                            <Button
                                                                type="submit" disabled={isCreating}
                                                                className="flex-1 sm:flex-none text-white font-semibold shadow-lg rounded-xl"
                                                                style={{ background: purpleGrad }}
                                                            >
                                                                {isCreating
                                                                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</>
                                                                    : "Create Product"}
                                                            </Button>
                                                        </DialogFooter>
                                                    </form>
                                                </DialogContent>
                                            </Dialog>
                                        </div>
                                    </div>
                                </div>

                                {/* Per-page / count row */}
                                <div
                                    className="flex items-center justify-between px-6 py-3 border-b"
                                    style={{ borderColor: "rgba(139,92,246,0.08)", background: "rgba(250,245,255,0.5)" }}
                                >
                                    <span className="text-xs text-purple-500 font-medium">
                                        Showing {paginatedRows.length} of {filteredRows.length} products
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-400">Per page:</span>
                                        <Select
                                            value={itemsPerPage === -1 ? "all" : itemsPerPage.toString()}
                                            onValueChange={(v) => setItemsPerPage(v === "all" ? -1 : parseInt(v))}
                                        >
                                            <SelectTrigger className="w-20 h-7 border-purple-200 text-xs rounded-lg focus:ring-purple-300">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {["10", "25", "50", "100"].map((v) => (
                                                    <SelectItem key={v} value={v}>{v}</SelectItem>
                                                ))}
                                                <SelectItem value="all">All</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[640px]">
                                        <thead>
                                            <tr style={{ background: "linear-gradient(135deg, #f5f3ff, #fdf4ff)" }}>
                                                {table.getHeaderGroups().map((hg) =>
                                                    hg.headers.map((header) => (
                                                        <th
                                                            key={header.id}
                                                            className="text-left px-4 py-3.5 border-b text-xs font-bold uppercase tracking-wider"
                                                            style={{ borderColor: "rgba(139,92,246,0.1)", color: "#6d28d9" }}
                                                        >
                                                            {header.isPlaceholder ? null : (
                                                                typeof header.column.columnDef.header === "function"
                                                                    ? header.column.columnDef.header(header.getContext())
                                                                    : header.column.columnDef.header
                                                            )}
                                                        </th>
                                                    ))
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {paginatedRows.length === 0 ? (
                                                <tr>
                                                    <td colSpan={columns.length} className="py-20 text-center">
                                                        <div
                                                            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
                                                            style={{ background: purpleGrad }}
                                                        >
                                                            <Package className="w-8 h-8 text-white" />
                                                        </div>
                                                        <p className="text-lg font-semibold text-purple-900">No products found</p>
                                                        {globalFilter && (
                                                            <p className="text-sm text-purple-400 mt-1">Try adjusting your search</p>
                                                        )}
                                                    </td>
                                                </tr>
                                            ) : (
                                                paginatedRows.map((row, index) => (
                                                    <tr
                                                        key={row.id}
                                                        className="border-b transition-colors duration-100"
                                                        style={{
                                                            background: index % 2 === 0 ? "white" : "rgba(245,243,255,0.4)",
                                                            borderColor: "rgba(139,92,246,0.07)",
                                                        }}
                                                        onMouseEnter={(e) => {
                                                            e.currentTarget.style.background = "rgba(237,233,254,0.5)"
                                                        }}
                                                        onMouseLeave={(e) => {
                                                            e.currentTarget.style.background = index % 2 === 0 ? "white" : "rgba(245,243,255,0.4)"
                                                        }}
                                                    >
                                                        {row.getVisibleCells().map((cell) => (
                                                            <td key={cell.id} className="px-4 py-3 align-middle text-xs sm:text-sm">
                                                                {typeof cell.column.columnDef.cell === "function"
                                                                    ? cell.column.columnDef.cell(cell.getContext())
                                                                    : (cell.getValue() as React.ReactNode)}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div
                                        className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t"
                                        style={{ borderColor: "rgba(139,92,246,0.1)", background: "rgba(250,245,255,0.5)" }}
                                    >
                                        <p className="text-xs text-gray-500">
                                            Page{" "}
                                            <span className="font-bold text-purple-700">{currentPage}</span>{" "}
                                            of{" "}
                                            <span className="font-bold text-purple-700">{totalPages}</span>
                                        </p>
                                        <div className="flex items-center gap-1">
                                            {/* First */}
                                            <button
                                                onClick={() => setCurrentPage(1)} disabled={currentPage === 1}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500 hover:bg-purple-50 hover:text-purple-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                            >«</button>
                                            {/* Prev */}
                                            <button
                                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-purple-50 hover:text-purple-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                            ><ChevronLeft className="w-4 h-4" /></button>

                                            {/* Page numbers */}
                                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                let page: number
                                                if (totalPages <= 5) page = i + 1
                                                else if (currentPage <= 3) page = i + 1
                                                else if (currentPage >= totalPages - 2) page = totalPages - 4 + i
                                                else page = currentPage - 2 + i
                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() => setCurrentPage(page)}
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold transition-all"
                                                        style={
                                                            currentPage === page
                                                                ? { background: purpleGrad, color: "white", boxShadow: "0 2px 8px rgba(124,58,237,0.4)" }
                                                                : {}
                                                        }
                                                    >
                                                        {currentPage !== page && (
                                                            <span className="text-gray-600 hover:text-purple-600">{page}</span>
                                                        )}
                                                        {currentPage === page && page}
                                                    </button>
                                                )
                                            })}

                                            {/* Next */}
                                            <button
                                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-purple-50 hover:text-purple-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                            ><ChevronRight className="w-4 h-4" /></button>
                                            {/* Last */}
                                            <button
                                                onClick={() => setCurrentPage(totalPages)} disabled={currentPage === totalPages}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-gray-500 hover:bg-purple-50 hover:text-purple-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                                            >»</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}