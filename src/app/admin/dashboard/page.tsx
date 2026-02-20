"use client"

import { useEffect, useState } from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Loader2 } from "lucide-react"
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

interface AnalyticsData {
  keyMetrics: {
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
    totalCustomers: number
    growthRate: number
  }
  revenueData: Array<{ date: string; revenue: number; orders: number }>
  orderStatusData: Array<{ status: string; count: number; percentage: number }>
  paymentMethodData: Array<{ method: string; count: number; percentage: number }>
  popularProducts: Array<{ name: string; orders: number; revenue: number; category: string; is_spicy: boolean }>
  categoryData: Array<{ category: string; orders: number; revenue: number }>
  productsCount: number
}

const statusColors = {
  deliveviolet: "#8b5cf6", // violet-500
  preparing: "#6366f1", // indigo-500
  confirmed: "#4f46e5", // indigo-600
  ready: "#7c3aed", // violet-600
  pending: "#fbbf24", // amber-400 (keeps contrast for "waiting")
  cancelled: "#6b7280", // gray-500 (neutral tone)
}

const paymentColors = {
  gcash: "#ef4444",
  cash: "#f97316",
  maya: "#ea580c",
  bpi: "#dc2626",
  paypal: "#fbbf24",
}

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isMobile, setIsMobile] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        console.log("[v0] Fetching analytics from /api/dashboard...")
        const response = await fetch("/api/dashboard")
        console.log("[v0] Response status:", response.status)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = await response.json()
        console.log("[v0] API Response:", data)

        if (data.success) {
          setAnalytics(data.data)
          if (data.data.error) {
            setApiError(data.data.error)
          }
          console.log("[v0] Analytics data set successfully")
        } else {
          throw new Error(data.message || "Failed to fetch analytics")
        }
      } catch (error) {
        console.error("[v0] Failed to fetch analytics:", error)
        setError(error instanceof Error ? error.message : "Unknown error occurviolet")
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex min-h-screen w-full bg-gradient-to-br from-purple-50 to-violet-50">
          <AppSidebar />
          <div className={`flex-1 min-w-0 ${isMobile ? "ml-0" : "ml-72"}`}>
            <div className="flex items-center justify-center min-h-screen w-full">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg">
                <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                <span className="text-gray-700 font-medium">Loading analytics...</span>
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  if (error || !analytics) {
    return (
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex min-h-screen w-full bg-gradient-to-br from-purple-50 to-violet-50">
          <AppSidebar />
          <div className={`flex-1 min-w-0 ${isMobile ? "ml-0" : "ml-72"}`}>
            <div className="flex items-center justify-center min-h-screen w-full">
              <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg max-w-md">
                <h2 className="text-2xl font-bold text-violet-800 mb-4">Failed to load analytics</h2>
                <p className="text-violet-600 mb-4">{error || "No data available"}</p>
                <p className="text-sm text-violet-500 mb-4">Make sure NEXT_PUBLIC_API_URL is set and your Laravel API is running</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  console.log("[v0] Rendering dashboard with analytics:", analytics)

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-purple-50 to-violet-50">
        <AppSidebar />
        <div className={`flex-1 min-w-0 ${isMobile ? "ml-0" : "ml-72"}`}>
          {isMobile && (
            <div className="sticky top-0 z-50 flex h-12 items-center gap-2 border-b bg-white/90 backdrop-blur-sm px-4 md:hidden shadow-sm">
              <SidebarTrigger className="-ml-1" />
              <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">Dashboard</span>
            </div>
          )}
          <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
            <div className="max-w-7xl mx-auto space-y-8">
              <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-100">
                <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-purple-700 text-base sm:text-lg">Restaurant Analytics & Insights</p>
                <p className="text-xs text-purple-600 mt-2">API URL: {process.env.NEXT_PUBLIC_API_URL || "Not configuviolet"}</p>
              </div>

              {!analytics.keyMetrics || analytics.keyMetrics.totalOrders === 0 ? (
                <div className="space-y-6">
                  <Card className="border-purple-200 bg-white/70 backdrop-blur-sm shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-purple-800 flex items-center gap-2">📊 No Data Available</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <h4 className="font-semibold text-purple-800 mb-2">No Orders Found</h4>
                        <p className="text-purple-700 text-sm mb-3">
                          {apiError ||
                            "There are currently no orders in the system. This could be because the database is empty or the API endpoint requires authentication."}
                        </p>
                        <div className="text-xs text-purple-600 space-y-1">
                          <p>
                            <strong>Possible reasons:</strong>
                          </p>
                          <p>• No orders have been created yet</p>
                          <p>• Orders were recently deleted</p>
                          <p>• Authentication requiviolet (auth:sanctum middleware)</p>
                        </div>
                      </div>

                      {analytics.productsCount > 0 && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <h4 className="font-semibold text-green-800 mb-2">✅ Products Data Available</h4>
                          <p className="text-green-700 text-sm">
                            Found {analytics.productsCount} products in your database. Products endpoint is working correctly.
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-purple-200 bg-white/70 backdrop-blur-sm shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-purple-800">🚀 Quick Setup Guide</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4 text-sm">
                        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                          <h4 className="font-semibold text-purple-800 mb-2">Laravel Routes (routes/api.php)</h4>
                          <pre className="bg-gray-800 text-green-400 p-3 rounded text-xs overflow-x-auto">
                            {`// Add this public analytics route
Route::get('/analytics', [OrderController::class, 'analytics']);

// Or temporarily remove auth from orders
Route::get('/orders', [OrderController::class, 'index']); // Remove ->middleware('auth:sanctum')`}
                          </pre>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h4 className="font-semibold text-blue-800 mb-2">Environment Variables</h4>
                          <pre className="bg-gray-800 text-green-400 p-3 rounded text-xs">
                            {`NEXT_PUBLIC_API_URL=http://your-laravel-app.com
LARAVEL_API_TOKEN=your-sanctum-token-here`}
                          </pre>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="border-violet-200 bg-gradient-to-br from-violet-500 to-purple-500 text-white shadow-xl">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-purple-100">Total Revenue</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">₱{(analytics.keyMetrics?.totalRevenue || 0).toLocaleString()}</div>
                        <p className="text-xs text-purple-100 mt-1">+{analytics.keyMetrics?.growthRate || 0}% from last month</p>
                      </CardContent>
                    </Card>

                    <Card className="border-purple-200 bg-gradient-to-br from-purple-500 to-violet-500 text-white shadow-xl">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-purple-100">Total Orders</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{(analytics.keyMetrics?.totalOrders || 0).toLocaleString()}</div>
                        <p className="text-xs text-purple-100 mt-1">Last 30 days</p>
                      </CardContent>
                    </Card>

                    <Card className="border-violet-200 bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-xl">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-purple-100">Avg Order Value</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">₱{(analytics.keyMetrics?.averageOrderValue || 0).toLocaleString()}</div>
                        <p className="text-xs text-purple-100 mt-1">Per order average</p>
                      </CardContent>
                    </Card>

                    <Card className="border-violet-200 bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-xl">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-purple-100">Total Customers</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{(analytics.keyMetrics?.totalCustomers || 0).toLocaleString()}</div>
                        <p className="text-xs text-purple-100 mt-1">Unique customers</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-violet-200 bg-white/70 backdrop-blur-sm shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-violet-800">Revenue Trends</CardTitle>
                      <CardDescription className="text-violet-600">Daily revenue and order count for the last 30 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {analytics.revenueData && analytics.revenueData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={analytics.revenueData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ddd6fe" />
                            <XAxis dataKey="date" stroke="#6d28d9" />
                            <YAxis stroke="#6d28d9" />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "#f5f3ff",
                                border: "1px solid #ddd6fe",
                                borderRadius: "8px",
                              }}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#8b5cf6" fill="#ddd6fe" strokeWidth={2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-[300px] flex items-center justify-center text-gray-500">No revenue data available</div>
                      )}
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Order Status Distribution */}
                    <Card className="border-violet-200 bg-white/70 backdrop-blur-sm shadow-xl">
                      <CardHeader>
                        <CardTitle className="text-violet-800">Order Status Distribution</CardTitle>
                        <CardDescription className="text-violet-600">Current order status breakdown</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {analytics.orderStatusData && analytics.orderStatusData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                              <Pie
                                data={analytics.orderStatusData}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                dataKey="count"
                                label={({ status, percentage }) => `${status} (${percentage}%)`}
                              >
                                {analytics.orderStatusData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={statusColors[entry.status as keyof typeof statusColors]} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#f5f3ff",
                                  border: "1px solid #ddd6fe",
                                  borderRadius: "8px",
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-[250px] flex items-center justify-center text-gray-500">No order status data available</div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Payment Methods */}
                    <Card className="border-violet-200 bg-white/70 backdrop-blur-sm shadow-xl">
                      <CardHeader>
                        <CardTitle className="text-violet-800">Payment Methods</CardTitle>
                        <CardDescription className="text-violet-600">Payment method preferences</CardDescription>
                      </CardHeader>
                      <CardContent>
                        {analytics.paymentMethodData && analytics.paymentMethodData.length > 0 ? (
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={analytics.paymentMethodData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#ddd6fe" />
                              <XAxis dataKey="method" stroke="#6d28d9" />
                              <YAxis stroke="#6d28d9" />
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "#f5f3ff",
                                  border: "1px solid #ddd6fe",
                                  borderRadius: "8px",
                                }}
                              />
                              <Bar dataKey="count" fill="#8b5cf6" />
                            </BarChart>
                          </ResponsiveContainer>
                        ) : (
                          <div className="h-[250px] flex items-center justify-center text-gray-500">No payment method data available</div>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="border-violet-200 bg-white/70 backdrop-blur-sm shadow-xl">
                    <CardHeader>
                      <CardTitle className="text-violet-800">Popular Products</CardTitle>
                      <CardDescription className="text-violet-600">Top selling items by order count</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {analytics.popularProducts && analytics.popularProducts.length > 0 ? (
                        <div className="space-y-4">
                          {analytics.popularProducts.map((product, index) => (
                            <div
                              key={product.name}
                              className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-50 to-indigo-50 rounded-lg border border-violet-200"
                            >
                              <div className="flex items-center space-x-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-500 text-white rounded-full flex items-center justify-center font-bold">
                                  {index + 1}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-violet-800">{product.name}</h3>
                                  <div className="flex items-center space-x-2 mt-1"></div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-violet-800">{product.orders} orders</div>
                                <div className="text-sm text-violet-600">₱{product.revenue.toLocaleString()}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-8 text-center text-gray-500">No popular products data available</div>
                      )}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
