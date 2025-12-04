import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        p.*,
        u.name AS host,
        u.id AS host_id
      FROM properties p
      LEFT JOIN users u ON u.id = p.host_id
      ORDER BY p.id DESC
    `)

    const listings = result.rows.map((row: any) => ({
      ...row,
      images: row.images ?? [],
    }))

    return NextResponse.json({ listings })
  } catch (error) {
    console.error("ADMIN LISTINGS ERROR:", error)
    return NextResponse.json({ error: "Failed to load listings" }, { status: 500 })
  }
}
