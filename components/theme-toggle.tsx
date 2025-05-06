"use client"

import * as React from "react"
import { Moon, Sun, Sparkles } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // After mounting, we can show the toggle (prevents hydration mismatch)
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="w-9 h-9" />
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="relative overflow-hidden bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 shadow-sm hover:shadow-md transition-all duration-300 group"
        >
          <motion.div 
            className="absolute inset-0 bg-gradient-to-r from-purple-400/10 to-blue-400/10 dark:from-purple-700/20 dark:to-blue-700/20 opacity-0 group-hover:opacity-100 transition-all duration-300"
            initial={false}
            animate={{ y: ['-100%', '100%'] }}
            transition={{ 
              repeat: Infinity, 
              repeatType: 'mirror', 
              duration: 4,
              ease: "easeInOut" 
            }}
          />
          
          <motion.div
            className="absolute"
            initial={false}
            animate={{ 
              rotate: theme === 'dark' ? [0, 45] : [45, 0],
              scale: theme === 'dark' ? [1, 0] : [0, 1],
            }}
            transition={{ duration: 0.4 }}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] text-amber-500" />
          </motion.div>
          
          <motion.div
            className="absolute"
            initial={false}
            animate={{ 
              rotate: theme === 'dark' ? [90, 0] : [0, 90],
              scale: theme === 'dark' ? [0, 1] : [1, 0],
            }}
            transition={{ duration: 0.4 }}
          >
            <Moon className="h-[1.2rem] w-[1.2rem] text-blue-500" />
          </motion.div>
          
          <motion.div
            className="absolute"
            initial={false}
            animate={{
              opacity: theme === 'system' ? 1 : 0,
              scale: theme === 'system' ? 1 : 0.5,
            }}
          >
            <Sparkles className="h-[1.2rem] w-[1.2rem] text-purple-500" />
          </motion.div>
          
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="border-purple-200 dark:border-purple-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className="flex items-center gap-2 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/30 focus:bg-purple-50 dark:focus:bg-purple-900/30"
        >
          <div className="bg-amber-100 dark:bg-amber-900/30 p-1 rounded-full">
            <Sun className="h-4 w-4 text-amber-500" />
          </div>
          <span>Light</span>
          {theme === 'light' && (
            <motion.div 
              layoutId="activeIndicator"
              className="ml-auto h-1.5 w-1.5 rounded-full bg-purple-500"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
            />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className="flex items-center gap-2 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/30 focus:bg-purple-50 dark:focus:bg-purple-900/30"
        >
          <div className="bg-blue-100 dark:bg-blue-900/30 p-1 rounded-full">
            <Moon className="h-4 w-4 text-blue-500" />
          </div>
          <span>Dark</span>
          {theme === 'dark' && (
            <motion.div 
              layoutId="activeIndicator"
              className="ml-auto h-1.5 w-1.5 rounded-full bg-purple-500"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
            />
          )}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className="flex items-center gap-2 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/30 focus:bg-purple-50 dark:focus:bg-purple-900/30"
        >
          <div className="bg-purple-100 dark:bg-purple-900/30 p-1 rounded-full">
            <Sparkles className="h-4 w-4 text-purple-500" />
          </div>
          <span>System</span>
          {theme === 'system' && (
            <motion.div 
              layoutId="activeIndicator"
              className="ml-auto h-1.5 w-1.5 rounded-full bg-purple-500"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
            />
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}