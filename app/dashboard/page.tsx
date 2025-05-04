"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { BookingsList } from "@/components/bookings-list"
import { AvailabilityCalendar } from "@/components/availability-calendar"
import { ProfileSection } from "@/components/profile-section"
import { SkillsSection } from "@/components/skills-section"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("bookings")
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Function to fetch user data
  const fetchUserData = useCallback(async () => {
    try {
      // First check if we have a valid session
      const {
        data: { session },
        error: sessionError
      } = await supabase.auth.getSession()

      // If there's a session error or no session, redirect to login
      if (sessionError || !session) {
        console.log("No valid session found, redirecting to login")
        router.push("/login")
        return
      }

      // Get user data from the database
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", session.user.id)
        .single()

      if (error) {
        console.error("Error fetching user data:", error)
        throw error
      }

      // Update user state with the retrieved data
      setUser(data)
    } catch (error: any) {
      console.error("Dashboard error:", error)
      toast({
        title: "Error",
        description: "Failed to load user profile.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [supabase, router, toast])

  // Load user data on initial page load
  useEffect(() => {
    fetchUserData()
  }, [fetchUserData])

  // Function to handle profile updates
  const handleProfileUpdate = useCallback(() => {
    console.log("Dashboard: handleProfileUpdate called - refreshing user data");
    fetchUserData();
  }, [fetchUserData]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <DashboardSidebar user={user} activeTab={activeTab} setActiveTab={setActiveTab} />

          <div className="lg:col-span-3">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 mb-8">
                  <TabsTrigger value="bookings">Bookings</TabsTrigger>
                  <TabsTrigger value="availability">Availability</TabsTrigger>
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="skills">Skills</TabsTrigger>
                </TabsList>

                <TabsContent value="bookings">
                  <BookingsList user={user} />
                </TabsContent>

                <TabsContent value="availability">
                  <AvailabilityCalendar user={user} />
                </TabsContent>

                <TabsContent value="profile">
                  <ProfileSection user={user} onProfileUpdate={handleProfileUpdate} />
                </TabsContent>

                <TabsContent value="skills">
                  <SkillsSection user={user} />
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
