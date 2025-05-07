"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://skilllink-one.vercel.app';

export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState("both")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Check if user is already logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        toast({
          title: "Already logged in",
          description: "You are already logged in. Redirecting to dashboard...",
        })
        router.replace("/dashboard")
      }
    }
    checkSession()
  }, [])

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null) // Clear previous errors

    try {
      // Enhanced validation
      if (!email || !password || !confirmPassword || !name) {
        setError("Please fill in all fields")
        return // Return early instead of throwing
      }

      if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        setError("Please enter a valid email address")
        return
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters long")
        return
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match")
        return
      }

      if (name.length < 2) {
        setError("Please enter your full name")
        return
      }

      // Check if email already exists in auth
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .single()

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 means no rows returned
        setError("Email already exists. Please log in instead.")
        console.error("Email check error:", checkError)
        return
      }

      if (existingUser) {
        setError("An account with this email already exists. Please log in instead.")
        return
      }

      // 1. Sign up with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
          emailRedirectTo: `${SITE_URL}/dashboard`,
        },
      })

      if (signUpError) {
        let errorMessage = "An error occurred during signup. Please try again."
        
        if (typeof signUpError === 'object' && signUpError !== null) {
          switch (signUpError.message) {
            case "User already registered":
              errorMessage = "An account with this email already exists. Please log in instead."
              break
            case "Password should be at least 6 characters":
              errorMessage = "Password must be at least 6 characters long"
              break
            case "Unable to validate email address":
              errorMessage = "Please enter a valid email address"
              break
            case "Rate limit exceeded":
              errorMessage = "Too many signup attempts. Please try again later"
              break
            default:
              errorMessage = signUpError.message || errorMessage
          }
        }
        
        setError(errorMessage)
        return
      }

      if (!data?.user?.id) {
        setError("Failed to create user account. Please try again.")
        return
      }

      // 2. Create user profile in database
      const { error: profileError } = await supabase.from("users").insert([
        {
          id: data.user.id,
          name,
          email,
          role,
        },
      ])

      if (profileError) {
        // If profile creation fails, attempt to delete the auth user
        try {
          await supabase.auth.admin.deleteUser(data.user.id)
        } catch (deleteError) {
          console.error("Failed to cleanup auth user after profile creation error:", deleteError)
        }
        
        let errorMessage = "Failed to create user profile. Please try again."
        
        if (typeof profileError === 'object' && profileError !== null) {
          if (profileError.code === "23505") {
            errorMessage = "An account with this email already exists. Please log in instead."
          } else if (profileError.code === "23503") {
            errorMessage = "An account with this email already exists. Please log in instead."
          } else if (profileError.message) {
            errorMessage = profileError.message
          }
        }
        
        setError(errorMessage)
        return
      }

      toast({
        title: "Account created successfully!",
        description: "Please check your email to verify your account. Check your spam folder if you don't see it.",
      })

      router.push("/login")
    } catch (error: any) {
      console.error("Signup error:", error)
      
      // Handle empty error object or unexpected errors
      let errorMessage = "An unexpected error occurred. Please try again."
      
      if (error && typeof error === 'object') {
        if (error.message && typeof error.message === 'string') {
          errorMessage = error.message
        } else if (error.error_description) {
          errorMessage = error.error_description
        }
      }
      
      // Don't show duplicate error messages
      if (!error?.message?.includes("Please") && !error?.message?.includes("Passwords")) {
        toast({
          title: "Signup failed",
          description: errorMessage,
          variant: "destructive",
        })
      }
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${SITE_URL}/dashboard`,
          shouldCreateUser: true, // Allow new users to sign up with magic link
          data: {
            name,
            role,
          },
        },
      })

      if (error) throw error

      toast({
        title: "Magic link sent!",
        description: "Please check your email for the login link.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-purple-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-2 border-purple-100 shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
              <CardDescription className="text-center">Join SkillLink to start exchanging skills</CardDescription>
            </CardHeader>
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="email">Email & Password</TabsTrigger>
                <TabsTrigger value="magic">Magic Link</TabsTrigger>
              </TabsList>
              <TabsContent value="email">
                <form onSubmit={handleSignUp}>
                  {error && (
                    <div className="px-6 pb-4">
                      <Alert variant="destructive">
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    </div>
                  )}
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Create a password (min. 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm your password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>I want to join as</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button
                          type="button"
                          variant={role === "seeker" ? "default" : "outline"}
                          className={role === "seeker" ? "bg-purple-600 hover:bg-purple-700" : ""}
                          onClick={() => setRole("seeker")}
                        >
                          Skill Seeker
                        </Button>
                        <Button
                          type="button"
                          variant={role === "provider" ? "default" : "outline"}
                          className={role === "provider" ? "bg-blue-600 hover:bg-blue-700" : ""}
                          onClick={() => setRole("provider")}
                        >
                          Skill Provider
                        </Button>
                        <Button
                          type="button"
                          variant={role === "both" ? "default" : "outline"}
                          className={
                            role === "both"
                              ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                              : ""
                          }
                          onClick={() => setRole("both")}
                        >
                          Both
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-4">
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating account..." : "Sign Up"}
                    </Button>
                    <div className="text-center text-sm">
                      Already have an account?{" "}
                      <Link href="/login" className="text-purple-600 hover:underline">
                        Log in
                      </Link>
                    </div>
                  </CardFooter>
                </form>
              </TabsContent>
              <TabsContent value="magic">
                <form onSubmit={handleMagicLink}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="magic-email">Email</Label>
                      <Input
                        id="magic-email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-4">
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending link..." : "Send Magic Link"}
                    </Button>
                    <div className="text-center text-sm">
                      Already have an account?{" "}
                      <Link href="/login" className="text-purple-600 hover:underline">
                        Log in
                      </Link>
                    </div>
                  </CardFooter>
                </form>
              </TabsContent>
            </Tabs>
          </Card>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
