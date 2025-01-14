import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/firebase-admin'
import { Timestamp } from 'firebase-admin/firestore'

// Helper function to get shared list
async function getSharedListData(shareId: string) {
  const docRef = adminDb.collection('shared_lists').doc(shareId)
  const docSnap = await docRef.get()
  
  if (!docSnap.exists) {
    throw new Error('Shared list not found')
  }
  
  const data = docSnap.data()
  return {
    id: docSnap.id,
    originalUserId: data?.originalUserId,
    listName: data?.listName,
    categories: data?.categories,
    createdAt: data?.createdAt?.toDate?.() || new Date(),
    isReadOnly: true
  }
}

export async function POST(request: Request) {
  try {
    const { userId, listName, categories } = await request.json()

    // Create a shared list document using Admin SDK
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

    const sharedList = await getSharedListData(shareId)
    return NextResponse.json(sharedList)
  } catch (error) {
    console.error('Error getting shared list:', error)
    return NextResponse.json(
      { error: 'Failed to get shared list' },
      { status: 500 }
    )
  }
} 