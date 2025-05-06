"use client"

import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone, Send, ArrowRight, ChevronRight } from "lucide-react"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Footer() {
  const { theme } = useTheme()
  const isDark = theme === "dark"
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    },
  }

  return (
    <footer className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 border-t border-gray-200 dark:border-gray-800 transition-colors duration-300 overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 dark:bg-purple-900/10 rounded-full blur-3xl opacity-30 pointer-events-none translate-x-1/4 -translate-y-1/4"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-100 dark:bg-blue-900/10 rounded-full blur-3xl opacity-30 pointer-events-none -translate-x-1/4 translate-y-1/4"></div>
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10"
        >
          {/* Company Info */}
          <motion.div variants={itemVariants} className="space-y-6">
            <div className="flex items-center space-x-2">
              <div className="relative w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-500 dark:to-blue-500 rounded-lg p-1.5 shadow-lg">
                <Image 
                  src="/logo.png?height=32&width=32" 
                  alt="SkillLink Logo" 
                  fill 
                  className="object-contain" 
                />
              </div>
              <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-400 dark:to-blue-400 bg-clip-text text-transparent">
                SkillLink
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              A hyperlocal skill-exchange platform where users can register as Skill Seekers, Skill Providers—or both. Join our community and grow your skills today.
            </p>
            
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Connect with us</h4>
              <div className="flex space-x-3">
                <Link 
                  href="#" 
                  className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 p-2.5 rounded-full transition-all shadow-sm"
                  aria-label="Facebook"
                >
                  <motion.div whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}>
                    <Facebook size={18} />
                  </motion.div>
                </Link>
                <Link 
                  href="#" 
                  className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 p-2.5 rounded-full transition-all shadow-sm"
                  aria-label="Twitter"
                >
                  <motion.div whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}>
                    <Twitter size={18} />
                  </motion.div>
                </Link>
                <Link 
                  href="#" 
                  className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 p-2.5 rounded-full transition-all shadow-sm"
                  aria-label="Instagram"
                >
                  <motion.div whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}>
                    <Instagram size={18} />
                  </motion.div>
                </Link>
                <Link 
                  href="#" 
                  className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 p-2.5 rounded-full transition-all shadow-sm"
                  aria-label="LinkedIn"
                >
                  <motion.div whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}>
                    <Linkedin size={18} />
                  </motion.div>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Navigation Links */}
          <motion.div variants={itemVariants}>
            <h3 className="text-base font-bold mb-6 text-gray-800 dark:text-gray-100 flex items-center">
              <span className="w-6 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-400 dark:to-blue-400 rounded-full mr-2"></span>
              Navigation
            </h3>
            <ul className="space-y-3">
              {[
                { name: "Explore", href: "/explore" },
                { name: "How It Works", href: "/how-it-works" },
                { name: "About Us", href: "/about" },
                { name: "Pricing", href: "/pricing" },
                { name: "Blog", href: "/blog" }
              ].map((link, index) => (
                <li key={index} className="group flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-purple-500 dark:text-purple-400 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                  <Link href={link.href} className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support Links */}
          <motion.div variants={itemVariants}>
            <h3 className="text-base font-bold mb-6 text-gray-800 dark:text-gray-100 flex items-center">
              <span className="w-6 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-400 dark:to-blue-400 rounded-full mr-2"></span>
              Support
            </h3>
            <ul className="space-y-3">
              {[
                { name: "FAQ", href: "/faq" },
                { name: "Contact Us", href: "/contact" },
                { name: "Privacy Policy", href: "/privacy" },
                { name: "Terms of Service", href: "/terms" },
                { name: "Help Center", href: "/help" }
              ].map((link, index) => (
                <li key={index} className="group flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-purple-500 dark:text-purple-400 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-200" />
                  <Link href={link.href} className="text-sm text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info & Newsletter */}
          <motion.div variants={itemVariants}>
            <h3 className="text-base font-bold mb-6 text-gray-800 dark:text-gray-100 flex items-center">
              <span className="w-6 h-0.5 bg-gradient-to-r from-purple-500 to-blue-500 dark:from-purple-400 dark:to-blue-400 rounded-full mr-2"></span>
              Stay Updated
            </h3>
            <div className="space-y-5">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Subscribe to our newsletter for the latest updates and offers
              </p>
              <div className="flex space-x-2">
                <Input 
                  type="email" 
                  placeholder="Your email" 
                  className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-purple-500 dark:focus:border-purple-400"
                />
                <Button 
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 dark:from-purple-500 dark:to-blue-500 dark:hover:from-purple-600 dark:hover:to-blue-600 text-white"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="pt-4 space-y-3">
                <div className="flex items-start">
                  <Mail className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">support@skilllink.com</span>
                </div>
                <div className="flex items-start">
                  <Phone className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">(123) 456-7890</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-2 text-purple-600 dark:text-purple-400 mt-0.5" />
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    123 Skill Street, Talent City<br />TC 12345, United States
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 dark:border-gray-800/60 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-center text-gray-600 dark:text-gray-400 mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} SkillLink. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
              <Link href="/accessibility" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Accessibility
              </Link>
              <Link href="/cookies" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Cookie Policy
              </Link>
              <Link href="/sitemap" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Sitemap
              </Link>
              <Link href="/responsible-disclosure" className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                Security
              </Link>
            </div>
          </div>
        </div>
        
        {/* Back to Top Button */}
        <div className="flex justify-center mt-12">
          <motion.button
            whileHover={{ y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 p-3 rounded-full shadow-md border border-gray-200 dark:border-gray-700 transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
            aria-label="Back to top"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </motion.button>
        </div>
      </div>
    </footer>
  )
}
