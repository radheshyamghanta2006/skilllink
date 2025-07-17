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
import { useSearchParams } from "next/navigation"
import { useEffect } from "react"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://skilllink-one.vercel.app';

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showResendButton, setShowResendButton] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const searchParams = useSearchParams()

  // Handle auth callback errors
  useEffect(() => {
    const error = searchParams.get("error")
    const message = searchParams.get("message")
    
    if (error && message) {
      let title = "Authentication Error"
      let description = message
      
      switch (error) {
        case "otp_expired":
          title = "Link Expired"
          description = "The email verification link has expired. Please request a new one."
          break
        case "access_denied":
          title = "Access Denied"
          description = "The authentication link is invalid or has already been used."
          break
        case "session_error":
          title = "Session Error"
          description = message
          break
        default:
          title = "Authentication Error"
          description = message
      }
      
      toast({
        title,
        description,
        variant: "destructive",
      })
      
      // Clean up URL parameters
      router.replace("/login", { scroll: false })
    }
  }, [searchParams, toast, router])

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

  const handleResendConfirmation = async () => {
    try {
      setIsLoading(true)
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      })

      if (error) throw error

      toast({
        title: "Verification email sent",
        description: "Please check your email to verify your account. Check your spam folder if you don't see it.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend verification email",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setShowResendButton(false)

    try {
      if (!email || !password) {
        setError("Please fill in all fields")
        return
      }

      if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        setError("Please enter a valid email address")
        return
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters long")
        return
      }

      await supabase.auth.signOut({ scope: 'local' })

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        switch (error.message) {
          case "Invalid login credentials":
            setError("Invalid email or password. Please try again.")
            break
          case "Email not confirmed":
            setError("Please verify your email before logging in. Check your inbox and spam folder for the verification email.")
            setShowResendButton(true)
            break
          case "Too many requests":
            setError("Too many login attempts. Please try again in a few minutes.")
            break
          case "User not found":
            setError("No account found with this email. Please check your email or sign up.")
            break
          default:
            setError(error.message || "An error occurred during login")
        }
        return
      }

      setError(null)
      
      toast({
        title: "Welcome back!",
        description: "You have successfully logged in.",
      })

      router.replace("/dashboard")
    } catch (error: any) {
      console.error("Login error:", error)
      setError("An unexpected error occurred. Please try again.")
      
      toast({
        title: "Login failed",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      })
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
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,

        },
      })

      if (error) throw error

      toast({
        title: "Magic link sent!",
        description: "Please check your email for the login link. The link will expire in 24 hours.",
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
    <div className="min-h-screen flex flex-col dark:bg-black">
      <Navbar />
      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 dark:bg-black">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-2 border-purple-100 shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
              <CardDescription className="text-center">Log in to your SkillLink account</CardDescription>
            </CardHeader>
            <Tabs defaultValue="email" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="email">Email & Password</TabsTrigger>
                <TabsTrigger value="magic">Magic Link</TabsTrigger>
              </TabsList>
              <TabsContent value="email">
                <form onSubmit={handleLogin}>
                  {error && (
                    <div className="px-6 pb-4">
                      <Alert variant="destructive">
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        <AlertDescription>
                          {error}
                          {showResendButton && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="mt-2 w-full"
                              onClick={handleResendConfirmation}
                              disabled={isLoading}
                            >
                              Resend verification email
                            </Button>
                          )}
                        </AlertDescription>
                      </Alert>
                    </div>
                  )}
                  <CardContent className="space-y-4">
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
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <div className="text-right">
                        <Link href="/forgot-password" className="text-sm text-purple-600 hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-4">
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      disabled={isLoading}
                    >
                      {isLoading ? "Logging in..." : "Log In"}
                    </Button>
                    <div className="text-center text-sm">
                      Don&apos;t have an account?{" "}
                      <Link href="/signup" className="text-purple-600 hover:underline">
                        Sign up
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
                    <div className="text-sm text-gray-600">
                      <p>We'll send you a secure login link to your email.</p>
                      <p className="mt-1">
                        <strong>Note:</strong> Email links expire after 24 hours. If your link has expired, simply request a new one.
                      </p>
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
                      Don&apos;t have an account?{" "}
                      <Link href="/signup" className="text-purple-600 hover:underline">
                        Sign up
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
