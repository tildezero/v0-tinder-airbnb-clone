import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT id, name, email, account_type, rating
      FROM users
      ORDER BY id DESC
    `)

    return NextResponse.json({ users: result.rows })
  } catch (err) {
    console.error("ADMIN USERS ERROR:", err)
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 })
  }
}
