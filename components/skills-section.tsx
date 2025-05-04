"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Trash2, Award, RefreshCw } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const skillCategories = [
  "Education",
  "Technology",
  "Home & Garden",
  "Arts & Crafts",
  "Fitness & Health",
  "Cooking",
  "Music",
  "Languages",
  "Business",
]

type SkillsSectionProps = {
  user: any
}

export function SkillsSection({ user }: SkillsSectionProps) {
  const [skills, setSkills] = useState<any[]>([])
  const [newSkill, setNewSkill] = useState({
    skill_name: "",
    category: "",
    intent: "provider",
    description: "",
  })
  const [isAddingSkill, setIsAddingSkill] = useState(false)
  const [skillSwapEnabled, setSkillSwapEnabled] = useState(true)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Fetch user's skills when component mounts
    if (user?.id) {
      fetchUserSkills(user.id)
    }
  }, [user])

  const fetchUserSkills = async (userId: string) => {
    setLoading(true)
    try {
      console.log("Fetching skills for user:", userId)
      const { data, error } = await supabase
        .from('skills')
        .select('*')
        .eq('provider_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error("Error fetching skills:", error)
        throw error
      }

      console.log("Fetched skills:", data)
      setSkills(data || [])
    } catch (error: any) {
      console.error("Error fetching skills:", error)
      toast({
        title: "Error",
        description: "Failed to load your skills.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newSkill.skill_name || !newSkill.category || !user?.id) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      
      // Use the API endpoint instead of direct Supabase client
      const response = await fetch('/api/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newSkill.skill_name,
          category: newSkill.category,
          description: newSkill.description,
          intent: newSkill.intent,
          duration: 60
        }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to add skill')
      }
      
      // Update local state with the new skill
      if (result.skill) {
        setSkills([result.skill, ...skills])
      }

      // Reset form
      setNewSkill({
        skill_name: "",
        category: "",
        intent: "provider",
        description: "",
      })

      setIsAddingSkill(false)

      toast({
        title: "Skill added",
        description: "Your skill has been added successfully.",
      })
    } catch (error: any) {
      console.error("Error adding skill:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to add skill.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteSkill = async (skillId: string) => {
    try {
      // Use the API endpoint to delete the skill
      const response = await fetch(`/api/skills?id=${skillId}`, {
        method: 'DELETE',
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete skill')
      }

      // Update local state
      setSkills(skills.filter((skill) => skill.id !== skillId))

      toast({
        title: "Skill deleted",
        description: "Your skill has been deleted successfully.",
      })
    } catch (error: any) {
      console.error("Error deleting skill:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete skill.",
        variant: "destructive",
      })
    }
  }

  const handleSkillSwapToggle = async (enabled: boolean) => {
    try {
      // Update user preferences in database
      const { error } = await supabase
        .from('users')
        .update({ open_to_skill_swap: enabled })
        .eq('id', user.id)

      if (error) throw error
      
      setSkillSwapEnabled(enabled)

      toast({
        title: enabled ? "Skill swap enabled" : "Skill swap disabled",
        description: enabled
          ? "You are now open to skill swap opportunities."
          : "You are no longer open to skill swap opportunities.",
      })
    } catch (error: any) {
      console.error("Error updating skill swap preference:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to update skill swap preference.",
        variant: "destructive",
      })
    }
  }

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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Skills</h2>
        <Button
          onClick={() => setIsAddingSkill(true)}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          disabled={isAddingSkill}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Skill
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Skill Swap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-5 w-5 text-green-600" />
                <h3 className="font-medium">Open to Skill Swap</h3>
              </div>
              <p className="text-sm text-gray-500">
                Enable this option to show that you're interested in exchanging skills instead of monetary payment.
              </p>
            </div>
            <Switch checked={skillSwapEnabled} onCheckedChange={handleSkillSwapToggle} />
          </div>
        </CardContent>
      </Card>

      {isAddingSkill && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Skill</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddSkill} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="skill_name">Skill Name</Label>
                    <Input
                      id="skill_name"
                      value={newSkill.skill_name}
                      onChange={(e) => setNewSkill({ ...newSkill, skill_name: e.target.value })}
                      placeholder="e.g., Web Development, Piano Lessons"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newSkill.category}
                      onValueChange={(value) => setNewSkill({ ...newSkill, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {skillCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>I want to</Label>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      variant={newSkill.intent === "provider" ? "default" : "outline"}
                      className={newSkill.intent === "provider" ? "bg-blue-600 hover:bg-blue-700" : ""}
                      onClick={() => setNewSkill({ ...newSkill, intent: "provider" })}
                    >
                      Provide this skill
                    </Button>
                    <Button
                      type="button"
                      variant={newSkill.intent === "seeker" ? "default" : "outline"}
                      className={newSkill.intent === "seeker" ? "bg-purple-600 hover:bg-purple-700" : ""}
                      onClick={() => setNewSkill({ ...newSkill, intent: "seeker" })}
                    >
                      Learn this skill
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Input
                    id="description"
                    value={newSkill.description}
                    onChange={(e) => setNewSkill({ ...newSkill, description: e.target.value })}
                    placeholder="Briefly describe your experience or what you're looking for"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddingSkill(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  >
                    Add Skill
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Skills You Provide</CardTitle>
            </CardHeader>
            <CardContent>
              {skills.filter((skill) => skill.is_active).length > 0 ? (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                  {skills
                    .filter((skill) => skill.is_active)
                    .map((skill) => (
                      <motion.div
                        key={skill.id}
                        variants={itemVariants}
                        className="flex items-start justify-between p-3 border rounded-md"
                      >
                        <div className="flex items-start space-x-3">
                          <Award className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-medium">{skill.name}</h3>
                              <Badge className="ml-2 bg-blue-100 text-blue-800">{skill.category}</Badge>
                            </div>
                            {skill.description && <p className="text-sm text-gray-500 mt-1">{skill.description}</p>}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteSkill(skill.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                </motion.div>
              ) : (
                <p className="text-gray-500">No skills provided yet.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Skills You Want to Learn</CardTitle>
            </CardHeader>
            <CardContent>
              {skills.filter((skill) => !skill.is_active).length > 0 ? (
                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                  {skills
                    .filter((skill) => !skill.is_active)
                    .map((skill) => (
                      <motion.div
                        key={skill.id}
                        variants={itemVariants}
                        className="flex items-start justify-between p-3 border rounded-md"
                      >
                        <div className="flex items-start space-x-3">
                          <Award className="h-5 w-5 text-purple-600 mt-0.5" />
                          <div>
                            <div className="flex items-center">
                              <h3 className="font-medium">{skill.name}</h3>
                              <Badge className="ml-2 bg-purple-100 text-purple-800">{skill.category}</Badge>
                            </div>
                            {skill.description && <p className="text-sm text-gray-500 mt-1">{skill.description}</p>}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteSkill(skill.id)}
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    ))}
                </motion.div>
              ) : (
                <p className="text-gray-500">No skills you want to learn yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

type TimeSlotModalProps = {
  date?: Date
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
}

export function TimeSlotModal({ date, isOpen, onClose, onSubmit }: TimeSlotModalProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(date || new Date())
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("10:00")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedDate) {
      return
    }

    onSubmit({
      date: format(selectedDate, "yyyy-MM-dd"),
      start_time: `${startTime}:00`,
      end_time: `${endTime}:00`,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Time Slot</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md border"
                disabled={(date) => {
                  const today = new Date()
                  today.setHours(0, 0, 0, 0)
                  return date < today
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input
                  id="start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input
                  id="end-time"
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              Add Slot
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
