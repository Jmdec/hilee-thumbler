import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization")
  const cookieToken = request.cookies.get("token")?.value || request.cookies.get("auth_token")?.value
  return authHeader?.replace("Bearer ", "") || cookieToken || null
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${params.id}`, {
      headers: { Accept: "application/json" },
      cache: "no-cache",
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
      return NextResponse.json({ message: errorData.message || "Failed to fetch product" }, { status: response.status })
    }

    return NextResponse.json(await response.json())
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = getAuthToken(request)
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 })

    const formData    = await request.formData()
    const laravelForm = new FormData()

    const name        = formData.get("name") as string
    const description = formData.get("description") as string
    const price       = formData.get("price") as string
    const quantity    = formData.get("quantity") as string
    const isActive    = formData.get("is_active") as string
    const image       = formData.get("image") as File

    laravelForm.append("name", name)
    laravelForm.append("description", description ?? "")
    laravelForm.append("price", price)
    laravelForm.append("quantity", quantity)
    laravelForm.append("_method", "PUT") // Laravel method spoofing for FormData

    if (isActive !== null && isActive !== undefined) {
      laravelForm.append("is_active", isActive)
    }

    if (image && image.size > 0) laravelForm.append("image", image)

    const response = await fetch(`${API_BASE_URL}/api/products/${params.id}`, {
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
        { message: responseData.message || "Failed to update product", errors: responseData.errors || null },
        { status: response.status }
      )
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Try getting token from Authorization header first, then cookies
    const token = getAuthToken(request)

    if (!token) {
      return NextResponse.json({ message: "Unauthorized - no token provided" }, { status: 401 })
    }

    const response = await fetch(`${API_BASE_URL}/api/products/${params.id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    // Handle empty responses (some APIs return 204 No Content on delete)
    if (response.status === 204) {
      return NextResponse.json({ success: true, message: "Product deleted successfully" })
    }

    const responseData = await response.json().catch(() => ({
      success: response.ok,
      message: response.ok ? "Product deleted successfully" : "Failed to delete product",
    }))

    if (!response.ok) {
      return NextResponse.json(
        { message: responseData.message || "Failed to delete product" },
        { status: response.status }
      )
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}