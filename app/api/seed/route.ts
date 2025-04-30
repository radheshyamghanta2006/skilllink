import { NextResponse } from "next/server"
import { seedDatabase } from "@/lib/seed-database"

// Add GET method that calls the same logic as POST
export async function GET(request: Request) {
  return handleSeedRequest(request)
}

export async function POST(request: Request) {
  return handleSeedRequest(request)
}

// Extract the shared logic into a separate function
async function handleSeedRequest(request: Request) {
  try {
    console.log("Seed endpoint called")
    
    // Get Supabase URL and service role key from environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    console.log("Supabase URL available:", !!supabaseUrl)
    console.log("Supabase Service Role Key available:", !!supabaseServiceRoleKey)

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error("Missing Supabase credentials")
      return NextResponse.json(
        { 
          error: "Missing Supabase credentials",
          urlAvailable: !!supabaseUrl,
          keyAvailable: !!supabaseServiceRoleKey
        }, 
        { status: 500 }
      )
    }

    // Seed the database
    console.log("Calling seed function...")
    const result = await seedDatabase(supabaseUrl, supabaseServiceRoleKey)
    console.log("Seed function result:", result)

    return NextResponse.json({ 
      success: true,
      message: "Database seeding completed successfully",
      result 
    })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ 
      error: "Failed to seed database", 
      message: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}
