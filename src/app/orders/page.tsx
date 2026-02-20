"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Package, Clock, CheckCircle, XCircle, User, LogIn,
  MapPin, CreditCard, ChefHat, Eye, Filter, AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import IzakayaLoader from "@/components/oppa-loader"

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
  subtotal?: number
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
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled"
  subtotal: number
  delivery_fee: number
  total_amount: number
  notes?: string
  receipt_file?: string
  items: OrderItem[]
  created_at: string
  updated_at: string
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [cancellingOrderId, setCancellingOrderId] = useState<number | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("auth_token")
      const userData = localStorage.getItem("user_data")

      if (!token) { setLoading(false); return }

      if (userData) {
        try { setUser(JSON.parse(userData)) } catch (e) { console.error(e) }
      }

      try {
        const ordersResponse = await apiClient.getOrders()
        if (ordersResponse.success && ordersResponse.data) {
          const raw = Array.isArray(ordersResponse.data)
            ? ordersResponse.data
            : ordersResponse.data.data || ordersResponse.data.orders || []

          const validated = raw.map((order: any) => ({
            ...order,
            total_amount: typeof order.total_amount === "number"
              ? order.total_amount
              : Number(order.total ?? order.total_amount ?? 0),
            subtotal: Number(order.subtotal ?? 0),
            delivery_fee: Number(order.delivery_fee ?? 0),
            items: Array.isArray(order.items)
              ? order.items.map((item: any) => ({
                ...item,
                price: Number(item.price ?? 0),
                quantity: Number(item.quantity ?? 0), subtotal: Number(item.subtotal ?? (item.price * item.quantity)),
              }))
              : [],
          }))

          setOrders(validated)
          setFilteredOrders(validated)
        }
      } catch (error) {
        toast({ title: "Error", description: "Failed to load orders.", variant: "destructive" })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  useEffect(() => {
    setFilteredOrders(
      activeFilter === "all" ? orders : orders.filter((o) => o.status === activeFilter)
    )
  }, [activeFilter, orders])

  const canCancelOrder = (order: Order) =>
    ["pending", "confirmed"].includes(order.status)

  const handleCancelClick = (order: Order) => {
    setOrderToCancel(order)
    setShowCancelDialog(true)
  }

  const handleCancelOrder = async () => {
    if (!orderToCancel) return
    setCancellingOrderId(orderToCancel.id)
    setShowCancelDialog(false)
    try {
      const token = localStorage.getItem("auth_token")

      // Use Next.js proxy route, not NEXT_PUBLIC_API_URL directly
      const response = await fetch(`/api/orders/${orderToCancel.id}/cancel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      // Guard against HTML error pages before parsing JSON
      const contentType = response.headers.get("content-type")
      if (!contentType?.includes("application/json")) {
        throw new Error("Server returned an unexpected response. Please try again.")
      }

      const data = await response.json()
      if (response.ok && data.success) {
        const updated = orders.map((o) =>
          o.id === orderToCancel.id ? { ...o, status: "cancelled" as const } : o
        )
        setOrders(updated)
        toast({ title: "Order Cancelled", description: "Your order has been cancelled." })
      } else {
        throw new Error(data.message || "Failed to cancel order")
      }
    } catch (error: any) {
      toast({ title: "Cancellation Failed", description: error.message, variant: "destructive" })
    } finally {
      setCancellingOrderId(null)
      setOrderToCancel(null)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />
      case "confirmed":
      case "preparing": return <ChefHat className="w-4 h-4" />
      case "ready": return <Package className="w-4 h-4" />
      case "delivered": return <CheckCircle className="w-4 h-4" />
      case "cancelled": return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-purple-100 text-purple-800 border-purple-300"
      case "confirmed":
      case "preparing": return "bg-blue-100 text-blue-800 border-blue-300"
      case "ready": return "bg-violet-100 text-violet-800 border-violet-300"
      case "delivered": return "bg-emerald-100 text-emerald-800 border-emerald-300"
      case "cancelled": return "bg-red-100 text-red-800 border-red-300"
      default: return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  const getCount = (status: string) =>
    status === "all" ? orders.length : orders.filter((o) => o.status === status).length

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <IzakayaLoader />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-10 via-purple-50 to-purple-80 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white shadow-2xl border-0">
          <CardContent className="p-10 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-3">Welcome Back</h1>
            <p className="text-gray-600 mb-8">Please log in to view your order history.</p>
            <div className="flex flex-col gap-3">
              <Link href="/login" className="w-full">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 text-lg shadow-lg">
                  <LogIn className="w-5 h-5 mr-2" /> Login to Continue
                </Button>
              </Link>
              <Link href="/register" className="w-full">
                <Button variant="outline" className="w-full border-2 border-purple-300 text-purple-600 hover:bg-purple-50 font-semibold py-6 text-lg bg-transparent">
                  Create Account
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-10 via-purple-50 to-purple-80 py-8 px-4">
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl">
              <AlertCircle className="w-6 h-6 text-purple-600" /> Cancel Order?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-2">
              Are you sure you want to cancel order{" "}
              <strong className="text-gray-900">{orderToCancel?.order_number}</strong>?
              <br /><br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="mt-0">Keep Order</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelOrder}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold"
            >
              Yes, Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
              Your{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-800">
                Orders
              </span>
            </h1>
            <p className="text-gray-600 text-lg">Track and manage your orders</p>
          </div>
          <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-lg border border-purple-100">
            <User className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-xs text-gray-500">Welcome back,</p>
              <p className="font-bold text-gray-900">{user.name}</p>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-4 border border-purple-100 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-gray-700">Filter by Status</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "All", color: "bg-gradient-to-r from-purple-600 to-purple-800" },
              { key: "pending", label: "Pending", color: "bg-purple-500" },
              { key: "confirmed", label: "Confirmed", color: "bg-blue-500" },
              { key: "preparing", label: "Preparing", color: "bg-blue-400" },
              { key: "ready", label: "On The Way", color: "bg-violet-500" },
              { key: "delivered", label: "Delivered", color: "bg-emerald-500" },
              { key: "cancelled", label: "Cancelled", color: "bg-red-500" },
            ].map(({ key, label, color }) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${activeFilter === key
                  ? `${color} text-white shadow-md`
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
              >
                {label} ({getCount(key)})
              </button>
            ))}
          </div>
        </div>

        {/* Orders Grid */}
        {filteredOrders.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <Card className="max-w-lg w-full bg-white shadow-2xl border-0">
              <CardContent className="p-12 text-center">
                <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-12 h-12 text-purple-600" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-3">No Orders Found</h2>
                <p className="text-gray-600 mb-8 text-lg">
                  {activeFilter === "all"
                    ? "Start exploring our menu and place your first order!"
                    : `No ${activeFilter} orders found. Try a different filter.`}
                </p>
                <Button
                  asChild
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 px-8 text-lg shadow-lg"
                >
                  <Link href="/menu">Browse Menu</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOrders.map((order) => {
              const orderStatus = order.status || "pending"
              const orderItems = order.items || []
              const isExpanded = expandedOrder === order.order_number
              const isCancelling = cancellingOrderId === order.id

              return (
                <Card
                  key={order.id}
                  className="bg-white shadow-xl py-0 hover:shadow-2xl transition-all border-0 overflow-hidden flex flex-col"
                >
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-4">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-black text-lg truncate">
                          {order.order_number}
                        </h3>
                        <p className="text-purple-100 text-sm">
                          {new Date(order.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <Badge
                        className={`${getStatusColor(orderStatus)} flex items-center gap-1.5 px-3 py-1.5 border whitespace-nowrap flex-shrink-0`}
                      >
                        {getStatusIcon(orderStatus)}
                        <span className="capitalize font-semibold text-xs">
                          {orderStatus.replace("_", " ")}
                        </span>
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-6 flex-1 flex flex-col">
                    {/* Items Table */}
                    <div className="mb-4 flex-1">
                      <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Package className="w-5 h-5 text-purple-600" />
                        Items ({orderItems.length})
                      </h4>
                      <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="text-left py-2 px-3 text-sm font-semibold text-gray-700">Item</th>
                              <th className="text-center py-2 px-3 text-sm font-semibold text-gray-700">Qty</th>
                              <th className="text-right py-2 px-3 text-sm font-semibold text-gray-700">Price</th>
                              <th className="text-right py-2 px-3 text-sm font-semibold text-gray-700">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(isExpanded ? orderItems : orderItems.slice(0, 2)).map(
                              (item: OrderItem, index: number) => (
                                <tr
                                  key={item.id ?? index}
                                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                                >
                                  <td className="py-2 px-3 text-gray-900 font-medium">{item.name}</td>
                                  <td className="py-2 px-3 text-center text-gray-700">{item.quantity}</td>
                                  <td className="py-2 px-3 text-right text-gray-700">
                                    ₱{Number(item.price).toFixed(2)}
                                  </td>
                                  <td className="py-2 px-3 text-right text-purple-600 font-bold">
                                    ₱{(item.subtotal ?? item.price * item.quantity).toFixed(2)}
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </table>
                      </div>

                      {!isExpanded && orderItems.length > 2 && (
                        <button
                          onClick={() => setExpandedOrder(order.order_number)}
                          className="mt-2 text-purple-600 font-semibold text-sm hover:text-purple-700 flex items-center gap-1"
                        >
                          <Eye className="w-4 h-4" />
                          View {orderItems.length - 2} more items
                        </button>
                      )}
                      {isExpanded && orderItems.length > 2 && (
                        <button
                          onClick={() => setExpandedOrder(null)}
                          className="mt-2 text-purple-600 font-semibold text-sm hover:text-purple-700"
                        >
                          Show less
                        </button>
                      )}
                    </div>

                    {/* Order Info */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <CreditCard className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Payment:</span>
                        <span className="font-semibold text-gray-900 capitalize">
                          {order.payment_method}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-gray-600">Delivery:</span>
                        <span className="font-semibold text-gray-900">{order.delivery_city}</span>
                      </div>
                    </div>

                    <Separator className="my-4" />

                    {/* Total */}
                    <div className="flex justify-between items-center text-xl font-black mb-4">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-purple-600">
                        ₱{Number(order.total_amount).toFixed(2)}
                      </span>
                    </div>

                    {/* Cancel Button */}
                    {canCancelOrder(order) && (
                      <Button
                        onClick={() => handleCancelClick(order)}
                        disabled={isCancelling}
                        variant="destructive"
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3"
                      >
                        {isCancelling ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel Order
                          </>
                        )}
                      </Button>
                    )}

                    {!canCancelOrder(order) && orderStatus !== "cancelled" && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                        <p className="text-sm text-purple-800 font-medium flex items-center justify-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Order cannot be cancelled at this stage
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Button
            asChild
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-6 px-10 text-lg shadow-lg rounded-2xl"
          >
            <Link href="/menu">Order More Tumbler</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Orders