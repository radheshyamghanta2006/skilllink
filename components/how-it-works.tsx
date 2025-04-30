"use client"

import { motion } from "framer-motion"
import { Search, Calendar, CreditCard, Star } from "lucide-react"

const steps = [
  {
    icon: <Search className="h-10 w-10" />,
    title: "Find Skills",
    description: "Search for skills in your area based on your needs and preferences.",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: <Calendar className="h-10 w-10" />,
    title: "Book a Session",
    description: "Choose a convenient time slot and book a session with your selected provider.",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: <CreditCard className="h-10 w-10" />,
    title: "Pay Securely",
    description: "Pay online or in-person using our secure payment system.",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: <Star className="h-10 w-10" />,
    title: "Leave a Review",
    description: "Share your experience and help others find great skill providers.",
    color: "bg-yellow-100 text-yellow-600",
  },
]

export function HowItWorks() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
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
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How SkillLink Works</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Our platform makes it easy to connect with skilled individuals in your community
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {steps.map((step, index) => (
            <motion.div key={step.title} variants={itemVariants}>
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <div className={`${step.color} p-5 rounded-full`}>{step.icon}</div>
                  <div className="absolute top-0 right-0 -mr-3 -mt-3 bg-white rounded-full border-2 border-purple-600 w-8 h-8 flex items-center justify-center font-bold text-purple-600">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Connecting lines between steps (visible on desktop) */}
        <div className="hidden lg:block relative h-0">
          <div className="absolute top-[-120px] left-[25%] w-[50%] border-t-2 border-dashed border-gray-300"></div>
        </div>
      </div>
    </section>
  )
}
