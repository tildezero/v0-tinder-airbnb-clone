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
import { RefreshCw } from "lucide-react"
import HomeownerEditDialog from "./HomeownerEditDialog"
import HomeownerDeleteDialog from "./HomeownerDeleteDialog"

export default function HomeownersPage() {
  const [homeowners, setHomeowners] = useState<User[]>([])
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<User | null>(null)
  const [toDelete, setToDelete] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    setIsLoading(true)
    try {
      const all = await api.adminGetUsers()
      setHomeowners(all.filter((u: User) => u.account_type === "homeowner"))
    } catch (error) {
      console.error("Failed to load homeowners:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const filtered = homeowners.filter((u) =>
    (u.name + u.email + u.username)
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Homeowners</h1>

      <div className="flex justify-between items-center mb-4 gap-4">
        <Input
          placeholder="Search homeowners..."
          className="w-64"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button
          variant="outline"
          onClick={load}
          disabled={isLoading}
          className="gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
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
            {filtered.map((h) => (
              <TableRow key={h.id}>
                <TableCell>{h.name}</TableCell>
                <TableCell>{h.email}</TableCell>
                <TableCell>{h.username}</TableCell>
                <TableCell>
                  <Badge variant="outline">{h.rating?.toFixed(1)}</Badge>
                </TableCell>

                <TableCell className="space-x-2">
                  <Button size="sm" onClick={() => setSelected(h)}>
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setToDelete(h)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  No homeowners found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selected && (
        <HomeownerEditDialog
          user={selected}
          onClose={() => {
            setSelected(null)
            load()
          }}
        />
      )}

      {toDelete && (
        <HomeownerDeleteDialog
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
