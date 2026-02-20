
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const backendUrl =
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.API_URL ??
    "http://localhost:8000"

  const { searchParams } = new URL(request.url)
  const range = searchParams.get("range") ?? "week"
  const token = request.headers.get("authorization")

  // 1. Check env
  const envCheck = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? "NOT SET",
    API_URL:             process.env.API_URL ?? "NOT SET",
    resolved_backend:    backendUrl,
    has_token:           !!token,
  }

  // 2. Try the backend call and capture raw response
  let rawBody = ""
  let status  = 0
  let headers: Record<string, string> = {}

  try {
    const res = await fetch(`${backendUrl}/api/reports?range=${range}`, {
      headers: {
        Authorization:  token ?? "",
        "Content-Type": "application/json",
        Accept:         "application/json",
      },
    })

    status   = res.status
    rawBody  = await res.text()
    res.headers.forEach((v, k) => { headers[k] = v })
  } catch (err: any) {
    return NextResponse.json({
      stage:   "fetch_failed",
      env:     envCheck,
      error:   err?.message ?? String(err),
    }, { status: 500 })
  }

  // 3. Try JSON parse
  let parsed: unknown = null
  let parseError       = null
  try {
    parsed = JSON.parse(rawBody)
  } catch (e: any) {
    parseError = e.message
  }

  return NextResponse.json({
    stage:        "backend_responded",
    env:          envCheck,
    backend_status: status,
    parse_error:  parseError,
    raw_snippet:  rawBody.slice(0, 2000),   // first 2000 chars
    parsed:       parsed,
  })
}












