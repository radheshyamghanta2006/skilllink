import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

type Review = {
  booking_id: string
  rating: number
  comment: string
  reviewer_id: string
  reviewee_id: string
  provider_id: string
  seeker_id: string
  is_provider_review: boolean
  skill_swap_direction?: 'received' | 'provided'
}

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
    const reviewData: Review = await request.json()

    // Validate required fields
    if (!reviewData.booking_id || !reviewData.rating || !reviewData.comment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate rating range
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 })
    }

    // Validate comment length
    if (reviewData.comment.trim().length < 3) {
      return NextResponse.json({ error: "Comment must be at least 3 characters long" }, { status: 400 })
    }

    // Check if booking exists and is completed
    const { data: booking, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", reviewData.booking_id)
      .single()

    if (fetchError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 })
    }

    if (booking.status !== "completed") {
      return NextResponse.json({ error: "Cannot review a booking that is not completed" }, { status: 400 })
    }

    // Check if user is either the provider or seeker of the booking
    if (booking.provider_id !== session.user.id && booking.seeker_id !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized to review this booking" }, { status: 403 })
    }

    // Check if user has already reviewed this booking
    const { data: existingReview, error: checkError } = await supabase
      .from("reviews")
      .select("*")
      .eq("booking_id", reviewData.booking_id)
      .eq("reviewer_id", session.user.id)
      .maybeSingle()

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this booking" }, { status: 400 })
    }

    // For skill swaps, validate both reviews are submitted
    if (booking.is_skill_swap) {
      if (!reviewData.skill_swap_direction) {
        return NextResponse.json({ error: "Skill swap direction is required for skill swap reviews" }, { status: 400 })
      }
    }

    // Create review
    const { data, error } = await supabase
      .from("reviews")
      .insert([reviewData])
      .select()
      .single()

    if (error) {
      console.error("Error creating review:", error)
      return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
    }

    // Update booking with review status
    await supabase
      .from("bookings")
      .update({ has_review: true })
      .eq("id", reviewData.booking_id)

    return NextResponse.json({ review: data })
  } catch (error) {
    console.error("Error processing review:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
