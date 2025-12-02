"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { FileText, Download, Home } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
import type { Booking } from "@/lib/types"

function InvoiceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const reservationNumber = searchParams.get("reservation")

  useEffect(() => {
    if (reservationNumber) {
      loadBooking()
    } else {
      router.push("/search")
    }
  }, [reservationNumber, router])

  const loadBooking = async () => {
    try {
      setIsLoading(true)
      const bookings = await api.getBookings()
      const found = bookings.find(
        (b: Booking) => b.reservation_number === reservationNumber
      )
      if (found) {
        setBooking(found)
      } else {
        alert("Reservation not found")
        router.push("/search")
      }
    } catch (error) {
      console.error("Failed to load booking:", error)
      alert("Failed to load reservation")
      router.push("/search")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <main className="container mx-auto px-6 py-8">
          <p className="text-center text-muted-foreground">Loading invoice...</p>
        </main>
      </div>
    )
  }

  if (!booking) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="bg-card rounded-xl border border-border p-8">
          <div className="flex items-center justify-between mb-8 print:hidden">
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6" />
              <h1 className="text-2xl font-bold">Invoice</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrint}>
                <Download className="w-4 h-4 mr-2" />
                Print/Download
              </Button>
              <Button asChild>
                <a href="/search">
                  <Home className="w-4 h-4 mr-2" />
                  Back to Search
                </a>
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold mb-2">BumbleBNB</h2>
                <p className="text-sm text-muted-foreground">Property Rental Service</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground mb-1">Reservation Number</p>
                <p className="text-2xl font-bold">{booking.reservation_number}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Date: {new Date(booking.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-semibold mb-4">Guest Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Name:</p>
                  <p className="font-semibold">
                    {booking.guest_first_name || "N/A"}{" "}
                    {booking.guest_middle_initial ? `${booking.guest_middle_initial}. ` : ""}
                    {booking.guest_last_name || ""}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email:</p>
                  <p className="font-semibold">{booking.guest_email || "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-semibold mb-4">Property Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Property:</span>
                  <span className="font-semibold">{booking.property_title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="font-semibold">{booking.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-in:</span>
                  <span className="font-semibold">
                    {new Date(booking.start_date).toLocaleDateString("en-GB")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Check-out:</span>
                  <span className="font-semibold">
                    {new Date(booking.end_date).toLocaleDateString("en-GB")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nights:</span>
                  <span className="font-semibold">
                    {Math.ceil(
                      (new Date(booking.end_date).getTime() -
                        new Date(booking.start_date).getTime()) /
                        (1000 * 60 * 60 * 24)
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h3 className="font-semibold mb-4">Payment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-semibold">${(booking.subtotal || booking.total_price).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax (12%):</span>
                  <span className="font-semibold">${(booking.tax || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-border pt-2 mt-2">
                  <span>Total:</span>
                  <span>${booking.total_price.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <p className="text-xs text-muted-foreground">
                This invoice confirms your reservation. Please keep this for your records.
                <br />
                Reservation Number: <strong>{booking.reservation_number}</strong>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function InvoicePage() {
  return (
    <Suspense fallback={<div>Loading invoice...</div>}>
      <InvoiceContent />
    </Suspense>
  )
}

