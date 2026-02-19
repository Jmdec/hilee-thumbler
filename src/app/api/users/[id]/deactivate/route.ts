import { type NextRequest, NextResponse } from "next/server"

function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization")
  // cookie may be stored under `token` or `auth_token` depending on login logic
  const cookieToken = request.cookies.get("token")?.value || request.cookies.get("auth_token")?.value
  return authHeader?.replace("Bearer ", "") || cookieToken || null
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params

    const token = getAuthToken(request)

    if (!token) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    const body = await request.json()

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const url = `${baseUrl}/api/users/${id}/deactivate`

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ success: false, message: `Backend returned ${response.status}`, details: errorText }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[API] Error in PUT /api/users/[id]:", error)
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 },
    )
  }
}