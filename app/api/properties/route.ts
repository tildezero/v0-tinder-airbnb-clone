import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const hostId = searchParams.get("hostId")

    let query = "SELECT * FROM properties ORDER BY created_at DESC"
    let params: any[] = []

    if (hostId) {
      query = "SELECT * FROM properties WHERE host_id = $1 ORDER BY created_at DESC"
      params = [hostId]
    }

    const { rows: properties } = await pool.query(query, params)

    // Parse images JSON and get availability
    const propertiesWithData = await Promise.all(
      properties.map(async (property: any) => {
        const images = JSON.parse(property.images || "[]")
        const { rows: availability } = await pool.query(
          "SELECT * FROM availability WHERE property_id = $1 AND is_available = 1",
          [property.id]
        )

        return {
          ...property,
          images,
          availability,
          host: property.host_name || property.host || "Unknown", // Map host_name to host for compatibility
        }
      })
    )

    return NextResponse.json(propertiesWithData)
  } catch (error) {
    console.error(error)
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

    const { rows } = await pool.query(
      `
      INSERT INTO properties (title, location, price, guests, bedrooms, bathrooms, images, host_id, host_name, description, address, zip_code, city, state)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `,
      [
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
        state || null,
      ]
    )

    const property = rows[0]
    const propertyId = property.id

    // Add availability dates if provided
    if (availability && Array.isArray(availability)) {
      for (const avail of availability) {
        await pool.query(
          "INSERT INTO availability (property_id, start_date, end_date) VALUES ($1, $2, $3)",
          [propertyId, avail.start_date, avail.end_date]
        )
      }
    }

    const { rows: propertyAvailability } = await pool.query(
      "SELECT * FROM availability WHERE property_id = $1",
      [propertyId]
    )

    return NextResponse.json(
      {
        ...property,
        images: JSON.parse(property.images || "[]"),
        availability: propertyAvailability,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create property" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get("id")
    const hostId = searchParams.get("hostId")

    if (!propertyId) {
      return NextResponse.json({ error: "Property ID required" }, { status: 400 })
    }

    if (!hostId) {
      return NextResponse.json({ error: "Host ID required" }, { status: 400 })
    }

    // Verify ownership
    const { rows: property } = await pool.query(
      "SELECT host_id FROM properties WHERE id = $1",
      [propertyId]
    )

    if (property.length === 0) {
      return NextResponse.json({ error: "Property not found" }, { status: 404 })
    }

    // Compare as strings to handle type differences
    if (String(property[0].host_id) !== String(hostId)) {
      return NextResponse.json({ error: "Unauthorized: You can only delete your own listings" }, { status: 403 })
    }

    // Delete related data first (cascade delete might handle this, but being explicit)
    await pool.query("DELETE FROM availability WHERE property_id = $1", [propertyId])
    await pool.query("DELETE FROM bookings WHERE property_id = $1", [propertyId])
    await pool.query("DELETE FROM reviews WHERE property_id = $1", [propertyId])
    await pool.query("DELETE FROM requests WHERE property_id = $1", [propertyId])

    // Delete the property
    await pool.query("DELETE FROM properties WHERE id = $1", [propertyId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to delete property" }, { status: 500 })
  }
}

