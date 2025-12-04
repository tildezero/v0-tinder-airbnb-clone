import { NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        b.*,
        p.title AS property_title,
        p.location,
        p.images,
        u.name AS renter_name
      FROM bookings b
      LEFT JOIN properties p ON p.id = b.property_id
      LEFT JOIN users u ON u.id = b.renter_id
      ORDER BY b.id DESC
    `)

    const bookings = result.rows.map((row: any) => ({
      ...row,
      images: row.images ?? [],
    }))

    return NextResponse.json({ bookings })
  } catch (err) {
    console.error("ADMIN BOOKINGS ERROR:", err)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json()

    await pool.query(
      `UPDATE bookings SET status = $1 WHERE id = $2`,
      [status, id]
    )

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("ADMIN BOOKINGS PATCH ERROR:", err)
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
  }
}
