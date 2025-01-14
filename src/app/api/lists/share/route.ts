import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase/firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export async function POST(request: Request) {
  try {
    const { userId, listName, categories } = await request.json()

    // Create a shared list document using admin SDK
    const docRef = await addDoc(collection(db, 'shared_lists'), {
      originalUserId: userId,
      listName,
      categories,
      createdAt: serverTimestamp(),
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