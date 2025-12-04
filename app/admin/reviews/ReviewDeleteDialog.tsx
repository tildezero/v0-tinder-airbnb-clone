"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Review } from "@/lib/types"
import { api } from "@/lib/api"

export default function ReviewDeleteDialog({
  review,
  onClose
}: {
  review: Review
  onClose: () => void
}) {
  const remove = async () => {
    try {
      await api.deleteReview(review.id)
      onClose()
    } catch (err) {
      console.error(err)
      alert("Failed to delete review.")
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Review</DialogTitle>
        </DialogHeader>

        <p className="mb-4">
          Are you sure you want to delete this review from{" "}
          <strong>{review.userName}</strong>?  
          This action cannot be undone.
        </p>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>

          <Button variant="destructive" onClick={remove}>
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
