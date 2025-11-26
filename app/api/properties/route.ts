import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hostId = searchParams.get("hostId")

    let query = "SELECT * FROM properties ORDER BY created_at DESC"
    let params: any[] = []

    if (hostId) {
      query = "SELECT * FROM properties WHERE host_id = ? ORDER BY created_at DESC"
      params = [hostId]
    }

    const properties = db.prepare(query).all(...params) as any[]

    // Parse images JSON and get availability
    const propertiesWithData = properties.map((property) => {
      const images = JSON.parse(property.images || "[]")
      const availability = db
        .prepare("SELECT * FROM availability WHERE property_id = ? AND is_available = 1")
        .all(property.id) as any[]

      return {
        ...property,
        images,
        availability,
        host: property.host_name || property.host || "Unknown", // Map host_name to host for compatibility
      }
    })

    return NextResponse.json(propertiesWithData)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch properties" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      title,
      location,
      price,
      guests,
      bedrooms,
      bathrooms,
      images,
      host_id,
      host_name,
      description,
      address,
      zip_code,
      city,
      state,
      availability,
    } = data

    const stmt = db.prepare(`
      INSERT INTO properties (title, location, price, guests, bedrooms, bathrooms, images, host_id, host_name, description, address, zip_code, city, state)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const result = stmt.run(
      title,
      location,
      price,
      guests,
      bedrooms,
      bathrooms,
      JSON.stringify(images),
      host_id,
      host_name,
      description || null,
      address || null,
      zip_code || null,
      city || null,
      state || null
    )

    const propertyId = result.lastInsertRowid

    // Add availability dates if provided
    if (availability && Array.isArray(availability)) {
      const availabilityStmt = db.prepare(
        "INSERT INTO availability (property_id, start_date, end_date) VALUES (?, ?, ?)"
      )
      for (const avail of availability) {
        availabilityStmt.run(propertyId, avail.start_date, avail.end_date)
      }
    }

    const property = db.prepare("SELECT * FROM properties WHERE id = ?").get(propertyId) as any
    const propertyAvailability = db
      .prepare("SELECT * FROM availability WHERE property_id = ?")
      .all(propertyId) as any[]

    return NextResponse.json(
      {
        ...property,
        images: JSON.parse(property.images || "[]"),
        availability: propertyAvailability,
      },
      { status: 201 }
    )
  } catch (error) {
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 })
  }
}

