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
    if (activeConversation) {
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
  }, [activeConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const fetchConversations = async (userId: string) => {
    try {
      // Get all users that the current user has exchanged messages with
      const { data: sentMessages, error: sentError } = await supabase
        .from("messages")
        .select("recipient_id")
        .eq("sender_id", userId)
        .distinct()

      const { data: receivedMessages, error: receivedError } = await supabase
        .from("messages")
        .select("sender_id")
        .eq("recipient_id", userId)
        .distinct()

      if (sentError || receivedError) throw sentError || receivedError

      // Combine unique user IDs
      const userIds = new Set([
        ...(sentMessages?.map((msg) => msg.recipient_id) || []),
        ...(receivedMessages?.map((msg) => msg.sender_id) || []),
      ])

      if (userIds.size === 0) {
        // No conversations yet
        setConversations([])
        return
      }

      // Get user details for each conversation
      const { data: users, error: usersError } = await supabase
        .from("users")
        .select("id, name, profile_image")
        .in("id", Array.from(userIds))

      if (usersError) throw usersError

      // For demo purposes, if no real conversations exist, create some dummy ones
      if (users && users.length > 0) {
        setConversations(users)
      } else {
        // Generate dummy conversations
        setConversations([
          {
            id: "dummy-1",
            name: "Jane Smith",
            profile_image: "/placeholder.svg?height=40&width=40",
            last_message: "Hi there! Are you available for a session tomorrow?",
            last_message_time: new Date().toISOString(),
          },
          {
            id: "dummy-2",
            name: "John Doe",
            profile_image: "/placeholder.svg?height=40&width=40",
            last_message: "Thanks for the great yoga session!",
            last_message_time: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: "dummy-3",
            name: "Alex Johnson",
            profile_image: "/placeholder.svg?height=40&width=40",
            last_message: "I'd like to book another piano lesson next week.",
            last_message_time: new Date(Date.now() - 172800000).toISOString(),
          },
        ])
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
      toast({
        title: "Error",
        description: "Failed to load conversations.",
        variant: "destructive",
      })
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      if (conversationId.startsWith("dummy")) {
        // Generate dummy messages for demo
        const dummyMessages = generateDummyMessages(conversationId)
        setMessages(dummyMessages)
        return
      }

      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: true })

      if (error) throw error

      setMessages(data || [])

      // Mark messages as read
      await supabase.from("messages").update({ is_read: true }).eq("recipient_id", user.id).eq("is_read", false)
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast({
        title: "Error",
        description: "Failed to load messages.",
        variant: "destructive",
      })
    }
  }

  const generateDummyMessages = (conversationId: string) => {
    const otherUser = conversations.find((c) => c.id === conversationId)

    if (conversationId === "dummy-1") {
      return [
        {
          id: "msg-1",
          sender_id: otherUser.id,
          recipient_id: user.id,
          content: "Hi there! I saw your profile and I'm interested in your web development skills.",
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "msg-2",
          sender_id: user.id,
          recipient_id: otherUser.id,
          content: "Hello! Thanks for reaching out. What kind of project are you working on?",
          created_at: new Date(Date.now() - 3500000).toISOString(),
        },
        {
          id: "msg-3",
          sender_id: otherUser.id,
          recipient_id: user.id,
          content: "I'm building a personal portfolio website and need some help with the frontend.",
          created_at: new Date(Date.now() - 3400000).toISOString(),
        },
        {
          id: "msg-4",
          sender_id: otherUser.id,
          recipient_id: user.id,
          content: "Are you available for a session tomorrow?",
          created_at: new Date(Date.now() - 3300000).toISOString(),
        },
      ]
    } else if (conversationId === "dummy-2") {
      return [
        {
          id: "msg-5",
          sender_id: user.id,
          recipient_id: otherUser.id,
          content: "How did you find today's yoga session?",
          created_at: new Date(Date.now() - 86500000).toISOString(),
        },
        {
          id: "msg-6",
          sender_id: otherUser.id,
          recipient_id: user.id,
          content: "It was amazing! I feel so relaxed now.",
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "msg-7",
          sender_id: otherUser.id,
          recipient_id: user.id,
          content: "Thanks for the great yoga session!",
          created_at: new Date(Date.now() - 86300000).toISOString(),
        },
      ]
    } else {
      return [
        {
          id: "msg-8",
          sender_id: otherUser.id,
          recipient_id: user.id,
          content: "Your piano lessons have been so helpful.",
          created_at: new Date(Date.now() - 173000000).toISOString(),
        },
        {
          id: "msg-9",
          sender_id: user.id,
          recipient_id: otherUser.id,
          content: "I'm glad you're enjoying them! You're making great progress.",
          created_at: new Date(Date.now() - 172900000).toISOString(),
        },
        {
          id: "msg-10",
          sender_id: otherUser.id,
          recipient_id: user.id,
          content: "I'd like to book another piano lesson next week.",
          created_at: new Date(Date.now() - 172800000).toISOString(),
        },
      ]
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !activeConversation) return

    try {
      if (activeConversation.id.startsWith("dummy")) {
        // For demo, just add to UI
        const newMsg = {
          id: `msg-new-${Date.now()}`,
          sender_id: user.id,
          recipient_id: activeConversation.id,
          content: newMessage,
          created_at: new Date().toISOString(),
        }

        setMessages([...messages, newMsg])
        setNewMessage("")
        return
      }

      const { data, error } = await supabase
        .from("messages")
        .insert([
          {
            sender_id: user.id,
            recipient_id: activeConversation.id,
            content: newMessage,
          },
        ])
        .select()
        .single()

      if (error) throw error

      setMessages([...messages, data])
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
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const getInitials = (name: string) => {
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
                <CardContent className="flex-grow overflow-y-auto p-4">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
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
                    ))}
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
