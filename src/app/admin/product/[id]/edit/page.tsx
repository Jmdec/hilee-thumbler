"use client"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
    ArrowLeft, Save, Loader2, Package, User, MapPin,
    CreditCard, FileText, Trash2, Plus, Minus, Clock,
    CheckCircle2, AlertCircle,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
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

const orderStatuses = [
    { value: "pending", label: "Pending", dot: "bg-yellow-400", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    { value: "confirmed", label: "Confirmed", dot: "bg-blue-400", color: "bg-blue-100 text-blue-800 border-blue-200" },
    { value: "preparing", label: "Preparing", dot: "bg-orange-400", color: "bg-orange-100 text-orange-800 border-orange-200" },
    { value: "ready", label: "Ready", dot: "bg-green-400", color: "bg-green-100 text-green-800 border-green-200" },
    { value: "delivered", label: "Delivered", dot: "bg-emerald-400", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    { value: "cancelled", label: "Cancelled", dot: "bg-red-400", color: "bg-red-100 text-red-800 border-red-200" },
]

const paymentMethods = [
    { value: "cash", label: "Cash on Delivery" },
    { value: "gcash", label: "GCash" },
    { value: "paypal", label: "PayPal" },
    { value: "bpi", label: "BPI Online" },
    { value: "maya", label: "Maya" },
    { value: "security_bank", label: "Security Bank" },
]

const disabledMap: Record<string, string[]> = {
    cancelled: ["pending", "confirmed", "preparing", "ready", "delivered"],
    preparing: ["confirmed"],
    ready: ["confirmed", "preparing"],
    delivered: ["pending", "confirmed", "preparing", "ready", "cancelled"],
}

export default function EditOrderPage() {
    const params = useParams()
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [order, setOrder] = useState<Order | null>(null)
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768)
        check()
        window.addEventListener("resize", check)
        return () => window.removeEventListener("resize", check)
    }, [])

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const token = localStorage.getItem("auth_token")
                if (!token) { router.push("/login"); return }
                const res = await fetch(`/api/orders/${params.id}`, {
                    headers: { Authorization: `Bearer ${token}`, "X-Admin-Request": "true" },
                })
                if (!res.ok) throw new Error("Failed to fetch order")
                const result = await res.json()
                if (result.success) {
                    const d = result.data
                    setOrder({
                        ...d,
                        total_amount: Number(d.total_amount ?? d.total ?? 0),
                        subtotal: Number(d.subtotal ?? 0),
                        delivery_fee: Number(d.delivery_fee ?? 0),
                        items: (d.items ?? []).map((i: any) => ({ ...i, price: Number(i.price ?? 0) })),
                    })
                }
            } catch {
                toast({ variant: "destructive", title: "Error", description: "Failed to load order details" })
                router.push("/admin/order")
            } finally {
                setLoading(false)
            }
        }
        if (params.id) fetchOrder()
    }, [params.id, router, toast])

    const handleSave = async () => {
        if (!order) return
        setSaving(true)
        try {
            const token = localStorage.getItem("auth_token")
            if (!token) throw new Error("Authentication token not found")
            const res = await fetch(`/api/orders/${order.id}`, {
                method: "PUT",
                headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", "X-Admin-Request": "true" },
                body: JSON.stringify({
                    customer_name: order.customer_name, customer_email: order.customer_email,
                    customer_phone: order.customer_phone, delivery_address: order.delivery_address,
                    delivery_city: order.delivery_city, delivery_zip_code: order.delivery_zip_code,
                    payment_method: order.payment_method, status: order.status,
                    delivery_fee: order.delivery_fee, notes: order.notes,
                }),
            })
            const result = await res.json()
            if (!res.ok) throw new Error(result.message || "Failed to update order")
            toast({ title: "Success", description: "Order updated successfully!" })
            router.push("/admin/order")
        } catch (e: any) {
            toast({ variant: "destructive", title: "Error", description: e.message || "Failed to update order" })
        } finally {
            setSaving(false)
        }
    }

    const updateQty = (idx: number, qty: number) => {
        if (!order || qty < 0) return
        const items = order.items.map((item, i) => i === idx ? { ...item, quantity: qty } : item)
        const subtotal = items.reduce((s, item) => s + item.price * item.quantity, 0)
        setOrder({ ...order, items, subtotal, total_amount: subtotal + order.delivery_fee })
    }

    const removeItem = (idx: number) => {
        if (!order) return
        const items = order.items.filter((_, i) => i !== idx)
        const subtotal = items.reduce((s, item) => s + item.price * item.quantity, 0)
        setOrder({ ...order, items, subtotal, total_amount: subtotal + order.delivery_fee })
    }

    const currentStatus = orderStatuses.find(s => s.value === order?.status)

    // ── Loading ──────────────────────────────────────────────────────────
    if (loading) return (
        <SidebarProvider defaultOpen={!isMobile}>
            <div className="flex min-h-screen w-full bg-[#f5f3ff]">
                <AppSidebar />
                <div className={`flex-1 ${isMobile ? "ml-0" : "ml-72"} flex items-center justify-center`}>
                    <div className="flex flex-col items-center gap-4 bg-white rounded-2xl px-12 py-10 shadow-xl border border-purple-100">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Loader2 className="h-7 w-7 animate-spin text-white" />
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-purple-900 text-lg">Loading Order</p>
                            <p className="text-sm text-gray-500 mt-0.5">Fetching order details…</p>
                        </div>
                    </div>
                </div>
            </div>
        </SidebarProvider>
    )

    // ── Not found ────────────────────────────────────────────────────────
    if (!order) return (
        <SidebarProvider defaultOpen={!isMobile}>
            <div className="flex min-h-screen w-full bg-[#f5f3ff]">
                <AppSidebar />
                <div className={`flex-1 ${isMobile ? "ml-0" : "ml-72"} flex items-center justify-center`}>
                    <div className="text-center bg-white rounded-2xl px-12 py-10 shadow-xl border border-purple-100 max-w-sm">
                        <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                            <AlertCircle className="h-7 w-7 text-purple-500" />
                        </div>
                        <h2 className="text-xl font-bold text-purple-900 mb-2">Order Not Found</h2>
                        <p className="text-sm text-gray-500 mb-6">This order may have been deleted or doesn't exist.</p>
                        <Button onClick={() => router.push("/admin/order")}
                            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 w-full">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
                        </Button>
                    </div>
                </div>
            </div>
        </SidebarProvider>
    )

    return (
        <SidebarProvider defaultOpen={!isMobile}>
            <div className="flex min-h-screen w-full bg-[#f5f3ff]">
                <AppSidebar />
                <div className={`flex-1 min-w-0 ${isMobile ? "ml-0" : "ml-72"}`}>

                    {/* Mobile top bar */}
                    {isMobile && (
                        <div className="sticky top-0 z-50 flex h-14 items-center gap-3 border-b bg-white/95 backdrop-blur-sm px-4 shadow-sm border-purple-100">
                            <SidebarTrigger className="-ml-1" />
                            <div className="w-7 h-7 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center">
                                <Package className="w-3.5 h-3.5 text-white" />
                            </div>
                            <span className="text-sm font-semibold text-purple-900">Edit Order</span>
                        </div>
                    )}

                    <main className="p-4 sm:p-6 lg:p-8">
                        <div className="max-w-7xl mx-auto space-y-6">

                            {/* ── Top bar ── */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <Button variant="outline" size="sm" onClick={() => router.push("/admin/order")}
                                        className="border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 h-9 px-3 gap-1.5">
                                        <ArrowLeft className="w-3.5 h-3.5" />
                                        <span className="text-sm">Back</span>
                                    </Button>
                                    <div className="h-6 w-px bg-purple-200" />
                                    <div>
                                        <div className="flex items-center gap-2.5 flex-wrap">
                                            <h1 className="text-xl font-bold text-purple-900">Order #{order.order_number}</h1>
                                            {currentStatus && (
                                                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${currentStatus.color}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot}`} />
                                                    {currentStatus.label}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                                            </span>
                                            <span>·</span>
                                            <span className="flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                {order.customer_name}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <Button onClick={handleSave} disabled={saving}
                                    className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 shadow-md hover:shadow-lg transition-all h-10 px-5 font-semibold">
                                    {saving
                                        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
                                        : <><Save className="w-4 h-4 mr-2" />Save Changes</>
                                    }
                                </Button>
                            </div>

                            {/* ── Main grid ── */}
                            <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6 items-start">

                                {/* ── LEFT COLUMN ── */}
                                <div className="space-y-5">

                                    {/* Customer Information */}
                                    <Card className="border-purple-100 shadow-sm bg-white rounded-2xl overflow-hidden">
                                        <CardHeader className="px-6 py-4 border-b border-purple-50 bg-gradient-to-r from-purple-50/60 to-violet-50/40">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center shadow-sm">
                                                    <User className="w-4 h-4 text-white" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-sm font-semibold text-purple-900">Customer Information</CardTitle>
                                                    <p className="text-xs text-gray-500 mt-0.5">Personal details and contact info</p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Full Name</Label>
                                                <Input value={order.customer_name}
                                                    onChange={e => setOrder({ ...order, customer_name: e.target.value })}
                                                    className="h-9 border-purple-200 focus:border-purple-400 focus:ring-purple-300/30 text-sm" />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email Address</Label>
                                                <Input type="email" value={order.customer_email}
                                                    onChange={e => setOrder({ ...order, customer_email: e.target.value })}
                                                    className="h-9 border-purple-200 focus:border-purple-400 focus:ring-purple-300/30 text-sm" />
                                            </div>
                                            <div className="space-y-1.5 sm:col-span-2">
                                                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone Number</Label>
                                                <Input value={order.customer_phone}
                                                    onChange={e => setOrder({ ...order, customer_phone: e.target.value })}
                                                    className="h-9 border-purple-200 focus:border-purple-400 focus:ring-purple-300/30 text-sm max-w-xs" />
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Delivery Information */}
                                    <Card className="border-purple-100 shadow-sm bg-white rounded-2xl overflow-hidden">
                                        <CardHeader className="px-6 py-4 border-b border-purple-50 bg-gradient-to-r from-violet-50/60 to-purple-50/40">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                                                    <MapPin className="w-4 h-4 text-white" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-sm font-semibold text-purple-900">Delivery Information</CardTitle>
                                                    <p className="text-xs text-gray-500 mt-0.5">Shipping address and location</p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="px-6 py-5 space-y-4">
                                            <div className="space-y-1.5">
                                                <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Street Address</Label>
                                                <Textarea value={order.delivery_address}
                                                    onChange={e => setOrder({ ...order, delivery_address: e.target.value })}
                                                    rows={2}
                                                    className="border-purple-200 focus:border-purple-400 focus:ring-purple-300/30 resize-none text-sm" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">City</Label>
                                                    <Input value={order.delivery_city}
                                                        onChange={e => setOrder({ ...order, delivery_city: e.target.value })}
                                                        className="h-9 border-purple-200 focus:border-purple-400 focus:ring-purple-300/30 text-sm" />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">ZIP Code</Label>
                                                    <Input value={order.delivery_zip_code}
                                                        onChange={e => setOrder({ ...order, delivery_zip_code: e.target.value })}
                                                        className="h-9 border-purple-200 focus:border-purple-400 focus:ring-purple-300/30 text-sm" />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Order Items */}
                                    <Card className="border-purple-100 shadow-sm bg-white rounded-2xl overflow-hidden">
                                        <CardHeader className="px-6 py-4 border-b border-purple-50 bg-gradient-to-r from-purple-50/60 to-violet-50/40">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-violet-600 rounded-lg flex items-center justify-center shadow-sm">
                                                        <Package className="w-4 h-4 text-white" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className="text-sm font-semibold text-purple-900">Order Items</CardTitle>
                                                        <p className="text-xs text-gray-500 mt-0.5">{order.items.length} item{order.items.length !== 1 ? "s" : ""} in this order</p>
                                                    </div>
                                                </div>
                                                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200">
                                                    {order.items.length} Items
                                                </span>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="p-0">
                                            {order.items.length === 0 ? (
                                                <div className="py-12 text-center text-gray-400 text-sm">No items in this order</div>
                                            ) : (
                                                <div className="divide-y divide-purple-50">
                                                    {order.items.map((item, idx) => (
                                                        <div key={idx} className="flex items-center gap-4 px-6 py-4 hover:bg-purple-50/40 transition-colors group">
                                                            {/* Image */}
                                                            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-purple-100 bg-purple-50">
                                                                <Image
                                                                    src={item.image_url || "/placeholder.svg?height=56&width=56"}
                                                                    alt={item.name} width={56} height={56}
                                                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
                                                                />
                                                            </div>

                                                            {/* Info */}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold text-purple-900 truncate">{item.name}</p>
                                                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{item.description}</p>
                                                                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                                                                    <span className="text-xs px-1.5 py-0.5 rounded border border-purple-200 text-purple-700 bg-purple-50">{item.category}</span>
                                                                    {item.is_spicy && <span className="text-xs px-1.5 py-0.5 rounded bg-red-50 text-red-600 border border-red-200">🌶 Spicy</span>}
                                                                    {item.is_vegetarian && <span className="text-xs px-1.5 py-0.5 rounded bg-green-50 text-green-600 border border-green-200">🌱 Veg</span>}
                                                                </div>
                                                            </div>

                                                            {/* Unit price */}
                                                            <div className="text-right flex-shrink-0 w-20 hidden sm:block">
                                                                <p className="text-xs text-gray-400">Unit price</p>
                                                                <p className="text-sm font-semibold text-gray-700 mt-0.5">₱{item.price.toFixed(2)}</p>
                                                            </div>

                                                            {/* Qty stepper */}
                                                            <div className="flex items-center gap-1 flex-shrink-0 bg-purple-50 border border-purple-200 rounded-lg p-1">
                                                                <button
                                                                    onClick={() => updateQty(idx, item.quantity - 1)}
                                                                    disabled={item.quantity <= 1}
                                                                    className="w-6 h-6 rounded-md flex items-center justify-center text-purple-600 hover:bg-purple-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                                >
                                                                    <Minus className="w-3 h-3" />
                                                                </button>
                                                                <Input
                                                                    type="number" value={item.quantity} min="1"
                                                                    onChange={e => updateQty(idx, parseInt(e.target.value) || 0)}
                                                                    className="w-10 h-6 text-center text-xs border-0 bg-transparent p-0 focus:ring-0 font-semibold text-purple-900 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                />
                                                                <button
                                                                    onClick={() => updateQty(idx, item.quantity + 1)}
                                                                    className="w-6 h-6 rounded-md flex items-center justify-center text-purple-600 hover:bg-purple-200 transition-colors"
                                                                >
                                                                    <Plus className="w-3 h-3" />
                                                                </button>
                                                            </div>

                                                            {/* Line total */}
                                                            <div className="text-right flex-shrink-0 w-24">
                                                                <p className="text-xs text-gray-400">Total</p>
                                                                <p className="text-sm font-bold text-purple-700 mt-0.5">₱{(item.price * item.quantity).toFixed(2)}</p>
                                                            </div>

                                                            {/* Remove — appears on row hover */}
                                                            <button
                                                                onClick={() => removeItem(idx)}
                                                                className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0 opacity-0 group-hover:opacity-100"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Items footer */}
                                            <div className="flex items-center justify-between px-6 py-3 border-t border-purple-100 bg-purple-50/50">
                                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Items Subtotal</span>
                                                <span className="text-sm font-bold text-purple-900">₱{order.subtotal.toFixed(2)}</span>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Notes */}
                                    <Card className="border-purple-100 shadow-sm bg-white rounded-2xl overflow-hidden">
                                        <CardHeader className="px-6 py-4 border-b border-purple-50 bg-gradient-to-r from-violet-50/60 to-purple-50/40">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center shadow-sm">
                                                    <FileText className="w-4 h-4 text-white" />
                                                </div>
                                                <div>
                                                    <CardTitle className="text-sm font-semibold text-purple-900">Special Notes</CardTitle>
                                                    <p className="text-xs text-gray-500 mt-0.5">Delivery instructions or special requests</p>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="px-6 py-5">
                                            <Textarea
                                                placeholder="Add special notes, dietary restrictions, or delivery instructions…"
                                                value={order.notes || ""}
                                                onChange={e => setOrder({ ...order, notes: e.target.value })}
                                                rows={3}
                                                className="border-purple-200 focus:border-purple-400 focus:ring-purple-300/30 resize-none text-sm"
                                            />
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* ── RIGHT COLUMN — sticky ── */}
                                <div className="space-y-4 xl:sticky xl:top-6">

                                    {/* Status */}
                                    <Card className="border-purple-100 shadow-sm bg-white rounded-2xl overflow-hidden">
                                        <CardHeader className="px-5 py-4 border-b border-purple-50 bg-gradient-to-r from-purple-50/60 to-violet-50/40">
                                            <div className="flex items-center gap-2">
                                                <CheckCircle2 className="w-4 h-4 text-purple-600" />
                                                <CardTitle className="text-sm font-semibold text-purple-900">Order Status</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="px-5 py-4">
                                            <Select value={order.status} onValueChange={v => setOrder({ ...order, status: v as any })}>
                                                <SelectTrigger className="border-purple-200 focus:border-purple-400 h-10 text-sm">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {orderStatuses.map(s => {
                                                        const isDisabled = order.status === s.value || (disabledMap[order.status] ?? []).includes(s.value)
                                                        return (
                                                            <SelectItem key={s.value} value={s.value} disabled={isDisabled}
                                                                className={isDisabled ? "opacity-40 cursor-not-allowed" : "focus:bg-purple-50"}>
                                                                <div className="flex items-center gap-2">
                                                                    <span className={`w-2 h-2 rounded-full ${s.dot}`} />
                                                                    {s.label}
                                                                </div>
                                                            </SelectItem>
                                                        )
                                                    })}
                                                </SelectContent>
                                            </Select>
                                        </CardContent>
                                    </Card>

                                    {/* Payment */}
                                    <Card className="border-purple-100 shadow-sm bg-white rounded-2xl overflow-hidden">
                                        <CardHeader className="px-5 py-4 border-b border-purple-50 bg-gradient-to-r from-violet-50/60 to-purple-50/40">
                                            <div className="flex items-center gap-2">
                                                <CreditCard className="w-4 h-4 text-violet-600" />
                                                <CardTitle className="text-sm font-semibold text-purple-900">Payment Method</CardTitle>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="px-5 py-4">
                                            <Select value={order.payment_method} onValueChange={v => setOrder({ ...order, payment_method: v })}>
                                                <SelectTrigger className="border-purple-200 focus:border-purple-400 h-10 text-sm">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {paymentMethods.map(m => (
                                                        <SelectItem key={m.value} value={m.value} className="focus:bg-purple-50 text-sm">
                                                            {m.label}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </CardContent>
                                    </Card>

                                    {/* Order Summary */}
                                    <Card className="border-purple-200 shadow-sm bg-white rounded-2xl overflow-hidden">
                                        <CardHeader className="px-5 py-4 bg-gradient-to-r from-purple-600 to-violet-600">
                                            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                                                <Package className="w-4 h-4" />
                                                Order Summary
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="px-5 py-4 space-y-3">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">Subtotal</span>
                                                <span className="font-semibold text-gray-800">₱{order.subtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-500">Delivery Fee</span>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-gray-400 text-xs">₱</span>
                                                    <Input
                                                        type="number" step="0.01" min="0"
                                                        value={order.delivery_fee}
                                                        onChange={e => {
                                                            const fee = parseFloat(e.target.value) || 0
                                                            setOrder({ ...order, delivery_fee: fee, total_amount: order.subtotal + fee })
                                                        }}
                                                        className="w-20 h-7 text-right text-sm border-purple-200 focus:border-purple-400 px-2 font-semibold text-gray-800"
                                                    />
                                                </div>
                                            </div>

                                            <div className="h-px bg-purple-100" />

                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-gray-900 text-sm">Total</span>
                                                <span className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-violet-600 bg-clip-text text-transparent">
                                                    ₱{order.total_amount.toFixed(2)}
                                                </span>
                                            </div>

                                            <Button onClick={handleSave} disabled={saving}
                                                className="w-full mt-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 shadow-md h-10 font-semibold text-sm">
                                                {saving
                                                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
                                                    : <><Save className="w-4 h-4 mr-2" />Save Changes</>
                                                }
                                            </Button>
                                        </CardContent>
                                    </Card>

                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}