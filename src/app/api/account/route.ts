import { NextRequest, NextResponse } from "next/server"

const LARAVEL_API_BASE = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "http://localhost:8000"

function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization")
  // cookie may be stored under `token` or `auth_token` depending on login logic
  const cookieToken = request.cookies.get("token")?.value || request.cookies.get("auth_token")?.value
  return authHeader?.replace("Bearer ", "") || cookieToken || null
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const token = getAuthToken(request)
    const section = body.section // 'profile' | 'shipping' | 'password'

    if (!section) {
      return NextResponse.json({ success: false, message: "Section is required (profile, shipping, password)" }, { status: 400 })
    }

    const errors: Record<string, string[]> = {}

    // Validation
    switch (section) {
      case "profile":
        if (!body.name) errors.name = ["Name is required"]
        if (Object.keys(errors).length > 0) {
          return NextResponse.json({ success: false, message: "Invalid profile data", errors }, { status: 400 })
        }
        break

      case "shipping":
        if (!body.address) errors.address = ["Address is required"]
        if (!body.city) errors.city = ["City is required"]
        if (!body.zip_code) errors.zip_code = ["Zip code is required"]
        if (Object.keys(errors).length > 0) {
          return NextResponse.json({ success: false, message: "Invalid shipping data", errors }, { status: 400 })
        }
        break

      case "password":
        if (!body.current_password) errors.current_password = ["Current password is required"]
        if (!body.new_password) errors.new_password = ["New password is required"]
        if (body.new_password !== body.new_password_confirmation) errors.new_password_confirmation = ["Passwords do not match"]
        if (Object.keys(errors).length > 0) {
          return NextResponse.json({ success: false, message: "Invalid password data", errors }, { status: 400 })
        }
        break

      default:
        return NextResponse.json({ success: false, message: "Invalid section" }, { status: 400 })
    }

    // Forward to Laravel
    const endpointMap: Record<string, string> = {
      profile: "/api/account/profile",
      shipping: "/api/account/shipping",
      password: "/api/account/password",
    }

    const response = await fetch(`${LARAVEL_API_BASE}${endpointMap[section]}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("Account Update Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update account. Please try again later.",
      },
      { status: 500 },
    )
  }
}
