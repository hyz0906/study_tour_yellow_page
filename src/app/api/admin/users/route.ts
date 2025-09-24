import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Get all users with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const role = searchParams.get('role')

    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from('users')
      .select('*', { count: 'exact' })

    if (role && role !== 'all') {
      query = query.eq('role', role)
    }

    const { data, error, count } = await query
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
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}