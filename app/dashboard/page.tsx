"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { BookingsList } from "@/components/bookings-list"
import { AvailabilityCalendar } from "@/components/availability-calendar"
import { ProfileSection } from "@/components/profile-section"
import { SkillsSection } from "@/components/skills-section"
import { NotificationsList } from "@/components/notifications-list"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const tabParam = searchParams.get('tab')
  const validTabs = ['bookings', 'availability', 'profile', 'skills', 'notifications']
  
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState(validTabs.includes(tabParam as string) ? tabParam as string : "bookings")
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const bookingsListRef = useRef<any>(null);

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
  
  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    router.push(`/dashboard?tab=${value}`, { scroll: false })
  }

  // Function to handle profile updates
  const handleProfileUpdate = useCallback(() => {
    console.log("Dashboard: handleProfileUpdate called - refreshing user data");
    fetchUserData();
  }, [fetchUserData]);

  const fetchBookings = () => {
    // Trigger refresh in BookingsList component if it exists
    if (bookingsListRef.current?.fetchBookings) {
      bookingsListRef.current.fetchBookings();
    }
  }

  useEffect(() => {
    if (!user) return

    // Subscribe to notifications
    const notificationsChannel = supabase
      .channel('notifications_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          // Add new notification to state
          setNotifications(prev => [payload.new, ...prev])
          // Increment unread count
          setUnreadCount(prev => prev + 1)
          
          // Show toast notification
          toast({
            title: payload.new.title,
            description: payload.new.message,
          })

          // If the notification is about a booking, refresh the bookings list
          if (payload.new.data?.booking_id) {
            // Trigger bookings refresh in BookingsList component
            if (activeTab === "bookings") {
              fetchBookings()
            }
          }
        }
      )
      .subscribe()

    // Fetch existing notifications
    const fetchNotifications = async () => {
      const { data: notifs, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (!error && notifs) {
        setNotifications(notifs)
        setUnreadCount(notifs.filter(n => !n.is_read).length)
      }
    }

    fetchNotifications()

    // Cleanup subscription
    return () => {
      supabase.removeChannel(notificationsChannel)
    }
  }, [user])

  const markNotificationAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)

    if (!error) {
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 dark:border-purple-500"></div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 transition-colors duration-300">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <DashboardSidebar 
            user={user} 
            activeTab={activeTab} 
            setActiveTab={handleTabChange} 
            unreadCount={unreadCount} 
          />

          <div className="lg:col-span-3">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsList className="grid grid-cols-5 mb-8 bg-muted/50 dark:bg-gray-800/50">
                  <TabsTrigger value="bookings" className="data-[state=active]:bg-background dark:data-[state=active]:bg-gray-700 dark:text-gray-200 dark:data-[state=active]:text-white">Bookings</TabsTrigger>
                  <TabsTrigger value="availability" className="data-[state=active]:bg-background dark:data-[state=active]:bg-gray-700 dark:text-gray-200 dark:data-[state=active]:text-white">Availability</TabsTrigger>
                  <TabsTrigger value="profile" className="data-[state=active]:bg-background dark:data-[state=active]:bg-gray-700 dark:text-gray-200 dark:data-[state=active]:text-white">Profile</TabsTrigger>
                  <TabsTrigger value="skills" className="data-[state=active]:bg-background dark:data-[state=active]:bg-gray-700 dark:text-gray-200 dark:data-[state=active]:text-white">Skills</TabsTrigger>
                  <TabsTrigger value="notifications" className="data-[state=active]:bg-background dark:data-[state=active]:bg-gray-700 dark:text-gray-200 dark:data-[state=active]:text-white">
                    Notifications
                    {unreadCount > 0 && (
                      <Badge 
                        variant="secondary" 
                        className="ml-2 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="bookings">
                  <BookingsList ref={bookingsListRef} user={user} />
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

                <TabsContent value="notifications">
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Notifications</h2>
                      {unreadCount > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            // Mark all as read
                            const { error } = await supabase
                              .from('notifications')
                              .update({ is_read: true })
                              .eq('user_id', user.id)
                              .eq('is_read', false)

                            if (!error) {
                              setNotifications(notifications.map(n => ({ ...n, is_read: true })))
                              setUnreadCount(0)
                              toast({
                                title: "Success",
                                description: "All notifications marked as read",
                              })
                            }
                          }}
                          className="text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        >
                          Mark all as read
                        </Button>
                      )}
                    </div>
                    <NotificationsList 
                      notifications={notifications} 
                      onMarkAsRead={markNotificationAsRead} 
                    />
                  </div>
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
