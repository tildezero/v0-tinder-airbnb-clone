import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT r.*, u.name AS user_name
      FROM reviews r
      LEFT JOIN users u ON u.id = r.user_id
      ORDER BY r.id DESC
    `)

    return NextResponse.json({ reviews: result.rows })
  } catch (err) {
    console.error("ADMIN REVIEWS ERROR:", err)
    return NextResponse.json({ error: "Failed to load reviews" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json()

    await pool.query(`DELETE FROM reviews WHERE id = $1`, [id])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("ADMIN REVIEW DELETE ERROR:", err)
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 })
  }
}
