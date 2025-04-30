"use client"

import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Star, Clock, RefreshCw } from "lucide-react"

type ProviderCardProps = {
  provider: {
    id: string
    name: string
    profile_image: string
    location: string
    bio: string
    rating: number
    skills: { skill_name: string; category: string }[]
    available_now: boolean
    skill_swap: boolean
  }
}

export function ProviderCard({ provider }: ProviderCardProps) {
  const router = useRouter()

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-40 sm:h-auto sm:w-1/3">
          <Image
            src={provider.profile_image || "/placeholder.svg?height=160&width=160"}
            alt={provider.name}
            fill
            className="object-cover"
          />
          {provider.available_now && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-green-500 hover:bg-green-600 text-white flex items-center">
                <Clock className="mr-1 h-3 w-3" /> Available Now
              </Badge>
            </div>
          )}
        </div>
        <div className="flex-1 p-5">
          <div className="flex flex-col h-full">
            <div>
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold">{provider.name}</h3>
                <div className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                  <span className="text-sm font-medium">{provider.rating.toFixed(1)}</span>
                </div>
              </div>

              <div className="flex items-center text-gray-600 text-sm mt-1 mb-3">
                <MapPin className="h-3 w-3 mr-1" />
                <span>{provider.location}</span>
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {provider.skills?.slice(0, 3).map((skill, index) => (
                  <Badge key={index} variant="outline" className="bg-purple-50">
                    {skill.skill_name}
                  </Badge>
                ))}
                {provider.skills?.length > 3 && <Badge variant="outline">+{provider.skills.length - 3} more</Badge>}
              </div>

              <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                {provider.bio || "This provider hasn't added a bio yet."}
              </p>
            </div>

            <div className="mt-auto flex items-center justify-between">
              {provider.skill_swap && (
                <Badge variant="outline" className="border-green-300 text-green-700 flex items-center">
                  <RefreshCw className="mr-1 h-3 w-3" /> Open to Skill Swap
                </Badge>
              )}

              <Button
                onClick={() => router.push(`/provider/${provider.id}`)}
                className="ml-auto bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                View Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
