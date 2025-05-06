"use client"

import React, { useRef, useEffect } from "react"
import { Canvas, useFrame, useLoader } from "@react-three/fiber"
import { OrbitControls, Environment, Float, PerspectiveCamera, Gltf } from "@react-three/drei"
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as THREE from 'three';
import { motion } from "framer-motion"
import { useTheme } from "next-themes"

// Animated 3D Model component (currently unused)
function AnimatedModel({ path, position = [0, 0, 0], scale = 1, rotation = [0, 0, 0] }: { path: string; position?: [number, number, number]; scale?: number; rotation?: [number, number, number] }) {
  const gltf = useLoader(GLTFLoader, path)
  const meshRef = useRef<THREE.Object3D>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1
    }
  })

  return (
    <primitive 
      ref={meshRef}
      object={(gltf).scene} 
      position={position}
      scale={scale}
      rotation={rotation}
    />
  )
}

// Floating particles background
function Particles({ count = 50 }) {
  const particles = useRef<{ position: [number, number, number]; size: number }[]>([])
  const { theme } = useTheme()
  
  useEffect(() => {
    particles.current = Array.from({ length: count }, () => ({
      position: [
        Math.random() * 10 - 5,
        Math.random() * 10 - 5,
        Math.random() * 10 - 5
      ],
      size: Math.random() * 0.05 + 0.05
    }))
  }, [count])
  
  return (
    <>
      {particles.current.map((particle, i) => (
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

export function Hero3D() {
  const { theme } = useTheme()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="w-full h-[70vh] relative overflow-hidden"
    >
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={75} />
        <ambientLight intensity={theme === "dark" ? 0.3 : 0.7} />
        <pointLight position={[10, 10, 10]} intensity={theme === "dark" ? 0.5 : 1} />
        <Particles count={30} />
        
        {/* Replace these placeholder models with actual models when available */}
        <Float speed={2} rotationIntensity={0.5} floatIntensity={2}>
          <mesh position={[0, 0, 0]}>
            <torusKnotGeometry args={[1, 0.3, 128, 32]} />
            <meshStandardMaterial 
              color={theme === "dark" ? "#8b5cf6" : "#6d28d9"} 
              roughness={0.5} 
              metalness={0.8}
            />
          </mesh>
        </Float>
        
        <Environment preset="city" />
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
            className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            Connect with Skilled Professionals
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl mb-8 text-foreground/80"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            Find experts for any skill you need or share your expertise with others
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row justify-center gap-4"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          >
            <button className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all shadow-lg">
              Get Started
            </button>
            <button className="px-8 py-3 rounded-full border-2 border-purple-600 text-foreground font-semibold hover:bg-purple-50 dark:hover:bg-gray-800 transform hover:scale-105 transition-all">
              Learn More
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}