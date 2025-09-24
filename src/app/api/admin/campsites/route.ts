import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Get all campsites (admin view)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
      .from('campsites')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      throw error
    }

    return NextResponse.json({
      data: data || [],
      count: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error('Error fetching campsites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campsites' },
      { status: 500 }
    )
  }
}

// Create new campsite
export async function POST(request: NextRequest) {
  try {
    const campsiteData = await request.json()

    const { data, error } = await supabase
      .from('campsites')
      .insert([{
        ...campsiteData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      message: 'Campsite created successfully',
      data: data
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating campsite:', error)
    return NextResponse.json(
      { error: 'Failed to create campsite' },
      { status: 500 }
    )
  }
}