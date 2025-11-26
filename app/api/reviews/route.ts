import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get("propertyId")
    const userId = searchParams.get("userId")

    let query = "SELECT * FROM reviews"
    let params: any[] = []

    if (propertyId) {
      query += " WHERE property_id = ?"
      params.push(propertyId)
    } else if (userId) {
      query += " WHERE user_id = ?"
      params.push(userId)
    }

    query += " ORDER BY created_at DESC"

    const reviews = db.prepare(query).all(...params) as any[]
    // Map database fields to match Review type
    const mappedReviews = reviews.map((r) => ({
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

    const stmt = db.prepare(`
      INSERT INTO reviews (id, property_id, user_id, user_name, rating, comment, reservation_number, stay_start_date, stay_end_date)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      id,
      property_id,
      user_id,
      user_name,
      rating,
      comment,
      reservation_number,
      stay_start_date || null,
      stay_end_date || null
    )

    // Update property rating (average of all reviews, 1-5 scale)
    const propertyReviews = db
      .prepare("SELECT rating FROM reviews WHERE property_id = ?")
      .all(property_id) as any[]
    const avgRating =
      propertyReviews.length > 0
        ? propertyReviews.reduce((sum, r) => sum + r.rating, 0) / propertyReviews.length
        : 0

    db.prepare("UPDATE properties SET rating = ?, reviews = ? WHERE id = ?").run(
      avgRating,
      propertyReviews.length,
      property_id
    )

    const review = db.prepare("SELECT * FROM reviews WHERE id = ?").get(id)
    return NextResponse.json(review, { status: 201 })
  } catch (error: any) {
    console.error("Review creation error:", error)
    return NextResponse.json({ error: "Failed to create review: " + (error.message || "Unknown error") }, { status: 500 })
  }
}

