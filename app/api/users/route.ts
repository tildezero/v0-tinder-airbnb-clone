import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get("email")

    if (email) {
      const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email])
      const user = rows[0] as any
      if (user) {
        // Remove password from response
        const { password, ...userWithoutPassword } = user
        return NextResponse.json(userWithoutPassword)
      }
      return NextResponse.json(null)
    }

    const { rows: users } = await pool.query(
      "SELECT id, name, username, email, account_type, rating FROM users"
    )
    return NextResponse.json(users)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, name, username, email, password, account_type, dob, bio, address } = data

    const { rows } = await pool.query(
      `
      INSERT INTO users (id, name, username, email, password, account_type, dob, bio, address)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `,
      [id, name, username, email, password, account_type, dob || null, bio || null, address || null]
    )

    const user = rows[0] as any
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error: any) {
    if (error.code === "23505") {
      // Postgres unique constraint violation code
      return NextResponse.json({ error: "Email already exists" }, { status: 400 })
    }
    console.error(error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, ...updates } = data

    const allowedFields = [
      "name",
      "username",
      "email",
      "password",
      "dob",
      "payment",
      "bio",
      "address",
      "avatar",
      "first_name",
      "last_name",
      "middle_initial",
      "driver_license",
      "driver_license_state",
      "default_credit_card",
      "account_type",
    ]
    const updateFields = Object.keys(updates).filter((key) => allowedFields.includes(key))

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 })
    }

    const setClause = updateFields.map((field, index) => `${field} = $${index + 1}`).join(", ")
    const values = updateFields.map((field) => updates[field])

    const { rows } = await pool.query(
      `UPDATE users SET ${setClause} WHERE id = $${values.length + 1} RETURNING *`,
      [...values, id]
    )

    const user = rows[0] as any
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing user id" }, { status: 400 })
    }

    await pool.query("DELETE FROM users WHERE id = $1", [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}

