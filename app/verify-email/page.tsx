"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Mail, RefreshCw, CheckCircle, XCircle } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function VerifyEmailPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isResent, setIsResent] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  const error = searchParams.get("error")
  const message = searchParams.get("message")
  const success = searchParams.get("success")
  const emailParam = searchParams.get("email")

  // Pre-fill email if provided
  useState(() => {
    if (emailParam && !email) {
      setEmail(decodeURIComponent(emailParam))
    }
  })

  const handleResendVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      })

      if (error) throw error

      setIsResent(true)
      toast({
        title: "Verification email sent!",
        description: "Please check your email for the new verification link.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to resend verification email.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendMagicLink = async (e: React.FormEvent) => {
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

      setIsResent(true)
      toast({
        title: "Magic link sent!",
        description: "Please check your email for the login link.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send magic link.",
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
        <div className="w-full max-w-md">
          <Card className="border-2 border-purple-100 shadow-lg">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-4">
                {error ? (
                  <XCircle className="h-12 w-12 text-red-500" />
                ) : isResent ? (
                  <CheckCircle className="h-12 w-12 text-green-500" />
                ) : (
                  <Mail className="h-12 w-12 text-purple-600" />
                )}
              </div>
              <CardTitle className="text-2xl font-bold text-center">
                {error ? "Email Link Error" 
                 : success ? "Check Your Email" 
                 : isResent ? "Email Sent!" 
                 : "Email Verification"}
              </CardTitle>
              <CardDescription className="text-center">
                {error 
                  ? "There was an issue with your email verification link"
                  : success
                  ? "We've sent a verification email to your inbox"
                  : isResent 
                  ? "A new verification email has been sent to your inbox"
                  : "Send a new verification email or magic link"
                }
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {error && message && (
                <Alert className="border-red-200 bg-red-50">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">
                    <strong>Error:</strong> {message}
                    <br />
                    <span className="text-sm mt-1 block">
                      Don't worry! You can request a new verification email below.
                    </span>
                  </AlertDescription>
                </Alert>
              )}

              {(success || isResent) && (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-700">
                    Check your email inbox and click the verification link to continue.
                    The link will expire in 24 hours.
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleResendVerification} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="flex flex-col space-y-2">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    disabled={isLoading || !email}
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Resend Verification Email
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendMagicLink}
                    disabled={isLoading || !email}
                    className="w-full"
                  >
                    {isLoading ? "Sending..." : "Send Magic Link Instead"}
                  </Button>
                </div>
              </form>

              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  Remember to check your spam folder if you don't see the email.
                </p>
                <div className="flex justify-center space-x-4 text-sm">
                  <Button variant="link" onClick={() => router.push("/login")} className="p-0">
                    Back to Login
                  </Button>
                  <Button variant="link" onClick={() => router.push("/signup")} className="p-0">
                    Create New Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
