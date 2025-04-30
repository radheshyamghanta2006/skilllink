"use client"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Star } from "lucide-react"

type ReviewsListProps = {
  reviews: any[]
}

export function ReviewsList({ reviews }: ReviewsListProps) {
  const [visibleReviews, setVisibleReviews] = useState(3)

  const handleLoadMore = () => {
    setVisibleReviews((prev) => prev + 3)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium mb-2">No Reviews Yet</h3>
        <p className="text-gray-500">Be the first to leave a review for this provider.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {reviews.slice(0, visibleReviews).map((review) => (
        <div key={review.id} className="border-b pb-6 last:border-b-0">
          <div className="flex items-start space-x-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={review.reviewer?.profile_image || "/placeholder.svg"} alt={review.reviewer?.name} />
              <AvatarFallback>{review.reviewer?.name ? getInitials(review.reviewer.name) : "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{review.reviewer?.name || "Anonymous"}</h3>
                <span className="text-sm text-gray-500">
                  {new Date(review.created_at || Date.now()).toLocaleDateString()}
                </span>
              </div>
              <div className="flex mt-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${star <= review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          </div>
        </div>
      ))}

      {reviews.length > visibleReviews && (
        <div className="text-center">
          <Button onClick={handleLoadMore} variant="outline" className="border-purple-300 hover:bg-purple-50">
            Load More Reviews
          </Button>
        </div>
      )}
    </div>
  )
}
