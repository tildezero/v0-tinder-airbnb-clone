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

    const listings = result.rows.map((row: any) => {
      // Parse images JSON if it's a string, otherwise use the array or default to empty array
      let images = []
      if (typeof row.images === 'string') {
        try {
          images = JSON.parse(row.images || "[]")
        } catch (e) {
          images = []
        }
      } else if (Array.isArray(row.images)) {
        images = row.images
      }
      
      return {
        ...row,
        images,
      }
    })

    return NextResponse.json({ listings })
  } catch (error) {
    console.error("ADMIN LISTINGS ERROR:", error)
    return NextResponse.json({ error: "Failed to load listings" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      id,
      title,
      location,
      price,
      guests,
      bedrooms,
      bathrooms,
      images,
      description,
      address,
      zip_code,
      city,
      state,
    } = data

    if (!id) {
      return NextResponse.json({ error: "Property ID required" }, { status: 400 })
    }

    // Admin can update any property without ownership verification
    const updateFields: string[] = []
    const values: any[] = []
    let paramIndex = 1

    if (title !== undefined) {
      updateFields.push(`title = $${paramIndex++}`)
      values.push(title)
    }
    if (location !== undefined) {
      updateFields.push(`location = $${paramIndex++}`)
      values.push(location)
    }
    if (price !== undefined) {
      updateFields.push(`price = $${paramIndex++}`)
      values.push(price)
    }
    if (guests !== undefined) {
      updateFields.push(`guests = $${paramIndex++}`)
      values.push(guests)
    }
    if (bedrooms !== undefined) {
      updateFields.push(`bedrooms = $${paramIndex++}`)
      values.push(bedrooms)
    }
    if (bathrooms !== undefined) {
      updateFields.push(`bathrooms = $${paramIndex++}`)
      values.push(bathrooms)
    }
    // Always update images if provided (even if empty array - user explicitly cleared them)
    // This ensures images are preserved if the field wasn't touched
    if (images !== undefined) {
      updateFields.push(`images = $${paramIndex++}`)
      values.push(JSON.stringify(Array.isArray(images) ? images : []))
    }
    if (description !== undefined) {
      updateFields.push(`description = $${paramIndex++}`)
      values.push(description || null)
    }
    if (address !== undefined) {
      updateFields.push(`address = $${paramIndex++}`)
      values.push(address || null)
    }
    if (zip_code !== undefined) {
      updateFields.push(`zip_code = $${paramIndex++}`)
      values.push(zip_code || null)
    }
    if (city !== undefined) {
      updateFields.push(`city = $${paramIndex++}`)
      values.push(city || null)
    }
    if (state !== undefined) {
      updateFields.push(`state = $${paramIndex++}`)
      values.push(state || null)
    }

    if (updateFields.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 })
    }

    values.push(id)
    const setClause = updateFields.join(", ")

    const { rows } = await pool.query(
      `UPDATE properties SET ${setClause} WHERE id = $${paramIndex} RETURNING *`,
      values
    )

    const property = rows[0]
    const { rows: propertyAvailability } = await pool.query(
      "SELECT * FROM availability WHERE property_id = $1",
      [id]
    )

    return NextResponse.json({
      ...property,
      images: JSON.parse(property.images || "[]"),
      availability: propertyAvailability,
    })
  } catch (error) {
    console.error("ADMIN UPDATE LISTING ERROR:", error)
    return NextResponse.json({ error: "Failed to update property" }, { status: 500 })
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
