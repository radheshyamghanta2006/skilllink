import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    let query = supabase.from("skills").select("*")

    if (category) {
      query = query.eq("category", category)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: "Failed to fetch skills" }, { status: 400 })
    }

    return NextResponse.json({ skills: data })
  } catch (error) {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
