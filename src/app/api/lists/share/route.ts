import { NextResponse } from 'next/server'
import { createSharedList, getSharedList } from '@/lib/firebase/firebaseUtils'

export async function POST(request: Request) {
  try {
    const { userId, listName, categories } = await request.json()
    
    if (!userId || !listName || !categories) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const shareId = await createSharedList(userId, listName, categories)
    const shareUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/lists/shared/${shareId}`
    
    return NextResponse.json({ shareId, shareUrl })
  } catch (error) {
    console.error('Error sharing list:', error)
    return NextResponse.json(
      { error: 'Failed to share list' },
      { status: 500 }
    )
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