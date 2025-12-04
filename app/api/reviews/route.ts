import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get("propertyId")
    const userId = searchParams.get("userId")

    let query = "SELECT * FROM reviews"
    let params: any[] = []
    let paramIndex = 1

    if (propertyId) {
      query += ` WHERE property_id = $${paramIndex++}`
      params.push(propertyId)
    } else if (userId) {
      query += ` WHERE user_id = $${paramIndex++}`
      params.push(userId)
    }

    query += " ORDER BY created_at DESC"

    const { rows: reviews } = await pool.query(query, params)
    // Map database fields to match Review type
    const mappedReviews = reviews.map((r: any) => ({
      id: r.id,
      propertyId: r.property_id,
      userId: r.user_id,
      userName: r.user_name,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.created_at,
      reservation_number: r.reservation_number,
      stay_start_date: r.stay_start_date,
      stay_end_date: r.stay_end_date,
    }))
    return NextResponse.json(mappedReviews)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      id,
      property_id,
      user_id,
      user_name,
      rating,
      comment,
      reservation_number,
      stay_start_date,
      stay_end_date,
    } = data

    if (!reservation_number) {
      return NextResponse.json({ error: "Reservation number is required" }, { status: 400 })
    }

    await pool.query(
      `
      INSERT INTO reviews (id, property_id, user_id, user_name, rating, comment, reservation_number, stay_start_date, stay_end_date)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,
      [
        id,
        property_id,
        user_id,
        user_name,
        rating,
        comment,
        reservation_number,
        stay_start_date || null,
        stay_end_date || null,
      ]
    )

    // Update property rating (average of all reviews, 1-5 scale)
    const { rows: propertyReviews } = await pool.query(
      "SELECT rating FROM reviews WHERE property_id = $1",
      [property_id]
    )
    const avgRating =
      propertyReviews.length > 0
        ? propertyReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / propertyReviews.length
        : 0

    await pool.query("UPDATE properties SET rating = $1, reviews = $2 WHERE id = $3", [
      avgRating,
      propertyReviews.length,
      property_id,
    ])

    const { rows } = await pool.query("SELECT * FROM reviews WHERE id = $1", [id])
    return NextResponse.json(rows[0], { status: 201 })
  } catch (error: any) {
    console.error("Review creation error:", error)
    return NextResponse.json(
      { error: "Failed to create review: " + (error.message || "Unknown error") },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Review ID required" }, { status: 400 })
    }

    await pool.query("DELETE FROM reviews WHERE id = $1", [id])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Review delete error:", error)
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 })
  }
}
