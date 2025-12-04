"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import type { Property } from "@/lib/types"
import { api } from "@/lib/api"

export default function ListingEditDialog({
  property,
  onClose
}: {
  property: Property
  onClose: () => void
}) {

  // 🔥 SAFETY DEFAULTS — prevents crashes
  const safeDefaults = {
    title: property.title || "",
    description: property.description || "",
    location: property.location || "",
    price: property.price ?? 0,
    bedrooms: property.bedrooms ?? 0,
    bathrooms: property.bathrooms ?? 0,
    address: property.address || "",
    city: property.city || "",
    state: property.state || "",
    zip_code: property.zip_code || "",
    images: Array.isArray(property.images) ? property.images : [],
    id: property.id,              // keep id
    host_id: (property as any).host_id // keep owner
  }

  const [form, setForm] = useState(safeDefaults)
  const [saving, setSaving] = useState(false)

  const update = (field: string, value: any) => {
    setForm((f) => ({ ...f, [field]: value }))
  }

  const save = async () => {
    setSaving(true)
    try {
      await api.adminUpdateProperty(form)
      onClose()
    } catch (err) {
      console.error(err)
      alert("Failed to update listing.")
    }
    setSaving(false)
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Listing</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">

          <div className="col-span-2">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
            />
          </div>

          <div className="col-span-2">
            <Label>Description</Label>
            <Input
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
            />
          </div>

          <div>
            <Label>Location</Label>
            <Input
              value={form.location}
              onChange={(e) => update("location", e.target.value)}
            />
          </div>

          <div>
            <Label>Price / Night</Label>
            <Input
              type="number"
              value={form.price}
              onChange={(e) => update("price", Number(e.target.value))}
            />
          </div>

          <div>
            <Label>Bedrooms</Label>
            <Input
              type="number"
              value={form.bedrooms}
              onChange={(e) => update("bedrooms", Number(e.target.value))}
            />
          </div>

          <div>
            <Label>Bathrooms</Label>
            <Input
              type="number"
              value={form.bathrooms}
              onChange={(e) => update("bathrooms", Number(e.target.value))}
            />
          </div>

          <div className="col-span-2">
            <Label>Address</Label>
            <Input
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
            />
          </div>

          <div>
            <Label>City</Label>
            <Input
              value={form.city}
              onChange={(e) => update("city", e.target.value)}
            />
          </div>

          <div>
            <Label>State</Label>
            <Input
              value={form.state}
              onChange={(e) => update("state", e.target.value)}
            />
          </div>

          <div>
            <Label>Zip Code</Label>
            <Input
              value={form.zip_code}
              onChange={(e) => update("zip_code", e.target.value)}
            />
          </div>

          <div className="col-span-2">
            <Label>Image URLs (comma separated)</Label>
            <Input
              value={form.images?.join(", ") || ""}
              onChange={(e) =>
                update(
                  "images",
                  e.target.value.split(",").map((s) => s.trim())
                )
              }
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
