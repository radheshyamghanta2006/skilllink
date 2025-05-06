"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { RefreshCw } from "lucide-react"
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog"

type SkillSwapModalProps = {
  provider: any
  currentUser: any
  isOpen: boolean
  onClose: () => void
}

export function SkillSwapModal({ provider, currentUser, isOpen, onClose }: SkillSwapModalProps) {
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClientComponentClient()
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [swapDetails, setSwapDetails] = useState<any>(null)

  // Get current user's skills that can be offered
  const userSkills = currentUser?.skills || [
    { id: "skill-1", skill_name: "Web Development", category: "Technology" },
    { id: "skill-2", skill_name: "Graphic Design", category: "Design" },
    { id: "skill-3", skill_name: "English Tutoring", category: "Languages" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedSkill) {
      toast({
        title: "Error",
        description: "Please select a skill to offer.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Create the skill swap agreement
      const { data: swapData, error: swapError } = await supabase
        .from('skill_swap_agreements')
        .insert([{
          proposer_id: currentUser.id,
          recipient_id: provider.id,
          proposer_skill_id: selectedSkill,
          recipient_skill_id: provider.skills?.[0]?.id,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (swapError) throw swapError

      // Create notification for the provider
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([{
          user_id: provider.id,
          type: 'skill_swap_request',
          title: 'New Skill Swap Request',
          message: `${currentUser.name} wants to swap their ${userSkills.find(s => s.id === selectedSkill)?.skill_name} for your ${provider.skills?.[0]?.skill_name}`,
          data: {
            swap_agreement_id: swapData.id,
            proposer_skill_id: selectedSkill,
            recipient_skill_id: provider.skills?.[0]?.id
          }
        }])

      if (notificationError) {
        console.error("Error creating notification:", notificationError)
      }

      // Set confirmation details
      setSwapDetails({
        provider: provider,
        providerSkill: provider.skills?.find((s: any) => s.id === provider.skills?.[0]?.id),
        seekerSkill: userSkills.find((s: any) => s.id === selectedSkill),
      })

      // Show confirmation dialog
      setShowConfirmation(true)

    } catch (error) {
      console.error("Error proposing skill swap:", error)
      toast({
        title: "Error",
        description: "Failed to send skill swap proposal.",
        variant: "destructive",
      })
      onClose()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Propose a Skill Swap with {provider.name}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Select a skill you can offer</Label>
                {userSkills.length > 0 ? (
                  <RadioGroup value={selectedSkill || ""} onValueChange={setSelectedSkill}>
                    <div className="grid grid-cols-1 gap-2">
                      {userSkills.map((skill: any) => (
                        <div key={skill.id}>
                          <RadioGroupItem value={skill.id} id={skill.id} className="peer sr-only" />
                          <Label
                            htmlFor={skill.id}
                            className="flex items-center justify-between p-4 border rounded-md cursor-pointer peer-data-[state=checked]:border-purple-600 peer-data-[state=checked]:bg-purple-50"
                          >
                            <div>
                              <div className="font-medium">{skill.skill_name}</div>
                              <div className="text-sm text-gray-500">{skill.category}</div>
                            </div>
                            <Badge variant="outline" className="bg-purple-50">
                              You Offer
                            </Badge>
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                ) : (
                  <p className="text-center py-4 text-gray-500">
                    You don't have any skills to offer. Add skills to your profile first.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message (Optional)</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Explain what you're looking for and how you can help each other..."
                  rows={3}
                />
              </div>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium mb-2">Skill Swap Summary</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">You'll receive:</span>
                      <span>{provider.skills?.[0]?.skill_name || "Provider's Skill"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">You'll provide:</span>
                      <span>
                        {selectedSkill
                          ? userSkills.find((s: any) => s.id === selectedSkill)?.skill_name
                          : "Select a skill"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Cost:</span>
                      <span className="font-medium text-green-600">Free (Skill Exchange)</span>
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
                disabled={!selectedSkill || isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Propose Swap
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      {showConfirmation && (
        <AlertDialog open={showConfirmation} onOpenChange={() => {
          setShowConfirmation(false)
          onClose()
        }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Skill Swap Request Sent!</AlertDialogTitle>
              <AlertDialogDescription className="space-y-4">
                <p>You've successfully requested to swap:</p>
                <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div>
                    <p className="font-medium">Your Skill</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{swapDetails?.seekerSkill?.skill_name}</p>
                  </div>
                  <RefreshCw className="h-5 w-5 text-purple-600 mx-4" />
                  <div>
                    <p className="font-medium">Their Skill</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{swapDetails?.providerSkill?.skill_name}</p>
                  </div>
                </div>
                {swapDetails?.date && (
                  <div className="mt-4">
                    <p className="font-medium">Proposed Date & Time:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {new Date(swapDetails.date).toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                      {" at "}
                      {swapDetails.startTime.substring(0, 5)}
                    </p>
                  </div>
                )}
                <p className="mt-4">
                  {swapDetails?.provider?.name} will be notified and can accept or decline your request.
                  You'll receive a notification once they respond.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button 
                onClick={() => {
                  setShowConfirmation(false)
                  onClose()
                }}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600"
              >
                Got it!
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </>
  )
}
