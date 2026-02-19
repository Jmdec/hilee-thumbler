import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization")
  // cookie may be stored under `token` or `auth_token` depending on login logic
  const cookieToken = request.cookies.get("token")?.value || request.cookies.get("auth_token")?.value
  return authHeader?.replace("Bearer ", "") || cookieToken || null
}

export async function GET(request: NextRequest) {
  try {
    const token = getAuthToken(request)

    console.log("[API] Token present:", !!token)

    if (!token) {
      console.log("[API] No token - returning 401")
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()
    const apiUrl = `${API_BASE_URL}/api/products${queryString ? `?${queryString}` : ""}`

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-cache",
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
      return NextResponse.json({ message: errorData.message || "Failed to fetch products" }, { status: response.status })
    }

    const data = await response.json()
    // Support both paginated and non-paginated responses
    return NextResponse.json(data.data ?? data)

  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // the API routes run on the server; localStorage is unavailable.
    // extract the token from the incoming request instead.
    const token = getAuthToken(request)
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    const formData = await request.formData()
    const laravelForm = new FormData()

    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const price = formData.get("price") as string
    const quantity = formData.get("quantity") as string
    const image = formData.get("image") as File

    laravelForm.append("name", name)
    laravelForm.append("description", description ?? "")
    laravelForm.append("price", price)
    laravelForm.append("quantity", quantity)

    if (image && image.size > 0) laravelForm.append("image", image)

    // forward request to Laravel backend using base url
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: laravelForm,
    })

    const responseData = await response.json()
    if (!response.ok) {
      return NextResponse.json(
        { message: responseData.message || "Failed to create product", errors: responseData.errors || null },
        { status: response.status }
      )
    }

    return NextResponse.json(responseData, { status: 201 })

  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}