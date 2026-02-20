
import { type NextRequest, NextResponse } from "next/server"

const LARAVEL_API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"


export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authToken = request.headers.get("Authorization")
    if (!authToken) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const url = new URL(request.url)
    const isCancelRequest = url.pathname.endsWith("/cancel")

    const laravelUrl = isCancelRequest
      ? `${LARAVEL_API_BASE}/api/orders/${id}/cancel`
      : `${LARAVEL_API_BASE}/api/orders/${id}`

    const response = await fetch(laravelUrl, {
      method: "POST",
      headers: {
        Authorization: authToken,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
  }
}