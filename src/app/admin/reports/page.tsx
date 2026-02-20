"use client"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import {
  BarChart3, TrendingUp, DollarSign, Users, Package, Calendar,
  Download, Loader2, CreditCard, ShoppingBag, CheckCircle2,
  Clock, XCircle, ChefHat, Bike,
} from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface Summary {
  total_revenue: number
  total_orders: number
  new_customers: number
  avg_order_value: number
}
interface ChartPoint { period: string; revenue: number; orders: number }
interface TopProduct { product_id: number; name: string; total_qty: number; total_revenue: number }
interface StatusCount { count: number; rate: number }
interface StatusStats {
  pending: StatusCount; confirmed: StatusCount; preparing: StatusCount
  ready: StatusCount; delivered: StatusCount; cancelled: StatusCount
  total: number
  [key: string]: StatusCount | number
}
interface PaymentRow { method: string; payment_status: string; count: number; revenue: number }
interface ReportData {
  summary: Summary
  revenue_chart: ChartPoint[]
  top_products: TopProduct[]
  order_stats: StatusStats
  payment_breakdown: PaymentRow[]
}

const fmt = (n: number) =>
  new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(n ?? 0)

// Safe array helper — guards against null/undefined/non-array from backend
const safeArray = <T,>(val: unknown): T[] => (Array.isArray(val) ? val : [])

type StatusMeta = { label: string; icon: React.ElementType; color: string; bg: string }
const STATUS_META: Record<string, StatusMeta> = {
  pending:   { label: "Pending",   icon: Clock,        color: "text-amber-600",  bg: "bg-amber-50"  },
  confirmed: { label: "Confirmed", icon: CheckCircle2, color: "text-blue-600",   bg: "bg-blue-50"   },
  preparing: { label: "Preparing", icon: ChefHat,      color: "text-orange-600", bg: "bg-orange-50" },
  ready:     { label: "Ready",     icon: ShoppingBag,  color: "text-teal-600",   bg: "bg-teal-50"   },
  delivered: { label: "Delivered", icon: Bike,         color: "text-green-600",  bg: "bg-green-50"  },
  cancelled: { label: "Cancelled", icon: XCircle,      color: "text-red-600",    bg: "bg-red-50"    },
}
const PAYMENT_LABELS: Record<string, string> = {
  cash: "Cash on Delivery", gcash: "GCash", security_bank: "Security Bank",
}
const purpleGrad = "linear-gradient(135deg, #7c3aed 0%, #9333ea 100%)"

// Default status so we never get undefined when accessing order_stats
const DEFAULT_STATUS_COUNT: StatusCount = { count: 0, rate: 0 }
const defaultOrderStats = (): StatusStats => ({
  pending: DEFAULT_STATUS_COUNT, confirmed: DEFAULT_STATUS_COUNT,
  preparing: DEFAULT_STATUS_COUNT, ready: DEFAULT_STATUS_COUNT,
  delivered: DEFAULT_STATUS_COUNT, cancelled: DEFAULT_STATUS_COUNT,
  total: 0,
})

export default function ReportsPage() {
  const [isMobile, setIsMobile]   = useState(false)
  const [timeRange, setTimeRange] = useState("week")
  const [data, setData]           = useState<ReportData | null>(null)
  const [loading, setLoading]     = useState(true)
  const { toast }                 = useToast()

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => { fetchReports() }, [timeRange])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("auth_token")
      const res = await fetch(`/api/reports?range=${timeRange}`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      })
      const result = await res.json()
      if (!res.ok || !result.success) {
        throw new Error(result.message ?? `HTTP ${res.status}`)
      }
      // Normalize all fields so nothing is ever null/undefined
      setData({
        summary: {
          total_revenue:   result.data?.summary?.total_revenue   ?? 0,
          total_orders:    result.data?.summary?.total_orders    ?? 0,
          new_customers:   result.data?.summary?.new_customers   ?? 0,
          avg_order_value: result.data?.summary?.avg_order_value ?? 0,
        },
        revenue_chart:     safeArray<ChartPoint>(result.data?.revenue_chart),
        top_products:      safeArray<TopProduct>(result.data?.top_products),
        order_stats:       result.data?.order_stats ?? defaultOrderStats(),
        payment_breakdown: safeArray<PaymentRow>(result.data?.payment_breakdown),
      })
    } catch (err: any) {
      console.error("[reports] fetch error:", err?.message)
      toast({ variant: "destructive", title: "Error", description: err?.message ?? "Failed to load reports." })
    } finally {
      setLoading(false)
    }
  }

  // ── Derived ────────────────────────────────────────────────────────────────

  const revenueChart = safeArray<ChartPoint>(data?.revenue_chart)
  const topProducts  = safeArray<TopProduct>(data?.top_products)
  const chartMax     = revenueChart.length ? Math.max(...revenueChart.map((p) => p.revenue), 1) : 1

  const paymentTotals = (() => {
    const map: Record<string, { count: number; revenue: number }> = {}
    for (const row of safeArray<PaymentRow>(data?.payment_breakdown)) {
      if (!map[row.method]) map[row.method] = { count: 0, revenue: 0 }
      map[row.method].count   += row.count
      map[row.method].revenue += row.revenue
    }
    return Object.entries(map).map(([method, vals]) => ({ method, ...vals }))
  })()

  const orderStats = data?.order_stats ?? defaultOrderStats()

  const summaryCards = data ? [
    { title: "Total Revenue",    value: fmt(data.summary.total_revenue),           icon: DollarSign, note: "Excludes cancelled orders" },
    { title: "Total Orders",     value: String(data.summary.total_orders),         icon: Package,    note: `${orderStats.delivered.count} delivered` },
    { title: "Unique Customers", value: String(data.summary.new_customers),        icon: Users,      note: "Registered accounts only" },
    { title: "Avg Order Value",  value: fmt(data.summary.avg_order_value),         icon: TrendingUp, note: "Per non-cancelled order" },
  ] : []

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
              <span className="text-sm font-bold text-white">Reports</span>
            </div>
          )}

          <main className="flex-1 overflow-auto p-4 sm:p-6 md:p-8">
            <div className="max-w-7xl space-y-6">

              {/* Header */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="rounded-2xl px-7 py-6 shadow-xl relative overflow-hidden" style={{ background: purpleGrad }}>
                  <div className="absolute right-4 top-4 w-20 h-20 rounded-full opacity-10 pointer-events-none"
                    style={{ background: "radial-gradient(circle, white, transparent)" }} />
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-7 h-7 text-white opacity-90" />
                    <div>
                      <h1 className="text-2xl font-bold text-white tracking-tight">Reports Management</h1>
                      <p className="text-violet-200 text-sm mt-0.5">Business analytics &amp; insights</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-36 bg-white border-purple-200 text-purple-800 font-medium focus:ring-purple-400">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                  {/* <Button variant="outline" className="bg-white border-purple-200 text-purple-700 hover:bg-purple-50" onClick={fetchReports}>
                    <Download className="w-4 h-4 mr-2" />Export
                  </Button> */}
                </div>
              </div>

              {/* Loading */}
              {loading && (
                <div className="flex items-center justify-center py-24">
                  <div className="flex items-center gap-3 bg-white/90 px-8 py-5 rounded-2xl shadow-xl border border-purple-100">
                    <Loader2 className="h-6 w-6 animate-spin text-violet-600" />
                    <span className="text-purple-800 font-semibold">Loading reports...</span>
                  </div>
                </div>
              )}

              {!loading && data && (
                <>
                  {/* Summary cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {summaryCards.map((card) => {
                      const Icon = card.icon
                      return (
                        <div key={card.title} className="rounded-2xl bg-white/90 p-5 shadow-lg border flex items-center gap-4"
                          style={{ borderColor: "rgba(139,92,246,0.15)" }}>
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md" style={{ background: purpleGrad }}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-purple-500 uppercase tracking-widest truncate">{card.title}</p>
                            <p className="text-2xl font-bold text-gray-900 leading-tight mt-0.5">{card.value}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{card.note}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Revenue chart + Top products */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Bar chart */}
                    <div className="rounded-2xl bg-white/90 shadow-xl overflow-hidden border" style={{ borderColor: "rgba(139,92,246,0.15)" }}>
                      <div className="px-6 py-5" style={{ background: purpleGrad }}>
                        <h2 className="text-white font-bold text-base">Revenue Overview</h2>
                        <p className="text-violet-200 text-xs mt-0.5">By period — cancelled excluded</p>
                      </div>
                      <div className="p-6">
                        {revenueChart.length === 0 ? (
                          <div className="flex items-center justify-center h-48 text-purple-300 text-sm">No data for this period</div>
                        ) : (
                          <div className="h-56 flex items-end gap-2">
                            {revenueChart.map((pt, i) => {
                              const pct = Math.max((pt.revenue / chartMax) * 100, 2)
                              const label = pt.period.length === 10
                                ? new Date(pt.period).toLocaleDateString("en-US", { weekday: "short" })
                                : new Date(pt.period + "-01").toLocaleDateString("en-US", { month: "short" })
                              return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                                  <span className="text-xs text-purple-700 font-semibold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    {fmt(pt.revenue)}
                                  </span>
                                  <div className="w-full rounded-t-lg transition-opacity duration-150 group-hover:opacity-70 cursor-pointer"
                                    style={{ height: `${pct}%`, background: purpleGrad }} title={`${label}: ${fmt(pt.revenue)}`} />
                                  <span className="text-[10px] text-gray-500 font-medium">{label}</span>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Top products */}
                    <div className="rounded-2xl bg-white/90 shadow-xl overflow-hidden border" style={{ borderColor: "rgba(139,92,246,0.15)" }}>
                      <div className="px-6 py-5" style={{ background: purpleGrad }}>
                        <h2 className="text-white font-bold text-base">Top Products</h2>
                        <p className="text-violet-200 text-xs mt-0.5">By quantity sold</p>
                      </div>
                      <div className="p-6">
                        {topProducts.length === 0 ? (
                          <div className="flex items-center justify-center h-48 text-purple-300 text-sm">No product data for this period</div>
                        ) : (
                          <div className="space-y-3">
                            {topProducts.map((prod, idx) => (
                              <div key={prod.product_id} className="flex items-center gap-4 p-3 rounded-xl transition-colors hover:bg-purple-50">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                                  style={{ background: purpleGrad }}>{idx + 1}</div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-gray-900 text-sm truncate">{prod.name}</p>
                                  <p className="text-xs text-gray-400">{prod.total_qty} pcs sold</p>
                                </div>
                                <p className="font-bold text-violet-700 text-sm flex-shrink-0">{fmt(prod.total_revenue)}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order status */}
                  <div className="rounded-2xl bg-white/90 shadow-xl overflow-hidden border" style={{ borderColor: "rgba(139,92,246,0.15)" }}>
                    <div className="px-6 py-5 flex items-center gap-3" style={{ background: purpleGrad }}>
                      <Calendar className="w-5 h-5 text-white" />
                      <div>
                        <h2 className="text-white font-bold text-base">Order Status Breakdown</h2>
                        <p className="text-violet-200 text-xs">pending · confirmed · preparing · ready · delivered · cancelled</p>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        {Object.entries(STATUS_META).map(([key, meta]) => {
                          const stat = (orderStats[key] as StatusCount) ?? DEFAULT_STATUS_COUNT
                          const Icon = meta.icon
                          return (
                            <div key={key} className={`${meta.bg} rounded-xl p-4 text-center border`}
                              style={{ borderColor: "rgba(139,92,246,0.08)" }}>
                              <Icon className={`w-5 h-5 ${meta.color} mx-auto mb-2`} />
                              <p className="text-2xl font-bold text-gray-900">{stat.count}</p>
                              <p className="text-xs font-semibold text-gray-600 mt-0.5">{meta.label}</p>
                              <p className="text-xs text-gray-400 mt-0.5">{stat.rate}%</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Payment breakdown */}
                  <div className="rounded-2xl bg-white/90 shadow-xl overflow-hidden border" style={{ borderColor: "rgba(139,92,246,0.15)" }}>
                    <div className="px-6 py-5 flex items-center gap-3" style={{ background: purpleGrad }}>
                      <CreditCard className="w-5 h-5 text-white" />
                      <div>
                        <h2 className="text-white font-bold text-base">Payment Methods</h2>
                        <p className="text-violet-200 text-xs">cash · gcash · security_bank</p>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {paymentTotals.map((pm) => (
                          <div key={pm.method} className="rounded-xl p-5 border flex items-center gap-4"
                            style={{ background: "rgba(245,243,255,0.7)", borderColor: "rgba(139,92,246,0.12)" }}>
                            <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: purpleGrad }}>
                              <CreditCard className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{PAYMENT_LABELS[pm.method] ?? pm.method}</p>
                              <p className="text-xs text-gray-500 mt-0.5">{pm.count} orders</p>
                              <p className="text-violet-700 font-bold text-sm mt-1">{fmt(pm.revenue)}</p>
                            </div>
                          </div>
                        ))}
                        {paymentTotals.length === 0 && (
                          <p className="col-span-3 text-center text-purple-300 py-6 text-sm">No payment data</p>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {!loading && !data && (
                <div className="flex items-center justify-center py-24">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-purple-300 mx-auto mb-3" />
                    <p className="text-purple-700 font-semibold">No report data available</p>
                    <p className="text-purple-400 text-sm mt-1">Try a different time range</p>
                  </div>
                </div>
              )}

            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}