"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { Calendar, Clock } from "lucide-react"

type BookingModalProps = {
  provider: any
  currentUser: any
  isOpen: boolean
  onClose: () => void
}

export function BookingModal({ provider, currentUser, isOpen, onClose }: BookingModalProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Filter available slots
  const availableSlots = provider.availability_slots?.filter((slot: any) => slot.is_available) || []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedSlot) {
      toast({
        title: "Error",
        description: "Please select a time slot.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // In a real app, this would create a booking in the database
      // For demo purposes, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      toast({
        title: "Booking requested",
        description: "Your booking request has been sent to the provider.",
      })

      onClose()
    } catch (error) {
      console.error("Error creating booking:", error)
      toast({
        title: "Error",
        description: "Failed to create booking.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Book a Session with {provider.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Select a Time Slot</Label>
              {availableSlots.length > 0 ? (
                <RadioGroup value={selectedSlot || ""} onValueChange={setSelectedSlot}>
                  <div className="grid grid-cols-1 gap-2">
                    {availableSlots.map((slot: any) => (
                      <div key={slot.id}>
                        <RadioGroupItem value={slot.id} id={slot.id} className="peer sr-only" />
                        <Label
                          htmlFor={slot.id}
                          className="flex flex-col items-start p-4 border rounded-md cursor-pointer peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:bg-purple-50"
                        >
                          <div className="flex items-center w-full justify-between">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                              <span>
                                {new Date(slot.date).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </div>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-2 text-gray-500" />
                              <span>
                                {slot.start_time.substring(0, 5)} - {slot.end_time.substring(0, 5)}
                              </span>
                            </div>
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              ) : (
                <p className="text-center py-4 text-gray-500">No available time slots. Please check back later.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any specific requirements or questions for the provider?"
                rows={3}
              />
            </div>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">Booking Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Provider:</span>
                    <span>{provider.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Service:</span>
                    <span>{provider.skills?.[0]?.skill_name || "Skill Service"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Duration:</span>
                    <span>60 minutes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Location:</span>
                    <span>Online or In-person</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total:</span>
                    <span>$50.00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={!selectedSlot || isLoading}
            >
              {isLoading ? "Processing..." : "Confirm Booking"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
