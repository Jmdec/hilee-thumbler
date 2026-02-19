"use client"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import type React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { useAuthStore } from "@/store/authStore"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MoreHorizontal,
  Eye,
  Plus,
  Search,
  Loader2,
  ArrowUpDown,
  Edit,
  Trash2,
  Upload,
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useRef, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
} from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"

// Product data type
interface Product {
  id: number
  name: string
  description: string
  price: number | string
  quantity: number
  image: string
  is_active: boolean
  created_at: string
  updated_at: string
}

const getImageUrl = (imagePath: string): string => {
  if (!imagePath) return "/placeholder.svg"
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  const fullPath = imagePath.startsWith("images/products/") ? imagePath : `images/products/${imagePath}`
  return `${API_BASE_URL}/${fullPath}`
}

const getStockBadge = (quantity: number) => {
  if (quantity === 0)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 border border-red-200">
        <XCircle className="w-3 h-3" /> Out of Stock
      </span>
    )
  if (quantity < 10)
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-200">
        <AlertTriangle className="w-3 h-3" /> Low Stock
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200">
      <CheckCircle2 className="w-3 h-3" /> In Stock
    </span>
  )
}

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [itemsPerPage, setItemsPerPage] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [newFormData, setNewFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "",
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === "string" ? Number.parseFloat(price) : price
    return numPrice.toFixed(2)
  }

  const handleNewFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewFormData((prev) => ({ ...prev, [name]: value }))
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

  const tokenFromStore = useAuthStore((state) => state.token)

  const handleCreateSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const token = tokenFromStore || localStorage.getItem("auth_token")

      const formData = new FormData()
      formData.append("name", newFormData.name)
      formData.append("description", newFormData.description)
      formData.append("price", newFormData.price)
      formData.append("quantity", newFormData.quantity)
      if (selectedImage) formData.append("image", selectedImage)

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          body: formData,
        }
      )

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

  const resetForm = () => {
    setNewFormData({ name: "", description: "", price: "", quantity: "" })
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      // Always get the freshest token available
      const token = tokenFromStore || localStorage.getItem("auth_token") || localStorage.getItem("token")

      if (!token) {
        throw new Error("You must be logged in to delete products.")
      }

      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      })

      // Handle 204 No Content (successful delete with no body)
      if (response.status === 204) {
        toast({ title: "Success", description: "Product deleted successfully!" })
        fetchProducts()
        return
      }

      // Try to parse JSON, but don't fail if body is empty
      let result: any = {}
      const text = await response.text()
      if (text) {
        try { result = JSON.parse(text) } catch { /* ignore parse errors */ }
      }

      if (!response.ok) {
        throw new Error(result.message || `Delete failed with status ${response.status}`)
      }

      toast({ title: "Success", description: "Product deleted successfully!" })
      fetchProducts()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "There was an error deleting the product.",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/products?paginate=false")
      const result = await response.json()
      if (response.ok) {
        setProducts(result)
      } else {
        throw new Error(result.message || "Failed to fetch products")
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to load products" })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchProducts() }, [])

  const columns: ColumnDef<Product>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) => (
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0 border border-orange-100 bg-orange-50">
          <Image
            src={getImageUrl(row.original.image) || "/placeholder.svg"}
            alt={row.original.name}
            width={48}
            height={48}
            className="object-cover w-full h-full"
          />
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-800 transition-colors"
        >
          Product Name <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="font-semibold text-gray-900 text-sm">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-800 transition-colors"
        >
          Price <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="font-bold text-gray-900 text-sm">₱{formatPrice(row.original.price)}</div>
      ),
    },
    {
      accessorKey: "quantity",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hidden sm:flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-800 transition-colors"
        >
          Stock <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="hidden sm:flex flex-col gap-1.5">
          <span className="font-semibold text-sm text-gray-700">{row.original.quantity} pcs</span>
          {getStockBadge(row.original.quantity)}
        </div>
      ),
    },
    {
      accessorKey: "is_active",
      header: () => (
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</span>
      ),
      cell: ({ row }) =>
        row.original.is_active ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            Inactive
          </span>
        ),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <button
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hidden lg:flex items-center gap-1 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-800 transition-colors"
        >
          Created <ArrowUpDown className="h-3.5 w-3.5" />
        </button>
      ),
      cell: ({ row }) => (
        <div className="text-xs text-gray-500 hidden lg:block whitespace-nowrap">
          {new Date(row.original.created_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const product = row.original
        return (
          <div className="flex items-center gap-1 justify-end">
            <Sheet>
              <SheetTrigger asChild>
                <button
                  onClick={() => setSelectedProduct(product)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-all"
                  title="View details"
                >
                  <Eye className="h-4 w-4" />
                  <span>View</span>
                </button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                {selectedProduct && (
                  <>
                    <SheetHeader>
                      <SheetTitle>Product Details</SheetTitle>
                      <SheetDescription>Complete information for this product</SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-6">
                      <div className="flex justify-center mb-6">
                        <div className="w-40 h-40 rounded-xl overflow-hidden border-2 border-gray-200 shadow-md">
                          <Image
                            src={getImageUrl(selectedProduct.image) || "/placeholder.svg"}
                            alt={selectedProduct.name}
                            width={160}
                            height={160}
                            className="object-cover w-full h-full"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Product Name</Label>
                            <p className="text-lg font-semibold">{selectedProduct.name}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Price</Label>
                            <p className="text-xl font-bold text-green-600">₱{formatPrice(selectedProduct.price)}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Quantity</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Package className="w-4 h-4 text-gray-400" />
                              <span className="font-medium">{selectedProduct.quantity} pcs</span>
                              {getStockBadge(selectedProduct.quantity)}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Status</Label>
                            <div className="mt-1">
                              {selectedProduct.is_active
                                ? <Badge className="bg-blue-100 text-blue-800 border-blue-300">Active</Badge>
                                : <Badge variant="outline" className="text-gray-500">Inactive</Badge>
                              }
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Created On</Label>
                            <p className="text-sm">{new Date(selectedProduct.created_at).toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" })}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-500">Last Updated</Label>
                            <p className="text-sm">{new Date(selectedProduct.updated_at).toLocaleDateString("en-US", { month: "long", day: "2-digit", year: "numeric" })}</p>
                          </div>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Description</Label>
                        <p className="text-sm mt-1 p-3 bg-gray-50 rounded-md whitespace-pre-wrap">{selectedProduct.description}</p>
                      </div>
                    </div>
                  </>
                )}
              </SheetContent>
            </Sheet>

            <button
              onClick={() => router.push(`/admin/products/${product.id}/edit`)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-orange-600 hover:bg-orange-50 transition-all"
              title="Edit product"
            >
              <Edit className="h-4 w-4" />
            </button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44 shadow-lg border-gray-100">
                <DropdownMenuLabel className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Actions</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => router.push(`/admin/products/${product.id}/edit`)}
                  className="cursor-pointer gap-2"
                >
                  <Edit className="h-4 w-4 text-gray-500" /> Edit Product
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="cursor-pointer gap-2 text-red-600 focus:text-red-600 focus:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" /> Delete Product
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                      <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                        <Trash2 className="w-6 h-6 text-red-600" />
                      </div>
                      <AlertDialogTitle className="text-center">Delete Product?</AlertDialogTitle>
                      <AlertDialogDescription className="text-center">
                        This will permanently delete{" "}
                        <span className="font-semibold text-gray-900">"{product.name}"</span> and cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2 sm:gap-2">
                      <AlertDialogCancel className="flex-1 border-gray-200">Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      >
                        {deletingId === product.id ? (
                          <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</>
                        ) : "Delete"}
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

  const table = useReactTable({
    data: products,
    columns,
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
  const endIndex = itemsPerPage === -1 ? totalItems : startIndex + itemsPerPage
  const paginatedRows = itemsPerPage === -1 ? filteredRows : filteredRows.slice(startIndex, endIndex)

  useEffect(() => { setCurrentPage(1) }, [itemsPerPage, globalFilter])

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(value === "all" ? -1 : parseInt(value))
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
                <span className="text-gray-700 font-medium">Loading products...</span>
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
              <span className="text-sm font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Products</span>
            </div>
          )}
          <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
            <div className="max-w-full space-y-4 sm:space-y-6">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-orange-100">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Products Management
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your tumbler products</p>
              </div>

              <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-orange-100">
                {/* Card Header — original orange gradient, search + Add button */}
                <CardHeader className="pb-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
                      <Input
                        placeholder="Search products..."
                        value={globalFilter || ""}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="pl-9 pr-3 py-2 w-full bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 focus:border-white/50 transition-all duration-200"
                      />
                    </div>

                    <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="shrink-0 bg-white text-orange-600 hover:bg-orange-50 hover:text-orange-700 font-semibold shadow-lg">
                          <Plus className="mr-2 h-4 w-4" />
                          <span className="hidden sm:inline">Add Product</span>
                          <span className="sm:hidden">Add</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto mx-4 bg-gradient-to-br from-orange-50 to-red-50">
                        <DialogHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 -m-6 mb-4 rounded-t-lg">
                          <DialogTitle className="text-xl font-bold">Add New Product</DialogTitle>
                          <DialogDescription className="text-orange-100">Fill in the details for the new tumbler.</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleCreateSubmit} className="space-y-5 py-4">
                          <div>
                            <Label htmlFor="name" className="text-gray-700 font-medium">Product Name</Label>
                            <Input
                              id="name"
                              name="name"
                              value={newFormData.name}
                              onChange={handleNewFormChange}
                              required
                              disabled={isCreating}
                              placeholder="e.g., Izakaya Premium Tumbler"
                              className="mt-1 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                            />
                          </div>
                          <div>
                            <Label htmlFor="description" className="text-gray-700 font-medium">Description</Label>
                            <Textarea
                              id="description"
                              name="description"
                              value={newFormData.description}
                              onChange={handleNewFormChange}
                              rows={3}
                              disabled={isCreating}
                              placeholder="Describe the tumbler, material, capacity..."
                              className="mt-1 resize-none border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="price" className="text-gray-700 font-medium">Price (₱)</Label>
                              <Input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                min="0"
                                value={newFormData.price}
                                onChange={handleNewFormChange}
                                required
                                disabled={isCreating}
                                placeholder="0.00"
                                className="mt-1 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                              />
                            </div>
                            <div>
                              <Label htmlFor="quantity" className="text-gray-700 font-medium">Quantity</Label>
                              <Input
                                id="quantity"
                                name="quantity"
                                type="number"
                                min="0"
                                value={newFormData.quantity}
                                onChange={handleNewFormChange}
                                required
                                disabled={isCreating}
                                placeholder="0"
                                className="mt-1 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                              />
                            </div>
                          </div>
                          <div>
                            <Label htmlFor="image" className="text-gray-700 font-medium">Product Image</Label>
                            <div className="flex items-center gap-3 mt-1">
                              <Input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                disabled={isCreating}
                                className="flex-1 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isCreating}
                                size="sm"
                                className="border-orange-300 text-orange-600 hover:bg-orange-50"
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Browse
                              </Button>
                            </div>
                            {imagePreview && (
                              <div className="mt-3">
                                <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-orange-200 shadow-md">
                                  <Image src={imagePreview} alt="Preview" width={80} height={80} className="object-cover w-full h-full" />
                                </div>
                              </div>
                            )}
                          </div>
                          <DialogFooter className="gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => { setIsCreateModalOpen(false); resetForm() }}
                              disabled={isCreating}
                              className="flex-1 sm:flex-none border-orange-300 text-orange-600 hover:bg-orange-50"
                            >
                              Cancel
                            </Button>
                            <Button
                              type="submit"
                              disabled={isCreating}
                              className="flex-1 sm:flex-none bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg"
                            >
                              {isCreating ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</>
                              ) : "Create Product"}
                            </Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>

                {/* ── NEW TABLE DESIGN FROM PAGE 2 ── */}
                <CardContent className="bg-white p-0">
                  {/* Table Controls */}
                  <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between px-5 py-4 border-b border-gray-100">
                    <p className="text-sm text-gray-600 font-medium">
                      Showing{" "}
                      <span className="font-semibold text-gray-800">{totalItems === 0 ? 0 : startIndex + 1} to {Math.min(endIndex, totalItems)}</span>{" "}
                      of <span className="font-semibold text-gray-800">{totalItems}</span> products
                    </p>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm text-gray-600 whitespace-nowrap">Items per page:</Label>
                      <Select value={itemsPerPage === -1 ? "all" : itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                        <SelectTrigger className="w-24 h-9 border-gray-200 focus:border-orange-400 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                          <SelectItem value="all">All</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="bg-gradient-to-r from-orange-100 to-red-100 border-b border-orange-200">
                          {table.getHeaderGroups().map((headerGroup) =>
                            headerGroup.headers.map((header) => (
                              <th key={header.id} className="text-left px-4 py-3 text-sm font-semibold text-gray-700 tracking-wide">
                                {header.isPlaceholder
                                  ? null
                                  : typeof header.column.columnDef.header === "function"
                                  ? header.column.columnDef.header(header.getContext())
                                  : header.column.columnDef.header}
                              </th>
                            ))
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedRows.length === 0 ? (
                          <tr>
                            <td colSpan={columns.length} className="px-4 py-16 text-center">
                              <div className="flex flex-col items-center gap-3">
                                <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center">
                                  <Package className="w-8 h-8 text-orange-300" />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-700">No products found</p>
                                  {globalFilter && (
                                    <p className="text-sm text-gray-400 mt-0.5">No results for "{globalFilter}"</p>
                                  )}
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          paginatedRows.map((row, index) => (
                            <tr
                              key={row.id}
                              className={`border-b border-orange-100 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-200 ${index % 2 === 0 ? "bg-white" : "bg-orange-50/30"}`}
                            >
                              {row.getVisibleCells().map((cell) => (
                                <td key={cell.id} className="px-4 py-3.5 text-sm align-middle">
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
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50/50">
                      <p className="text-sm text-gray-500">
                        Page <span className="font-semibold text-gray-700">{currentPage}</span> of{" "}
                        <span className="font-semibold text-gray-700">{totalPages}</span>
                      </p>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setCurrentPage(1)}
                          disabled={currentPage === 1}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white hover:text-orange-600 hover:border hover:border-orange-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-semibold"
                        >«</button>
                        <button
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white hover:text-orange-600 hover:border hover:border-orange-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        ><ChevronLeft className="w-4 h-4" /></button>
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
                              className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold transition-all ${
                                currentPage === page
                                  ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md shadow-orange-200"
                                  : "text-gray-600 hover:bg-white hover:text-orange-600 hover:border hover:border-orange-200"
                              }`}
                            >{page}</button>
                          )
                        })}
                        <button
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white hover:text-orange-600 hover:border hover:border-orange-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        ><ChevronRight className="w-4 h-4" /></button>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          disabled={currentPage === totalPages}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-white hover:text-orange-600 hover:border hover:border-orange-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all text-xs font-semibold"
                        >»</button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}