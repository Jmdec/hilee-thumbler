import { type NextRequest, NextResponse } from "next/server"

const LARAVEL_API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization")
  const cookieToken =
    request.cookies.get("token")?.value || request.cookies.get("auth_token")?.value
  return authHeader?.replace("Bearer ", "") || cookieToken || null
}

// GET /api/cart
export async function GET(request: NextRequest) {
  try {
    const token = getAuthToken(request)
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    const response = await fetch(`${LARAVEL_API_BASE}/api/cart`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("[API] Laravel cart GET error:", data)
      return NextResponse.json(
        { success: false, message: data.message || "Failed to fetch cart" },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("[API] Error fetching cart:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

// POST /api/cart  — add item to cart
export async function POST(request: NextRequest) {
  try {
    const token = getAuthToken(request)
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    const body = await request.json()

    console.log("[API] Add to cart request:", body)

    const response = await fetch(`${LARAVEL_API_BASE}/api/cart`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        product_id: body.productId,
        quantity: body.quantity ?? 1,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("[API] Laravel cart POST error:", data)
      return NextResponse.json(
        { success: false, message: data.message || "Failed to add to cart" },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("[API] Error adding to cart:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/cart  — clear entire cart
export async function DELETE(request: NextRequest) {
  try {
    const token = getAuthToken(request)
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    const response = await fetch(`${LARAVEL_API_BASE}/api/cart/clear`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("[API] Laravel cart DELETE error:", data)
      return NextResponse.json(
        { success: false, message: data.message || "Failed to clear cart" },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("[API] Error clearing cart:", error)
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}