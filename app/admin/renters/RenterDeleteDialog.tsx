"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { User } from "@/lib/types"
import { api } from "@/lib/api"

export default function RenterDeleteDialog({
  user,
  onClose
}: {
  user: User
  onClose: () => void
}) {
  const remove = async () => {
    try {
      await api.deleteUser(user.id)
      onClose()
    } catch {
      alert("Failed to delete renter.")
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Renter</DialogTitle>
        </DialogHeader>

        <p className="mb-4">
          Are you sure you want to delete renter{" "}
          <strong>{user.name}</strong>?  
          This will permanently remove their account and all data.
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
