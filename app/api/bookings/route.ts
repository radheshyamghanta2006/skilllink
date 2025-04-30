import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get booking data from request
    const { provider_id, slot_id, service_name, notes } = await request.json()

    // Get the slot details
    const { data: slotData, error: slotError } = await supabase
      .from("availability_slots")
      .select("*")
      .eq("id", slot_id)
      .single()

    if (slotError) {
      return NextResponse.json({ error: "Failed to fetch slot details" }, { status: 400 })
    }

    // Create booking
    const { data, error } = await supabase
      .from("bookings")
      .insert([
        {
          seeker_id: session.user.id,
          provider_id,
          slot_id,
          date: slotData.date,
          start_time: slotData.start_time,
          end_time: slotData.end_time,
          service_name,
          notes,
          status: "pending",
          payment_status: "pending",
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to create booking" }, { status: 400 })
    }

    // Update slot availability
    await supabase.from("availability_slots").update({ is_available: false }).eq("id", slot_id)

    return NextResponse.json({ booking: data })
  } catch (error) {
    console.error("Error creating booking:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")

    let query = supabase.from("bookings").select(`
        *,
        provider:provider_id (id, name, profile_image),
        seeker:seeker_id (id, name, profile_image),
        slot:slot_id (*)
      `)

    if (role === "provider") {
      query = query.eq("provider_id", session.user.id)
    } else if (role === "seeker") {
      query = query.eq("seeker_id", session.user.id)
    } else {
      // If no role specified, return bookings where user is either provider or seeker
      query = query.or(`provider_id.eq.${session.user.id},seeker_id.eq.${session.user.id}`)
    }

    const { data, error } = await query.order("date", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 400 })
    }

    return NextResponse.json({ bookings: data })
  } catch (error) {
    console.error("Error fetching bookings:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
