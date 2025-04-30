"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TimeSlotModal } from "@/components/time-slot-modal"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { Clock, Plus, Trash2 } from "lucide-react"

type AvailabilityCalendarProps = {
  user: any
}

export function AvailabilityCalendar({ user }: AvailabilityCalendarProps) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [slots, setSlots] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("calendar")
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Generate dummy slots for the selected date
  const generateSlotsForDate = (selectedDate: Date) => {
    const formattedDate = selectedDate.toISOString().split("T")[0]

    // Generate 5 random slots for the selected date
    return Array.from({ length: 5 }, (_, i) => {
      const startHour = 9 + i * 2
      const endHour = startHour + 1

      return {
        id: `slot-${formattedDate}-${i}`,
        date: formattedDate,
        start_time: `${startHour}:00:00`,
        end_time: `${endHour}:00:00`,
        is_available: Math.random() > 0.3, // 70% chance of being available
      }
    })
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return

    setDate(selectedDate)
    setSlots(generateSlotsForDate(selectedDate))
  }

  const handleAddSlot = async (newSlot: any) => {
    try {
      // In a real app, this would add to the database
      setSlots([
        ...slots,
        {
          id: `slot-new-${Date.now()}`,
          ...newSlot,
          is_available: true,
        },
      ])

      toast({
        title: "Time slot added",
        description: "Your availability has been updated.",
      })

      setIsModalOpen(false)
    } catch (error) {
      console.error("Error adding time slot:", error)
      toast({
        title: "Error",
        description: "Failed to add time slot.",
        variant: "destructive",
      })
    }
  }

  const handleToggleAvailability = async (slotId: string) => {
    try {
      // In a real app, this would update the database
      setSlots(slots.map((slot) => (slot.id === slotId ? { ...slot, is_available: !slot.is_available } : slot)))

      toast({
        title: "Availability updated",
        description: "Your time slot has been updated.",
      })
    } catch (error) {
      console.error("Error updating time slot:", error)
      toast({
        title: "Error",
        description: "Failed to update time slot.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteSlot = async (slotId: string) => {
    try {
      // In a real app, this would delete from the database
      setSlots(slots.filter((slot) => slot.id !== slotId))

      toast({
        title: "Time slot deleted",
        description: "Your availability has been updated.",
      })
    } catch (error) {
      console.error("Error deleting time slot:", error)
      toast({
        title: "Error",
        description: "Failed to delete time slot.",
        variant: "destructive",
      })
    }
  }

  // Function to determine if a date has available slots
  const hasAvailableSlots = (day: Date) => {
    // For demo purposes, we'll just return random values
    return Math.random() > 0.7
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Availability</h2>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Time Slot
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={handleDateSelect}
                  className="rounded-md border"
                  modifiers={{
                    hasSlots: (day) => hasAvailableSlots(day),
                  }}
                  modifiersStyles={{
                    hasSlots: { backgroundColor: "rgba(147, 51, 234, 0.1)" },
                  }}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {date
                    ? date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })
                    : "Select a date"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {slots.length > 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                    {slots.map((slot) => (
                      <div key={slot.id} className="flex items-center justify-between p-3 border rounded-md">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2 text-gray-500" />
                          <span>
                            {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={slot.is_available ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                          >
                            {slot.is_available ? "Available" : "Unavailable"}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleAvailability(slot.id)}
                            className="h-8 w-8 p-0"
                          >
                            {slot.is_available ? "❌" : "✅"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteSlot(slot.id)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    {date ? "No time slots for this date. Add one!" : "Select a date to view or add time slots."}
                  </div>
                )}

                <Button onClick={() => setIsModalOpen(true)} variant="outline" className="w-full mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Time Slot for This Date
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="list">
          <Card>
            <CardHeader>
              <CardTitle>All Available Time Slots</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Group slots by date */}
                {Array.from({ length: 5 }, (_, i) => {
                  const date = new Date()
                  date.setDate(date.getDate() + i)
                  return {
                    date: date.toISOString().split("T")[0],
                    slots: generateSlotsForDate(date).filter((slot) => slot.is_available),
                  }
                }).map((day) => (
                  <div key={day.date} className="border-b pb-4 last:border-b-0">
                    <h3 className="font-medium mb-3">
                      {new Date(day.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </h3>
                    {day.slots.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {day.slots.map((slot) => (
                          <div key={slot.id} className="flex items-center justify-between p-2 border rounded-md">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-gray-500" />
                              <span>
                                {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                              </span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteSlot(slot.id)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No available slots on this day.</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isModalOpen && (
        <TimeSlotModal
          date={date}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleAddSlot}
        />
      )}
    </div>
  )
}
