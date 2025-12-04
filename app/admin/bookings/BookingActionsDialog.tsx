"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Booking } from "@/lib/types"
import { api } from "@/lib/api"
import { useState } from "react"

export default function BookingActionsDialog({
    booking,
    onClose,
}: {
    booking: Booking
    onClose: () => void
}) {
    const [loading, setLoading] = useState(false)

    const updateStatus = async (next: string) => {
        setLoading(true)
        try {
            await api.adminUpdateBookingStatus(booking.id, next)

            onClose()
        } catch (err) {
            console.error(err)
            alert("Failed to update booking status.")
            setLoading(false)
        }
    }

    const adminCancel = async () => {
        setLoading(true)
        try {
            // Refund calculation (same as front-end renter cancellation)
            const fee = booking.total_price * 0.03
            const refund = booking.total_price - fee

            await api.adminUpdateBookingStatus(booking.id, "cancelled")

            alert(
                `Booking cancelled.\n\nTotal: $${booking.total_price.toFixed(
                    2
                )}\nAdmin Fee: $${fee.toFixed(
                    2
                )}\nRefund: $${refund.toFixed(2)}`
            )

            onClose()
        } catch (err) {
            console.error(err)
            alert("Failed to cancel booking.")
            setLoading(false)
        }
    }

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Manage Booking</DialogTitle>
                </DialogHeader>

                <p className="mb-3">
                    Reservation: <strong>{booking.reservation_number}</strong>
                </p>
                <p className="mb-3">
                    Property: <strong>{booking.property_title}</strong>
                </p>

                <div className="space-y-3 mt-4">
                    <Button
                        className="w-full"
                        disabled={loading}
                        onClick={() => updateStatus("confirmed")}
                    >
                        Mark as Confirmed
                    </Button>

                    <Button
                        className="w-full"
                        disabled={loading}
                        onClick={() => updateStatus("completed")}
                    >
                        Mark as Completed
                    </Button>

                    <Button
                        variant="destructive"
                        className="w-full"
                        disabled={loading}
                        onClick={adminCancel}
                    >
                        Admin Cancel + Refund
                    </Button>
                </div>

                <Button variant="outline" className="w-full mt-4" onClick={onClose}>
                    Close
                </Button>
            </DialogContent>
        </Dialog>
    )
}
