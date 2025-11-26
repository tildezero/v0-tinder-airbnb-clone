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

    const reviews = db.prepare(query).all(...params)
    return NextResponse.json(reviews)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, property_id, user_id, user_name, rating, comment } = data

    const stmt = db.prepare(`
      INSERT INTO reviews (id, property_id, user_id, user_name, rating, comment)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    stmt.run(id, property_id, user_id, user_name, rating, comment)

    // Update property rating
    const propertyReviews = db.prepare("SELECT rating FROM reviews WHERE property_id = ?").all(property_id) as any[]
    const avgRating =
      propertyReviews.reduce((sum, r) => sum + r.rating, 0) / propertyReviews.length

    db.prepare("UPDATE properties SET rating = ?, reviews = ? WHERE id = ?").run(
      avgRating,
      propertyReviews.length,
      property_id
    )

    const review = db.prepare("SELECT * FROM reviews WHERE id = ?").get(id)
    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
  }
}

