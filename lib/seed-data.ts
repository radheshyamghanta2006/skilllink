import { createClient } from "@supabase/supabase-js"

// This is a utility function to seed the database with initial data
// It would typically be run once during development or deployment

export async function seedDatabase(supabaseUrl: string, supabaseKey: string) {
  const supabase = createClient(supabaseUrl, supabaseKey)

  // Sample categories for skills
  const skillCategories = [
    "Technology",
    "Design",
    "Music",
    "Cooking",
    "Fitness",
    "Languages",
    "Academic",
    "Arts & Crafts",
    "Business",
    "Home Improvement",
  ]

  // Sample skills for each category
  const skillsByCategory: Record<string, string[]> = {
    Technology: ["Web Development", "Mobile App Development", "Data Science", "Machine Learning", "Cybersecurity"],
    Design: ["Graphic Design", "UI/UX Design", "Interior Design", "Fashion Design", "Logo Design"],
    Music: ["Guitar Lessons", "Piano Lessons", "Vocal Training", "Music Production", "DJ Skills"],
    Cooking: ["Baking", "Italian Cuisine", "Vegan Cooking", "Pastry Making", "BBQ Techniques"],
    Fitness: ["Yoga", "Personal Training", "Nutrition Advice", "Meditation", "CrossFit"],
    Languages: ["English Tutoring", "Spanish Lessons", "French Lessons", "Mandarin Chinese", "Japanese"],
    Academic: ["Math Tutoring", "Science Help", "Essay Writing", "History Lessons", "Test Preparation"],
    "Arts & Crafts": ["Painting", "Pottery", "Knitting", "Photography", "Jewelry Making"],
    Business: ["Marketing Strategy", "Financial Planning", "Public Speaking", "Resume Writing", "Sales Techniques"],
    "Home Improvement": ["Carpentry", "Plumbing", "Electrical Work", "Gardening", "Interior Decoration"],
  }

  return { skillCategories, skillsByCategory }
}
