import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Get single campsite
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('campsites')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      throw error
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Campsite not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching campsite:', error)
    return NextResponse.json(
      { error: 'Failed to fetch campsite' },
      { status: 500 }
    )
  }
}

// Update campsite
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campsiteData = await request.json()

    const { data, error } = await supabase
      .from('campsites')
      .update({
        ...campsiteData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      message: 'Campsite updated successfully',
      data: data
    })
  } catch (error) {
    console.error('Error updating campsite:', error)
    return NextResponse.json(
      { error: 'Failed to update campsite' },
      { status: 500 }
    )
  }
}

// Delete campsite
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // First, check if campsite has any comments or ratings
    const { data: comments } = await supabase
      .from('comments')
      .select('id')
      .eq('campsite_id', params.id)

    const { data: ratings } = await supabase
      .from('ratings')
      .select('id')
      .eq('campsite_id', params.id)

    if (comments && comments.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete campsite with existing comments' },
        { status: 400 }
      )
    }

    if (ratings && ratings.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete campsite with existing ratings' },
        { status: 400 }
      )
    }

    const { error } = await supabase
      .from('campsites')
      .delete()
      .eq('id', params.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ message: 'Campsite deleted successfully' })
  } catch (error) {
    console.error('Error deleting campsite:', error)
    return NextResponse.json(
      { error: 'Failed to delete campsite' },
      { status: 500 }
    )
  }
}