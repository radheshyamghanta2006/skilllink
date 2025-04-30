"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin } from "lucide-react"

export function HeroSection() {
  const [searchTerm, setSearchTerm] = useState("")
  const [location, setLocation] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams()
    if (searchTerm) params.append("skill", searchTerm)
    if (location) params.append("location", location)

    router.push(`/explore?${params.toString()}`)
  }

  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-blue-50 z-0"></div>

      {/* Animated shapes */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 rounded-full bg-purple-200 opacity-20"
          animate={{
            y: [0, 30, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-blue-200 opacity-20"
          animate={{
            y: [0, -40, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
        <motion.div
          className="absolute top-40 right-1/4 w-40 h-40 rounded-full bg-pink-200 opacity-20"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 7,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Connect with{" "}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                local skills
              </span>{" "}
              in your community
            </h1>
            <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
              Find skilled people nearby or share your expertise with others. Exchange knowledge, learn new skills, and
              build connections.
            </p>

            <form onSubmit={handleSearch} className="max-w-md mx-auto lg:mx-0">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
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

            <div className="flex flex-wrap justify-center lg:justify-start gap-2 text-sm text-gray-500">
              <span>Popular:</span>
              <Button
                variant="link"
                className="p-0 h-auto text-purple-600"
                onClick={() => {
                  setSearchTerm("Cooking")
                  router.push("/explore?skill=Cooking")
                }}
              >
                Cooking
              </Button>
              <Button
                variant="link"
                className="p-0 h-auto text-purple-600"
                onClick={() => {
                  setSearchTerm("Programming")
                  router.push("/explore?skill=Programming")
                }}
              >
                Programming
              </Button>
              <Button
                variant="link"
                className="p-0 h-auto text-purple-600"
                onClick={() => {
                  setSearchTerm("Yoga")
                  router.push("/explore?skill=Yoga")
                }}
              >
                Yoga
              </Button>
              <Button
                variant="link"
                className="p-0 h-auto text-purple-600"
                onClick={() => {
                  setSearchTerm("Language")
                  router.push("/explore?skill=Language")
                }}
              >
                Language
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="relative h-[400px] md:h-[500px] w-full">
              <Image
                src="/placeholder.svg?height=500&width=600"
                alt="People exchanging skills"
                fill
                className="object-cover rounded-lg shadow-xl"
              />
            </div>

            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <Image src="/placeholder.svg?height=48&width=48" alt="User avatar" fill className="object-cover" />
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="font-medium">Sarah T.</span>
                    <div className="flex ml-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 24 24">
                          <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">"Found an amazing guitar teacher in my neighborhood!"</p>
                </div>
              </div>
            </div>

            <div className="absolute -top-6 -right-6 bg-white p-4 rounded-lg shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden">
                  <Image src="/placeholder.svg?height=48&width=48" alt="User avatar" fill className="object-cover" />
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="font-medium">Michael R.</span>
                    <div className="flex ml-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <svg key={star} className="w-4 h-4 text-yellow-500 fill-current" viewBox="0 0 24 24">
                          <path d="M12 17.27L18.18 21L16.54 13.97L22 9.24L14.81 8.63L12 2L9.19 8.63L2 9.24L7.46 13.97L5.82 21L12 17.27Z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">"Teaching coding and learning photography in exchange!"</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
