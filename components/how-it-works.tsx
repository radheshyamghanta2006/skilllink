"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { SearchIcon, Calendar, RefreshCw, Star } from "lucide-react"

export function HowItWorks() {
  const [activeTab, setActiveTab] = useState(0)
  const [isClient, setIsClient] = useState(false)

  // Handle SSR rendering of animations
  useEffect(() => {
    setIsClient(true)
  }, [])

  const steps = [
    {
      icon: <SearchIcon className="h-6 w-6" />,
      title: "Find a Skill",
      description: "Browse our extensive catalog of skills offered by professionals in your area. Filter by category, rating, and availability.",
      image: "/placeholder.svg?height=300&width=400",
      color: "from-blue-500 to-blue-600",
      darkColor: "dark:from-blue-400 dark:to-blue-500",
      bgColor: "bg-blue-50 dark:bg-blue-950/30"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "Book a Session",
      description: "Choose a time that works for you and book directly through our platform. Secure, easy, and instant confirmation.",
      image: "/placeholder.svg?height=300&width=400",
      color: "from-purple-500 to-purple-600",
      darkColor: "dark:from-purple-400 dark:to-purple-500",
      bgColor: "bg-purple-50 dark:bg-purple-950/30"
    },
    {
      icon: <RefreshCw className="h-6 w-6" />,
      title: "Swap Skills",
      description: "Exchange your expertise with others. Learn something new while teaching what you know best.",
      image: "/placeholder.svg?height=300&width=400",
      color: "from-emerald-500 to-emerald-600",
      darkColor: "dark:from-emerald-400 dark:to-emerald-500",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/30"
    },
    {
      icon: <Star className="h-6 w-6" />,
      title: "Leave a Review",
      description: "Share your experience with the community. Help others find the best skill providers in town.",
      image: "/placeholder.svg?height=300&width=400",
      color: "from-amber-500 to-amber-600",
      darkColor: "dark:from-amber-400 dark:to-amber-500",
      bgColor: "bg-amber-50 dark:bg-amber-950/30"
    }
  ]

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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    },
  }

  const contentVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
    exit: { opacity: 0, x: 20, transition: { duration: 0.3 } }
  }

  return (
    <section id="how-it-works" className="py-20 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-500 dark:to-blue-500"></div>
      <div className="absolute top-10 right-10 h-32 w-32 bg-purple-200 dark:bg-purple-900/20 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
      <div className="absolute bottom-10 left-10 h-48 w-48 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-40 pointer-events-none"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
            How SkillLink Works
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Connect with skilled professionals or offer your expertise in a few simple steps
          </p>
          <div className="h-1 w-20 bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-400 dark:to-blue-400 mx-auto mt-6 rounded-full"></div>
        </motion.div>

        {/* Desktop View - Only shown on lg screens and up */}
        <div className="hidden lg:grid grid-cols-2 gap-12 items-center">
          {/* Tabs and content for larger screens */}
          <div>
            {isClient && (
              <AnimatePresence mode="wait">
                <motion.div 
                  key={activeTab}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={contentVariants}
                  className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors duration-300 ${steps[activeTab].bgColor}`}
                >
                  <div className="aspect-w-4 aspect-h-3 relative">
                    <Image 
                      src={steps[activeTab].image} 
                      alt={steps[activeTab].title} 
                      fill 
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                      <div className="p-6 text-white">
                        <div className={`inline-flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-r ${steps[activeTab].color} ${steps[activeTab].darkColor} mb-4 shadow-lg`}>
                          {steps[activeTab].icon}
                        </div>
                        <h3 className="text-2xl font-bold">{steps[activeTab].title}</h3>
                      </div>
                    </div>
                  </div>
                  <div className="p-8">
                    <p className="text-gray-600 dark:text-gray-300 text-lg">
                      {steps[activeTab].description}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            )}
          </div>

          {/* Step indicators for desktop */}
          <div>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-6"
            >
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    flex cursor-pointer p-5 rounded-xl 
                    ${index === activeTab 
                      ? `bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700 ${step.bgColor}` 
                      : "hover:bg-white/60 dark:hover:bg-gray-800/50"
                    }
                    transition-all duration-300
                  `}
                  onClick={() => setActiveTab(index)}
                  role="button"
                  tabIndex={0}
                  aria-selected={index === activeTab}
                >
                  <div className={`
                    h-14 w-14 rounded-full flex items-center justify-center flex-shrink-0 mr-5 shadow-md
                    transition-all duration-300
                    ${index === activeTab 
                      ? `bg-gradient-to-r ${step.color} ${step.darkColor} text-white` 
                      : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    }
                  `}>
                    {step.icon}
                  </div>
                  <div className="flex-grow">
                    <h3 className={`font-bold text-lg mb-1 transition-colors duration-300 ${index === activeTab ? "text-gray-800 dark:text-gray-100" : "text-gray-700 dark:text-gray-300"}`}>
                      {step.title}
                    </h3>
                    <p className={`${index === activeTab ? "text-gray-600 dark:text-gray-300" : "text-gray-500 dark:text-gray-400"}`}>
                      {step.description}
                    </p>
                  </div>
                  <div className="ml-auto flex items-start">
                    <div className={`
                      h-7 w-7 rounded-full flex items-center justify-center border-2 text-sm font-bold transition-all duration-300
                      ${index === activeTab 
                        ? "border-purple-600 dark:border-purple-400 bg-purple-600 dark:bg-purple-400 text-white scale-110" 
                        : "border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500"
                      }
                    `}>
                      {index + 1}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
          
        {/* Mobile View - Only shown on screens smaller than lg */}
        <div className="block lg:hidden">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {steps.map((step, index) => (
              <motion.div 
                key={index} 
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className={`bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-100 dark:border-gray-700 ${step.bgColor}`}
              >
                <div className="flex items-start mb-4">
                  <div className={`h-12 w-12 rounded-full flex items-center justify-center mr-4 bg-gradient-to-r ${step.color} ${step.darkColor} text-white shadow-md`}>
                    {step.icon}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">{step.title}</h3>
                  <div className="ml-auto">
                    <div className="h-7 w-7 rounded-full flex items-center justify-center border-2 text-sm font-bold border-purple-600 dark:border-purple-400 text-purple-600 dark:text-purple-400">
                      {index + 1}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300">{step.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
