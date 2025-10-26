"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Send } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function PostListingPage() {
  const [formData, setFormData] = useState({
    title: "",
    bedrooms: "",
    bathrooms: "",
    address: "",
    description: "",
  })

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />

      <main className="container mx-auto px-6 py-8">
        <div className="bg-card rounded-xl border border-border p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Property Title</Label>
                <Input
                  id="title"
                  placeholder="Enter a good title..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  placeholder="Enter the number of bedrooms..."
                  value={formData.bedrooms}
                  onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                  className="bg-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  placeholder="Enter the number of bathrooms"
                  value={formData.bathrooms}
                  onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                  className="bg-input"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  placeholder="Type your message here."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="bg-input min-h-[120px]"
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="relative aspect-video bg-muted rounded-xl overflow-hidden">
                <Button variant="secondary" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <Button variant="secondary" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2">
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Upload Images</Label>
                <Input id="file" type="file" multiple className="bg-input" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Add a description here"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-input min-h-[120px]"
                />
              </div>

              <Button className="w-full gap-2" size="lg">
                <Send className="w-4 h-4" />
                Publish!
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
