"use client"

import { useState, useEffect } from "react"
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

  useEffect(() => {
    fetchBookings()
  }, [user])

  const fetchBookings = async () => {
    if (!user) return

    setLoading(true)

    try {
      // In a real app, this would fetch from the database
      // For demo purposes, we'll create dummy data
      const dummyBookings = generateDummyBookings(user)
      setBookings(dummyBookings)
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

  const generateDummyBookings = (user: any) => {
    const now = new Date()
    const statuses = ["pending", "confirmed", "completed", "cancelled"]
    const paymentStatuses = ["pending", "paid", "refunded"]

    // Generate 10 random bookings
    return Array.from({ length: 10 }, (_, i) => {
      const date = new Date()
      date.setDate(now.getDate() + (i % 5 === 0 ? -5 : i))

      const status = statuses[Math.floor(Math.random() * statuses.length)]
      const paymentStatus = paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)]

      return {
        id: `booking-${i}`,
        date: date.toISOString().split("T")[0],
        start_time: `${10 + (i % 8)}:00:00`,
        end_time: `${11 + (i % 8)}:00:00`,
        status,
        payment_status: paymentStatus,
        payment_amount: Math.floor(Math.random() * 50) + 20,
        skill_name: ["Piano Lessons", "Yoga Class", "Web Development", "Cooking Class", "Language Exchange"][i % 5],
        location: "Online",
        notes: "Looking forward to our session!",
        provider: {
          id: `provider-${i}`,
          name: ["Alex Johnson", "Maria Garcia", "David Kim", "Sarah Patel", "James Wilson"][i % 5],
          profile_image: "/placeholder.svg?height=40&width=40",
        },
        seeker: {
          id: `seeker-${i}`,
          name: ["John Doe", "Jane Smith", "Robert Brown", "Emily Davis", "Michael Lee"][i % 5],
          profile_image: "/placeholder.svg?height=40&width=40",
        },
        has_review: status === "completed" && Math.random() > 0.5,
      }
    })
  }

  const handleUpdateStatus = async (bookingId: string, newStatus: string) => {
    try {
      // In a real app, this would update the database
      setBookings(bookings.map((booking) => (booking.id === bookingId ? { ...booking, status: newStatus } : booking)))

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
      // In a real app, this would update the database
      setBookings(
        bookings.map((booking) => (booking.id === bookingId ? { ...booking, payment_status: newStatus } : booking)),
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
      // In a real app, this would create a review in the database
      setBookings(bookings.map((booking) => (booking.id === bookingId ? { ...booking, has_review: true } : booking)))

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
                                user.role === "provider" ? booking.seeker.profile_image : booking.provider.profile_image
                              }
                              alt={user.role === "provider" ? booking.seeker.name : booking.provider.name}
                            />
                            <AvatarFallback>
                              {getInitials(user.role === "provider" ? booking.seeker.name : booking.provider.name)}
                            </AvatarFallback>
                          </Avatar>

                          <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h3 className="font-semibold">
                                {user.role === "provider" ? booking.seeker.name : booking.provider.name}
                              </h3>
                              <span className="text-gray-500">•</span>
                              <span className="text-sm text-gray-600">{booking.skill_name}</span>
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
                                {booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)}
                              </div>
                              <div className="flex items-center">
                                <MapPin className="h-4 w-4 mr-1" />
                                {booking.location}
                              </div>
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />${booking.payment_amount}
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
                          {booking.status === "pending" && user.role === "provider" && (
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
                            user.role === "provider" && (
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
