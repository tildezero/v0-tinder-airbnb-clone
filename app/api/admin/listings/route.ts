import { NextRequest, NextResponse } from "next/server"
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

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get("id")

    if (!propertyId) {
      return NextResponse.json({ error: "Property ID required" }, { status: 400 })
    }

    // Admin can delete any property without ownership verification
    // Delete related data first
    await pool.query("DELETE FROM availability WHERE property_id = $1", [propertyId])
    await pool.query("DELETE FROM bookings WHERE property_id = $1", [propertyId])
    await pool.query("DELETE FROM reviews WHERE property_id = $1", [propertyId])
    await pool.query("DELETE FROM requests WHERE property_id = $1", [propertyId])

    // Delete the property
    await pool.query("DELETE FROM properties WHERE id = $1", [propertyId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("ADMIN DELETE LISTING ERROR:", error)
    return NextResponse.json({ error: "Failed to delete property" }, { status: 500 })
  }
}
