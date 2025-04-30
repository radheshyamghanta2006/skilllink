"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProviderCard } from "@/components/provider-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Search, MapPin, Star, Clock, RefreshCw } from "lucide-react"

type Provider = {
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

export default function ExplorePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const initialSkill = searchParams.get("skill") || ""
  const initialLocation = searchParams.get("location") || ""

  const [searchTerm, setSearchTerm] = useState("")
  const [location, setLocation] = useState(initialLocation)
  const [category, setCategory] = useState("all")
  const [minRating, setMinRating] = useState(0)
  const [availableNow, setAvailableNow] = useState(false)
  const [skillSwap, setSkillSwap] = useState(false)
  const [distance, setDistance] = useState([5])
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    if (initialSkill) {
      setSearchTerm(initialSkill)
    }
    fetchProviders()
  }, [initialSkill, initialLocation])

  const fetchProviders = async (reset = true) => {
    if (reset) {
      setLoading(true)
      setPage(1)
    }

    try {
      // In a real app, this would be a proper API call with filters
      // For demo purposes, we're simulating the API response
      const currentPage = reset ? 1 : page

      let query = supabase
        .from("users")
        .select(`
          id,
          name,
          profile_image,
          location,
          bio,
          skills (skill_name, category),
          availability_slots (id, date, start_time, end_time, is_available)
        `)
        .eq("role", "provider")
        .order("name")

      if (searchTerm) {
        query = query.textSearch("skills.skill_name", searchTerm)
      }

      if (location) {
        query = query.ilike("location", `%${location}%`)
      }

      if (category !== "all") {
        query = query.eq("skills.category", category)
      }

      if (availableNow) {
        const now = new Date()
        const today = now.toISOString().split("T")[0]
        const currentTime = `${now.getHours()}:${now.getMinutes()}:00`

        query = query
          .eq("availability_slots.date", today)
          .gte("availability_slots.start_time", currentTime)
          .eq("availability_slots.is_available", true)
      }

      const { data, error } = await query.range((currentPage - 1) * 10, currentPage * 10 - 1)

      if (error) throw error

      // Transform data and add dummy ratings for demo
      const transformedData = data.map((provider) => ({
        ...provider,
        rating: Math.floor(Math.random() * 5) + 1,
        skill_swap: Math.random() > 0.5,
        available_now: availableNow ? true : Math.random() > 0.5,
      }))

      if (reset) {
        setProviders(transformedData)
      } else {
        setProviders((prev) => [...prev, ...transformedData])
      }

      setHasMore(data.length === 10)
      setPage(currentPage + 1)
    } catch (error) {
      console.error("Error fetching providers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchProviders()
  }

  const handleLoadMore = () => {
    fetchProviders(false)
  }

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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <section className="bg-gradient-to-r from-purple-100 to-blue-100 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-6 text-center">Find Skilled People Near You</h1>
            <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    type="text"
                    placeholder="What skill are you looking for?"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex-1 relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  Search
                </Button>
              </div>
            </form>
          </div>
        </section>

        <section className="py-12 container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
                <h2 className="text-xl font-semibold mb-4">Filters</h2>

                <div className="space-y-6">
                  <div>
                    <Label className="mb-2 block">Category</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="home">Home & Garden</SelectItem>
                        <SelectItem value="arts">Arts & Crafts</SelectItem>
                        <SelectItem value="fitness">Fitness & Health</SelectItem>
                        <SelectItem value="cooking">Cooking</SelectItem>
                        <SelectItem value="music">Music</SelectItem>
                        <SelectItem value="language">Languages</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="mb-2 block">Distance (km)</Label>
                    <Slider value={distance} min={1} max={50} step={1} onValueChange={setDistance} className="my-4" />
                    <div className="text-sm text-gray-500 text-right">{distance[0]} km</div>
                  </div>

                  <div>
                    <Label className="mb-2 block">Minimum Rating</Label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <Button
                          key={rating}
                          type="button"
                          variant={minRating >= rating ? "default" : "outline"}
                          size="sm"
                          className={minRating >= rating ? "bg-yellow-500 hover:bg-yellow-600" : ""}
                          onClick={() => setMinRating(rating)}
                        >
                          <Star className={`h-4 w-4 ${minRating >= rating ? "fill-white" : "fill-none"}`} />
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="available-now"
                        checked={availableNow}
                        onCheckedChange={(checked) => setAvailableNow(checked as boolean)}
                      />
                      <Label htmlFor="available-now" className="flex items-center">
                        <Clock className="mr-1 h-4 w-4" /> Available Now
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="skill-swap"
                        checked={skillSwap}
                        onCheckedChange={(checked) => setSkillSwap(checked as boolean)}
                      />
                      <Label htmlFor="skill-swap" className="flex items-center">
                        <RefreshCw className="mr-1 h-4 w-4" /> Open to Skill Swap
                      </Label>
                    </div>
                  </div>

                  <Button
                    onClick={() => fetchProviders()}
                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
                </div>
              ) : providers.length > 0 ? (
                <>
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                  >
                    {providers.map((provider) => (
                      <motion.div key={provider.id} variants={itemVariants}>
                        <ProviderCard provider={provider} />
                      </motion.div>
                    ))}
                  </motion.div>

                  {hasMore && (
                    <div className="mt-8 text-center">
                      <Button
                        onClick={handleLoadMore}
                        variant="outline"
                        className="border-purple-300 hover:bg-purple-50"
                      >
                        Load More
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-xl font-medium mb-2">No providers found</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your search criteria</p>
                  <Button
                    onClick={() => {
                      setSearchTerm("")
                      setLocation("")
                      setCategory("all")
                      setMinRating(0)
                      setAvailableNow(false)
                      setSkillSwap(false)
                      fetchProviders()
                    }}
                    variant="outline"
                  >
                    Reset Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
