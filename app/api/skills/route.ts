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

export async function POST(request: Request) {
  try {
    // Use proper cookie handling to fix the cookie issue
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Get the current user
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      console.error("Authentication error:", sessionError || "No session found")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const user = session.user
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }
    
    // Parse the request body
    const body = await request.json()
    const { name, category, description, intent } = body
    
    if (!name || !category) {
      return NextResponse.json({ error: "Name and category are required" }, { status: 400 })
    }
    
    // Insert the skill into the database with the actual column names
    const skillData = {
      user_id: user.id,
      skill_name: name, // Use skill_name instead of name to match DB schema
      category,
      intent: intent || 'provider', // Use intent instead of is_active
      description: description || "",
    }
    
    console.log("Inserting skill with data:", skillData)
    
    const { data, error } = await supabase
      .from('skills')
      .insert([skillData])
      .select()
    
    if (error) {
      console.error("Error creating skill:", error)
      return NextResponse.json({ 
        error: "Failed to create skill", 
        details: error 
      }, { status: 400 })
    }
    
    return NextResponse.json({ skill: data[0] })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ 
      error: "Failed to process request",
      details: error
    }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    // Use proper cookie handling to fix the cookie issue
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Get the current user with proper session handling
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const user = session.user
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const skillId = searchParams.get("id")
    
    if (!skillId) {
      return NextResponse.json({ error: "Skill ID is required" }, { status: 400 })
    }
    
    // Verify the skill belongs to the user
    const { data: skillData, error: skillError } = await supabase
      .from('skills')
      .select('*')
      .eq('id', skillId)
      .eq('user_id', user.id)
      .single()
    
    if (skillError || !skillData) {
      return NextResponse.json({ error: "Skill not found or unauthorized" }, { status: 404 })
    }
    
    // Delete the skill
    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', skillId)
    
    if (error) {
      return NextResponse.json({ error: "Failed to delete skill" }, { status: 400 })
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
