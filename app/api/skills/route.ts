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
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Parse the request body
    const body = await request.json()
    const { name, category, description, intent, duration = 60 } = body
    
    if (!name || !category) {
      return NextResponse.json({ error: "Name and category are required" }, { status: 400 })
    }
    
    // Set is_active based on intent (provider or seeker)
    const is_active = intent === "provider"
    
    // Insert the skill into the database
    const { data, error } = await supabase
      .from('skills')
      .insert([{
        user_id: user.id,
        name,
        description: description || "",
        category,
        provider_id: user.id,
        duration,
        is_active,
        price: is_active ? 0 : null // Set price for provider skills only
      }])
      .select()
    
    if (error) {
      console.error("Error creating skill:", error)
      return NextResponse.json({ error: "Failed to create skill" }, { status: 400 })
    }
    
    return NextResponse.json({ skill: data[0] })
  } catch (error) {
    console.error("Server error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
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
