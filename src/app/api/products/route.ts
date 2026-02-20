import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization")
  const cookieToken =
    request.cookies.get("token")?.value || request.cookies.get("auth_token")?.value
  return authHeader?.replace("Bearer ", "") || cookieToken || null
}

export async function GET(request: NextRequest) {
  try {
    const token = getAuthToken(request)

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Authentication required" },
        { status: 401 }
      )
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
      return NextResponse.json(
        { message: errorData.message || "Failed to fetch products" },
        { status: response.status }
      )
    }

    const data = await response.json()
    // Support both paginated ({ data: [...] }) and flat array responses
    return NextResponse.json(data.data ?? data)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = getAuthToken(request)
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()

    // Log incoming values to help debug
    console.log("[POST /api/products] name:", formData.get("name"))
    console.log("[POST /api/products] price:", formData.get("price"))
    console.log("[POST /api/products] stock:", formData.get("stock"))

    const name = formData.get("name") as string
    const description = (formData.get("description") as string) ?? ""
    const price = formData.get("price") as string
    const stock = formData.get("stock") as string
    const image = formData.get("image") as File | null

    // Validate required fields before forwarding
    if (!name || !price || stock === null || stock === "") {
      return NextResponse.json(
        { message: "name, price, and stock are required" },
        { status: 422 }
      )
    }

    const laravelForm = new FormData()
    laravelForm.append("name", name)
    laravelForm.append("description", description)
    laravelForm.append("price", price)
    laravelForm.append("stock", stock)          // forward as string; Laravel casts to int

    if (image && image.size > 0) {
      laravelForm.append("image", image)
    }

    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
        // DO NOT set Content-Type here — let fetch set it with the boundary for multipart
      },
      body: laravelForm,
    })

    const responseData = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        {
          message: responseData.message || "Failed to create product",
          errors: responseData.errors || null,
        },
        { status: response.status }
      )
    }

    return NextResponse.json(responseData, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}