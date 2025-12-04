"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { Booking } from "@/lib/types"
import {
  Table,
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import BookingActionsDialog from "./BookingActionsDialog"

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Booking | null>(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const list = await api.adminGetBookings()
    setBookings(list)
  }

  const filtered = bookings.filter((b) =>
    (
      b.property_title +
      b.location +
      b.reservation_number +
      b.renter_id
    )
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const statusColor = (s: string) => {
    switch (s) {
      case "confirmed":
        return "bg-emerald-100 text-emerald-700"
      case "cancelled":
        return "bg-red-100 text-red-700"
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      case "completed":
        return "bg-blue-100 text-blue-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Bookings Management</h1>

      <div className="flex justify-between mb-4">
        <Input
          placeholder="Search by property, renter, reservation #..."
          className="w-80"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reservation</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Renter</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map((b) => (
              <TableRow key={b.id}>
                <TableCell>{b.reservation_number}</TableCell>

                <TableCell>{b.property_title}</TableCell>

                <TableCell>{b.renter_id || "Guest Checkout"}</TableCell>

                <TableCell>
                  {new Date(b.start_date).toLocaleDateString()} →{" "}
                  {new Date(b.end_date).toLocaleDateString()}
                </TableCell>

                <TableCell>${b.total_price.toFixed(2)}</TableCell>

                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${statusColor(
                      b.status
                    )}`}
                  >
                    {b.status}
                  </span>
                </TableCell>

                <TableCell>
                  <Button size="sm" onClick={() => setSelected(b)}>
                    Manage
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6">
                  No bookings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selected && (
        <BookingActionsDialog
          booking={selected}
          onClose={() => {
            setSelected(null)
            load()
          }}
        />
      )}
    </div>
  )
}
