import { createClient } from "@supabase/supabase-js"

export async function seedDatabase(supabaseUrl: string, supabaseKey: string) {
  // This function should be run with the service role key
  try {
    console.log("Creating Supabase client with service role key...")
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // Verify connection by checking if we can access users
    try {
      const { error: connectionTest } = await supabase.from("users").select("count").limit(1)
      if (connectionTest) {
        console.error("Connection test failed:", connectionTest.message)
        return { 
          success: false, 
          error: "Database connection failed", 
          details: connectionTest.message 
        }
      }
      console.log("Database connection successful!")
    } catch (err) {
      console.error("Connection test error:", err)
      return { 
        success: false, 
        error: "Failed to connect to database", 
        details: err instanceof Error ? err.message : String(err) 
      }
    }

    console.log("Starting database seeding...")
    const results = {
      users: [] as string[],
      skills: [] as string[],
      slots: [] as string[],
      bookings: [] as string[],
      reviews: [] as string[],
      messages: [] as string[],
      flags: [] as string[],
    }

    // Create users in auth system first with more diverse data
    const users = [
      {
        email: "john.smith@example.com",
        password: "password123",
        userData: {
          name: "John Smith",
          role: "both",
          current_mode: "provider",
          profile_image: "/placeholder.svg?height=200&width=200",
          bio: "Full-stack developer with 5+ years of experience. Specializing in React, Node.js, and cloud architecture. Also passionate about photography and cooking.",
          location: "New York, NY",
          phone: "+1-555-0101",
          distance: 10,
        },
      },
      {
        email: "alice.johnson@example.com",
        password: "password123",
        userData: {
          name: "Alice Johnson",
          role: "seeker",
          profile_image: "/placeholder.svg?height=200&width=200",
          bio: "Marketing professional looking to learn new skills. Interested in expanding my technical knowledge and creative abilities.",
          location: "San Francisco, CA",
          phone: "+1-555-0102",
          distance: 5,
        },
      },
      {
        email: "bob.williams@example.com",
        password: "password123",
        userData: {
          name: "Bob Williams",
          role: "provider",
          profile_image: "/placeholder.svg?height=200&width=200",
          bio: "Certified yoga instructor with 10+ years of experience. Also skilled in meditation, wellness coaching, and nutrition planning.",
          location: "Los Angeles, CA",
          phone: "+1-555-0103",
          distance: 8,
        },
      },
      {
        email: "emma.davis@example.com",
        password: "password123",
        userData: {
          name: "Emma Davis",
          role: "both",
          current_mode: "seeker",
          profile_image: "/placeholder.svg?height=200&width=200",
          bio: "Professional photographer and amateur chef. Love teaching creative skills and learning new technologies.",
          location: "Chicago, IL",
          phone: "+1-555-0104",
          distance: 15,
        },
      },
      {
        email: "carlos.rodriguez@example.com",
        password: "password123",
        userData: {
          name: "Carlos Rodriguez",
          role: "provider",
          profile_image: "/placeholder.svg?height=200&width=200",
          bio: "Native Spanish speaker and certified language teacher. 8 years experience teaching Spanish and English. Also skilled in guitar and music production.",
          location: "Miami, FL",
          phone: "+1-555-0105",
          distance: 12,
        },
      },
      {
        email: "sarah.chen@example.com",
        password: "password123",
        userData: {
          name: "Sarah Chen",
          role: "both",
          current_mode: "provider",
          profile_image: "/placeholder.svg?height=200&width=200",
          bio: "Data scientist and AI researcher. PhD in Machine Learning. Passionate about teaching data science and learning creative arts.",
          location: "Seattle, WA",
          phone: "+1-555-0106",
          distance: 7,
        },
      },
      {
        email: "mike.thompson@example.com",
        password: "password123",
        userData: {
          name: "Mike Thompson",
          role: "seeker",
          profile_image: "/placeholder.svg?height=200&width=200",
          bio: "Small business owner looking to expand my digital skills. Interested in web development, digital marketing, and design.",
          location: "Austin, TX",
          phone: "+1-555-0107",
          distance: 20,
        },
      },
      {
        email: "linda.patel@example.com",
        password: "password123",
        userData: {
          name: "Linda Patel",
          role: "provider",
          profile_image: "/placeholder.svg?height=200&width=200",
          bio: "Professional chef specializing in Indian and Mediterranean cuisine. 15 years in culinary arts. Also teach baking and pastry making.",
          location: "Denver, CO",
          phone: "+1-555-0108",
          distance: 6,
        },
      },
      {
        email: "alex.kim@example.com",
        password: "password123",
        userData: {
          name: "Alex Kim",
          role: "both",
          current_mode: "provider",
          profile_image: "/placeholder.svg?height=200&width=200",
          bio: "UX/UI designer with a background in psychology. Love teaching design thinking and learning about emerging technologies.",
          location: "Portland, OR",
          phone: "+1-555-0109",
          distance: 9,
        },
      },
      {
        email: "michael.brown@example.com",
        password: "password123",
        userData: {
          name: "Michael Brown",
          role: "admin",
          profile_image: "/placeholder.svg?height=200&width=200",
          bio: "Platform administrator and community manager. Former software engineer with expertise in system administration.",
          location: "Austin, TX",
          phone: "+1-555-0110",
          distance: 5,
        },
      },
    ]

    const createdUsers: Record<string, string> = {}

    // Create users in auth system and then in the users table
    for (const user of users) {
      try {
        // Create user in auth system
        console.log(`Creating auth user ${user.email}...`)
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
        })

        if (authError) {
          console.error(`Error creating auth user ${user.email}:`, authError)
          results.users.push(`Failed to create ${user.email}: ${authError.message}`)
          continue
        }

        const userId = authUser.user.id
        console.log(`Auth user created with ID: ${userId}`)

        // Store the user ID for later use
        createdUsers[user.email] = userId

        // Insert user data into users table
        console.log(`Creating user profile for ${user.email}...`)
        const { error: userError } = await supabase.from("users").insert([
          {
            id: userId,
            email: user.email,
            ...user.userData,
          },
        ])

        if (userError) {
          console.error(`Error inserting user data for ${user.email}:`, userError)
          results.users.push(`Failed to create profile for ${user.email}: ${userError.message}`)
        } else {
          console.log(`Created user profile: ${user.email}`)
          results.users.push(`Created user: ${user.email}`)
        }
      } catch (error) {
        console.error(`Unexpected error creating user ${user.email}:`, error)
        results.users.push(`Error with ${user.email}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    // Add skills for users with more comprehensive data
    const skills = [
      {
        user_email: "john.smith@example.com",
        skills: [
          {
            skill_name: "React Development",
            category: "Technology",
            intent: "provider",
            description: "Advanced React development including hooks, context, and performance optimization.",
          },
          {
            skill_name: "Node.js Backend",
            category: "Technology",
            intent: "provider",
            description: "Building scalable backend services with Express, MongoDB, and PostgreSQL.",
          },
          {
            skill_name: "Cloud Architecture",
            category: "Technology",
            intent: "provider",
            description: "AWS and Azure cloud infrastructure design and deployment.",
          },
          {
            skill_name: "Photography",
            category: "Arts & Crafts",
            intent: "seeker",
            description: "Interested in learning portrait and landscape photography techniques.",
          },
        ],
      },
      {
        user_email: "alice.johnson@example.com",
        skills: [
          {
            skill_name: "Digital Marketing",
            category: "Business",
            intent: "provider",
            description: "Social media marketing, SEO, and content strategy for small businesses.",
          },
          {
            skill_name: "Web Development",
            category: "Technology",
            intent: "seeker",
            description: "Learning HTML, CSS, and JavaScript fundamentals.",
          },
          {
            skill_name: "Data Analysis",
            category: "Technology",
            intent: "seeker",
            description: "Interested in learning Excel, Python for data analysis.",
          },
        ],
      },
      {
        user_email: "bob.williams@example.com",
        skills: [
          {
            skill_name: "Hatha Yoga",
            category: "Fitness",
            intent: "provider",
            description: "Traditional Hatha yoga for beginners to advanced practitioners.",
          },
          {
            skill_name: "Vinyasa Yoga",
            category: "Fitness",
            intent: "provider",
            description: "Dynamic flow sequences connecting breath with movement.",
          },
          {
            skill_name: "Meditation",
            category: "Fitness",
            intent: "provider",
            description: "Mindfulness meditation and stress reduction techniques.",
          },
          {
            skill_name: "Nutrition Planning",
            category: "Fitness",
            intent: "provider",
            description: "Personalized nutrition plans for wellness and fitness goals.",
          },
        ],
      },
      {
        user_email: "emma.davis@example.com",
        skills: [
          {
            skill_name: "Portrait Photography",
            category: "Arts & Crafts",
            intent: "provider",
            description: "Professional portrait photography and photo editing.",
          },
          {
            skill_name: "Food Photography",
            category: "Arts & Crafts",
            intent: "provider",
            description: "Specialized in food styling and restaurant photography.",
          },
          {
            skill_name: "Baking",
            category: "Cooking",
            intent: "provider",
            description: "Artisan bread baking and pastry making techniques.",
          },
          {
            skill_name: "React Development",
            category: "Technology",
            intent: "seeker",
            description: "Learning modern web development with React.",
          },
        ],
      },
      {
        user_email: "carlos.rodriguez@example.com",
        skills: [
          {
            skill_name: "Spanish Language",
            category: "Languages",
            intent: "provider",
            description: "Native Spanish speaker offering conversational and business Spanish lessons.",
          },
          {
            skill_name: "English as Second Language",
            category: "Languages",
            intent: "provider",
            description: "ESL instruction for Spanish speakers.",
          },
          {
            skill_name: "Guitar Lessons",
            category: "Music",
            intent: "provider",
            description: "Acoustic and classical guitar for beginners to intermediate.",
          },
          {
            skill_name: "Music Production",
            category: "Music",
            intent: "provider",
            description: "Digital audio workstation (DAW) training and music production.",
          },
        ],
      },
      {
        user_email: "sarah.chen@example.com",
        skills: [
          {
            skill_name: "Machine Learning",
            category: "Technology",
            intent: "provider",
            description: "Python-based machine learning and AI model development.",
          },
          {
            skill_name: "Data Science",
            category: "Technology",
            intent: "provider",
            description: "Statistical analysis, data visualization, and predictive modeling.",
          },
          {
            skill_name: "Python Programming",
            category: "Technology",
            intent: "provider",
            description: "Advanced Python programming for data science and automation.",
          },
          {
            skill_name: "Watercolor Painting",
            category: "Arts & Crafts",
            intent: "seeker",
            description: "Interested in learning traditional watercolor techniques.",
          },
        ],
      },
      {
        user_email: "mike.thompson@example.com",
        skills: [
          {
            skill_name: "Small Business Management",
            category: "Business",
            intent: "provider",
            description: "15 years experience in small business operations and strategy.",
          },
          {
            skill_name: "Web Development",
            category: "Technology",
            intent: "seeker",
            description: "Learning to build websites for my business.",
          },
          {
            skill_name: "Social Media Marketing",
            category: "Business",
            intent: "seeker",
            description: "Want to improve my social media presence.",
          },
          {
            skill_name: "Graphic Design",
            category: "Design",
            intent: "seeker",
            description: "Learning design tools for marketing materials.",
          },
        ],
      },
      {
        user_email: "linda.patel@example.com",
        skills: [
          {
            skill_name: "Indian Cuisine",
            category: "Cooking",
            intent: "provider",
            description: "Authentic regional Indian dishes and spice blending.",
          },
          {
            skill_name: "Mediterranean Cooking",
            category: "Cooking",
            intent: "provider",
            description: "Healthy Mediterranean diet recipes and techniques.",
          },
          {
            skill_name: "Pastry Making",
            category: "Cooking",
            intent: "provider",
            description: "French pastry techniques and dessert preparation.",
          },
          {
            skill_name: "Food Styling",
            category: "Arts & Crafts",
            intent: "provider",
            description: "Professional food presentation and styling for photography.",
          },
        ],
      },
      {
        user_email: "alex.kim@example.com",
        skills: [
          {
            skill_name: "UX Design",
            category: "Design",
            intent: "provider",
            description: "User experience design and research methodologies.",
          },
          {
            skill_name: "UI Design",
            category: "Design",
            intent: "provider",
            description: "Interface design and prototyping with Figma and Sketch.",
          },
          {
            skill_name: "Design Thinking",
            category: "Design",
            intent: "provider",
            description: "Human-centered design process and innovation workshops.",
          },
          {
            skill_name: "Swift Programming",
            category: "Technology",
            intent: "seeker",
            description: "Learning iOS app development with Swift.",
          },
        ],
      },
    ]

    // Add skills for each user
    for (const userSkills of skills) {
      const userId = createdUsers[userSkills.user_email]
      if (!userId) continue

      for (const skill of userSkills.skills) {
        const { error } = await supabase.from("skills").insert([
          {
            user_id: userId,
            ...skill,
          },
        ])

        if (error) {
          console.error(`Error adding skill ${skill.skill_name} for ${userSkills.user_email}:`, error)
        } else {
          console.log(`Added skill ${skill.skill_name} for ${userSkills.user_email}`)
          results.skills.push(`Added skill ${skill.skill_name} for ${userSkills.user_email}`)
        }
      }
    }

    // Add availability slots
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dayAfterTomorrow = new Date(today)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2)
    const threeDaysLater = new Date(today)
    threeDaysLater.setDate(threeDaysLater.getDate() + 3)

    const formatDate = (date: Date) => {
      return date.toISOString().split("T")[0]
    }

    const availabilitySlots = [
      {
        user_email: "john@example.com",
        slots: [
          { date: formatDate(today), start_time: "09:00:00", end_time: "10:00:00", is_available: true },
          { date: formatDate(today), start_time: "11:00:00", end_time: "12:00:00", is_available: true },
          { date: formatDate(tomorrow), start_time: "14:00:00", end_time: "15:00:00", is_available: true },
        ],
      },
      {
        user_email: "bob@example.com",
        slots: [
          { date: formatDate(today), start_time: "08:00:00", end_time: "09:00:00", is_available: true },
          { date: formatDate(today), start_time: "17:00:00", end_time: "18:00:00", is_available: true },
          { date: formatDate(dayAfterTomorrow), start_time: "08:00:00", end_time: "09:00:00", is_available: true },
        ],
      },
      {
        user_email: "emma@example.com",
        slots: [
          { date: formatDate(tomorrow), start_time: "10:00:00", end_time: "11:00:00", is_available: true },
          { date: formatDate(threeDaysLater), start_time: "15:00:00", end_time: "16:00:00", is_available: true },
        ],
      },
    ]

    // Add availability slots for each user
    for (const userSlots of availabilitySlots) {
      const userId = createdUsers[userSlots.user_email]
      if (!userId) continue

      for (const slot of userSlots.slots) {
        const { error } = await supabase.from("availability_slots").insert([
          {
            provider_id: userId,
            ...slot,
          },
        ])

        if (error) {
          console.error(`Error adding availability slot for ${userSlots.user_email}:`, error)
        } else {
          console.log(`Added availability slot for ${userSlots.user_email}`)
          results.slots.push(`Added slot for ${userSlots.user_email}`)
        }
      }
    }

    // Create bookings
    const johnId = createdUsers["john@example.com"]
    const aliceId = createdUsers["alice@example.com"]
    const bobId = createdUsers["bob@example.com"]
    const emmaId = createdUsers["emma@example.com"]

    if (johnId && aliceId && bobId && emmaId) {
      // Get slot IDs
      const { data: johnSlots } = await supabase
        .from("availability_slots")
        .select("id")
        .eq("provider_id", johnId)
        .limit(2)

      const { data: bobSlots } = await supabase.from("availability_slots").select("id").eq("provider_id", bobId).limit(1)

      if (johnSlots && johnSlots.length >= 2 && bobSlots && bobSlots.length >= 1) {
        const bookings = [
          {
            seeker_id: aliceId,
            provider_id: johnId,
            slot_id: johnSlots[0].id,
            date: formatDate(today),
            start_time: "09:00:00",
            end_time: "10:00:00",
            service_name: "Web Development Session",
            notes: "Looking forward to learning React basics.",
            status: "confirmed",
            payment_status: "paid",
            payment_amount: 50.0,
            is_skill_swap: false,
          },
          {
            seeker_id: aliceId,
            provider_id: bobId,
            slot_id: bobSlots[0].id,
            date: formatDate(today),
            start_time: "08:00:00",
            end_time: "09:00:00",
            service_name: "Morning Yoga Session",
            notes: "First time trying yoga, please be gentle.",
            status: "completed",
            payment_status: "paid",
            payment_amount: 30.0,
            is_skill_swap: false,
          },
          {
            seeker_id: emmaId,
            provider_id: johnId,
            slot_id: johnSlots[1].id,
            date: formatDate(today),
            start_time: "11:00:00",
            end_time: "12:00:00",
            service_name: "Web Development Basics",
            notes: "Interested in learning HTML and CSS.",
            status: "pending",
            payment_status: "pending",
            payment_amount: 50.0,
            is_skill_swap: true,
          },
        ]

        for (const booking of bookings) {
          const { data, error } = await supabase.from("bookings").insert([booking]).select()

          if (error) {
            console.error(`Error creating booking:`, error)
          } else if (data) {
            console.log(`Created booking: ${data[0].id}`)
            results.bookings.push(`Created booking: ${data[0].id}`)

            // If the booking is completed, add reviews
            if (booking.status === "completed") {
              const bookingId = data[0].id

              // Add reviews for completed bookings
              const reviews = [
                {
                  booking_id: bookingId,
                  reviewer_id: aliceId,
                  reviewee_id: bobId,
                  provider_id: bobId,
                  seeker_id: aliceId,
                  rating: 5,
                  comment: "Bob is an excellent yoga instructor! Very patient and knowledgeable.",
                },
                {
                  booking_id: bookingId,
                  reviewer_id: bobId,
                  reviewee_id: aliceId,
                  provider_id: bobId,
                  seeker_id: aliceId,
                  rating: 4,
                  comment: "Alice was attentive and eager to learn. Great student!",
                },
              ]

              for (const review of reviews) {
                const { error: reviewError } = await supabase.from("reviews").insert([review])

                if (reviewError) {
                  console.error(`Error creating review:`, reviewError)
                } else {
                  console.log(`Created review for booking ${bookingId}`)
                  results.reviews.push(`Created review for booking ${bookingId}`)
                }
              }
            }
          }
        }
      }

      // Add messages
      const messages = [
        {
          sender_id: aliceId,
          recipient_id: johnId,
          content: "Hi John, I'm interested in your web development services.",
          is_read: true,
        },
        {
          sender_id: johnId,
          recipient_id: aliceId,
          content: "Hello Alice! What specific areas are you looking to learn about?",
          is_read: true,
        },
        {
          sender_id: aliceId,
          recipient_id: johnId,
          content: "I'd like to learn React and build a personal portfolio website.",
          is_read: true,
        },
        {
          sender_id: emmaId,
          recipient_id: johnId,
          content:
            "Hi John, would you be interested in a skill swap? I can teach you photography in exchange for web development lessons.",
          is_read: false,
        },
      ]

      for (const message of messages) {
        const { error } = await supabase.from("messages").insert([message])

        if (error) {
          console.error(`Error creating message:`, error)
        } else {
          console.log(`Created message from ${message.sender_id} to ${message.recipient_id}`)
          results.messages.push(`Message from ${message.sender_id} to ${message.recipient_id}`)
        }
      }

      // Add admin flag
      const michaelId = createdUsers["michael@example.com"]
      if (michaelId) {
        // Get a review ID
        const { data: reviews } = await supabase.from("reviews").select("id").limit(1)

        if (reviews && reviews.length > 0) {
          const { error } = await supabase.from("admin_flags").insert([
            {
              type: "review",
              item_id: reviews[0].id,
              reason: "Suspicious review - may be fake",
              status: "pending",
              created_by: michaelId,
            },
          ])

          if (error) {
            console.error(`Error creating admin flag:`, error)
          } else {
            console.log(`Created admin flag`)
            results.flags.push(`Created admin flag for review ID ${reviews[0].id}`)
          }
        }
      }
    }

    console.log("Database seeding completed!")
    return { 
      success: true,
      results,
      createdUsers: Object.keys(createdUsers).length
    }
  } catch (error) {
    console.error("Fatal error during database seeding:", error)
    return { 
      success: false, 
      error: "Fatal error during seeding", 
      details: error instanceof Error ? error.message : String(error)
    }
  }
}
