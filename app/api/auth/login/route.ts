import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // Get user with password for verification
    const { rows } = await pool.query("SELECT * FROM users WHERE email = $1", [email])
    const user = rows[0] as any

    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Compare passwords (in a real app, this would use hashed passwords)
    if (user.password !== password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    // Remove password before returning
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Login failed" }, { status: 500 })
  }
}

