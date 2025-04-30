"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, Search, User, Calendar, Star } from "lucide-react"

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("flags")
  const [flags, setFlags] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [bookings, setBookings] = useState<any[]>([])
  const [reviews, setReviews] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/login")
        return
      }

      try {
        const { data, error } = await supabase.from("users").select("*").eq("id", session.user.id).single()

        if (error) throw error

        if (data.role !== "admin") {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access the admin panel.",
            variant: "destructive",
          })
          router.push("/")
          return
        }

        setUser(data)
        fetchFlags()
        fetchUsers()
        fetchBookings()
        fetchReviews()
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load user profile.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [])

  const fetchFlags = async () => {
    try {
      // In a real app, this would fetch from the database
      // For demo purposes, we'll use dummy data
      setFlags([
        {
          id: "flag-1",
          type: "user",
          item_id: "user-1",
          reason: "Inappropriate profile content",
          status: "pending",
          created_at: new Date().toISOString(),
          user: { name: "John Smith", email: "john@example.com" },
        },
        {
          id: "flag-2",
          type: "review",
          item_id: "review-1",
          reason: "Offensive language in review",
          status: "resolved",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          user: { name: "Alice Johnson", email: "alice@example.com" },
        },
        {
          id: "flag-3",
          type: "booking",
          item_id: "booking-1",
          reason: "Suspected scam activity",
          status: "pending",
          created_at: new Date(Date.now() - 172800000).toISOString(),
          user: { name: "Bob Williams", email: "bob@example.com" },
        },
      ])
    } catch (error) {
      console.error("Error fetching flags:", error)
    }
  }

  const fetchUsers = async () => {
    try {
      // In a real app, this would fetch from the database
      // For demo purposes, we'll use dummy data
      setUsers([
        {
          id: "user-1",
          name: "John Smith",
          email: "john@example.com",
          role: "provider",
          created_at: new Date().toISOString(),
          status: "active",
        },
        {
          id: "user-2",
          name: "Alice Johnson",
          email: "alice@example.com",
          role: "seeker",
          created_at: new Date(Date.now() - 86400000).toISOString(),
          status: "active",
        },
        {
          id: "user-3",
          name: "Bob Williams",
          email: "bob@example.com",
          role: "both",
          created_at: new Date(Date.now() - 172800000).toISOString(),
          status: "suspended",
        },
      ])
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const fetchBookings = async () => {
    try {
      // In a real app, this would fetch from the database
      // For demo purposes, we'll use dummy data
      setBookings([
        {
          id: "booking-1",
          seeker: { name: "Alice Johnson", email: "alice@example.com" },
          provider: { name: "John Smith", email: "john@example.com" },
          service_name: "Web Development",
          date: new Date().toISOString(),
          status: "pending",
          payment_status: "pending",
        },
        {
          id: "booking-2",
          seeker: { name: "Bob Williams", email: "bob@example.com" },
          provider: { name: "John Smith", email: "john@example.com" },
          service_name: "UI/UX Design",
          date: new Date(Date.now() - 86400000).toISOString(),
          status: "confirmed",
          payment_status: "paid",
        },
        {
          id: "booking-3",
          seeker: { name: "Alice Johnson", email: "alice@example.com" },
          provider: { name: "Bob Williams", email: "bob@example.com" },
          service_name: "Yoga Session",
          date: new Date(Date.now() - 172800000).toISOString(),
          status: "completed",
          payment_status: "paid",
        },
      ])
    } catch (error) {
      console.error("Error fetching bookings:", error)
    }
  }

  const fetchReviews = async () => {
    try {
      // In a real app, this would fetch from the database
      // For demo purposes, we'll use dummy data
      setReviews([
        {
          id: "review-1",
          reviewer: { name: "Alice Johnson", email: "alice@example.com" },
          reviewee: { name: "John Smith", email: "john@example.com" },
          booking_id: "booking-3",
          rating: 5,
          comment: "Excellent service! John was very professional and knowledgeable.",
          created_at: new Date().toISOString(),
        },
        {
          id: "review-2",
          reviewer: { name: "Bob Williams", email: "bob@example.com" },
          reviewee: { name: "John Smith", email: "john@example.com" },
          booking_id: "booking-2",
          rating: 4,
          comment: "Great design work, just what I needed for my project.",
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "review-3",
          reviewer: { name: "John Smith", email: "john@example.com" },
          reviewee: { name: "Alice Johnson", email: "alice@example.com" },
          booking_id: "booking-3",
          rating: 5,
          comment: "Alice was a pleasure to work with. Very responsive and clear about her requirements.",
          created_at: new Date(Date.now() - 172800000).toISOString(),
        },
      ])
    } catch (error) {
      console.error("Error fetching reviews:", error)
    }
  }

  const handleResolveFlag = async (flagId: string) => {
    try {
      // In a real app, this would update the database
      setFlags(flags.map((flag) => (flag.id === flagId ? { ...flag, status: "resolved" } : flag)))

      toast({
        title: "Flag resolved",
        description: "The flag has been marked as resolved.",
      })
    } catch (error) {
      console.error("Error resolving flag:", error)
      toast({
        title: "Error",
        description: "Failed to resolve flag.",
        variant: "destructive",
      })
    }
  }

  const handleDismissFlag = async (flagId: string) => {
    try {
      // In a real app, this would update the database
      setFlags(flags.map((flag) => (flag.id === flagId ? { ...flag, status: "dismissed" } : flag)))

      toast({
        title: "Flag dismissed",
        description: "The flag has been dismissed.",
      })
    } catch (error) {
      console.error("Error dismissing flag:", error)
      toast({
        title: "Error",
        description: "Failed to dismiss flag.",
        variant: "destructive",
      })
    }
  }

  const handleSuspendUser = async (userId: string) => {
    try {
      // In a real app, this would update the database
      setUsers(users.map((user) => (user.id === userId ? { ...user, status: "suspended" } : user)))

      toast({
        title: "User suspended",
        description: "The user has been suspended.",
      })
    } catch (error) {
      console.error("Error suspending user:", error)
      toast({
        title: "Error",
        description: "Failed to suspend user.",
        variant: "destructive",
      })
    }
  }

  const handleActivateUser = async (userId: string) => {
    try {
      // In a real app, this would update the database
      setUsers(users.map((user) => (user.id === userId ? { ...user, status: "active" } : user)))

      toast({
        title: "User activated",
        description: "The user has been activated.",
      })
    } catch (error) {
      console.error("Error activating user:", error)
      toast({
        title: "Error",
        description: "Failed to activate user.",
        variant: "destructive",
      })
    }
  }

  const filteredFlags = flags.filter((flag) => {
    if (filterStatus !== "all" && flag.status !== filterStatus) return false

    const searchFields = [flag.user?.name, flag.user?.email, flag.reason, flag.type]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    return searchTerm === "" || searchFields.includes(searchTerm.toLowerCase())
  })

  const filteredUsers = users.filter((user) => {
    if (filterStatus !== "all" && user.status !== filterStatus) return false

    const searchFields = [user.name, user.email, user.role].filter(Boolean).join(" ").toLowerCase()

    return searchTerm === "" || searchFields.includes(searchTerm.toLowerCase())
  })

  const filteredBookings = bookings.filter((booking) => {
    if (filterStatus !== "all" && booking.status !== filterStatus) return false

    const searchFields = [
      booking.seeker?.name,
      booking.provider?.name,
      booking.service_name,
      booking.status,
      booking.payment_status,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    return searchTerm === "" || searchFields.includes(searchTerm.toLowerCase())
  })

  const filteredReviews = reviews.filter((review) => {
    const searchFields = [review.reviewer?.name, review.reviewee?.name, review.comment]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()

    return searchTerm === "" || searchFields.includes(searchTerm.toLowerCase())
  })

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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-purple-100 text-purple-800">
              Admin
            </Badge>
            <span className="text-sm text-gray-500">{user?.email}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">+2 from last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{bookings.filter((b) => b.status === "confirmed").length}</div>
              <p className="text-xs text-muted-foreground">+1 from yesterday</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Flags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{flags.filter((f) => f.status === "pending").length}</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.7</div>
              <p className="text-xs text-muted-foreground">From {reviews.length} reviews</p>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-48">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="flags">Flags</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="flags">
            <Card>
              <CardHeader>
                <CardTitle>Reported Items</CardTitle>
                <CardDescription>Manage flagged content and user reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredFlags.length > 0 ? (
                    filteredFlags.map((flag) => (
                      <Card key={flag.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex flex-col md:flex-row">
                            <div
                              className={`p-4 md:w-2 ${
                                flag.status === "pending"
                                  ? "bg-yellow-500"
                                  : flag.status === "resolved"
                                    ? "bg-green-500"
                                    : "bg-gray-500"
                              }`}
                            ></div>
                            <div className="p-4 flex-grow">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                                <div>
                                  <Badge
                                    className={`mb-2 md:mb-0 ${
                                      flag.type === "user"
                                        ? "bg-blue-100 text-blue-800"
                                        : flag.type === "review"
                                          ? "bg-purple-100 text-purple-800"
                                          : "bg-orange-100 text-orange-800"
                                    }`}
                                  >
                                    {flag.type.charAt(0).toUpperCase() + flag.type.slice(1)}
                                  </Badge>
                                  <span className="text-sm text-gray-500 ml-2">
                                    {new Date(flag.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                <Badge
                                  variant="outline"
                                  className={`${
                                    flag.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : flag.status === "resolved"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {flag.status.charAt(0).toUpperCase() + flag.status.slice(1)}
                                </Badge>
                              </div>
                              <h3 className="font-medium">{flag.reason}</h3>
                              <p className="text-sm text-gray-500 mt-1">
                                Reported by: {flag.user.name} ({flag.user.email})
                              </p>
                              {flag.status === "pending" && (
                                <div className="flex space-x-2 mt-4">
                                  <Button
                                    size="sm"
                                    onClick={() => handleResolveFlag(flag.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="mr-1 h-4 w-4" />
                                    Resolve
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={() => handleDismissFlag(flag.id)}>
                                    Dismiss
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">No flags found matching your criteria</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage user accounts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <Card key={user.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex flex-col md:flex-row">
                            <div
                              className={`p-4 md:w-2 ${user.status === "active" ? "bg-green-500" : "bg-red-500"}`}
                            ></div>
                            <div className="p-4 flex-grow">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                                <div className="flex items-center">
                                  <User className="h-5 w-5 mr-2 text-gray-500" />
                                  <div>
                                    <h3 className="font-medium">{user.name}</h3>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                  </div>
                                </div>
                                <div className="mt-2 md:mt-0">
                                  <Badge
                                    className={`mr-2 ${
                                      user.role === "provider"
                                        ? "bg-blue-100 text-blue-800"
                                        : user.role === "seeker"
                                          ? "bg-purple-100 text-purple-800"
                                          : "bg-green-100 text-green-800"
                                    }`}
                                  >
                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={`${
                                      user.status === "active"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                Joined: {new Date(user.created_at).toLocaleDateString()}
                              </p>
                              <div className="flex space-x-2 mt-4">
                                {user.status === "active" ? (
                                  <Button size="sm" variant="destructive" onClick={() => handleSuspendUser(user.id)}>
                                    Suspend User
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => handleActivateUser(user.id)}
                                  >
                                    Activate User
                                  </Button>
                                )}
                                <Button size="sm" variant="outline">
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">No users found matching your criteria</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Booking Management</CardTitle>
                <CardDescription>View and manage all bookings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                      <Card key={booking.id} className="overflow-hidden">
                        <CardContent className="p-0">
                          <div className="flex flex-col md:flex-row">
                            <div
                              className={`p-4 md:w-2 ${
                                booking.status === "pending"
                                  ? "bg-yellow-500"
                                  : booking.status === "confirmed"
                                    ? "bg-blue-500"
                                    : booking.status === "completed"
                                      ? "bg-green-500"
                                      : "bg-red-500"
                              }`}
                            ></div>
                            <div className="p-4 flex-grow">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                                <div>
                                  <h3 className="font-medium">{booking.service_name}</h3>
                                  <div className="flex items-center text-sm text-gray-500 mt-1">
                                    <Calendar className="h-4 w-4 mr-1" />
                                    {new Date(booking.date).toLocaleDateString()}
                                  </div>
                                </div>
                                <div className="mt-2 md:mt-0 space-x-2">
                                  <Badge
                                    className={`${
                                      booking.status === "pending"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : booking.status === "confirmed"
                                          ? "bg-blue-100 text-blue-800"
                                          : booking.status === "completed"
                                            ? "bg-green-100 text-green-800"
                                            : "bg-red-100 text-red-800"
                                    }`}
                                  >
                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                  </Badge>
                                  <Badge
                                    variant="outline"
                                    className={`${
                                      booking.payment_status === "paid"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-yellow-100 text-yellow-800"
                                    }`}
                                  >
                                    {booking.payment_status.charAt(0).toUpperCase() + booking.payment_status.slice(1)}
                                  </Badge>
                                </div>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                                <div>
                                  <p className="text-xs font-medium text-gray-500">Provider</p>
                                  <p className="text-sm">{booking.provider.name}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-medium text-gray-500">Seeker</p>
                                  <p className="text-sm">{booking.seeker.name}</p>
                                </div>
                              </div>
                              <div className="flex space-x-2 mt-4">
                                <Button size="sm" variant="outline">
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">No bookings found matching your criteria</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Review Management</CardTitle>
                <CardDescription>Monitor and moderate user reviews</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredReviews.length > 0 ? (
                    filteredReviews.map((review) => (
                      <Card key={review.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2">
                            <div>
                              <div className="flex items-center">
                                <div className="flex mr-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-4 w-4 ${
                                        star <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="mt-2">{review.comment}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 text-sm">
                            <div>
                              <p className="font-medium text-gray-500">Reviewer</p>
                              <p>{review.reviewer.name}</p>
                            </div>
                            <div>
                              <p className="font-medium text-gray-500">Reviewee</p>
                              <p>{review.reviewee.name}</p>
                            </div>
                          </div>
                          <div className="flex space-x-2 mt-4">
                            <Button size="sm" variant="outline">
                              View Booking
                            </Button>
                            <Button size="sm" variant="destructive">
                              Flag Review
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">No reviews found matching your criteria</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}
