"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Property } from "@/lib/types"
import { api } from "@/lib/api"

export default function ListingDeleteDialog({
  property,
  onClose
}: {
  property: Property
  onClose: () => void
}) {
  const remove = async () => {
    try {
      await api.adminDeleteProperty(property.id)
      onClose()
    } catch (err) {
      console.error(err)
      alert("Failed to delete listing.")
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Listing</DialogTitle>
        </DialogHeader>

        <p className="mb-4">
          Are you sure you want to delete listing{" "}
          <strong>{property.title}</strong>?  
          This action is permanent.
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
