import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
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

    const bookingId = params.id
    const { status, payment_status } = await request.json()

    // Check if booking exists and user has permission
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    // Check if user is either the provider or seeker
    if (booking.provider_id !== session.user.id && booking.seeker_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Update booking
    const updateData: any = {}
    if (status) updateData.status = status
    if (payment_status) updateData.payment_status = payment_status

    const { data, error } = await supabase.from("bookings").update(updateData).eq("id", bookingId).select().single()

    if (error) {
      return NextResponse.json({ error: "Failed to update booking" }, { status: 400 })
    }

    // If booking is cancelled, make the slot available again
    if (status === "cancelled") {
      await supabase.from("availability_slots").update({ is_available: true }).eq("id", booking.slot_id)
    }

    return NextResponse.json({ booking: data })
  } catch (error) {
    console.error("Error updating booking:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
