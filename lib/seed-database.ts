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

    // Create users in auth system first
    const users = [
      {
        email: "john@example.com",
        password: "password123",
        userData: {
          name: "John Smith",
          role: "both",
          current_mode: "provider",
          profile_image: "/placeholder.svg?height=200&width=200",
          bio: "Experienced web developer with 5+ years of experience in React and Node.js.",
          location: "New York, NY",
        },
      },
      {
        email: "alice@example.com",
        password: "password123",
        userData: {
          name: "Alice Johnson",
          role: "seeker",
          profile_image: "/placeholder.svg?height=200&width=200",
          bio: "Looking to learn new skills and expand my horizons.",
          location: "San Francisco, CA",
        },
      },
      {
        email: "bob@example.com",
        password: "password123",
        userData: {
          name: "Bob Williams",
          role: "provider",
          profile_image: "/placeholder.svg?height=200&width=200",
          bio: "Certified yoga instructor with 10+ years of experience.",
          location: "Los Angeles, CA",
        },
      },
      {
        email: "emma@example.com",
        password: "password123",
        userData: {
          name: "Emma Davis",
          role: "both",
          current_mode: "seeker",
          profile_image: "/placeholder.svg?height=200&width=200",
          bio: "Professional photographer and amateur cook looking to exchange skills.",
          location: "Chicago, IL",
        },
      },
      {
        email: "michael@example.com",
        password: "password123",
        userData: {
          name: "Michael Brown",
          role: "admin",
          profile_image: "/placeholder.svg?height=200&width=200",
          bio: "Platform administrator and community manager.",
          location: "Austin, TX",
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

    // Add skills for users
    const skills = [
      {
        user_email: "john@example.com",
        skills: [
          {
            skill_name: "Web Development",
            category: "Technology",
            intent: "provider",
            description: "Full-stack web development with React, Node.js, and MongoDB.",
          },
          {
            skill_name: "Mobile App Development",
            category: "Technology",
            intent: "provider",
            description: "iOS and Android app development with React Native.",
          },
          {
            skill_name: "Cooking",
            category: "Cooking",
            intent: "seeker",
            description: "Interested in learning Italian cuisine.",
          },
        ],
      },
      {
        user_email: "bob@example.com",
        skills: [
          {
            skill_name: "Yoga",
            category: "Fitness",
            intent: "provider",
            description: "Hatha and Vinyasa yoga for all levels.",
          },
          {
            skill_name: "Meditation",
            category: "Fitness",
            intent: "provider",
            description: "Mindfulness meditation techniques for stress reduction.",
          },
        ],
      },
      {
        user_email: "emma@example.com",
        skills: [
          {
            skill_name: "Photography",
            category: "Arts & Crafts",
            intent: "provider",
            description: "Portrait and landscape photography.",
          },
          { skill_name: "Cooking", category: "Cooking", intent: "provider", description: "Baking and pastry making." },
          {
            skill_name: "Web Development",
            category: "Technology",
            intent: "seeker",
            description: "Interested in learning front-end development.",
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
