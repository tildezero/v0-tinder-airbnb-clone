import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      id,
      booking_id,
      property_id,
      renter_id,
      renter_name,
      homeowner_id,
      homeowner_name,
      rating,
      comment,
      reservation_number,
    } = data

    if (!renter_id && !renter_name) {
      return NextResponse.json({ error: "Renter information is required" }, { status: 400 })
    }

    await pool.query(
      `
      INSERT INTO renter_reviews (
        id, booking_id, property_id, renter_id, renter_name,
        homeowner_id, homeowner_name, rating, comment, reservation_number
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `,
      [
        id,
        booking_id,
        property_id,
        renter_id || null,
        renter_name,
        homeowner_id,
        homeowner_name,
        rating,
        comment,
        reservation_number,
      ]
    )

    // Update renter's rating (average of all renter reviews) only if renter_id exists
    if (renter_id) {
      const { rows: renterReviews } = await pool.query(
        "SELECT rating FROM renter_reviews WHERE renter_id = $1",
        [renter_id]
      )
      const avgRating =
        renterReviews.length > 0
          ? renterReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / renterReviews.length
          : 0

      await pool.query("UPDATE users SET rating = $1 WHERE id = $2", [avgRating, renter_id])
    }

    const { rows } = await pool.query("SELECT * FROM renter_reviews WHERE id = $1", [id])
    return NextResponse.json(rows[0], { status: 201 })
  } catch (error: any) {
    console.error("Renter review creation error:", error)
    return NextResponse.json(
      { error: "Failed to create review: " + (error.message || "Unknown error") },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const renterId = searchParams.get("renterId")
    const homeownerId = searchParams.get("homeownerId")

    let query = "SELECT * FROM renter_reviews"
    let params: any[] = []
    let paramIndex = 1

    if (renterId) {
      query += ` WHERE renter_id = $${paramIndex++}`
      params.push(renterId)
    } else if (homeownerId) {
      query += ` WHERE homeowner_id = $${paramIndex++}`
      params.push(homeownerId)
    }

    query += " ORDER BY created_at DESC"

    const { rows: reviews } = await pool.query(query, params)
    // Map to a consistent format
    const mappedReviews = reviews.map((r: any) => ({
      id: r.id,
      booking_id: r.booking_id,
      property_id: r.property_id,
      renter_id: r.renter_id,
      renter_name: r.renter_name,
      homeowner_id: r.homeowner_id,
      homeowner_name: r.homeowner_name,
      rating: r.rating,
      comment: r.comment,
      reservation_number: r.reservation_number,
      createdAt: r.created_at,
    }))
    return NextResponse.json(mappedReviews)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

