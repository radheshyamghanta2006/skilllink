"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { MapPin, Star, ArrowRight } from "lucide-react"

// Sample data for featured providers
const dummyProviders = [
  {
    id: "1",
    name: "Alex Johnson",
    profile_image: "/placeholder.svg?height=300&width=300",
    location: "New York, NY",
    skills: [{ skill_name: "Piano Lessons", category: "Music" }],
    rating: 4.9,
    reviews_count: 28,
  },
  {
    id: "2",
    name: "Maria Garcia",
    profile_image: "/placeholder.svg?height=300&width=300",
    location: "Los Angeles, CA",
    skills: [{ skill_name: "Yoga Instructor", category: "Fitness" }],
    rating: 5.0,
    reviews_count: 42,
  },
  {
    id: "3",
    name: "David Kim",
    profile_image: "/placeholder.svg?height=300&width=300",
    location: "Chicago, IL",
    skills: [{ skill_name: "Web Development", category: "Technology" }],
    rating: 4.8,
    reviews_count: 35,
  },
  {
    id: "4",
    name: "Sarah Patel",
    profile_image: "/placeholder.svg?height=300&width=300",
    location: "Austin, TX",
    skills: [{ skill_name: "Cooking Classes", category: "Cooking" }],
    rating: 4.7,
    reviews_count: 19,
  },
]

export function FeaturedProviders() {
  const [providers, setProviders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        // In a real app, this would fetch from the database
        // For demo purposes, we'll use the dummy data
        setProviders(dummyProviders)
      } catch (error) {
        console.error("Error fetching featured providers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProviders()
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl font-bold mb-2">Featured Skill Providers</h2>
            <p className="text-lg text-gray-600">Discover top-rated skill providers in your community</p>
          </div>
          <Button onClick={() => router.push("/explore")} variant="outline" className="mt-4 md:mt-0">
            View All Providers
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {providers.map((provider) => (
              <motion.div key={provider.id} variants={itemVariants}>
                <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48">
                    <Image
                      src={provider.profile_image || "/placeholder.svg"}
                      alt={provider.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{provider.name}</h3>
                    <div className="flex items-center mb-3 text-gray-600">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{provider.location}</span>
                    </div>
                    <div className="flex items-center mb-4">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-4 w-4 ${
                              star <= Math.round(provider.rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">({provider.reviews_count} reviews)</span>
                    </div>
                    <div className="space-y-2">
                      {provider.skills.map((skill: any, index: number) => (
                        <Badge key={index} variant="outline" className="bg-purple-50 mr-2">
                          {skill.skill_name}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 pt-0">
                    <Button
                      onClick={() => router.push(`/provider/${provider.id}`)}
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                    >
                      View Profile
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}
