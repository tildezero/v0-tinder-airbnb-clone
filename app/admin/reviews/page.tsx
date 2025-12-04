"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { Review } from "@/lib/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import ReviewDeleteDialog from "./ReviewDeleteDialog"

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [search, setSearch] = useState("")
  const [toDelete, setToDelete] = useState<Review | null>(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const props = await api.getReviews() // You must have api.getReviews() implemented
    setReviews(props)
  }

  const filtered = Array.isArray(reviews)
  ? reviews.filter((r) =>
      (r.userName + r.comment + r.propertyId)
        .toLowerCase()
        .includes(search.toLowerCase())
    )
  : [];


  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Reviews Moderation</h1>

      <div className="flex justify-between mb-4">
        <Input
          placeholder="Search by username, comment, or property..."
          className="w-80"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Property</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell>#{r.propertyId}</TableCell>

                <TableCell>{r.userName}</TableCell>

                <TableCell>
                  <Badge variant="outline">{r.rating} ⭐</Badge>
                </TableCell>

                <TableCell className="max-w-xs truncate">
                  {r.comment || "—"}
                </TableCell>

                <TableCell>
                  {new Date(r.createdAt).toLocaleDateString()}
                </TableCell>

                <TableCell className="space-x-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setToDelete(r)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  No reviews found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {toDelete && (
        <ReviewDeleteDialog
          review={toDelete}
          onClose={() => {
            setToDelete(null)
            load()
          }}
        />
      )}
    </div>
  )
}
