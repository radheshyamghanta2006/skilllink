"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { motion, useAnimation, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Sparkles, Star } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { TextPlugin } from "gsap/TextPlugin"
import { useTheme } from "next-themes"

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, TextPlugin)
}

export function HeroSection() {
  const [searchTerm, setSearchTerm] = useState("")
  const [location, setLocation] = useState("")
  const router = useRouter()
  const heroRef = useRef<HTMLElement>(null)
  const textRef = useRef<HTMLHeadingElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const testimonial1Ref = useRef<HTMLDivElement>(null)
  const testimonial2Ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(heroRef, { once: false, margin: "-100px" })
  const controls = useAnimation()
  const { theme } = useTheme()

  // Text animation variants
  const textVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const letterVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 }
    },
  }

  // Bubble variants for floating elements
  const bubbleVariants = {
    float: {
      y: [0, -15, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: "reverse" as const,
        ease: "easeInOut",
      },
    },
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams()
    if (searchTerm) params.append("skill", searchTerm)
    if (location) params.append("location", location)

    router.push(`/explore?${params.toString()}`)
  }

  // Initialize animations when component mounts
  useEffect(() => {
    if (typeof window === "undefined") return

    // GSAP animations for the hero section
    const ctx = gsap.context(() => {
      // Create a floating animation for the background shapes
      gsap.to(".floating-shape", {
        y: -20,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
        stagger: 0.2,
      })

      // Animate the title with text reveal
      if (textRef.current) {
        const element = textRef.current;
        const splitText = element.innerText.split(" ");
        element.innerHTML = "";
        
        splitText.forEach((word: string, index: number) => {
          const wordSpan = document.createElement("span");
          wordSpan.innerHTML = word + (index < splitText.length - 1 ? " " : "");
          wordSpan.classList.add("word-reveal");
          wordSpan.style.display = "inline-block";
          element.appendChild(wordSpan);
        });
        
        gsap.from(".word-reveal", {
          opacity: 0, 
          y: 20,
          duration: 0.8,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: heroRef.current,
            start: "top 80%"
          }
        });
      }

      // Fancy entrance for the form
      gsap.from(formRef.current, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        delay: 0.8,
        ease: "back.out(1.7)",
      })

      // Parallax effect for the image
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        onUpdate: (self) => {
          if (imageRef.current) {
            gsap.to(imageRef.current, {
              y: self.progress * 50,
              duration: 0.5,
              ease: "none",
            })
          }
        },
      })

      // Testimonial animations
      gsap.from([testimonial1Ref.current, testimonial2Ref.current], {
        scale: 0.8,
        opacity: 0,
        duration: 0.6,
        stagger: 0.3,
        delay: 1,
        ease: "elastic.out(1, 0.5)",
      })
    }, heroRef)

    return () => ctx.revert() // Cleanup animation context
  }, [])

  // Animation based on scroll position
  useEffect(() => {
    if (isInView) {
      controls.start("visible")
    } else {
      controls.start("hidden")
    }
  }, [controls, isInView])

  return (
    <section ref={heroRef} className="relative py-20 overflow-hidden min-h-screen flex items-center bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/10 dark:to-blue-950/10 z-0 transition-colors duration-500"></div>

      {/* Enhanced animated shapes with GSAP */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="floating-shape absolute top-20 left-10 w-64 h-64 rounded-full bg-purple-200 dark:bg-purple-800/20 opacity-20 dark:opacity-30 transition-colors duration-500"></div>
        <div className="floating-shape absolute bottom-20 right-10 w-80 h-80 rounded-full bg-blue-200 dark:bg-blue-800/20 opacity-20 dark:opacity-30 transition-colors duration-500"></div>
        <div className="floating-shape absolute top-40 right-1/4 w-40 h-40 rounded-full bg-pink-200 dark:bg-pink-800/20 opacity-20 dark:opacity-30 transition-colors duration-500"></div>
        
        {/* Added more shapes for visual interest */}
        <div className="floating-shape absolute top-1/3 left-1/4 w-20 h-20 rounded-full bg-yellow-200 dark:bg-yellow-700/20 opacity-20 dark:opacity-30 transition-colors duration-500"></div>
        <div className="floating-shape absolute bottom-1/4 left-1/3 w-32 h-32 rounded-full bg-green-200 dark:bg-green-800/20 opacity-15 dark:opacity-30 transition-colors duration-500"></div>
        
        {/* Animated dots pattern */}
        <div className="absolute inset-0 opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 rounded-full transition-colors duration-500"
              style={{
                top: `${Math.random() * 100}%`, 
                left: `${Math.random() * 100}%`,
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                repeatType: "reverse",
              }}
            />
          ))}
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            animate={controls}
            variants={textVariants}
            className="text-center lg:text-left"
          >
            <h1 
              ref={textRef}
              className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gray-800 dark:text-white transition-colors duration-300"
            >
              Connect with{" "}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent relative transition-colors duration-300">
                local skills
                <motion.div
                  className="absolute -right-8 -top-8"
                  animate={{ rotate: [0, 20, 0, -20, 0] }}
                  transition={{ duration: 5, repeat: Infinity }}
                >
                  <Sparkles className="text-yellow-400 dark:text-yellow-300" size={24} />
                </motion.div>
              </span>{" "}
              in your community
            </h1>
            
            <motion.p 
              variants={letterVariants}
              className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-lg mx-auto lg:mx-0 transition-colors duration-300"
            >
              Find skilled people nearby or share your expertise with others. Exchange knowledge, learn new skills, and
              build connections.
            </motion.p>

            <motion.form 
              ref={formRef}
              onSubmit={handleSearch} 
              className="max-w-md mx-auto lg:mx-0"
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { 
                  opacity: 1, 
                  y: 0,
                  transition: { 
                    duration: 0.6, 
                    ease: "easeOut",
                    delay: 0.4
                  }
                }
              }}
            >
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <motion.div 
                  className="flex-1 relative"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    type="text"
                    placeholder="What skill are you looking for?"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-500 transition-all bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  />
                </motion.div>
                <motion.div 
                  className="flex-1 relative"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    type="text"
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="pl-10 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500 transition-all bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                  />
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 dark:from-purple-500 dark:to-blue-500 dark:hover:from-purple-600 dark:hover:to-blue-600 text-white transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Search
                  </Button>
                </motion.div>
              </div>
            </motion.form>

            {/* Popular search terms section */}
            <motion.div 
              className="flex flex-wrap justify-center lg:justify-start gap-2 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300"
              variants={letterVariants}
            >
              <motion.span
                animate={{ 
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse" as const,
                  ease: "easeInOut"
                }}
              >
                Popular:
              </motion.span>
              {["Cooking", "Programming", "Yoga", "Language"].map((skill, index) => (
                <motion.div
                  key={skill}
                  whileHover={{ scale: 1.1 }} 
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + (index * 0.1) }}
                >
                  <Button
                    variant="link"
                    className="p-0 h-auto text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
                    onClick={() => {
                      setSearchTerm(skill)
                      router.push(`/explore?skill=${skill}`)
                    }}
                  >
                    {skill}
                  </Button>
                </motion.div>
              ))}
            </motion.div>
            
            {/* Added trusted by section */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1 }}
              className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800 hidden md:block transition-colors duration-300"
            >
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 transition-colors duration-300">
                Trusted by communities across:
              </p>
              <div className="flex flex-wrap items-center gap-6 justify-center lg:justify-start opacity-70">
                {["New York", "San Francisco", "London", "Berlin", "Tokyo"].map((city, i) => (
                  <motion.span 
                    key={city}
                    className="text-sm font-medium text-gray-600 dark:text-gray-300 transition-colors duration-300"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.6 + (i * 0.1) }}
                  >
                    {city}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            ref={imageRef}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            <motion.div 
              className="relative h-[400px] md:h-[500px] w-full"
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <Image
                src="https://wallpaperaccess.com/full/19690.jpg"
                alt="People exchanging skills"
                fill
                className="object-cover rounded-lg shadow-xl"
                style={{ filter: "drop-shadow(0 25px 25px rgba(0,0,0,0.15))" }}
              />
              
              {/* Glass overlay for dark mode */}
              <div className="absolute inset-0 bg-black/0 dark:bg-black/20 rounded-lg transition-colors duration-500"></div>
              
              {/* Floating elements around the image */}
              <motion.div
                className="absolute -top-10 -left-10 bg-white dark:bg-gray-800 p-3 rounded-full shadow-lg border border-gray-100 dark:border-gray-700 transition-colors duration-300"
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 1.2, type: "spring" }}
              >
                <Sparkles className="text-yellow-500 dark:text-yellow-400" size={24} />
              </motion.div>
              
              <motion.div
                className="absolute top-1/4 -right-6 bg-gradient-to-br from-purple-500 to-blue-500 dark:from-purple-600 dark:to-blue-600 p-3 rounded-full shadow-lg transition-colors duration-300"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.4, type: "spring" }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" className="text-white">
                    <path fill="currentColor" d="M12 2L4.5 20.3L5.5 21L12 18L18.5 21L19.5 20.3L12 2Z" />
                  </svg>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Testimonial box 1 */}
            <motion.div
              ref={testimonial1Ref}
              className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 transition-colors duration-300"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
              variants={bubbleVariants}
              animate="float"
            >
              <div className="flex items-center space-x-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-purple-100 dark:border-purple-900">
                  <Image src="/placeholder.svg?height=48&width=48" alt="User avatar" fill className="object-cover" />
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-800 dark:text-gray-100 transition-colors duration-300">Sarah T.</span>
                    <div className="flex ml-2">
                      {Array.from({ length: 5 }).map((_, star) => (
                        <Star 
                          key={star} 
                          className="w-3.5 h-3.5 text-yellow-500 dark:text-yellow-400 fill-current transition-colors duration-300" 
                          fill="currentColor"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-300 transition-colors duration-300">
                    "Found an amazing guitar teacher in my neighborhood!"
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Testimonial box 2 */}
            <motion.div
              ref={testimonial2Ref}
              className="absolute -top-6 -right-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 transition-colors duration-300"
              whileHover={{ scale: 1.05, boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}
              variants={bubbleVariants}
              animate="float"
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatType: "reverse" as const,
                ease: "easeInOut",
                delay: 1
              }}
            >
              <div className="flex items-center space-x-3">
                <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-blue-100 dark:border-blue-900">
                  <Image src="/placeholder.svg?height=48&width=48" alt="User avatar" fill className="object-cover" />
                </div>
                <div>
                  <div className="flex items-center">
                    <span className="font-medium text-gray-800 dark:text-gray-100 transition-colors duration-300">Michael R.</span>
                    <div className="flex ml-2">
                      {Array.from({ length: 5 }).map((_, star) => (
                        <Star
                          key={star} 
                          className="w-3.5 h-3.5 text-yellow-500 dark:text-yellow-400 fill-current transition-colors duration-300" 
                          fill="currentColor"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-300 transition-colors duration-300">
                    "Teaching coding and learning photography in exchange!"
                  </p>
                </div>
              </div>
            </motion.div>
            
            {/* Added stat highlight */}
            <motion.div
              className="absolute bottom-14 right-6 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-500 dark:to-blue-500 p-3 rounded-lg shadow-lg transition-colors duration-300 text-white"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.6, type: "spring" }}
            >
              <p className="text-sm font-medium">Join 10,000+ members</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
