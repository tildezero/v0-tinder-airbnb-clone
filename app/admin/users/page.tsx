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
import UserEditDialog from "./UserEditDialog"
import UserDeleteDialog from "./UserDeleteDialog"

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [search, setSearch] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [deleteUser, setDeleteUser] = useState<User | null>(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const data = await api.adminGetUsers()
    setUsers(data)
  }

  const filtered = users.filter((u) =>
    (u.name + u.email + u.username)
      .toLowerCase()
      .includes(search.toLowerCase())
  )

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Manage Users</h1>

      <div className="flex justify-between mb-4">
        <Input
          placeholder="Search users..."
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
              <TableHead>Type</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filtered.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.username}</TableCell>
                <TableCell>
                  <Badge variant="secondary">{u.account_type}</Badge>
                </TableCell>
                <TableCell>{u.rating?.toFixed(1)}</TableCell>

                <TableCell className="space-x-2">
                  <Button
                    size="sm"
                    onClick={() => setSelectedUser(u)}
                  >
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setDeleteUser(u)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Edit User Dialog */}
      {selectedUser && (
        <UserEditDialog
          user={selectedUser}
          onClose={() => {
            setSelectedUser(null)
            load()
          }}
        />
      )}

      {/* Delete User Dialog */}
      {deleteUser && (
        <UserDeleteDialog
          user={deleteUser}
          onClose={() => {
            setDeleteUser(null)
            load()
          }}
        />
      )}
    </div>
  )
}
