import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

export async function POST(request: Request) {
  try {
    const { userId, listName, categories } = await request.json()

    // Create a shared list document using admin SDK
    const docRef = await adminDb.collection('shared_lists').add({
      originalUserId: userId,
      listName,
      categories,
      createdAt: Timestamp.now(),
      isReadOnly: true
    })

    // Generate the share URL
    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/shared/${docRef.id}`

    return NextResponse.json({ shareUrl })
  } catch (error) {
    console.error('Error creating shared list:', error)
    return NextResponse.json({ error: 'Failed to create shared list' }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const shareId = searchParams.get('id')
    
    if (!shareId) {
      return NextResponse.json(
        { error: 'Share ID is required' },
        { status: 400 }
      )
    }

    const sharedList = await getSharedList(shareId)
    return NextResponse.json(sharedList)
  } catch (error) {
    console.error('Error getting shared list:', error)
    return NextResponse.json(
      { error: 'Failed to get shared list' },
      { status: 500 }
    )
  }
} 