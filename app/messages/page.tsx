"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { Send, Search } from "lucide-react"

export default function MessagesPage() {
  const [user, setUser] = useState<any>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [activeConversation, setActiveConversation] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  // Get the user query parameter from the URL
  useEffect(() => {
    // Extract user ID from URL query parameter
    const urlParams = new URLSearchParams(window.location.search)
    const userIdFromUrl = urlParams.get('user')
    
    if (userIdFromUrl && user && !activeConversation) {
      console.log("Found user ID in URL:", userIdFromUrl)
      // Try to find this user in conversations
      const foundConversation = conversations.find(conv => conv.id === userIdFromUrl)
      
      if (foundConversation) {
        // If the user is in the conversations list, set as active
        setActiveConversation(foundConversation)
      } else if (user) {
        // If not found but we have our user, fetch the user details and create a new conversation
        fetchUserDetails(userIdFromUrl)
      }
    }
  }, [conversations, user]) // Run when conversations or user changes

  // Function to fetch user details for a new conversation
  const fetchUserDetails = async (userId: string) => {
    if (!userId) return
    
    try {
      // First check if this user is already in the conversations list
      // This prevents duplicate entries that could cause React key errors
      if (conversations.some(conv => conv.id === userId)) {
        const existingConversation = conversations.find(conv => conv.id === userId)
        setActiveConversation(existingConversation)
        return
      }
      
      const { data, error } = await supabase
        .from("users")
        .select("id, name, profile_image")
        .eq("id", userId)
        .single()
        
      if (error) throw error
      
      if (data) {
        // Create a new conversation object
        const newConversation = {
          id: data.id,
          name: data.name,
          profile_image: data.profile_image,
          last_message: null,
          last_message_time: null
        }
        
        // Set as active conversation
        setActiveConversation(newConversation)
        
        // Add to conversations list if not already there
        setConversations(prevConversations => [...prevConversations, newConversation])
      }
    } catch (error) {
      console.error("Error fetching user details:", error)
      toast({
        title: "Error",
        description: "Failed to load user information.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push("/login")
        return
      }

      try {
        const { data, error } = await supabase.from("users").select("*").eq("id", session.user.id).single()

        if (error) throw error

        setUser(data)
        fetchConversations(data.id)
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to load user profile.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [])

  useEffect(() => {
    if (activeConversation && user) {
      fetchMessages(activeConversation.id)

      // Subscribe to new messages
      const channel = supabase
        .channel(`messages:${activeConversation.id}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `recipient_id=eq.${user.id}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new])
          },
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [activeConversation, user])

  // Only scroll to bottom when messages change AND there are messages to scroll to
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages])

  const fetchConversations = async (userId: string) => {
    try {
      // Get all users that the current user has exchanged messages with
      const { data: sentMessages, error: sentError } = await supabase
        .from("messages")
        .select("recipient_id")
        .eq("sender_id", userId)

      const { data: receivedMessages, error: receivedError } = await supabase
        .from("messages")
        .select("sender_id")
        .eq("recipient_id", userId)

      if (sentError || receivedError) throw sentError || receivedError

      // Create unique userIds using Set
      const userIds = new Set([
        ...(sentMessages?.map((msg) => msg.recipient_id) || []),
        ...(receivedMessages?.map((msg) => msg.sender_id) || []),
      ])

      if (userIds.size === 0) {
        setConversations([])
        return
      }

      // Get user details for each conversation partner
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, name, profile_image")
        .in("id", Array.from(userIds))

      if (usersError) throw usersError

      if (!users || users.length === 0) {
        setConversations([])
        return
      }

      // Get last message for each conversation to display in the list
      const enhancedConversations = await Promise.all(
        users.map(async (conversationPartner) => {
          // Get the most recent message for this conversation
          const { data: lastMessage, error: messageError } = await supabase
            .from("messages")
            .select("*")
            .or(`and(sender_id.eq.${userId},recipient_id.eq.${conversationPartner.id}),and(sender_id.eq.${conversationPartner.id},recipient_id.eq.${userId})`)
            .order("created_at", { ascending: false })
            .limit(1)
            .single()

          if (messageError) {
            console.error("Error fetching last message:", messageError)
            return {
              ...conversationPartner,
              last_message: null,
              last_message_time: null
            }
          }

          return {
            ...conversationPartner,
            last_message: lastMessage?.content,
            last_message_time: lastMessage?.created_at
          }
        })
      )

      // Sort conversations by the most recent message
      const sortedConversations = enhancedConversations.sort((a, b) => {
        if (!a.last_message_time) return 1
        if (!b.last_message_time) return -1
        return new Date(b.last_message_time).getTime() - new Date(a.last_message_time).getTime()
      })

      setConversations(sortedConversations)
    } catch (error) {
      console.error("Error fetching conversations:", error)
      toast({
        title: "Error",
        description: "Failed to load conversations.",
        variant: "destructive",
      })
    }
  }

  const fetchMessages = async (conversationPartnerId: string) => {
    try {
      if (!user) return

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${conversationPartnerId}),and(sender_id.eq.${conversationPartnerId},recipient_id.eq.${user.id})`)
        .order("created_at", { ascending: true })

      if (error) throw error

      setMessages(data || [])
      
      // After setting messages, scroll to bottom with a slight delay
      // to ensure messages are rendered before scrolling
      if (data && data.length > 0) {
        setTimeout(() => scrollToBottom(), 200)
      }

      // Mark messages as read
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("recipient_id", user.id)
        .eq("sender_id", conversationPartnerId)
        .eq("is_read", false)
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast({
        title: "Error",
        description: "Failed to load messages.",
        variant: "destructive",
      })
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !activeConversation || !user) return

    try {
      const { data, error } = await supabase
        .from("messages")
        .insert([
          {
            sender_id: user.id,
            recipient_id: activeConversation.id,
            content: newMessage,
            is_read: false,
          },
        ])
        .select()
        .single()

      if (error) throw error

      setMessages([...messages, data])
      
      // Update the last_message in conversations list
      setConversations(conversations.map(conv => 
        conv.id === activeConversation.id 
          ? { 
              ...conv, 
              last_message: newMessage,
              last_message_time: new Date().toISOString() 
            } 
          : conv
      ))
      
      setNewMessage("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message.",
        variant: "destructive",
      })
    }
  }

  const scrollToBottom = () => {
    // Use a small timeout to ensure DOM is updated before scrolling
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, 100)
  }

  const getInitials = (name: string) => {
    if (!name) return ""
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const filteredConversations = conversations.filter((conversation) =>
    conversation.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Messages</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
          {/* Conversations List */}
          <Card className="md:col-span-1 overflow-hidden flex flex-col">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-grow overflow-y-auto">
              {filteredConversations.length > 0 ? (
                filteredConversations.map((conversation) => (
                  <motion.div
                    key={conversation.id}
                    whileHover={{ backgroundColor: "rgba(147, 51, 234, 0.05)" }}
                    className={`p-4 border-b cursor-pointer ${
                      activeConversation?.id === conversation.id ? "bg-purple-50" : ""
                    }`}
                    onClick={() => setActiveConversation(conversation)}
                  >
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={conversation.profile_image || "/placeholder.svg"} alt={conversation.name} />
                        <AvatarFallback>{getInitials(conversation.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-grow min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-medium truncate">{conversation.name}</h3>
                          {conversation.last_message_time && (
                            <span className="text-xs text-gray-500">
                              {new Date(conversation.last_message_time).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {conversation.last_message && (
                          <p className="text-sm text-gray-500 truncate">{conversation.last_message}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-8 text-center text-gray-500">No conversations found</div>
              )}
            </div>
          </Card>

          {/* Messages */}
          <Card className="md:col-span-2 flex flex-col">
            {activeConversation ? (
              <>
                <div className="p-4 border-b">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage
                        src={activeConversation.profile_image || "/placeholder.svg"}
                        alt={activeConversation.name}
                      />
                      <AvatarFallback>{getInitials(activeConversation.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{activeConversation.name}</h3>
                    </div>
                  </div>
                </div>
                <CardContent className="flex-grow overflow-y-auto p-4" id="message-container">
                  <div className="space-y-4">
                    {messages.length > 0 ? (
                      messages.map((message, index) => (
                        <div
                          key={`${message.id}-${index}`}
                          className={`flex ${message.sender_id === user.id ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              message.sender_id === user.id ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            <p>{message.content}</p>
                            <div
                              className={`text-xs mt-1 ${
                                message.sender_id === user.id ? "text-purple-200" : "text-gray-500"
                              }`}
                            >
                              {new Date(message.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <p>No messages yet. Send your first message!</p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </CardContent>
                <div className="p-4 border-t">
                  <form onSubmit={sendMessage} className="flex items-center">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-grow mr-2"
                    />
                    <Button
                      type="submit"
                      className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      disabled={!newMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-grow flex items-center justify-center p-8 text-center text-gray-500">
                <div>
                  <div className="mx-auto w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                    <Send className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Your Messages</h3>
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  )
}
