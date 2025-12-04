"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { api } from "@/lib/api"
import type { User } from "@/lib/types"

export default function RenterEditDialog({
  user,
  onClose
}: {
  user: User
  onClose: () => void
}) {
  const [form, setForm] = useState({ ...user })
  const [saving, setSaving] = useState(false)

  const update = (field: string, value: any) => {
    setForm((f) => ({ ...f, [field]: value }))
  }

  const save = async () => {
    setSaving(true)
    try {
      const { id, password, ...updates } = form
      
      // Only include password if it's not empty
      if (password && password.trim() !== "") {
        updates.password = password
      }
      
      const result = await api.updateUser(id, updates)
      if (result) {
        // Only close on successful update
        onClose()
      }
    } catch (err) {
      console.error(err)
      alert("Failed to update renter")
      setSaving(false)
      return
    }
    setSaving(false)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Renter</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">

          <div>
            <Label>Name</Label>
            <Input
              value={form.name || ""}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>

          <div>
            <Label>Username</Label>
            <Input
              value={form.username || ""}
              onChange={(e) => update("username", e.target.value)}
            />
          </div>

          <div>
            <Label>Email</Label>
            <Input
              value={form.email || ""}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>

          <div>
            <Label>Password (optional)</Label>
            <Input
              placeholder="Leave blank to keep current password"
              onChange={(e) => update("password", e.target.value)}
            />
          </div>

          <div className="col-span-2">
            <Label>Address</Label>
            <Input
              value={form.address || ""}
              onChange={(e) => update("address", e.target.value)}
            />
          </div>

          <div className="col-span-2">
            <Label>Bio</Label>
            <Input
              value={form.bio || ""}
              onChange={(e) => update("bio", e.target.value)}
            />
          </div>

          <div>
            <Label>Date of Birth</Label>
            <Input
              value={form.dob || ""}
              onChange={(e) => update("dob", e.target.value)}
              placeholder="YYYY-MM-DD"
            />
          </div>

          <div>
            <Label>Avatar URL</Label>
            <Input
              value={form.avatar || ""}
              onChange={(e) => update("avatar", e.target.value)}
            />
          </div>

          <div className="col-span-2">
            <Label>Default Credit Card</Label>
            <Input
              value={form.default_credit_card || ""}
              onChange={(e) => update("default_credit_card", e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
