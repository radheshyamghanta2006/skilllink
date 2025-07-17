import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { type Database } from "@/types/database.types"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const error = requestUrl.searchParams.get("error")
  const error_description = requestUrl.searchParams.get("error_description")

  // Handle errors (like expired OTP)
  if (error) {
    console.error("Auth callback error:", error, error_description)
    
    // For OTP expired or access denied, redirect to verify email page
    if (error === "otp_expired" || error === "access_denied") {
      const redirectUrl = new URL("/verify-email", requestUrl.origin)
      redirectUrl.searchParams.set("error", error)
      redirectUrl.searchParams.set("message", error_description || "Email link has expired")
      
      return NextResponse.redirect(redirectUrl.toString())
    }
    
    // For other errors, redirect to login with error message
    const redirectUrl = new URL("/login", requestUrl.origin)
    redirectUrl.searchParams.set("error", error)
    redirectUrl.searchParams.set("message", error_description || "Authentication failed")
    
    return NextResponse.redirect(redirectUrl.toString())
  }

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    try {
      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
      
      if (exchangeError) {
        console.error("Code exchange error:", exchangeError)
        
        // Redirect to login with error
        const redirectUrl = new URL("/login", requestUrl.origin)
        redirectUrl.searchParams.set("error", "session_error")
        redirectUrl.searchParams.set("message", "Failed to create session. Please try logging in again.")
        
        return NextResponse.redirect(redirectUrl.toString())
      }
      
      // Success - redirect to dashboard
      return NextResponse.redirect(requestUrl.origin + "/dashboard")
      
    } catch (error) {
      console.error("Auth callback error:", error)
      
      // Redirect to login with generic error
      const redirectUrl = new URL("/login", requestUrl.origin)
      redirectUrl.searchParams.set("error", "callback_error")
      redirectUrl.searchParams.set("message", "Authentication failed. Please try again.")
      
      return NextResponse.redirect(redirectUrl.toString())
    }
  }

  // No code provided, redirect to login
  return NextResponse.redirect(requestUrl.origin + "/login")
}
