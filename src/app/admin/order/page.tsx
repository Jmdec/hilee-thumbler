"use client"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import type React from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MoreHorizontal, Eye, Search, Loader2, ArrowUpDown, Edit,
  Package, CheckCircle, XCircle, Truck, DollarSign,
  User, Phone, MapPin,
} from "lucide-react"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import {
  type ColumnDef, type ColumnFiltersState, type RowSelectionState,
  type SortingState,
  useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel,
} from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"
import Image from "next/image"

interface OrderItem {
  id: number
  name: string
  description: string
  price: number
  quantity: number
  category: string
  is_spicy: boolean
  is_vegetarian: boolean
  image_url: string
}

interface Order {
  id: number
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  delivery_address: string
  delivery_city: string
  delivery_zip_code: string
  payment_method: string
  status: "confirmed" | "preparing" | "ready" | "delivered" | "cancelled"
  subtotal: number
  delivery_fee: number
  total_amount: number
  notes?: string
  receipt_file?: string
  items: OrderItem[]
  created_at: string
  updated_at: string
}

const orderStatuses = [
  { value: "confirmed", label: "Confirmed", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  { value: "preparing", label: "Preparing", color: "bg-orange-100 text-orange-800", icon: Package },
  { value: "ready", label: "On The Way", color: "bg-violet-100 text-violet-800", icon: Truck },
  { value: "delivered", label: "Delivered", color: "bg-emerald-100 text-emerald-800", icon: CheckCircle },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800", icon: XCircle },
]

const paymentMethods = [
  { value: "cash", label: "Cash on Delivery" },
  { value: "gcash", label: "GCash" },
  { value: "security_bank", label: "Security Bank" },
  { value: "paypal", label: "PayPal" },
  { value: "bpi", label: "BPI Online" },
  { value: "maya", label: "Maya" },
]

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState("")
  // Client-side filter state
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all")
  const [isMobile, setIsMobile] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Apply client-side filters on top of raw orders data
  const filteredOrders = useMemo(() => {
    let result = orders
    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter)
    }
    if (paymentMethodFilter !== "all") {
      result = result.filter((o) => o.payment_method === paymentMethodFilter)
    }
    return result
  }, [orders, statusFilter, paymentMethodFilter])

  const calculateTotalRevenue = (orders: Order[]): string => {
    if (!Array.isArray(orders) || orders.length === 0) return "0.00"
    try {
      const total = orders.reduce((sum, order) => {
        const orderTotal = typeof order.total_amount === "number" ? order.total_amount : 0
        return sum + orderTotal
      }, 0)
      return total.toFixed(2)
    } catch {
      return "0.00"
    }
  }

  const getStatusBadge = (status: string) => {
    const statusInfo = orderStatuses.find((s) => s.value === status)
    if (!statusInfo) return null
    const Icon = statusInfo.icon
    return (
      <Badge className={`text-xs px-2 py-1 ${statusInfo.color} border-0`}>
        <Icon className="w-3 h-3 mr-1" />
        {statusInfo.label}
      </Badge>
    )
  }

  const getPaymentMethodBadge = (method: string) => {
    const methodInfo = paymentMethods.find((m) => m.value === method)
    return (
      <Badge variant="outline" className="text-xs border-purple-200 text-purple-700">
        {methodInfo?.label || method}
      </Badge>
    )
  }

  const getDisabledStatuses = (currentStatus: string): string[] => {
    switch (currentStatus) {
      case "cancelled": return ["confirmed", "preparing", "ready", "delivered"]
      case "preparing": return ["confirmed"]
      case "ready": return ["confirmed", "preparing"]
      case "delivered": return ["confirmed", "preparing", "ready", "cancelled"]
      default: return []
    }
  }

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    setUpdatingStatus(orderId)
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) throw new Error("Authentication token not found")

      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Admin-Request": "true",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.message || "Failed to update order status.")

      toast({ title: "Success", description: "Order status updated successfully!" })
      fetchOrders()
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Error updating status." })
    } finally {
      setUpdatingStatus(null)
    }
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("auth_token")
      if (!token) {
        toast({ variant: "destructive", title: "Authentication Required", description: "Please log in." })
        router.push("/login")
        return
      }

      // Fetch ALL orders — filtering is done client-side
      const response = await fetch("/api/orders?per_page=100", {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Admin-Request": "true",
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        if (response.status === 401) {
          localStorage.removeItem("auth_token")
          router.push("/login")
          return
        }
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      if (result.success) {
        const ordersData = result.data || []
        if (Array.isArray(ordersData)) {
          const validatedOrders = ordersData.map((order) => ({
            ...order,
            total_amount: typeof order.total_amount === "number" ? order.total_amount : Number(order.total ?? 0),
            subtotal: typeof order.subtotal === "number" ? order.subtotal : 0,
            delivery_fee: typeof order.delivery_fee === "number" ? order.delivery_fee : 0,
            items: Array.isArray(order.items) ? order.items : [],
          }))
          setOrders(validatedOrders)
        } else {
          setOrders([])
        }
      } else {
        throw new Error(result.message || "Failed to fetch orders")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load orders.",
      })
      setOrders([])
      if (error instanceof Error && error.message.includes("401")) {
        localStorage.removeItem("auth_token")
        router.push("/login")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchOrders() }, [])

  const columns: ColumnDef<Order>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="border-purple-300"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="border-purple-300"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "order_number",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="p-0 h-auto font-semibold text-purple-900 hover:text-purple-700">
          Order # <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="font-semibold text-purple-900 truncate">#{row.original.order_number}</div>
          <div className="text-xs text-purple-400 sm:hidden truncate">{row.original.customer_name}</div>
        </div>
      ),
    },
    {
      accessorKey: "customer_name",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="p-0 h-auto font-semibold text-purple-900 hover:text-purple-700 hidden sm:flex">
          Customer <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="min-w-0 hidden sm:block">
          <div className="font-medium text-gray-900 truncate">{row.original.customer_name}</div>
          <div className="text-xs text-gray-500 truncate">{row.original.customer_email}</div>
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="p-0 h-auto font-semibold text-purple-900 hover:text-purple-700">
          Status <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => getStatusBadge(row.original.status),
    },
    {
      accessorKey: "payment_method",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="p-0 h-auto font-semibold text-purple-900 hover:text-purple-700 hidden lg:flex">
          Payment <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="hidden lg:block">{getPaymentMethodBadge(row.original.payment_method)}</div>,
    },
    {
      accessorKey: "total_amount",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="p-0 h-auto font-semibold text-purple-900 hover:text-purple-700">
          Total <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-bold text-purple-700">₱{(row.original.total_amount || 0).toFixed(2)}</div>
      ),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="p-0 h-auto font-semibold text-purple-900 hover:text-purple-700 hidden lg:flex">
          Created <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-gray-600 hidden lg:block">
          {new Date(row.original.created_at).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className="flex items-center gap-1">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => setSelectedOrder(order)} className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50">
                  <Eye className="h-4 w-4" />
                  <span className="ml-1 sr-only sm:not-sr-only hidden sm:inline">View</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
                {selectedOrder && (
                  <>
                    <SheetHeader>
                      <SheetTitle className="text-purple-900">Order Details - #{selectedOrder.order_number}</SheetTitle>
                      <SheetDescription>Complete information for this order</SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusBadge(selectedOrder.status)}
                            {getPaymentMethodBadge(selectedOrder.payment_method)}
                          </div>
                          <p className="text-sm text-gray-600">
                            Order placed on{" "}
                            {new Date(selectedOrder.created_at).toLocaleDateString("en-US", {
                              month: "long", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-purple-700">
                            ₱{(typeof selectedOrder.total_amount === "number" ? selectedOrder.total_amount : 0).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-500">
                            Subtotal: ₱{(typeof selectedOrder.subtotal === "number" ? selectedOrder.subtotal : 0).toFixed(2)} +
                            Delivery: ₱{(typeof selectedOrder.delivery_fee === "number" ? selectedOrder.delivery_fee : 0).toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="border-purple-100">
                          <CardHeader className="pb-3 bg-purple-50 rounded-t-lg">
                            <h3 className="font-semibold text-lg flex items-center gap-2 text-purple-900">
                              <User className="w-5 h-5 text-purple-600" /> Customer Information
                            </h3>
                          </CardHeader>
                          <CardContent className="space-y-3 pt-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Name</Label>
                              <p className="font-medium">{selectedOrder.customer_name}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Email</Label>
                              <p className="text-sm">{selectedOrder.customer_email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-purple-400" />
                              <p className="text-sm">{selectedOrder.customer_phone}</p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="border-purple-100">
                          <CardHeader className="pb-3 bg-purple-50 rounded-t-lg">
                            <h3 className="font-semibold text-lg flex items-center gap-2 text-purple-900">
                              <MapPin className="w-5 h-5 text-purple-600" /> Delivery Address
                            </h3>
                          </CardHeader>
                          <CardContent className="space-y-2 pt-4">
                            <p className="text-sm">{selectedOrder.delivery_address}</p>
                            <p className="text-sm">{selectedOrder.delivery_city}, {selectedOrder.delivery_zip_code}</p>
                          </CardContent>
                        </Card>
                      </div>

                      <Card className="border-purple-100">
                        <CardHeader className="pb-3 bg-purple-50 rounded-t-lg">
                          <h3 className="font-semibold text-lg flex items-center gap-2 text-purple-900">
                            <Package className="w-5 h-5 text-purple-600" />
                            Order Items ({selectedOrder.items?.length || 0})
                          </h3>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {(selectedOrder.items || []).map((item, index) => (
                              <div key={index} className="flex items-center gap-3 p-3 border border-purple-100 rounded-lg hover:bg-purple-50 transition-colors">
                                <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                                  <Image
                                    src={item.image_url || "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"}
                                    alt={item.name}
                                    width={48}
                                    height={48}
                                    className="object-cover w-full h-full"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm truncate">{item.name}</h4>
                                  <p className="text-xs text-gray-500 truncate">{item.description}</p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs border-purple-200 text-purple-700">{item.category}</Badge>
                                    {item.is_spicy && <Badge variant="destructive" className="text-xs">Spicy</Badge>}
                                    {item.is_vegetarian && <Badge className="text-xs bg-green-100 text-green-800">Veg</Badge>}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium text-sm">₱{(typeof item.price === "number" ? item.price : 0).toFixed(2)}</div>
                                  <div className="text-xs text-gray-500">Qty: {item.quantity || 0}</div>
                                  <div className="font-bold text-xs text-purple-700">
                                    ₱{((typeof item.price === "number" ? item.price : 0) * (item.quantity || 0)).toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {selectedOrder.notes && (
                        <Card className="border-purple-100">
                          <CardHeader className="pb-3 bg-purple-50 rounded-t-lg">
                            <h3 className="font-semibold text-lg text-purple-900">Special Notes</h3>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm p-3 bg-purple-50 rounded-md whitespace-pre-wrap">{selectedOrder.notes}</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </>
                )}
              </SheetContent>
            </Sheet>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-purple-600 hover:text-purple-800 hover:bg-purple-50">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="border-purple-100">
                <DropdownMenuLabel className="text-purple-900">Order Actions</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-purple-100" />
                {orderStatuses.map((status) => {
                  const disabledStatuses = getDisabledStatuses(order.status)
                  const isDisabled =
                    updatingStatus === order.id ||
                    order.status === status.value ||
                    disabledStatuses.includes(status.value)
                  return (
                    <DropdownMenuItem
                      key={status.value}
                      onClick={() => !isDisabled && handleStatusUpdate(order.id, status.value)}
                      disabled={isDisabled}
                      className={isDisabled ? "opacity-40 cursor-not-allowed" : "focus:bg-purple-50 focus:text-purple-900"}
                    >
                      <status.icon className="mr-2 h-4 w-4" />
                      Mark as {status.label}
                    </DropdownMenuItem>
                  )
                })}
                <DropdownMenuSeparator className="bg-purple-100" />
                <DropdownMenuItem onClick={() => router.push(`/admin/order/${order.id}/edit`)} className="text-red-600 focus:bg-red-50">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Order
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  // Table now receives `filteredOrders` (pre-filtered by status/payment) + globalFilter for search
  const table = useReactTable({
    data: filteredOrders,
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

  if (loading) {
    return (
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex min-h-screen w-full bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100">
          <AppSidebar />
          <div className={`flex-1 min-w-0 ${isMobile ? "ml-0" : "ml-72"}`}>
            <div className="flex items-center justify-center min-h-screen w-full">
              <div className="flex items-center gap-3 bg-white/90 backdrop-blur-sm px-8 py-5 rounded-2xl shadow-xl border border-purple-100">
                <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                <span className="text-purple-800 font-semibold">Loading orders...</span>
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-purple-50 via-violet-50 to-purple-100">
        <AppSidebar />
        <div className={`flex-1 min-w-0 ${isMobile ? "ml-0" : "ml-72"}`}>
          {isMobile && (
            <div className="sticky top-0 z-50 flex h-12 items-center gap-2 border-b bg-white/90 backdrop-blur-sm px-4 md:hidden shadow-sm border-purple-100">
              <SidebarTrigger className="-ml-1" />
              <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                Orders
              </span>
            </div>
          )}

          <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
            <div className="max-w-full space-y-4 sm:space-y-6">

              {/* Header */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-purple-100">
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-700 to-violet-600 bg-clip-text text-transparent">
                    주문 관리 Orders
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">
                    Manage customer orders and track delivery status
                  </p>
                  <p className="text-xs text-purple-400 mt-1">Showing all orders from all customers (Admin View)</p>
                </div>
                <div className="flex items-center gap-4 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-purple-100">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Total Revenue</p>
                      <span className="font-bold text-purple-700 text-lg">₱{calculateTotalRevenue(orders)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {orderStatuses.slice(0, 4).map((status) => {
                  const count = orders.filter((order) => order.status === status.value).length
                  const Icon = status.icon
                  return (
                    <Card
                      key={status.value}
                      onClick={() => setStatusFilter(statusFilter === status.value ? "all" : status.value)}
                      className={`bg-white/80 backdrop-blur-sm shadow-lg border transition-all duration-200 rounded-2xl cursor-pointer ${
                        statusFilter === status.value
                          ? "border-purple-400 ring-2 ring-purple-300 shadow-purple-200"
                          : "border-purple-100 hover:shadow-xl hover:border-purple-200"
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-500">{status.label}</p>
                            <p className="text-3xl font-black text-purple-700 mt-1">{count}</p>
                          </div>
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Filters + Table */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-xl border-purple-100 rounded-2xl overflow-hidden">
                <CardHeader className="pb-0 p-0">
                  <div className="bg-gradient-to-r from-purple-600 to-violet-600 p-4 rounded-t-2xl">
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/60" />
                        <Input
                          placeholder="Search orders..."
                          value={globalFilter || ""}
                          onChange={(e) => setGlobalFilter(e.target.value)}
                          className="pl-9 w-full bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/30 focus:border-white/60 rounded-xl"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-36 bg-white/20 border-white/30 text-white focus:bg-white/30 rounded-xl">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            {orderStatuses.map((s) => (
                              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                          <SelectTrigger className="w-36 bg-white/20 border-white/30 text-white focus:bg-white/30 rounded-xl">
                            <SelectValue placeholder="Payment" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Payments</SelectItem>
                            {paymentMethods.map((m) => (
                              <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-4 bg-white">
                  {/* Active filter pills */}
                  {(statusFilter !== "all" || paymentMethodFilter !== "all") && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {statusFilter !== "all" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                          Status: {orderStatuses.find((s) => s.value === statusFilter)?.label}
                          <button onClick={() => setStatusFilter("all")} className="ml-1 hover:text-purple-900 font-bold">×</button>
                        </span>
                      )}
                      {paymentMethodFilter !== "all" && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                          Payment: {paymentMethods.find((m) => m.value === paymentMethodFilter)?.label}
                          <button onClick={() => setPaymentMethodFilter("all")} className="ml-1 hover:text-purple-900 font-bold">×</button>
                        </span>
                      )}
                      <button
                        onClick={() => { setStatusFilter("all"); setPaymentMethodFilter("all") }}
                        className="text-xs text-purple-400 hover:text-purple-600 underline"
                      >
                        Clear all
                      </button>
                    </div>
                  )}

                  <div className="text-sm text-purple-500 mb-4 font-medium">
                    Showing {table.getFilteredRowModel().rows.length} of {orders.length} orders
                  </div>

                  <div className="rounded-xl border border-purple-100 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[800px]">
                        <thead className="bg-gradient-to-r from-purple-50 to-violet-50">
                          <tr className="border-b border-purple-100">
                            {table.getHeaderGroups().map((headerGroup) =>
                              headerGroup.headers.map((header) => (
                                <th key={header.id} className="text-left p-3 text-xs sm:text-sm font-semibold text-purple-800">
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
                          {table.getRowModel().rows.map((row, index) => (
                            <tr
                              key={row.id}
                              className={`border-b border-purple-50 hover:bg-purple-50/50 transition-colors duration-150 ${index % 2 === 0 ? "bg-white" : "bg-purple-50/20"}`}
                            >
                              {row.getVisibleCells().map((cell) => (
                                <td key={cell.id} className="p-3 text-xs sm:text-sm">
                                  {typeof cell.column.columnDef.cell === "function"
                                    ? cell.column.columnDef.cell(cell.getContext())
                                    : (cell.getValue() as React.ReactNode)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {table.getRowModel().rows.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-xl border border-purple-100 mt-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-purple-500" />
                      </div>
                      <p className="text-lg font-semibold text-purple-800">No orders found</p>
                      {(globalFilter || statusFilter !== "all" || paymentMethodFilter !== "all") && (
                        <p className="text-sm mt-1 text-gray-500">Try adjusting your search terms or filters</p>
                      )}
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