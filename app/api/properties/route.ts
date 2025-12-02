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

