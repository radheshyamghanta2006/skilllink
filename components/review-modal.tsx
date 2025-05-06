"use client"

import type React from "react"

import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Review {
  booking_id: string
  rating: number
  comment: string
  reviewer_id: string
  reviewee_id: string
  provider_id: string
  seeker_id: string
  is_provider_review: boolean
  skill_swap_direction?: 'received' | 'provided'
}

type ReviewModalProps = {
  booking: {
    id: string
    provider: {
      id: string
      name: string
      profile_image?: string
    }
    seeker: {
      id: string
      name: string
      profile_image?: string
    }
    service_name: string
    is_skill_swap: boolean
    status: string
  }
  isOpen: boolean
  onClose: () => void
  onSubmit: (bookingId: string, rating: number, comment: string) => void
  user: {
    id: string
    name: string
  }
}

export function ReviewModal({ booking, isOpen, onClose, onSubmit, user }: ReviewModalProps) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  // Add state for dual reviews
  const [providedSkillRating, setProvidedSkillRating] = useState(5)
  const [providedSkillComment, setProvidedSkillComment] = useState("")
  const [receivedSkillRating, setReceivedSkillRating] = useState(5)
  const [receivedSkillComment, setReceivedSkillComment] = useState("")

  // Validation
  const isValidRating = (rating: number) => rating >= 1 && rating <= 5
  const isValidComment = (comment: string) => comment.trim().length >= 3

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validate booking status
      if (booking.status !== 'completed') {
        throw new Error('Can only review completed bookings')
      }

      if (booking.is_skill_swap) {
        // Validate skill swap reviews
        if (!isValidRating(providedSkillRating) || !isValidRating(receivedSkillRating)) {
          throw new Error('Invalid rating value')
        }
        if (!isValidComment(providedSkillComment) || !isValidComment(receivedSkillComment)) {
          throw new Error('Please provide more detailed feedback (minimum 3 characters)')
        }

        const reviews: Review[] = [
          {
            booking_id: booking.id,
            rating: receivedSkillRating,
            comment: receivedSkillComment.trim(),
            reviewer_id: user.id,
            reviewee_id: user.id === booking.provider.id ? booking.seeker.id : booking.provider.id,
            provider_id: booking.provider.id,
            seeker_id: booking.seeker.id,
            is_provider_review: user.id === booking.provider.id,
            skill_swap_direction: 'received'
          },
          {
            booking_id: booking.id,
            rating: providedSkillRating,
            comment: providedSkillComment.trim(),
            reviewer_id: user.id,
            reviewee_id: user.id === booking.provider.id ? booking.seeker.id : booking.provider.id,
            provider_id: booking.provider.id,
            seeker_id: booking.seeker.id,
            is_provider_review: user.id === booking.provider.id,
            skill_swap_direction: 'provided'
          }
        ]

        const { error } = await supabase.from('reviews').insert(reviews)
        if (error) throw error

        // Send notification for skill swap review
        await supabase.from('notifications').insert([{
          user_id: user.id === booking.provider.id ? booking.seeker.id : booking.provider.id,
          type: 'new_review',
          title: 'New Skill Swap Reviews',
          message: `${user.name} has left reviews for your skill swap session`,
          data: { 
            booking_id: booking.id,
            is_skill_swap: true
          }
        }])
      } else {
        // Validate regular review
        if (!isValidRating(rating)) {
          throw new Error('Invalid rating value')
        }
        if (!isValidComment(comment)) {
          throw new Error('Please provide more detailed feedback (minimum 3 characters)')
        }

        const review: Review = {
          booking_id: booking.id,
          rating: rating,
          comment: comment.trim(),
          reviewer_id: user.id,
          reviewee_id: user.id === booking.provider.id ? booking.seeker.id : booking.provider.id,
          provider_id: booking.provider.id,
          seeker_id: booking.seeker.id,
          is_provider_review: user.id === booking.provider.id
        }

        const { error } = await supabase.from('reviews').insert([review])
        if (error) throw error

        // Send notification for regular review
        await supabase.from('notifications').insert([{
          user_id: user.id === booking.provider.id ? booking.seeker.id : booking.provider.id,
          type: 'new_review',
          title: 'New Review',
          message: `${user.name} has left a review for your session`,
          data: { booking_id: booking.id }
        }])
      }

      await onSubmit(booking.id, rating, comment)
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      })
      onClose()
    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={booking.provider.profile_image || "/placeholder.svg"} alt={booking.provider.name} />
                <AvatarFallback>{getInitials(booking.provider.name)}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{booking.provider.name}</h3>
                <p className="text-sm text-gray-500">{booking.service_name}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" className="focus:outline-none" onClick={() => setRating(star)}>
                    <Star
                      className={`h-8 w-8 ${star <= rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comment">Your Review</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience with this provider..."
                rows={4}
                required
              />
            </div>

            {booking.is_skill_swap && (
              <div className="space-y-6">
                <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <h3 className="font-medium">Rate the skill you received</h3>
                  <div className="space-y-2">
                    <Label>Rating</Label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="focus:outline-none"
                          onClick={() => setReceivedSkillRating(star)}
                        >
                          <Star
                            className={`h-8 w-8 ${
                              star <= receivedSkillRating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <Textarea
                      value={receivedSkillComment}
                      onChange={(e) => setReceivedSkillComment(e.target.value)}
                      placeholder="How was the skill you received?"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h3 className="font-medium">Rate the skill you provided</h3>
                  <div className="space-y-2">
                    <Label>Rating</Label>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="focus:outline-none"
                          onClick={() => setProvidedSkillRating(star)}
                        >
                          <Star
                            className={`h-8 w-8 ${
                              star <= providedSkillRating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    <Textarea
                      value={providedSkillComment}
                      onChange={(e) => setProvidedSkillComment(e.target.value)}
                      placeholder="How was your experience providing your skill?"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
