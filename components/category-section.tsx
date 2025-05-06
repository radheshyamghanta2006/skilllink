"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { 
  BookOpen, Code, Home, Palette, Dumbbell, 
  Utensils, Music, Languages, LineChart, Globe, ArrowRight 
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface CategoryProps {
  icon: React.ReactNode
  name: string
  color: string
  darkColor: string
  hoverLight: string
  hoverDark: string
  count?: number
}

export function CategorySection() {
  const router = useRouter()

  const handleCategoryClick = (categoryName: string) => {
    router.push(`/explore?category=${categoryName}`)
  }

  const categories: CategoryProps[] = [
    {
      icon: <BookOpen className="h-6 w-6" />,
      name: "Education",
      color: "bg-blue-50 text-blue-700",
      darkColor: "dark:bg-blue-950/40 dark:text-blue-300",
      hoverLight: "group-hover:bg-blue-100 group-hover:text-blue-800",
      hoverDark: "dark:group-hover:bg-blue-900/50 dark:group-hover:text-blue-200",
      count: 142
    },
    {
      icon: <Code className="h-6 w-6" />,
      name: "Technology",
      color: "bg-purple-50 text-purple-700",
      darkColor: "dark:bg-purple-950/40 dark:text-purple-300",
      hoverLight: "group-hover:bg-purple-100 group-hover:text-purple-800",
      hoverDark: "dark:group-hover:bg-purple-900/50 dark:group-hover:text-purple-200",
      count: 89
    },
    {
      icon: <Home className="h-6 w-6" />,
      name: "Home & Garden",
      color: "bg-green-50 text-green-700",
      darkColor: "dark:bg-green-950/40 dark:text-green-300",
      hoverLight: "group-hover:bg-green-100 group-hover:text-green-800",
      hoverDark: "dark:group-hover:bg-green-900/50 dark:group-hover:text-green-200",
      count: 76
    },
    {
      icon: <Palette className="h-6 w-6" />,
      name: "Arts & Crafts",
      color: "bg-pink-50 text-pink-700",
      darkColor: "dark:bg-pink-950/40 dark:text-pink-300",
      hoverLight: "group-hover:bg-pink-100 group-hover:text-pink-800",
      hoverDark: "dark:group-hover:bg-pink-900/50 dark:group-hover:text-pink-200",
      count: 63
    },
    {
      icon: <Dumbbell className="h-6 w-6" />,
      name: "Fitness & Health",
      color: "bg-orange-50 text-orange-700",
      darkColor: "dark:bg-orange-950/40 dark:text-orange-300",
      hoverLight: "group-hover:bg-orange-100 group-hover:text-orange-800",
      hoverDark: "dark:group-hover:bg-orange-900/50 dark:group-hover:text-orange-200",
      count: 58
    },
    {
      icon: <Utensils className="h-6 w-6" />,
      name: "Cooking",
      color: "bg-red-50 text-red-700",
      darkColor: "dark:bg-red-950/40 dark:text-red-300",
      hoverLight: "group-hover:bg-red-100 group-hover:text-red-800",
      hoverDark: "dark:group-hover:bg-red-900/50 dark:group-hover:text-red-200",
      count: 51
    },
    {
      icon: <Music className="h-6 w-6" />,
      name: "Music",
      color: "bg-indigo-50 text-indigo-700",
      darkColor: "dark:bg-indigo-950/40 dark:text-indigo-300",
      hoverLight: "group-hover:bg-indigo-100 group-hover:text-indigo-800",
      hoverDark: "dark:group-hover:bg-indigo-900/50 dark:group-hover:text-indigo-200",
      count: 47
    },
    {
      icon: <Languages className="h-6 w-6" />,
      name: "Languages",
      color: "bg-yellow-50 text-yellow-700",
      darkColor: "dark:bg-yellow-950/40 dark:text-yellow-300",
      hoverLight: "group-hover:bg-yellow-100 group-hover:text-yellow-800",
      hoverDark: "dark:group-hover:bg-yellow-900/50 dark:group-hover:text-yellow-200",
      count: 39
    },
    {
      icon: <LineChart className="h-6 w-6" />,
      name: "Business",
      color: "bg-gray-50 text-gray-700",
      darkColor: "dark:bg-gray-800/60 dark:text-gray-300",
      hoverLight: "group-hover:bg-gray-100 group-hover:text-gray-800",
      hoverDark: "dark:group-hover:bg-gray-700/70 dark:group-hover:text-gray-200",
      count: 36
    },
    {
      icon: <Globe className="h-6 w-6" />,
      name: "Other",
      color: "bg-teal-50 text-teal-700",
      darkColor: "dark:bg-teal-950/40 dark:text-teal-300",
      hoverLight: "group-hover:bg-teal-100 group-hover:text-teal-800",
      hoverDark: "dark:group-hover:bg-teal-900/50 dark:group-hover:text-teal-200",
      count: 74
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    },
  }

  return (
    <section className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 relative">
        {/* Section heading */}
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent"
          >
            Browse Categories
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
          >
            Explore our diverse range of skill categories and find experts ready to share their knowledge
          </motion.p>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="h-1 w-16 bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-400 dark:to-blue-400 rounded-full mt-4 mx-auto"
          ></motion.div>
        </div>

        {/* Background decorative elements */}
        <div className="hidden md:block absolute -top-10 -left-20 w-64 h-64 bg-purple-100 dark:bg-purple-900/20 rounded-full blur-3xl opacity-30 pointer-events-none"></div>
        <div className="hidden md:block absolute -bottom-10 -right-20 w-72 h-72 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 relative z-10"
        >
          {categories.map((category) => (
            <motion.div
              key={category.name}
              variants={itemVariants}
              whileHover={{ 
                y: -6, 
                transition: { 
                  type: "spring", 
                  stiffness: 400, 
                  damping: 10 
                } 
              }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleCategoryClick(category.name)}
              className="group cursor-pointer"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md dark:shadow-gray-900/30 dark:hover:shadow-lg dark:hover:shadow-purple-900/20 transition-all duration-300 p-4 md:p-5 border border-gray-100 dark:border-gray-700/50 h-full flex flex-col items-center text-center">
                <div 
                  className={`rounded-full h-16 w-16 flex items-center justify-center mb-4 transition-colors duration-300 
                  ${category.color} ${category.darkColor} ${category.hoverLight} ${category.hoverDark}`}
                >
                  {category.icon}
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1.5 text-base group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  {category.count} {category.count === 1 ? "provider" : "providers"}
                </p>
                <div className="w-12 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-400 dark:to-blue-400 rounded mt-1 transform scale-0 group-hover:scale-100 transition-transform duration-300 opacity-90"></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <Button 
            onClick={() => router.push('/explore')}
            className="inline-flex items-center px-6 py-3 text-sm font-medium rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md hover:shadow-lg hover:from-purple-700 hover:to-blue-700 dark:from-purple-500 dark:to-blue-500 dark:hover:from-purple-600 dark:hover:to-blue-600 transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:ring-offset-2 dark:focus:ring-offset-gray-900 hover:scale-105"
          >
            View All Categories
            <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-300" />
          </Button>
        </motion.div>
      </div>
    </section>
  )
}
