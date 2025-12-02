import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hostId = searchParams.get("hostId")
    const requesterId = searchParams.get("requesterId")

    let query = "SELECT * FROM requests ORDER BY created_at DESC"
    let params: any[] = []

    if (hostId) {
      // Get requests for properties owned by this host
      query = `
        SELECT r.* FROM requests r
        JOIN properties p ON r.property_id = p.id
        WHERE p.host_id = $1 AND r.status = 'pending'
        ORDER BY r.created_at DESC
      `
      params = [hostId]
    } else if (requesterId) {
      query = "SELECT * FROM requests WHERE requester_id = $1 ORDER BY created_at DESC"
      params = [requesterId]
    }

    const { rows: requests } = await pool.query(query, params)
    return NextResponse.json(requests)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, property_id, property_title, requester_id, requester_name, requester_rating, requester_age, message } =
      data

    const { rows } = await pool.query(
      `
      INSERT INTO requests (id, property_id, property_title, requester_id, requester_name, requester_rating, requester_age, message)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
      [
        id,
        property_id,
        property_title,
        requester_id,
        requester_name,
        requester_rating || null,
        requester_age || null,
        message || null,
      ]
    )

    return NextResponse.json(rows[0], { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, status } = data

    const { rows } = await pool.query(
      "UPDATE requests SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    )

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 })
  }
}

