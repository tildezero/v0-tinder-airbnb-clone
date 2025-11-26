import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (email) {
      const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any
      if (user) {
        // Remove password from response
        const { password, ...userWithoutPassword } = user
        return NextResponse.json(userWithoutPassword)
      }
      return NextResponse.json(null)
    }

    const users = db.prepare("SELECT id, name, username, email, account_type, rating FROM users").all()
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, name, username, email, password, account_type, dob, bio, address } = data

    const stmt = db.prepare(`
      INSERT INTO users (id, name, username, email, password, account_type, dob, bio, address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(id, name, username, email, password, account_type, dob || null, bio || null, address || null)

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as any
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error: any) {
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, ...updates } = data

    const allowedFields = ["name", "username", "email", "password", "dob", "payment", "bio", "address", "avatar"]
    const updateFields = Object.keys(updates).filter((key) => allowedFields.includes(key))

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    const setClause = updateFields.map((field) => `${field} = ?`).join(", ")
    const values = updateFields.map((field) => updates[field])

    const stmt = db.prepare(`UPDATE users SET ${setClause} WHERE id = ?`)
    stmt.run(...values, id)

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as any
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

