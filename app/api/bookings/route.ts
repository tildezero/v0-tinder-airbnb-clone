import { NextRequest, NextResponse } from "next/server"
import pool from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const renterId = searchParams.get("renterId")
    const propertyId = searchParams.get("propertyId")

    let query = `
      SELECT b.*, p.title as property_title, p.location, p.images
      FROM bookings b
      JOIN properties p ON b.property_id = p.id
      WHERE 1=1
    `
    let params: any[] = []
    let paramIndex = 1

    if (renterId) {
      query += ` AND b.renter_id = $${paramIndex++}`
      params.push(renterId)
    }

    if (propertyId) {
      query += ` AND b.property_id = $${paramIndex++}`
      params.push(propertyId)
    }

    query += " ORDER BY b.created_at DESC"

    const { rows: bookings } = await pool.query(query, params)
    const bookingsWithImages = bookings.map((booking: any) => ({
      ...booking,
      images: JSON.parse(booking.images || "[]"),
    }))

    return NextResponse.json(bookingsWithImages)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const {
      property_id,
      renter_id,
      start_date,
      end_date,
      subtotal,
      guest_first_name,
      guest_last_name,
      guest_middle_initial,
      guest_email,
      guest_credit_card,
    } = data

    // Check if booking is at least 5 days in advance
    const checkInDate = new Date(start_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Reset time to start of day
    const daysUntilCheckIn = Math.ceil((checkInDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

    if (daysUntilCheckIn < 5) {
      return NextResponse.json(
        { error: "Bookings must be made at least 5 days in advance" },
        { status: 400 }
      )
    }

    // Check if dates are available
    const { rows: conflictingBookings } = await pool.query(
      `
      SELECT * FROM bookings 
      WHERE property_id = $1 
      AND status IN ('pending', 'confirmed')
      AND (
        (start_date <= $2 AND end_date >= $3) OR
        (start_date <= $4 AND end_date >= $5) OR
        (start_date >= $6 AND end_date <= $7)
      )
    `,
      [property_id, start_date, start_date, end_date, end_date, start_date, end_date]
    )

    if (conflictingBookings.length > 0) {
      return NextResponse.json({ error: "Selected dates are not available" }, { status: 400 })
    }

    // Calculate tax (12% of subtotal) and total
    const calculatedSubtotal = subtotal || 0
    const tax = calculatedSubtotal * 0.12
    const total_price = calculatedSubtotal + tax

    // Generate reservation number
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 1000)
    const reservation_number = `RES-${timestamp}-${random}`

    const { rows } = await pool.query(
      `
      INSERT INTO bookings (
        property_id, renter_id, start_date, end_date, 
        subtotal, tax, total_price, reservation_number,
        guest_first_name, guest_last_name, guest_middle_initial,
        guest_email, guest_credit_card, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'confirmed')
      RETURNING *
    `,
      [
        property_id,
        renter_id || null,
        start_date,
        end_date,
        calculatedSubtotal,
        tax,
        total_price,
        reservation_number,
        guest_first_name || null,
        guest_last_name || null,
        guest_middle_initial || null,
        guest_email || null,
        guest_credit_card || null,
      ]
    )

    return NextResponse.json(rows[0], { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const data = await request.json()
    const { id, status } = data

    const { rows } = await pool.query(
      "UPDATE bookings SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    )

    return NextResponse.json(rows[0])
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Failed to update booking" }, { status: 500 })
  }
}

