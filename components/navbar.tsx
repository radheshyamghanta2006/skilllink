"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { Menu, X, User, LogOut, Settings, MessageSquare, Calendar } from "lucide-react"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProviderMode, setIsProviderMode] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        try {
          const { data, error } = await supabase.from("users").select("*").eq("id", session.user.id).single()

          if (error) throw error

          setUser(data)
          setIsProviderMode(data.role === "provider" || data.role === "both")
        } catch (error) {
          console.error("Error fetching user:", error)
        }
      }

      setIsLoading(false)
    }

    getUser()
  }, [])

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })
      router.push("/")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleProviderMode = async () => {
    if (!user) return

    const newMode = !isProviderMode
    setIsProviderMode(newMode)

    try {
      // Only update if user has "both" role
      if (user.role === "both") {
        const { error } = await supabase
          .from("users")
          .update({ current_mode: newMode ? "provider" : "seeker" })
          .eq("id", user.id)

        if (error) throw error
      }

      toast({
        title: `Switched to ${newMode ? "Provider" : "Seeker"} mode`,
        description: `You are now in ${newMode ? "Provider" : "Seeker"} mode.`,
      })
    } catch (error) {
      console.error("Error toggling mode:", error)
      setIsProviderMode(!newMode) // Revert on error
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-200 ${
        isScrolled ? "bg-white shadow-md" : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="relative w-8 h-8">
            <Image src="/placeholder.svg?height=32&width=32" alt="SkillLink Logo" fill className="object-contain" />
          </div>
          <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            SkillLink
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-purple-600 ${
              pathname === "/" ? "text-purple-600" : "text-gray-600"
            }`}
          >
            Home
          </Link>
          <Link
            href="/explore"
            className={`text-sm font-medium transition-colors hover:text-purple-600 ${
              pathname === "/explore" ? "text-purple-600" : "text-gray-600"
            }`}
          >
            Explore
          </Link>
          <Link
            href="/how-it-works"
            className={`text-sm font-medium transition-colors hover:text-purple-600 ${
              pathname === "/how-it-works" ? "text-purple-600" : "text-gray-600"
            }`}
          >
            How It Works
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          {!isLoading && user ? (
            <>
              {user.role === "both" && (
                <div className="hidden md:flex items-center space-x-2 mr-2">
                  <Switch id="provider-mode" checked={isProviderMode} onCheckedChange={toggleProviderMode} />
                  <Label htmlFor="provider-mode" className="text-xs">
                    {isProviderMode ? "Provider Mode" : "Seeker Mode"}
                  </Label>
                </div>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.profile_image || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/dashboard")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Dashboard</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/dashboard?tab=bookings")}>
                    <Calendar className="mr-2 h-4 w-4" />
                    <span>Bookings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/messages")}>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    <span>Messages</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/dashboard?tab=profile")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Button
                variant="ghost"
                onClick={() => router.push("/login")}
                className="text-gray-700 hover:text-purple-600 hover:bg-purple-50"
              >
                Log In
              </Button>
              <Button
                onClick={() => router.push("/signup")}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                Sign Up
              </Button>
            </div>
          )}

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-6">
                  <Link href="/" className="flex items-center space-x-2">
                    <div className="relative w-8 h-8">
                      <Image
                        src="/placeholder.svg?height=32&width=32"
                        alt="SkillLink Logo"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                      SkillLink
                    </span>
                  </Link>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <X className="h-5 w-5" />
                      <span className="sr-only">Close menu</span>
                    </Button>
                  </SheetTrigger>
                </div>

                <div className="space-y-4 py-4">
                  <Link
                    href="/"
                    className={`block py-2 text-base font-medium transition-colors hover:text-purple-600 ${
                      pathname === "/" ? "text-purple-600" : "text-gray-600"
                    }`}
                  >
                    Home
                  </Link>
                  <Link
                    href="/explore"
                    className={`block py-2 text-base font-medium transition-colors hover:text-purple-600 ${
                      pathname === "/explore" ? "text-purple-600" : "text-gray-600"
                    }`}
                  >
                    Explore
                  </Link>
                  <Link
                    href="/how-it-works"
                    className={`block py-2 text-base font-medium transition-colors hover:text-purple-600 ${
                      pathname === "/how-it-works" ? "text-purple-600" : "text-gray-600"
                    }`}
                  >
                    How It Works
                  </Link>
                </div>

                {user && user.role === "both" && (
                  <div className="flex items-center space-x-2 py-4">
                    <Switch id="mobile-provider-mode" checked={isProviderMode} onCheckedChange={toggleProviderMode} />
                    <Label htmlFor="mobile-provider-mode">{isProviderMode ? "Provider Mode" : "Seeker Mode"}</Label>
                  </div>
                )}

                <div className="mt-auto pt-4">
                  {!isLoading && user ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.profile_image || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          onClick={() => router.push("/dashboard")}
                          className="w-full justify-start"
                        >
                          <User className="mr-2 h-4 w-4" />
                          Dashboard
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => router.push("/messages")}
                          className="w-full justify-start"
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Messages
                        </Button>
                      </div>
                      <Button
                        variant="default"
                        onClick={handleLogout}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" onClick={() => router.push("/login")} className="w-full">
                        Log In
                      </Button>
                      <Button
                        onClick={() => router.push("/signup")}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        Sign Up
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
