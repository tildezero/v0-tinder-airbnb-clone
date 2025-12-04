"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { User } from "@/lib/types"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import RenterEditDialog from "./RenterEditDialog"
import RenterDeleteDialog from "./RenterDeleteDialog"

export default function RentersPage() {
  const [renters, setRenters] = useState<User[]>([])
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<User | null>(null)
  const [toDelete, setToDelete] = useState<User | null>(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const all = await api.adminGetUsers()
    setRenters(all.filter((u: User) => u.account_type === "renter"))
  }

  const filtered = renters.filter((u) =>
    (u.name + u.email + u.username)
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Renters</h1>

      <div className="flex justify-between mb-4">
        <Input
          placeholder="Search renters..."
          className="w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.name}</TableCell>
                <TableCell>{r.email}</TableCell>
                <TableCell>{r.username}</TableCell>

                <TableCell>
                  <Badge variant="outline">{(r.rating ?? 0).toFixed(1)}</Badge>
                </TableCell>

                <TableCell className="space-x-2">
                  <Button size="sm" onClick={() => setSelected(r)}>
                    Edit
                  </Button>
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
                <TableCell colSpan={5} className="text-center py-6">
                  No renters found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selected && (
        <RenterEditDialog
          user={selected}
          onClose={() => {
            setSelected(null)
            load()
          }}
        />
      )}

      {toDelete && (
        <RenterDeleteDialog
          user={toDelete}
          onClose={() => {
            setToDelete(null)
            load()
          }}
        />
      )}
    </div>
  )
}
