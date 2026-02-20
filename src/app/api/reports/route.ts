import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const range = searchParams.get("range") ?? "week"
    const token = request.headers.get("authorization")

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    const backendUrl =
      process.env.NEXT_PUBLIC_API_URL ??
      process.env.API_URL ??
      "http://localhost:8000"

    const res = await fetch(`${backendUrl}/api/reports?range=${range}`, {
      headers: {
        Authorization:  token,
        "Content-Type": "application/json",
        Accept:         "application/json",
      },
    })

    // Always read raw text first — never lose the error body
    const rawText = await res.text()

    if (!res.ok) {
      let laravelMessage = rawText
      try {
        const json = JSON.parse(rawText)
        laravelMessage = json.message ?? json.error ?? json.exception ?? rawText
      } catch {
        // HTML Whoops page — strip tags, take first 300 chars
        laravelMessage = rawText
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 300)
      }

      console.error(`[reports] Laravel ${res.status}:`, laravelMessage)

      return NextResponse.json(
        { success: false, message: laravelMessage, status: res.status },
        { status: res.status }
      )
    }

    try {
      const data = JSON.parse(rawText)
      return NextResponse.json(data)
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid JSON from backend", raw: rawText.slice(0, 500) },
        { status: 502 }
      )
    }

  } catch (err: any) {
    console.error("[reports] Network error:", err?.message)
    return NextResponse.json(
      { success: false, message: `Cannot reach backend: ${err?.message ?? "unknown error"}` },
      { status: 502 }
    )
  }
}