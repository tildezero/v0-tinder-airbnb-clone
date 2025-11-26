import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

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
        WHERE p.host_id = ? AND r.status = 'pending'
        ORDER BY r.created_at DESC
      `
      params = [hostId]
    } else if (requesterId) {
      query = "SELECT * FROM requests WHERE requester_id = ? ORDER BY created_at DESC"
      params = [requesterId]
    }

    const requests = db.prepare(query).all(...params)
    return NextResponse.json(requests)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch requests" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, property_id, property_title, requester_id, requester_name, requester_rating, requester_age, message } =
      data

    const stmt = db.prepare(`
      INSERT INTO requests (id, property_id, property_title, requester_id, requester_name, requester_rating, requester_age, message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    stmt.run(id, property_id, property_title, requester_id, requester_name, requester_rating || null, requester_age || null, message || null)

    const request = db.prepare("SELECT * FROM requests WHERE id = ?").get(id)
    return NextResponse.json(request, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create request" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, status } = data

    const stmt = db.prepare("UPDATE requests SET status = ? WHERE id = ?")
    stmt.run(status, id)

    const request = db.prepare("SELECT * FROM requests WHERE id = ?").get(id)
    return NextResponse.json(request)
  } catch (error) {
    return NextResponse.json({ error: "Failed to update request" }, { status: 500 })
  }
}

