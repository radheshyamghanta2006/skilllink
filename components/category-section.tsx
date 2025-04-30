"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Palette, Code, BookOpen, Home, Dumbbell, Music, Languages, Utensils, Briefcase } from "lucide-react"

const categories = [
  {
    name: "Arts & Crafts",
    icon: <Palette className="h-8 w-8" />,
    color: "bg-red-100 text-red-600",
    query: "arts",
  },
  {
    name: "Technology",
    icon: <Code className="h-8 w-8" />,
    color: "bg-blue-100 text-blue-600",
    query: "technology",
  },
  {
    name: "Education",
    icon: <BookOpen className="h-8 w-8" />,
    color: "bg-yellow-100 text-yellow-600",
    query: "education",
  },
  {
    name: "Home & Garden",
    icon: <Home className="h-8 w-8" />,
    color: "bg-green-100 text-green-600",
    query: "home",
  },
  {
    name: "Fitness & Health",
    icon: <Dumbbell className="h-8 w-8" />,
    color: "bg-purple-100 text-purple-600",
    query: "fitness",
  },
  {
    name: "Music",
    icon: <Music className="h-8 w-8" />,
    color: "bg-pink-100 text-pink-600",
    query: "music",
  },
  {
    name: "Languages",
    icon: <Languages className="h-8 w-8" />,
    color: "bg-indigo-100 text-indigo-600",
    query: "language",
  },
  {
    name: "Cooking",
    icon: <Utensils className="h-8 w-8" />,
    color: "bg-orange-100 text-orange-600",
    query: "cooking",
  },
  {
    name: "Business",
    icon: <Briefcase className="h-8 w-8" />,
    color: "bg-gray-100 text-gray-600",
    query: "business",
  },
]

export function CategorySection() {
  const router = useRouter()

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
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Explore Skills by Category</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover skilled individuals in your area across various categories
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4"
        >
          {categories.map((category) => (
            <motion.div key={category.name} variants={itemVariants}>
              <Card
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => router.push(`/explore?category=${category.query}`)}
              >
                <CardContent className="p-6 flex flex-col items-center text-center">
                  <div className={`${category.color} p-4 rounded-full mb-4`}>{category.icon}</div>
                  <h3 className="font-medium">{category.name}</h3>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
