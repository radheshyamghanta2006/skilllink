"use client"

import { useState, useEffect } from "react"
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
  const [allSlots, setAllSlots] = useState<any[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("calendar")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Fetch all availability slots for the user
  useEffect(() => {
    if (user && user.id) {
      fetchAllSlots()
    }
  }, [user])

  // Fetch slots for the selected date when date changes
  useEffect(() => {
    if (date) {
      fetchSlotsForDate(date)
    }
  }, [date, allSlots])

  const fetchAllSlots = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('provider_id', user.id)
        .order('date', { ascending: true })
        .order('start_time', { ascending: true })

      if (error) throw error
      
      setAllSlots(data || [])
    } catch (error) {
      console.error("Error fetching availability slots:", error)
      toast({
        title: "Error",
        description: "Failed to load availability slots.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchSlotsForDate = async (selectedDate: Date) => {
    if (!selectedDate) return
    
    const formattedDate = selectedDate.toISOString().split("T")[0]
    
    // Filter slots from allSlots that match the selected date
    if (allSlots.length > 0) {
      const filteredSlots = allSlots.filter(slot => slot.date === formattedDate)
      setSlots(filteredSlots)
    } else {
      // If allSlots isn't loaded yet, fetch directly from database
      try {
        const { data, error } = await supabase
          .from('availability_slots')
          .select('*')
          .eq('provider_id', user.id)
          .eq('date', formattedDate)
          .order('start_time', { ascending: true })

        if (error) throw error
        
        setSlots(data || [])
      } catch (error) {
        console.error("Error fetching slots for date:", error)
      }
    }
  }

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return
    setDate(selectedDate)
  }

  const handleAddSlot = async (newSlot: any) => {
    try {
      const slotData = {
        provider_id: user.id,
        date: newSlot.date,
        start_time: newSlot.start_time,
        end_time: newSlot.end_time,
        is_available: true
      }
      
      const { data, error } = await supabase
        .from('availability_slots')
        .insert([slotData])
        .select()

      if (error) throw error
      
      // Update both states
      if (data && data.length > 0) {
        setSlots([...slots, data[0]])
        setAllSlots([...allSlots, data[0]])
        
        toast({
          title: "Time slot added",
          description: "Your availability has been updated.",
        })
      }
      
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
      // Find the slot
      const slot = slots.find(s => s.id === slotId)
      if (!slot) return
      
      // Toggle the is_available flag
      const { error } = await supabase
        .from('availability_slots')
        .update({ is_available: !slot.is_available })
        .eq('id', slotId)

      if (error) throw error
      
      // Update both local states
      const updatedSlot = { ...slot, is_available: !slot.is_available }
      setSlots(slots.map(s => s.id === slotId ? updatedSlot : s))
      setAllSlots(allSlots.map(s => s.id === slotId ? updatedSlot : s))

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
      const { error } = await supabase
        .from('availability_slots')
        .delete()
        .eq('id', slotId)

      if (error) throw error
      
      // Update both local states
      setSlots(slots.filter(slot => slot.id !== slotId))
      setAllSlots(allSlots.filter(slot => slot.id !== slotId))

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
    const formattedDate = day.toISOString().split("T")[0]
    return allSlots.some(slot => slot.date === formattedDate && slot.is_available)
  }

  // Group slots by date for list view
  const groupedSlots = allSlots.reduce((groups, slot) => {
    const date = slot.date
    if (!groups[date]) {
      groups[date] = []
    }
    if (slot.is_available) {
      groups[date].push(slot)
    }
    return groups
  }, {})

  // Sort dates for display
  const sortedDates = Object.keys(groupedSlots).sort((a, b) => 
    new Date(a).getTime() - new Date(b).getTime()
  )

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
                {isLoading ? (
                  <div className="flex justify-center items-center h-60">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-600"></div>
                  </div>
                ) : (
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
                )}
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
                {isLoading ? (
                  <div className="flex justify-center items-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
                  </div>
                ) : slots.length > 0 ? (
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

                <Button 
                  onClick={() => setIsModalOpen(true)} 
                  variant="outline" 
                  className="w-full mt-4"
                  disabled={!date}
                >
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
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
                </div>
              ) : sortedDates.length > 0 ? (
                <div className="space-y-6">
                  {sortedDates.map((dateStr) => (
                    <div key={dateStr} className="border-b pb-4 last:border-b-0">
                      <h3 className="font-medium mb-3">
                        {new Date(dateStr).toLocaleDateString("en-US", {
                          weekday: "long",
                          month: "long",
                          day: "numeric",
                        })}
                      </h3>
                      {groupedSlots[dateStr].length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {groupedSlots[dateStr].map((slot:any) => (
                            <div key={slot.id} className="flex items-center justify-between p-2 border rounded-md">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                                <span>
                                  {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
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
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No available slots on this day.</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 mb-4">You haven't added any availability slots yet.</p>
                  <Button 
                    onClick={() => setIsModalOpen(true)} 
                    variant="outline" 
                    className="border-purple-300 text-purple-700 hover:bg-purple-50"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Your First Time Slot
                  </Button>
                </div>
              )}
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
