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
import { Badge } from "./ui/badge"
import { Switch } from "./ui/switch"
import { RefreshCw } from "lucide-react"

interface Slot {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
}

interface Skill {
  id: string;
  skill_name: string;
  category: string;
  intent: string;
}

type BookingModalProps = {
  provider: any
  currentUser: any
  isOpen: boolean
  onClose: () => void
  onSuccess?: (bookingData: any) => void
}

export function BookingModal({ provider, currentUser, isOpen, onClose, onSuccess }: BookingModalProps) {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSkillSwap, setIsSkillSwap] = useState(false)
  const [selectedSeekerSkill, setSelectedSeekerSkill] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Filter available slots and sort them by date and time
  const availableSlots = (provider.availability_slots?.filter((slot: Slot) => slot.is_available) || [])
    .sort((a: Slot, b: Slot) => {
      const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime()
      if (dateCompare !== 0) return dateCompare
      return a.start_time.localeCompare(b.start_time)
    })

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

    if (isSkillSwap && !selectedSeekerSkill) {
      toast({
        title: "Error",
        description: "Please select a skill to swap.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const selectedSlotData = availableSlots.find((slot: Slot) => slot.id === selectedSlot)
      
      if (!selectedSlotData) {
        throw new Error("Selected time slot not found")
      }

      // Create the booking
      const { data: bookingData, error: bookingError } = await supabase
        .from('bookings')
        .insert([{
          provider_id: provider.id,
          seeker_id: currentUser.id,
          slot_id: selectedSlot,
          date: selectedSlotData.date,
          start_time: selectedSlotData.start_time,
          end_time: selectedSlotData.end_time,
          service_name: provider.skills?.[0]?.skill_name || "Skill Service",
          notes: notes,
          status: "pending",
          payment_status: isSkillSwap ? "not_required" : "pending",
          is_skill_swap: isSkillSwap,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select(`
          *,
          provider:provider_id(*),
          seeker:seeker_id(*),
          slot:slot_id(*)
        `)
        .single()

      if (bookingError) throw bookingError

      // If this is a skill swap, create the skill swap agreement
      if (isSkillSwap && selectedSeekerSkill) {
        const { error: swapError } = await supabase
          .from('skill_swap_agreements')
          .insert([{
            proposer_id: currentUser.id,
            recipient_id: provider.id,
            proposer_skill_id: selectedSeekerSkill,
            recipient_skill_id: provider.skills?.[0]?.id,
            status: 'pending',
          }])

        if (swapError) throw swapError
      }

      // Mark the slot as unavailable
      const { error: slotError } = await supabase
        .from('availability_slots')
        .update({ is_available: false })
        .eq('id', selectedSlot)

      if (slotError) throw slotError

      // Send notification to the provider
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([{
          user_id: provider.id,
          type: isSkillSwap ? 'skill_swap_request' : 'new_booking',
          title: isSkillSwap ? 'New Skill Swap Request' : 'New Booking Request',
          message: isSkillSwap
            ? `${currentUser.name} has requested to swap their ${currentUser.skills?.find((s: Skill) => s.id === selectedSeekerSkill)?.skill_name} for your ${provider.skills?.[0]?.skill_name}`
            : `${currentUser.name} has requested to book a session for ${provider.skills?.[0]?.skill_name}`,
          data: { 
            booking_id: bookingData.id,
            is_skill_swap: isSkillSwap,
            swap_skill_id: selectedSeekerSkill
          }
        }])

      if (notificationError) {
        console.error("Error creating notification:", notificationError)
      }

      toast({
        title: "Success!",
        description: isSkillSwap 
          ? "Your skill swap request has been sent to the provider."
          : "Your booking request has been sent to the provider.",
      })

      // Call the success callback with the booking data
      if (onSuccess) {
        onSuccess(bookingData)
      }

      onClose()
    } catch (error) {
      console.error("Error creating booking:", error)
      toast({
        title: "Error",
        description: "Failed to create booking. Please try again.",
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
                    {availableSlots.map((slot: Slot) => (
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
              {provider.skill_swap && currentUser.skills?.length > 0 && (
                <div className="flex items-center justify-between p-4 border rounded-md">
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="h-5 w-5 text-purple-600" />
                    <div>
                      <h4 className="font-medium">Skill Swap Available</h4>
                      <p className="text-sm text-gray-500">Exchange your skills instead of paying</p>
                    </div>
                  </div>
                  <Switch
                    checked={isSkillSwap}
                    onCheckedChange={setIsSkillSwap}
                  />
                </div>
              )}

              {isSkillSwap && (
                <div className="space-y-2">
                  <Label>Select Your Skill to Swap</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {currentUser.skills
                      ?.filter((skill: Skill) => skill.intent === "provider")
                      .map((skill: Skill) => (
                        <div
                          key={skill.id}
                          className={`p-3 border rounded-md cursor-pointer ${
                            selectedSeekerSkill === skill.id
                              ? "border-purple-600 bg-purple-50"
                              : "hover:border-gray-400"
                          }`}
                          onClick={() => setSelectedSeekerSkill(skill.id)}
                        >
                          <h4 className="font-medium">{skill.skill_name}</h4>
                          <p className="text-sm text-gray-500">{skill.category}</p>
                        </div>
                      ))}
                  </div>
                </div>
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
