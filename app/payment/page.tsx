"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CreditCard, Check, Lock } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useApp } from "@/lib/context"
import { api } from "@/lib/api"
import type { Booking, Property } from "@/lib/types"

function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useApp()
  const [property, setProperty] = useState<Property | null>(null)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
  })
  const [isGuestCheckout, setIsGuestCheckout] = useState(false)
  const [guestInfo, setGuestInfo] = useState({
    firstName: "",
    lastName: "",
    middleInitial: "",
    email: "",
  })
  const [isProcessing, setIsProcessing] = useState(false)

  const propertyId = searchParams.get("propertyId")
  const startDate = searchParams.get("startDate")
  const endDate = searchParams.get("endDate")

  useEffect(() => {
    if (!propertyId || !startDate || !endDate) {
      router.push("/search")
      return
    }

    // Allow guest checkout - don't require login
    if (!user) {
      setIsGuestCheckout(true)
    }

    loadProperty()
  }, [propertyId, router])

  const loadProperty = async () => {
    try {
      const properties = await api.getProperties()
      const found = properties.find((p: Property) => p.id === Number.parseInt(propertyId || "0"))
      if (found) {
        setProperty(found)
        calculateBooking(found)
      }
    } catch (error) {
      console.error("Failed to load property:", error)
    }
  }

  const calculateBooking = (prop: Property) => {
    if (!startDate || !endDate) return

    const start = new Date(startDate)
    const end = new Date(endDate)
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    const subtotal = nights * prop.price
    const tax = subtotal * 0.12 // 12% tax
    const totalPrice = subtotal + tax

    setBooking({
      id: 0,
      property_id: prop.id,
      renter_id: user?.id || "",
      start_date: startDate,
      end_date: endDate,
      subtotal: subtotal,
      tax: tax,
      total_price: totalPrice,
      status: "pending",
      created_at: new Date().toISOString(),
      property_title: prop.title,
      location: prop.location,
      images: prop.images,
    })
  }

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!booking || !property) return

    // Validate guest info if guest checkout
    if (isGuestCheckout) {
      if (!guestInfo.firstName || !guestInfo.lastName || !guestInfo.email) {
        alert("Please fill in all required guest information")
        return
      }
    }

    setIsProcessing(true)

    try {
      // Create booking with tax calculation
      const newBooking = await api.createBooking({
        property_id: booking.property_id,
        renter_id: user?.id || null,
        start_date: booking.start_date,
        end_date: booking.end_date,
        subtotal: booking.subtotal || 0,
        guest_first_name: isGuestCheckout ? guestInfo.firstName : null,
        guest_last_name: isGuestCheckout ? guestInfo.lastName : null,
        guest_middle_initial: isGuestCheckout ? guestInfo.middleInitial : null,
        guest_email: isGuestCheckout ? guestInfo.email : null,
        guest_credit_card: paymentData.cardNumber,
      })

      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      router.push(`/invoice?reservation=${newBooking.reservation_number}`)
    } catch (error: any) {
      alert(error.message || "Payment failed. Please try again.")
      setIsProcessing(false)
    }
  }

  if (!property || !booking) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container mx-auto px-6 py-8">
          <p className="text-center text-muted-foreground">Loading...</p>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl border border-border p-8">
              <div className="flex items-center gap-2 mb-6">
                <Lock className="w-5 h-5" />
                <h1 className="text-2xl font-bold">Secure Payment</h1>
              </div>

              {isGuestCheckout && (
                <div className="bg-muted p-4 rounded-lg mb-6">
                  <h3 className="font-semibold mb-4">Guest Information</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={guestInfo.firstName}
                        onChange={(e) => setGuestInfo({ ...guestInfo, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={guestInfo.lastName}
                        onChange={(e) => setGuestInfo({ ...guestInfo, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="middleInitial">Middle Initial</Label>
                      <Input
                        id="middleInitial"
                        maxLength={1}
                        value={guestInfo.middleInitial}
                        onChange={(e) => setGuestInfo({ ...guestInfo, middleInitial: e.target.value.toUpperCase() })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="guestEmail">Email *</Label>
                      <Input
                        id="guestEmail"
                        type="email"
                        value={guestInfo.email}
                        onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handlePayment} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    placeholder="John Doe"
                    value={paymentData.cardName}
                    onChange={(e) => setPaymentData({ ...paymentData, cardName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={paymentData.cardNumber}
                    onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                    maxLength={19}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input
                      id="expiryDate"
                      placeholder="MM/YY"
                      value={paymentData.expiryDate}
                      onChange={(e) => setPaymentData({ ...paymentData, expiryDate: e.target.value })}
                      maxLength={5}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input
                      id="cvv"
                      placeholder="123"
                      type="password"
                      value={paymentData.cvv}
                      onChange={(e) => setPaymentData({ ...paymentData, cvv: e.target.value })}
                      maxLength={4}
                      required
                    />
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-2">
                    <Lock className="w-3 h-3 inline mr-1" />
                    This is a demo payment. No real charges will be made.
                  </p>
                </div>

                <Button type="submit" className="w-full" size="lg" disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <CreditCard className="w-4 h-4 mr-2 animate-pulse" />
                      Processing Payment...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Complete Payment
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">Booking Summary</h2>

              {property.images && property.images.length > 0 && (
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-48 object-cover rounded-lg mb-4"
                />
              )}

              <h3 className="font-semibold mb-2">{property.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{property.location}</p>

              <div className="space-y-2 border-t border-border pt-4">
                <div className="flex justify-between text-sm">
                  <span>Check-in:</span>
                  <span className="font-semibold">{new Date(booking.start_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Check-out:</span>
                  <span className="font-semibold">{new Date(booking.end_date).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Nights:</span>
                  <span className="font-semibold">
                    {Math.ceil(
                      (new Date(booking.end_date).getTime() - new Date(booking.start_date).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Price per night:</span>
                  <span className="font-semibold">${property.price}</span>
                </div>
                <div className="flex justify-between text-sm border-t border-border pt-2 mt-2">
                  <span>Subtotal:</span>
                  <span className="font-semibold">${(booking.subtotal || booking.total_price).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (12%):</span>
                  <span className="font-semibold">${(booking.tax || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t border-border pt-2 mt-2">
                  <span>Total:</span>
                  <span>${booking.total_price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div>Loading payment details...</div>}>
      <PaymentContent />
    </Suspense>
  )
}

