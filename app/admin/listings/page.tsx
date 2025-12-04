"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { Property } from "@/lib/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import ListingEditDialog from "./ListingEditDialog"
import ListingDeleteDialog from "./ListingDeleteDialog"

export default function ListingsPage() {
  const [listings, setListings] = useState<Property[]>([])
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Property | null>(null)
  const [toDelete, setToDelete] = useState<Property | null>(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const result = await api.adminGetListings()
    const all = Array.isArray(result)
      ? result
      : (result.listings ?? [])

    setListings(all)

  }

  const filtered = listings.filter((p) =>
    (p.title + p.location + p.host)
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Listings</h1>

      <div className="flex justify-between mb-4">
        <Input
          placeholder="Search listings..."
          className="w-72"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Host</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Beds/Baths</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  <img
                    src={p.images?.[0] || "/placeholder.png"}
                    className="h-14 w-20 rounded object-cover border"
                  />
                </TableCell>

                <TableCell>{p.title}</TableCell>
                <TableCell>{p.host}</TableCell>
                <TableCell>{p.location}</TableCell>

                <TableCell>${p.price}/night</TableCell>

                <TableCell>
                  <Badge variant="outline">
                    {p.rating?.toFixed(1) || "N/A"}
                  </Badge>
                </TableCell>

                <TableCell>
                  {p.bedrooms} bd / {p.bathrooms} ba
                </TableCell>

                <TableCell className="space-x-2 whitespace-nowrap">
                  <Button size="sm" onClick={() => setSelected(p)}>
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setToDelete(p)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6">
                  No listings found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selected && (
        <ListingEditDialog
          property={selected}
          onClose={() => {
            setSelected(null)
            load()
          }}
        />
      )}

      {toDelete && (
        <ListingDeleteDialog
          property={toDelete}
          onClose={() => {
            setToDelete(null)
            load()
          }}
        />
      )}
    </div>
  )
}
