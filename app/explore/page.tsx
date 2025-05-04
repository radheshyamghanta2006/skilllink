"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Search, MapPin, Star, Clock, RefreshCw, Info, User, Calendar, ArrowRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

type Skill = {
  id: string
  skill_name: string
  category: string
  description: string
  intent: string
  user_id: string
  created_at: string
  user: {
    id: string
    name: string
    profile_image: string
    location: string
  }
  rating?: number
  available_now?: boolean
  open_to_skill_swap?: boolean
}

export default function ExplorePage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClientComponentClient()

  const initialSkill = searchParams.get("skill") || ""
  const initialLocation = searchParams.get("location") || ""
  const initialCategory = searchParams.get("category") || "all"

  const [searchTerm, setSearchTerm] = useState(initialSkill)
  const [location, setLocation] = useState(initialLocation)
  const [category, setCategory] = useState(initialCategory)
  const [minRating, setMinRating] = useState(0)
  const [availableNow, setAvailableNow] = useState(false)
  const [skillSwap, setSkillSwap] = useState(false)
  const [distance, setDistance] = useState([5])
  const [skills, setSkills] = useState<Skill[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [intentFilter, setIntentFilter] = useState<string>("all") // "all", "provider", or "seeker"

  useEffect(() => {
    if (initialSkill) {
      setSearchTerm(initialSkill)
    }
    if (initialCategory !== "all") {
      setCategory(initialCategory)
    }
    fetchSkills()
  }, [initialSkill, initialLocation, initialCategory])

  const fetchSkills = async (reset = true) => {
    if (reset) {
      setLoading(true)
      setPage(1)
    }

    try {
      const currentPage = reset ? 1 : page
      const pageSize = 12
      const startRange = (currentPage - 1) * pageSize
      const endRange = startRange + pageSize - 1

      console.log("Fetching skills with params:", { 
        searchTerm, 
        category, 
        intentFilter, 
        location,
        skillSwap,
        page: currentPage
      });

      // Simplified query to just fetch skills first
      let query = supabase
        .from("skills")
        .select("*")
        .order("created_at", { ascending: false });
      
      // Apply filters
      if (searchTerm) {
        query = query.ilike("skill_name", `%${searchTerm}%`);
      }

      if (category !== "all") {
        query = query.eq("category", category);
      }

      if (intentFilter !== "all") {
        query = query.eq("intent", intentFilter);
      }

      // Apply pagination
      query = query.range(startRange, endRange);

      console.log("Executing skills query");
      const { data: skillsData, error: skillsError } = await query;

      if (skillsError) {
        console.error("Supabase skills query error:", skillsError);
        throw skillsError;
      }

      console.log("Skills query result:", skillsData?.length || 0, "items");

      // If no skills found, return early
      if (!skillsData || skillsData.length === 0) {
        setSkills([]);
        setHasMore(false);
        setLoading(false);
        return;
      }

      // Get unique user IDs from skills
      const userIds = [...new Set(skillsData.map(skill => skill.user_id))];
      
      // Fetch user information separately
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("*")
        .in("id", userIds);
      
      if (usersError) {
        console.error("Supabase users query error:", usersError);
      }

      // Create a map of users by ID for easy lookup
      const usersMap = (usersData || []).reduce((map, user) => {
        map[user.id] = user;
        return map;
      }, {});

      // Apply location filter client-side if specified
      let filteredSkills = skillsData;
      if (location && filteredSkills.length > 0) {
        filteredSkills = filteredSkills.filter(skill => {
          const user = usersMap[skill.user_id];
          return user && user.location && user.location.toLowerCase().includes(location.toLowerCase());
        });
      }

      // Apply skill swap filter client-side if specified
      if (skillSwap && filteredSkills.length > 0) {
        filteredSkills = filteredSkills.filter(skill => {
          const user = usersMap[skill.user_id];
          return user && user.open_to_skill_swap === true;
        });
      }

      // Check availability if needed
      if (availableNow && filteredSkills.length > 0) {
        const now = new Date();
        const today = now.toISOString().split("T")[0];
        const hours = now.getHours().toString().padStart(2, '0');
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const currentTime = `${hours}:${minutes}:00`;

        // For demo purposes, just mark some randomly as available
        // In a real app, you'd query the availability_slots table
        const availableUserIds = new Set();
        userIds.forEach(id => {
          if (Math.random() > 0.5) {
            availableUserIds.add(id);
          }
        });

        filteredSkills = filteredSkills.filter(skill => availableUserIds.has(skill.user_id));
      }

      // Get ratings data if needed
      let userRatings: Record<string, number> = {};
      if (minRating > 0 && filteredSkills.length > 0) {
        // For demo purposes, assign random ratings
        // In a real app, you'd query the reviews table
        userIds.forEach(id => {
          userRatings[id] = Math.floor(Math.random() * 5) + 1;
        });

        filteredSkills = filteredSkills.filter(skill => 
          (userRatings[skill.user_id] || 0) >= minRating
        );
      } else {
        // Assign random ratings for all users
        userIds.forEach(id => {
          userRatings[id] = Math.floor(Math.random() * 5) + 1;
        });
      }

      // Combine the data and add computed properties
      const combinedData = filteredSkills.map(skill => ({
        ...skill,
        user: usersMap[skill.user_id] || { 
          id: skill.user_id,
          name: "Unknown User",
          profile_image: null,
          location: ""
        },
        rating: userRatings[skill.user_id] || Math.floor(Math.random() * 5) + 1,
        available_now: availableNow,
        open_to_skill_swap: usersMap[skill.user_id]?.open_to_skill_swap || false
      }));

      console.log("Final combined data:", combinedData.length, "items");
      
      if (reset) {
        setSkills(combinedData);
      } else {
        setSkills(prev => [...prev, ...combinedData]);
      }
      
      setHasMore(filteredSkills.length === pageSize);
      setPage(currentPage + 1);
    } catch (error) {
      console.error("Error fetching skills:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchSkills()
  }

  const handleLoadMore = () => {
    fetchSkills(false)
  }

  const handleViewProfile = (userId: string) => {
    router.push(`/provider/${userId}`)
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
            <h1 className="text-3xl font-bold mb-6 text-center">Explore Skills</h1>
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
                        <SelectItem value="Education">Education</SelectItem>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Home & Garden">Home & Garden</SelectItem>
                        <SelectItem value="Arts & Crafts">Arts & Crafts</SelectItem>
                        <SelectItem value="Fitness & Health">Fitness & Health</SelectItem>
                        <SelectItem value="Cooking">Cooking</SelectItem>
                        <SelectItem value="Music">Music</SelectItem>
                        <SelectItem value="Languages">Languages</SelectItem>
                        <SelectItem value="Business">Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="mb-2 block">Skill Type</Label>
                    <Select value={intentFilter} onValueChange={setIntentFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select skill type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Skills</SelectItem>
                        <SelectItem value="provider">Skills People Provide</SelectItem>
                        <SelectItem value="seeker">Skills People Want to Learn</SelectItem>
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
                    onClick={() => fetchSkills()}
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
              ) : skills.length > 0 ? (
                <>
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {skills.map((skill) => (
                      <motion.div key={skill.id} variants={itemVariants}>
                        <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <span className="truncate">{skill.skill_name}</span>
                              <Badge 
                                className={
                                  skill.intent === "provider" 
                                    ? "bg-blue-100 text-blue-800" 
                                    : "bg-purple-100 text-purple-800"
                                }
                              >
                                {skill.intent === "provider" ? "Provider" : "Seeking"}
                              </Badge>
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              <Badge className="bg-gray-100 text-gray-800">{skill.category}</Badge>
                              {skill.available_now && (
                                <Badge className="bg-green-100 text-green-800">Available Now</Badge>
                              )}
                              {skill.open_to_skill_swap && (
                                <Badge className="bg-orange-100 text-orange-800">Skill Swap</Badge>
                              )}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="flex-grow">
                            <div className="mb-3 text-sm text-gray-600">
                              {skill.description || "No description provided"}
                            </div>
                            
                            <div className="flex items-center mt-4">
                              <Avatar className="h-8 w-8 mr-2">
                                <AvatarImage src={skill.user?.profile_image || "/placeholder-user.jpg"} alt={skill.user?.name || "User"} />
                                <AvatarFallback>{skill.user?.name?.charAt(0) || "U"}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{skill.user?.name || "Anonymous"}</div>
                                <div className="text-xs text-gray-500 flex items-center">
                                  {skill.user?.location && (
                                    <>
                                      <MapPin className="h-3 w-3 mr-1" />
                                      {skill.user.location}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center mt-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= (skill.rating || 0) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                                  }`}
                                />
                              ))}
                              <span className="text-xs text-gray-500 ml-1">({skill.rating || 0})</span>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button 
                              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                              onClick={() => handleViewProfile(skill.user_id)}
                            >
                              View Profile <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                          </CardFooter>
                        </Card>
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
                  <h3 className="text-xl font-medium mb-2">No skills found</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your search criteria</p>
                  <Button
                    onClick={() => {
                      setSearchTerm("")
                      setLocation("")
                      setCategory("all")
                      setMinRating(0)
                      setAvailableNow(false)
                      setSkillSwap(false)
                      setIntentFilter("all")
                      fetchSkills()
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
