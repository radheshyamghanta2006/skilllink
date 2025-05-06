"use client"

import React, { useRef, useState, useEffect, Suspense } from "react"
import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber"
import { OrbitControls, Environment, Float, PerspectiveCamera } from "@react-three/drei"
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import * as THREE from 'three'
import { motion } from "framer-motion"
import { useTheme } from "next-themes"
import { useRouter } from 'next/navigation'

// Scene initialization component to ensure proper context
function SceneInitializer() {
  const { scene, gl } = useThree()
  
  useEffect(() => {
    if (scene) {
      scene.fog = new THREE.Fog('#000000', 5, 15)
      gl.setClearColor('#000000', 0)
      
      return () => {
        scene.fog = null
      }
    }
  }, [scene, gl])
  
  return null
}

// Floating particles background with stable initialization
function Particles({ count = 50 }) {
  const { theme } = useTheme()
  const [isReady, setIsReady] = useState(false)
  
  // Create particles array immediately and store in state to maintain stability
  const particles = React.useMemo(() => {
    return Array.from({ length: count || 0 }, () => ({
      position: [
        Math.random() * 10 - 5,
        Math.random() * 10 - 5,
        Math.random() * 10 - 5
      ],
      size: Math.random() * 0.05 + 0.05
    }))
  }, [count])

  useEffect(() => {
    // Mark component as ready after mount
    setIsReady(true)
  }, [])

  if (!isReady || !particles) return null
  
  return (
    <>
      {particles.map((particle, i) => (
        <Float key={i} speed={2} rotationIntensity={0.5} floatIntensity={2}>
          <mesh position={particle.position as [number, number, number]}>
            <sphereGeometry args={[particle.size as number, 16, 16]} />
            <meshStandardMaterial 
              color={theme === "dark" ? "#6d28d9" : "#8b5cf6"} 
              emissive={theme === "dark" ? "#6d28d9" : "#8b5cf6"}
              emissiveIntensity={0.5}
              transparent
              opacity={0.7}
            />
          </mesh>
        </Float>
      ))}
    </>
  )
}

// Main torus knot component with animation
function TorusKnot() {
  const meshRef = useRef<THREE.Mesh>(null)
  const { theme } = useTheme()
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += 0.01
      meshRef.current.rotation.y += 0.005
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={2}>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <torusKnotGeometry args={[1, 0.3, 128, 32]} />
        <meshStandardMaterial 
          color={theme === "dark" ? "#8b5cf6" : "#6d28d9"} 
          roughness={0.5} 
          metalness={0.8}
        />
      </mesh>
    </Float>
  )
}

export function Hero3D() {
  const { theme } = useTheme()
  const [isLoaded, setIsLoaded] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Mark component as loaded after initial render
    setIsLoaded(true)
  }, [])

  const scrollToHowItWorks = () => {
    // Find the how-it-works section and scroll to it
    const howItWorksSection = document.getElementById('how-it-works')
    if (howItWorksSection) {
      howItWorksSection.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isLoaded ? 1 : 0 }}
      transition={{ duration: 1 }}
      className="w-full h-[70vh] relative overflow-hidden"
    >
      <Canvas shadows>
        <SceneInitializer />
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={75} />
        <ambientLight intensity={theme === "dark" ? 0.3 : 0.7} />
        <pointLight position={[10, 10, 10]} intensity={theme === "dark" ? 0.5 : 1} />
        <Suspense fallback={null}>
          <Particles count={30} />
          <TorusKnot />
          <Environment preset="city" />
        </Suspense>
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
      
      {/* Text overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center z-10 max-w-3xl px-6">
            <motion.h1 
            className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-red-500 bg-clip-text text-transparent"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: isLoaded ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            >
            Connect with Skilled Professionals
            </motion.h1>
          <motion.p 
            className="text-lg md:text-xl mb-8 text-foreground/80"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: isLoaded ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Find experts for any skill you need or share your expertise with others
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: isLoaded ? 1 : 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <button 
              className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all shadow-lg"
              onClick={() => router.push('/explore')}
            >
              Get Started
            </button>
            <button 
              className="px-8 py-3 rounded-full border-2 border-purple-600 text-foreground font-semibold hover:bg-purple-50 dark:hover:bg-gray-800 transform hover:scale-105 transition-all"
              onClick={scrollToHowItWorks}
            >
              Learn More
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}