import { NextResponse } from "next/server"

const LARAVEL_API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
const LARAVEL_API_TOKEN = process.env.LARAVEL_API_TOKEN || ""

async function fetchDashboardAnalytics() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  }

  // Attach Bearer token if provided (required for auth:sanctum routes)
  if (LARAVEL_API_TOKEN) {
    headers["Authorization"] = `Bearer ${LARAVEL_API_TOKEN}`
  }

  const url = `${LARAVEL_API_BASE}/api/dashboard/analytics`
  console.log("[dashboard] GET", url)

  const response = await fetch(url, {
    headers,
    // Disable Next.js fetch cache so we always get fresh data
    cache: "no-store",
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[dashboard] Laravel error (${response.status}):`, errorText)
    throw new Error(`Laravel returned ${response.status}: ${errorText}`)
  }

  return response.json()
}

export async function GET() {
  try {
    const laravelResponse = await fetchDashboardAnalytics()

    // Laravel controller should return { success: true, data: { ... } }
    if (!laravelResponse.success) {
      throw new Error(laravelResponse.message || "Laravel returned success: false")
    }

    return NextResponse.json({
      success: true,
      data: laravelResponse.data,
    })
  } catch (error) {
    console.error("[dashboard] Failed to fetch analytics:", error)

    // Return a structured fallback so the UI can still render empty states
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
        data: {
          keyMetrics: {
            totalRevenue: 0,
            totalOrders: 0,
            averageOrderValue: 0,
            totalCustomers: 0,
            growthRate: 0,
          },
          revenueData: [],
          orderStatusData: [],
          paymentMethodData: [],
          popularProducts: [],
          categoryData: [],
          productsCount: 0,
        },
      },
      { status: 502 }, // 502 = upstream error, more accurate than 500
    )
  }
}