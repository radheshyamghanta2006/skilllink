"use client"

import { User, Calendar, Clock, Settings, MessageSquare, Star, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

type DashboardSidebarProps = {
  user: any
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function DashboardSidebar({ user, activeTab, setActiveTab }: DashboardSidebarProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="lg:col-span-1">
      <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
        <div className="flex flex-col items-center mb-6">
          <Avatar className="h-20 w-20 mb-4">
            <AvatarImage src={user?.profile_image || "/placeholder.svg"} alt={user?.name} />
            <AvatarFallback>{user?.name ? getInitials(user.name) : "U"}</AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-bold">{user?.name}</h2>
          <p className="text-sm text-gray-500">{user?.email}</p>

          <div className="flex mt-2 space-x-2">
            {user?.role === "provider" && (
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Provider</Badge>
            )}
            {user?.role === "seeker" && (
              <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Seeker</Badge>
            )}
            {user?.role === "both" && (
              <Badge className="bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 hover:from-purple-200 hover:to-blue-200">
                Provider & Seeker
              </Badge>
            )}
          </div>
        </div>

        <nav className="space-y-2">
          <Button
            variant={activeTab === "bookings" ? "default" : "ghost"}
            className={`w-full justify-start ${
              activeTab === "bookings" ? "bg-gradient-to-r from-purple-600 to-blue-600" : ""
            }`}
            onClick={() => setActiveTab("bookings")}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Bookings
          </Button>

          <Button
            variant={activeTab === "availability" ? "default" : "ghost"}
            className={`w-full justify-start ${
              activeTab === "availability" ? "bg-gradient-to-r from-purple-600 to-blue-600" : ""
            }`}
            onClick={() => setActiveTab("availability")}
          >
            <Clock className="mr-2 h-4 w-4" />
            Availability
          </Button>

          <Button
            variant={activeTab === "profile" ? "default" : "ghost"}
            className={`w-full justify-start ${
              activeTab === "profile" ? "bg-gradient-to-r from-purple-600 to-blue-600" : ""
            }`}
            onClick={() => setActiveTab("profile")}
          >
            <User className="mr-2 h-4 w-4" />
            Profile
          </Button>

          <Button
            variant={activeTab === "skills" ? "default" : "ghost"}
            className={`w-full justify-start ${
              activeTab === "skills" ? "bg-gradient-to-r from-purple-600 to-blue-600" : ""
            }`}
            onClick={() => setActiveTab("skills")}
          >
            <Star className="mr-2 h-4 w-4" />
            Skills
          </Button>
        </nav>

        <div className="mt-8 pt-6 border-t">
          <h3 className="font-medium mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start">
              <MessageSquare className="mr-2 h-4 w-4" />
              Messages
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <RefreshCw className="mr-2 h-4 w-4" />
              Skill Swaps
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
