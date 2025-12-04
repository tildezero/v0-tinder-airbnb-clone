"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { Request } from "@/lib/types"
import { api } from "@/lib/api"
import { useState } from "react"

export default function RequestDialog({
  request,
  onClose,
}: {
  request: Request
  onClose: () => void
}) {
  const [loading, setLoading] = useState(false)

  const updateStatus = async (status: "accepted" | "rejected") => {
    setLoading(true)
    try {
      await api.updateRequest(request.id, status)
      onClose()
    } catch (err) {
      console.error(err)
      alert("Failed to update request.")
      setLoading(false)
    }
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p><strong>Property:</strong> {request.property_title}</p>
          <p><strong>Requester:</strong> {request.requester_name}</p>
          <p><strong>Rating:</strong> {request.requester_rating || "N/A"}</p>
          <p><strong>Age:</strong> {request.requester_age || "N/A"}</p>
          <p><strong>Message:</strong></p>
          <p className="p-3 bg-muted rounded">{request.message || "No message"}</p>

          <div className="flex flex-col gap-3 pt-4">
            <Button
              onClick={() => updateStatus("accepted")}
              disabled={loading}
            >
              Approve Request
            </Button>

            <Button
              variant="destructive"
              onClick={() => updateStatus("rejected")}
              disabled={loading}
            >
              Reject Request
            </Button>

            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
