"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle, CreditCard, Wallet } from "lucide-react"

declare global {
  interface Window {
    Razorpay: any
  }
}

type PaymentModalProps = {
  booking: any
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function PaymentModal({ booking, isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<"online" | "offline">("online")
  const { toast } = useToast()
  const supabase = createClientComponentClient()

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handlePayment = async () => {
    if (paymentMethod === "offline") {
      try {
        setIsLoading(true)
        console.log("Processing offline payment for booking:", booking.id)

        // Update the booking in the database
        const { error } = await supabase
          .from('bookings')
          .update({ 
            payment_status: 'pending',
            status: 'confirmed',
            updated_at: new Date().toISOString()
          })
          .eq('id', booking.id)

        if (error) throw error

        // Send notifications to both parties
        await Promise.all([
          // Notify provider
          supabase.from('notifications').insert([{
            user_id: booking.provider_id,
            type: 'payment_pending',
            title: 'Offline Payment Pending',
            message: `${booking.seeker.name} will pay in person for ${booking.service_name}`,
            data: { booking_id: booking.id }
          }]),
          // Notify seeker
          supabase.from('notifications').insert([{
            user_id: booking.seeker_id,
            type: 'booking_confirmed',
            title: 'Booking Confirmed',
            message: `Your booking for ${booking.service_name} has been confirmed. Please pay in person.`,
            data: { booking_id: booking.id }
          }])
        ])

        toast({
          title: "Payment marked as offline",
          description: "Please pay the provider directly during your session.",
        })

        onSuccess()
      } catch (error) {
        console.error("Error marking payment as offline:", error)
        toast({
          title: "Error",
          description: "Failed to process your request.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
      return
    }

    // For online payment
    setIsLoading(true)

    try {
      // Create order ID for Razorpay (in real app this would come from backend)
      const orderId = `order_${Date.now()}`

      // Simulate payment processing
      setTimeout(async () => {
        // Update booking status
        const { error: bookingError } = await supabase
          .from('bookings')
          .update({ 
            payment_status: 'paid',
            status: 'confirmed',
            payment_id: `pay_${Date.now()}`,
            updated_at: new Date().toISOString()
          })
          .eq('id', booking.id)

        if (bookingError) throw bookingError

        // Send notifications to both parties
        await Promise.all([
          // Notify provider
          supabase.from('notifications').insert([{
            user_id: booking.provider_id,
            type: 'payment_received',
            title: 'Payment Received',
            message: `Payment received from ${booking.seeker.name} for ${booking.service_name}`,
            data: { booking_id: booking.id }
          }]),
          // Notify seeker
          supabase.from('notifications').insert([{
            user_id: booking.seeker_id,
            type: 'payment_completed',
            title: 'Payment Completed',
            message: `Your payment for ${booking.service_name} has been processed successfully`,
            data: { booking_id: booking.id }
          }])
        ])

        toast({
          title: "Payment successful",
          description: "Your booking has been confirmed.",
        })

        onSuccess()
      }, 2000)
    } catch (error) {
      console.error("Error processing payment:", error)
      setIsLoading(false)
      toast({
        title: "Error",
        description: "Failed to process payment.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Complete Your Payment</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Booking Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Service:</span>
                  <span>{booking?.service_name || "Skill Service"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Provider:</span>
                  <span>{booking?.provider?.name || "Provider Name"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span>
                    {booking?.date ? new Date(booking.date).toLocaleDateString() : new Date().toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time:</span>
                  <span>
                    {booking?.start_time?.substring(0, 5) || "10:00"} - {booking?.end_time?.substring(0, 5) || "11:00"}
                  </span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>₹50.00</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="font-medium">Select Payment Method</h3>
            <div className="grid grid-cols-2 gap-4">
              <div
                className={`border rounded-md p-4 cursor-pointer ${
                  paymentMethod === "online" ? "border-purple-600 bg-purple-50" : ""
                }`}
                onClick={() => setPaymentMethod("online")}
              >
                <div className="flex items-center justify-center mb-2">
                  <CreditCard className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-center text-sm font-medium">Pay Online</p>
                <p className="text-center text-xs text-gray-500">Credit/Debit Card, UPI</p>
              </div>
              <div
                className={`border rounded-md p-4 cursor-pointer ${
                  paymentMethod === "offline" ? "border-purple-600 bg-purple-50" : ""
                }`}
                onClick={() => setPaymentMethod("offline")}
              >
                <div className="flex items-center justify-center mb-2">
                  <Wallet className="h-6 w-6 text-purple-600" />
                </div>
                <p className="text-center text-sm font-medium">Pay Offline</p>
                <p className="text-center text-xs text-gray-500">Cash, Direct Transfer</p>
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            onClick={handlePayment}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                Processing...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                {paymentMethod === "online" ? "Pay Now" : "Confirm"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
