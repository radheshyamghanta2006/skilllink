"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
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
import { Menu, X, User, LogOut, Settings, MessageSquare, Calendar, ChevronDown } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProviderMode, setIsProviderMode] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Handle scroll effect for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Fetch user data
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

  // Handle user logout
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' })
      
      if (error) throw error
      
      setUser(null)
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      })
      
      router.push("/")
      router.refresh()
    } catch (error) {
      console.error("Logout error:", error)
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Toggle between provider/seeker mode
  const toggleProviderMode = async () => {
    if (!user) return

    const newMode = !isProviderMode
    setIsProviderMode(newMode)

    try {
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
      setIsProviderMode(!newMode)
    }
  }

  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <header
      className={`sticky top-0 z-50 w-full backdrop-blur-md transition-all duration-300 ${
        isScrolled 
          ? "bg-white/90 dark:bg-gray-900/90 shadow-md dark:shadow-gray-800/30" 
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 group">
          <motion.div 
            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
            className="relative w-8 h-8"
          >
            <Image src="/placeholder.svg?height=32&width=32" alt="SkillLink Logo" fill className="object-contain" />
          </motion.div>
          <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-700 group-hover:to-blue-700 dark:group-hover:from-purple-300 dark:group-hover:to-blue-300 transition-all duration-300">
            SkillLink
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors hover:text-purple-600 dark:hover:text-purple-400 relative group ${
              pathname === "/" ? "text-purple-600 dark:text-purple-400" : "text-gray-800 dark:text-gray-200"
            }`}
          >
            Home
            <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 dark:bg-purple-400 transition-all duration-300 group-hover:w-full ${pathname === "/" ? "w-full" : ""}`}></span>
          </Link>
          <Link
            href="/explore"
            className={`text-sm font-medium transition-colors hover:text-purple-600 dark:hover:text-purple-400 relative group ${
              pathname === "/explore" ? "text-purple-600 dark:text-purple-400" : "text-gray-800 dark:text-gray-200"
            }`}
          >
            Explore
            <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 dark:bg-purple-400 transition-all duration-300 group-hover:w-full ${pathname === "/explore" ? "w-full" : ""}`}></span>
          </Link>
          <Link
            href="/#how-it-works"
            className={`text-sm font-medium transition-colors hover:text-purple-600 dark:hover:text-purple-400 relative group ${
              pathname === "/how-it-works" ? "text-purple-600 dark:text-purple-400" : "text-gray-800 dark:text-gray-200"
            }`}
          >
            How It Works
            <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-600 dark:bg-purple-400 transition-all duration-300 group-hover:w-full ${pathname === "/how-it-works" ? "w-full" : ""}`}></span>
          </Link>
          <div className="ml-2">
            <ThemeToggle />
          </div>
        </nav>

        <div className="flex items-center space-x-4">
          {!isLoading && user ? (
            <>
              {/* Provider/Seeker Toggle for Users with both roles */}
              {user.role === "both" && (
                <div className="hidden md:flex items-center space-x-2 mr-2 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
                  <div className="flex items-center">
                    <Switch id="provider-mode" checked={isProviderMode} onCheckedChange={toggleProviderMode} />
                    <Label htmlFor="provider-mode" className="ml-2 text-xs text-gray-700 dark:text-gray-300">
                      {isProviderMode ? "Provider" : "Seeker"}
                    </Label>
                  </div>
                </div>
              )}

              {/* Theme toggle for desktop */}
              <div className="hidden md:block mr-2">
                <ThemeToggle />
              </div>

              {/* User dropdown menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-transparent focus:bg-transparent">
                    <Avatar className="h-8 w-8 ring-2 ring-purple-500/30 ring-offset-2 ring-offset-white dark:ring-offset-gray-900">
                      <AvatarImage src={user.profile_image || "/placeholder.svg"} alt={user.name} />
                      <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal border-b border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <div className="p-2">
                    <DropdownMenuItem onClick={() => router.push("/dashboard")} className="cursor-pointer flex items-center text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400">
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/dashboard?tab=bookings")} className="cursor-pointer flex items-center text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Bookings</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/messages")} className="cursor-pointer flex items-center text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <span>Messages</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push("/dashboard?tab=profile")} className="cursor-pointer flex items-center text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </div>
                  <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                  <div className="p-2">
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer flex items-center text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                onClick={() => router.push("/login")}
                className="text-gray-700 dark:text-gray-200 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Log In
              </Button>
              <Button
                onClick={() => router.push("/signup")}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 dark:from-purple-500 dark:to-blue-500 dark:hover:from-purple-600 dark:hover:to-blue-600 text-white shadow-md hover:shadow-lg transition-all"
              >
                Sign Up
              </Button>
            </div>
          )}

          {/* Mobile menu button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent className="w-[280px] sm:w-[350px] bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800" side="right">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                  <Link href="/" className="flex items-center space-x-2">
                    <div className="relative w-8 h-8">
                      <Image
                        src="/placeholder.svg?height=32&width=32"
                        alt="SkillLink Logo"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                      SkillLink
                    </span>
                  </Link>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <X className="h-5 w-5" />
                      <span className="sr-only">Close menu</span>
                    </Button>
                  </SheetTrigger>
                </div>

                <div className="space-y-6 py-4">
                  <Link
                    href="/"
                    className={`block py-2 text-base font-medium transition-colors hover:text-purple-600 dark:hover:text-purple-400 ${
                      pathname === "/" ? "text-purple-600 dark:text-purple-400" : "text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    Home
                  </Link>
                  <Link
                    href="/explore"
                    className={`block py-2 text-base font-medium transition-colors hover:text-purple-600 dark:hover:text-purple-400 ${
                      pathname === "/explore" ? "text-purple-600 dark:text-purple-400" : "text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    Explore
                  </Link>
                  <Link
                    href="/#how-it-works"
                    className={`block py-2 text-base font-medium transition-colors hover:text-purple-600 dark:hover:text-purple-400 ${
                      pathname === "/how-it-works" ? "text-purple-600 dark:text-purple-400" : "text-gray-700 dark:text-gray-200"
                    }`}
                  >
                    How It Works
                  </Link>
                  <div className="flex items-center space-x-2 py-2">
                    <span className="text-base font-medium text-gray-700 dark:text-gray-200">Theme</span>
                    <ThemeToggle />
                  </div>
                </div>

                {user && user.role === "both" && (
                  <div className="flex items-center space-x-2 py-4 border-t border-gray-100 dark:border-gray-800">
                    <Switch id="mobile-provider-mode" checked={isProviderMode} onCheckedChange={toggleProviderMode} />
                    <Label htmlFor="mobile-provider-mode" className="text-gray-700 dark:text-gray-200">
                      {isProviderMode ? "Provider Mode" : "Seeker Mode"}
                    </Label>
                  </div>
                )}

                <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800">
                  {!isLoading && user ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10 ring-2 ring-purple-500/30 dark:ring-purple-500/20 ring-offset-2 ring-offset-white dark:ring-offset-gray-900">
                          <AvatarImage src={user.profile_image || "/placeholder.svg"} alt={user.name} />
                          <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          variant="outline"
                          onClick={() => router.push("/dashboard")}
                          className="w-full justify-start text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <User className="mr-2 h-4 w-4" />
                          Dashboard
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => router.push("/messages")}
                          className="w-full justify-start text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          <MessageSquare className="mr-2 h-4 w-4" />
                          Messages
                        </Button>
                      </div>
                      <Button
                        variant="default"
                        onClick={handleLogout}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 dark:from-purple-500 dark:to-blue-500 dark:hover:from-purple-600 dark:hover:to-blue-600 text-white shadow-md hover:shadow-lg transition-all"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => router.push("/login")}
                        className="w-full text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        Log In
                      </Button>
                      <Button
                        onClick={() => router.push("/signup")}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 dark:from-purple-500 dark:to-blue-500 dark:hover:from-purple-600 dark:hover:to-blue-600 text-white shadow-md hover:shadow-lg transition-all"
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
