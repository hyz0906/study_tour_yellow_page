import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      throw error
    }

    if (!data) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    )
  }
}

// Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json()

    // Only allow certain fields to be updated by admin
    const allowedFields = ['role', 'full_name', 'nickname']
    const filteredUpdates = Object.keys(updates)
      .filter(key => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = updates[key]
        return obj
      }, {} as any)

    if (Object.keys(filteredUpdates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('users')
      .update({
        ...filteredUpdates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({
      message: 'User updated successfully',
      data: data
    })
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    )
  }
}

// Delete user (soft delete - set status to inactive)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Instead of actually deleting, we could set a status field
    // or move to a deleted_users table
    const { error } = await supabase
      .from('users')
      .update({
        status: 'inactive',
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.id)

    if (error) {
      throw error
    }

    return NextResponse.json({ message: 'User deactivated successfully' })
  } catch (error) {
    console.error('Error deactivating user:', error)
    return NextResponse.json(
      { error: 'Failed to deactivate user' },
      { status: 500 }
    )
  }
}