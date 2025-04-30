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

    // Get review data from request
    const { booking_id, rating, comment } = await request.json()

    if (!booking_id || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid review data" }, { status: 400 })
    }

    // Check if booking exists and is completed
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", booking_id)
      .single()

    if (fetchError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (booking.status !== "completed") {
      return NextResponse.json({ error: "Cannot review a booking that is not completed" }, { status: 400 })
    }

    // Check if user is either the provider or seeker of the booking
    if (booking.provider_id !== session.user.id && booking.seeker_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Determine reviewer and reviewee
    const isProvider = booking.provider_id === session.user.id
    const reviewer_id = session.user.id
    const reviewee_id = isProvider ? booking.seeker_id : booking.provider_id

    // Check if user has already reviewed this booking
    const { data: existingReview, error: checkError } = await supabase
      .from("reviews")
      .select("*")
      .eq("booking_id", booking_id)
      .eq("reviewer_id", reviewer_id)
      .maybeSingle()

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this booking" }, { status: 400 })
    }

    // Create review
    const { data, error } = await supabase
      .from("reviews")
      .insert([
        {
          booking_id,
          reviewer_id,
          reviewee_id,
          provider_id: booking.provider_id,
          seeker_id: booking.seeker_id,
          rating,
          comment,
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Failed to create review" }, { status: 400 })
    }

    return NextResponse.json({ review: data })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
