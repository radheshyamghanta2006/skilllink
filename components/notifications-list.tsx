import { useState, useEffect } from "react"
import { Bell, Calendar, RefreshCw, DollarSign, MessageSquare, Star } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { motion, AnimatePresence } from "framer-motion"

type NotificationsListProps = {
  notifications: any[]
  onMarkAsRead: (id: string) => void
}

export function NotificationsList({ notifications, onMarkAsRead }: NotificationsListProps) {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_booking':
      case 'booking_confirmed':
      case 'booking_completed':
      case 'booking_cancelled':
        return <Calendar className="h-5 w-5 text-blue-600" />
      case 'skill_swap_request':
      case 'skill_swap_accepted':
      case 'skill_swap_rejected':
        return <RefreshCw className="h-5 w-5 text-green-600" />
      case 'payment_received':
      case 'payment_pending':
      case 'payment_refunded':
        return <DollarSign className="h-5 w-5 text-yellow-600" />
      case 'new_message':
        return <MessageSquare className="h-5 w-5 text-purple-600" />
      case 'new_review':
        return <Star className="h-5 w-5 text-orange-600" />
      default:
        return <Bell className="h-5 w-5 text-gray-600" />
    }
  }

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case 'new_booking':
        return <Badge className="bg-blue-100 text-blue-800">New Booking</Badge>
      case 'booking_confirmed':
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
      case 'booking_completed':
        return <Badge className="bg-purple-100 text-purple-800">Completed</Badge>
      case 'booking_cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>
      case 'skill_swap_request':
        return <Badge className="bg-green-100 text-green-800">Skill Swap</Badge>
      case 'payment_received':
        return <Badge className="bg-yellow-100 text-yellow-800">Payment</Badge>
      case 'new_review':
        return <Badge className="bg-orange-100 text-orange-800">Review</Badge>
      default:
        return null
    }
  }

  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        when: "beforeChildren"
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.2
      }
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {notifications.map((notification) => (
          <motion.div 
            key={notification.id} 
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layoutId={notification.id}
            className="w-full"
          >
            <Card className={`relative overflow-hidden transition-colors duration-200 ${
              !notification.is_read ? 'border-l-4 border-l-purple-600' : ''
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {notification.title}
                      </h4>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {getNotificationBadge(notification.type)}
                        <span className="text-sm text-gray-500 whitespace-nowrap">
                          {formatTimeAgo(new Date(notification.created_at))}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {notification.message}
                    </p>
                    {!notification.is_read && (
                      <div className="mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
                          onClick={() => onMarkAsRead(notification.id)}
                        >
                          Mark as read
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {notifications.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-8"
          >
            <Bell className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              No notifications
            </h3>
            <p className="text-gray-500">You're all caught up!</p>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

// Add time ago formatter function
function formatTimeAgo(date: Date) {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
  
  return date.toLocaleDateString()
}