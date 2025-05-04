import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Add a simple test endpoint to verify the route is working
export async function GET(request: Request) {
  console.log("GET /api/profile route hit");
  return NextResponse.json({ message: "Profile API is working" }, { status: 200 });
}

export async function PUT(request: Request) {
  console.log("PUT /api/profile route hit");
  
  try {
    // Log request details for debugging
    const requestBody = await request.json();
    console.log("Request body received:", requestBody);
    
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      console.error("Profile update failed: No active session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Session user ID:", session.user.id);

    // Get profile data from request
    const { name, phone, location, bio } = requestBody;
    const userId = session.user.id;

    console.log("Processing profile update:", {
      userId,
      name,
      phone,
      location,
      bioLength: bio ? bio.length : 0
    });

    // For debugging - let's try a simple query first
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();
      
    if (userError) {
      console.error("Error fetching user data:", userError);
      return NextResponse.json({ 
        error: "Failed to fetch user data", 
        details: userError.message 
      }, { status: 400 });
    }
    
    console.log("Found user data:", userData);

    // Update user profile
    const { data, error } = await supabase
      .from("users")
      .update({
        name,
        phone,
        location,
        bio,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select();

    if (error) {
      console.error("Profile update error:", error);
      return NextResponse.json({ 
        error: "Failed to update profile", 
        details: error.message,
        code: error.code
      }, { status: 400 });
    }

    if (!data || data.length === 0) {
      console.error("No user found with ID:", userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log("Profile updated successfully:", data[0]);
    return NextResponse.json({ user: data[0] });
  } catch (error) {
    console.error("Server error during profile update:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ 
      error: "Internal server error", 
      details: message 
    }, { status: 500 });
  }
}