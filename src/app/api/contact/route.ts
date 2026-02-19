import { NextRequest, NextResponse } from 'next/server'

const LARAVEL_API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization")
  // cookie may be stored under `token` or `auth_token` depending on login logic
  const cookieToken = request.cookies.get("token")?.value || request.cookies.get("auth_token")?.value
  return authHeader?.replace("Bearer ", "") || cookieToken || null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log(body)
    // Validate required fields
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        {
          success: false,
          message: 'Name, email, and message are required fields. 이름, 이메일, 메시지는 필수 항목입니다.',
          errors: {
            name: !body.name ? ['Name is required'] : [],
            email: !body.email ? ['Email is required'] : [],
            
            message: !body.message ? ['Message is required'] : [],
          }
        },
        { status: 400 }
      )
    }

    // Send to Laravel backend
    const response = await fetch(`${LARAVEL_API_BASE}/api/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        name: body.name,
        email: body.email,
        phone: body.phone || '',
        subject: body.subject || '',
        message: body.message,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: 201 })

  } catch (error) {
    console.error('Contact API Error:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to send message. Please try again later. 메시지 전송에 실패했습니다. 나중에 다시 시도해 주세요.',
      },
      { status: 500 }
    )
  }
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
    const apiUrl = `${LARAVEL_API_BASE}/api/contacts${queryString ? `?${queryString}` : ""}`

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
    console.log(data)
    // Support both paginated and non-paginated responses
    return NextResponse.json(data.data ?? data)

  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}