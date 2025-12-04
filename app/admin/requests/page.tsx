"use client"

import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import type { Request } from "@/lib/types"
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import RequestDialog from "./RequestDialog"

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([])
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Request | null>(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const list = await api.getRequests()
    setRequests(list)
  }

  const filtered = requests.filter((r) =>
    (
      r.property_title +
      r.requester_name +
      r.requester_id +
      r.status
    )
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  const statusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      case "accepted":
        return "bg-emerald-100 text-emerald-700"
      case "rejected":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Requests Management</h1>

      <div className="flex justify-between mb-4">
        <Input
          placeholder="Search by property, requester, status..."
          className="w-80"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Request ID</TableHead>
              <TableHead>Property</TableHead>
              <TableHead>Requester</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.id}</TableCell>

                <TableCell>{r.property_title}</TableCell>

                <TableCell>
                  {r.requester_name}
                  <div className="text-xs text-muted-foreground">{r.requester_id}</div>
                </TableCell>

                <TableCell>{r.requester_rating || "—"}</TableCell>

                <TableCell>
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${statusColor(r.status)}`}
                  >
                    {r.status}
                  </span>
                </TableCell>

                <TableCell>
                  <Button size="sm" onClick={() => setSelected(r)}>
                    Manage
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  No requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selected && (
        <RequestDialog
          request={selected}
          onClose={() => {
            setSelected(null)
            load()
          }}
        />
      )}
    </div>
  )
}
