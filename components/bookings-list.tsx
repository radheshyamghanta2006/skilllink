"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation" // Added router import
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { Calendar, Clock, MapPin, DollarSign, MessageSquare, Star } from "lucide-react"
import { ReviewModal } from "@/components/review-modal"

type BookingsListProps = {
  user: any
}

export function BookingsList({ user }: BookingsListProps) {
  const [bookings, setBookings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("upcoming")
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<any>(null)
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const router = useRouter() // Initialize router

  useEffect(() => {
    fetchBookings()
  }, [user])

  const fetchBookings = async () => {
    if (!user) return

    setLoading(true)

    try {
      console.log("Fetching bookings for user:", user.id, "with role:", user.role)
      
      // Determine which bookings to fetch based on user role
      let query = supabase
        .from('bookings')
        .select(`
          *,
          provider:provider_id(id, name, profile_image),
          seeker:seeker_id(id, name, profile_image)
        `)
      
      // Filter based on user role
      if (user.role === 'provider' || user.current_mode === 'provider') {
        query = query.eq('provider_id', user.id)
      } else if (user.role === 'seeker' || user.current_mode === 'seeker') {
        query = query.eq('seeker_id', user.id)
      } else {
        // For 'both' role or any other case, get all bookings where user is either provider or seeker
        query = query.or(`provider_id.eq.${user.id},seeker_id.eq.${user.id}`)
      }
      
      // Execute the query
      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      
      console.log("Bookings fetched:", data?.length || 0, "bookings")
      
      // Check if the booking has reviews
      const enhancedBookings = await Promise.all((data || []).map(async (booking) => {
        const { data: reviewData } = await supabase
          .from('reviews')
          .select('*')
          .eq('booking_id', booking.id)
          .limit(1)
        
        return {
          ...booking,
          has_review: reviewData && reviewData.length > 0
        }
      }))
      
      setBookings(enhancedBookings)
    } catch (error) {
      console.error("Error fetching bookings:", error)
      toast({
        title: "Error",
        description: "Failed to load bookings.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId)
      
      if (error) throw error
      
      // Update the local state
      setBookings(bookings.map((booking) => 
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      ))

      toast({
        title: "Status updated",
        description: `Booking status changed to ${newStatus}.`,
      })
    } catch (error) {
      console.error("Error updating booking status:", error)
      toast({
        title: "Error",
        description: "Failed to update booking status.",
        variant: "destructive",
      })
    }
  }

  const handleUpdatePayment = async (bookingId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ payment_status: newStatus })
        .eq('id', bookingId)
      
      if (error) throw error
      
      // Update the local state
      setBookings(
        bookings.map((booking) => 
          booking.id === bookingId ? { ...booking, payment_status: newStatus } : booking
        ),
      )

      toast({
        title: "Payment updated",
        description: `Payment status changed to ${newStatus}.`,
      })
    } catch (error) {
      console.error("Error updating payment status:", error)
      toast({
        title: "Error",
        description: "Failed to update payment status.",
        variant: "destructive",
      })
    }
  }

  const openReviewModal = (booking: any) => {
    setSelectedBooking(booking)
    setIsReviewModalOpen(true)
  }

  const handleReviewSubmit = async (bookingId: string, rating: number, comment: string) => {
    try {
      // Create the review in the database
      const { error } = await supabase.from('reviews').insert([{
        booking_id: bookingId,
        rating: rating,
        comment: comment,
        reviewer_id: user.id,
        reviewee_id: user.role === 'provider' ? 
          bookings.find(b => b.id === bookingId)?.seeker_id : 
          bookings.find(b => b.id === bookingId)?.provider_id,
        provider_id: bookings.find(b => b.id === bookingId)?.provider_id,
        seeker_id: bookings.find(b => b.id === bookingId)?.seeker_id
      }])
      
      if (error) throw error
      
      // Update the local state
      setBookings(bookings.map((booking) => 
        booking.id === bookingId ? { ...booking, has_review: true } : booking
      ))

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      })

      setIsReviewModalOpen(false)
    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        title: "Error",
        description: "Failed to submit review.",
        variant: "destructive",
      })
    }
  }

  // Handle message button click - navigate to messages with the correct user ID
  const handleMessageClick = (booking: any) => {
    // Determine which user ID to chat with based on the current user's role
    const chatUserId = user.id === booking.provider_id ? booking.seeker_id : booking.provider_id
    
    // Navigate to the messages page with the user ID as a query parameter
    router.push(`/messages?user=${chatUserId}`)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="border-yellow-300 text-yellow-700">
            Payment Pending
          </Badge>
        )
      case "paid":
        return (
          <Badge variant="outline" className="border-green-300 text-green-700">
            Paid
          </Badge>
        )
      case "refunded":
        return (
          <Badge variant="outline" className="border-red-300 text-red-700">
            Refunded
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getInitials = (name: string) => {
    if (!name) return ""
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const filteredBookings = bookings.filter((booking) => {
    const bookingDate = new Date(booking.date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (activeTab === "upcoming") {
      return bookingDate >= today && (booking.status === "pending" || booking.status === "confirmed")
    } else if (activeTab === "past") {
      return bookingDate < today || booking.status === "completed" || booking.status === "cancelled"
    } else if (activeTab === "all") {
      return true
    }
    return false
  })

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Bookings</h2>
        <Button
          onClick={fetchBookings}
          variant="outline"
          size="sm"
          className="text-purple-600 border-purple-200 hover:bg-purple-50"
        >
          Refresh
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
            </div>
          ) : filteredBookings.length > 0 ? (
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
              {filteredBookings.map((booking) => (
                <motion.div key={booking.id} variants={itemVariants}>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage
                              src={
                                user.id === booking.provider_id ? booking.seeker.profile_image : booking.provider.profile_image
                              }
                              alt={user.id === booking.provider_id ? booking.seeker.name : booking.provider.name}
                            />
                            <AvatarFallback>
                              {getInitials(user.id === booking.provider_id ? booking.seeker.name : booking.provider.name)}
                            </AvatarFallback>
                          </Avatar>

                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="font-semibold">
                                {user.id === booking.provider_id ? booking.seeker.name : booking.provider.name}
                              </h3>
                              <span className="text-gray-500">•</span>
                              <span className="text-sm text-gray-600">{booking.service_name}</span>
                            </div>

                            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-600">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {new Date(booking.date).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </div>
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                {booking.start_time?.substring(0, 5)} - {booking.end_time?.substring(0, 5)}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {booking.location || "Online"}
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />${booking.payment_amount || 0}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {getStatusBadge(booking.status)}
                          {getPaymentBadge(booking.payment_status)}
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t flex flex-wrap justify-between items-center gap-2">
                        <div className="flex flex-wrap gap-2">
                          {booking.status === "pending" && user.id === booking.provider_id && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(booking.id, "confirmed")}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                Accept
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(booking.id, "cancelled")}
                                className="border-red-300 text-red-700 hover:bg-red-50"
                              >
                                Decline
                              </Button>
                            </>
                          )}

                          {booking.status === "confirmed" && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(booking.id, "completed")}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                Mark Completed
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(booking.id, "cancelled")}
                                className="border-red-300 text-red-700 hover:bg-red-50"
                              >
                                Cancel
                              </Button>
                            </>
                          )}

                          {booking.status === "confirmed" &&
                            booking.payment_status === "pending" &&
                            user.id === booking.provider_id && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdatePayment(booking.id, "paid")}
                                className="border-green-300 text-green-700 hover:bg-green-50"
                              >
                                <DollarSign className="mr-1 h-4 w-4" />
                                Mark as Paid
                              </Button>
                            )}

                          {booking.status === "completed" && !booking.has_review && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openReviewModal(booking)}
                              className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                            >
                              <Star className="mr-1 h-4 w-4" />
                              Leave Review
                            </Button>
                          )}
                        </div>

                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                          onClick={() => handleMessageClick(booking)}
                        >
                          <MessageSquare className="mr-1 h-4 w-4" />
                          Message
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <h3 className="text-xl font-medium mb-2">No bookings found</h3>
              <p className="text-gray-500 mb-6">
                {activeTab === "upcoming"
                  ? "You don't have any upcoming bookings."
                  : activeTab === "past"
                    ? "You don't have any past bookings."
                    : "You don't have any bookings yet."}
              </p>
              {user.role !== "seeker" && (
                <Button
                  variant="outline"
                  className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  onClick={() => setActiveTab("all")}
                >
                  View All Bookings
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {isReviewModalOpen && selectedBooking && (
        <ReviewModal
          booking={selectedBooking}
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  )
}
