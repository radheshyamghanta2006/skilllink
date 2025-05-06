"use client"

import { User, Calendar, Clock, Settings, MessageSquare, Star, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

type DashboardSidebarProps = {
  user: any
  activeTab: string
  setActiveTab: (tab: string) => void
  unreadCount?: number
}

export function DashboardSidebar({ user, activeTab, setActiveTab, unreadCount = 0 }: DashboardSidebarProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }
  const router = useRouter()

  return (
    <div className="lg:col-span-1">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md sticky top-24 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <div className="flex flex-col items-center mb-6">
          <Avatar className="h-20 w-20 mb-4 border-2 border-gray-100 dark:border-gray-700">
            <AvatarImage src={user?.profile_image || "/placeholder.svg"} alt={user?.name} />
            <AvatarFallback className="bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300">{user?.name ? getInitials(user.name) : "U"}</AvatarFallback>
          </Avatar>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{user?.name}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>

          <div className="flex mt-2 space-x-2">
            {user?.role === "provider" && (
              <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50">Provider</Badge>
            )}
            {user?.role === "seeker" && (
              <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-900/50">Seeker</Badge>
            )}
            {user?.role === "both" && (
              <Badge className="bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 text-purple-800 dark:text-purple-300 hover:from-purple-200 hover:to-blue-200 dark:hover:from-purple-900/50 dark:hover:to-blue-900/50">
                Provider & Seeker
              </Badge>
            )}
          </div>
        </div>

        <nav className="space-y-2">
          <Button
            variant={activeTab === "bookings" ? "default" : "ghost"}
            className={`w-full justify-start ${
              activeTab === "bookings" ? "bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-500 dark:to-blue-500" : "dark:text-gray-300 dark:hover:bg-gray-700/50"
            }`}
            onClick={() => setActiveTab("bookings")}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Bookings
            {unreadCount > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-auto bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>

          <Button
            variant={activeTab === "availability" ? "default" : "ghost"}
            className={`w-full justify-start ${
              activeTab === "availability" ? "bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-500 dark:to-blue-500" : "dark:text-gray-300 dark:hover:bg-gray-700/50"
            }`}
            onClick={() => setActiveTab("availability")}
          >
            <Clock className="mr-2 h-4 w-4" />
            Availability
          </Button>

          <Button
            variant={activeTab === "profile" ? "default" : "ghost"}
            className={`w-full justify-start ${
              activeTab === "profile" ? "bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-500 dark:to-blue-500" : "dark:text-gray-300 dark:hover:bg-gray-700/50"
            }`}
            onClick={() => setActiveTab("profile")}
          >
            <User className="mr-2 h-4 w-4" />
            Profile
          </Button>

          <Button
            variant={activeTab === "skills" ? "default" : "ghost"}
            className={`w-full justify-start ${
              activeTab === "skills" ? "bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-500 dark:to-blue-500" : "dark:text-gray-300 dark:hover:bg-gray-700/50"
            }`}
            onClick={() => setActiveTab("skills")}
          >
            <Star className="mr-2 h-4 w-4" />
            Skills
          </Button>
        </nav>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
          <h3 className="font-medium mb-4 text-gray-800 dark:text-gray-200">Quick Actions</h3>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/50" 
              onClick={() => {
                router.push("/messages");
              }}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Messages
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/50"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Skill Swaps
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/50"
            >
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
