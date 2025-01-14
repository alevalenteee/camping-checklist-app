import { 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  updateProfile as updateFirebaseProfile
} from 'firebase/auth'
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot,
  writeBatch
} from 'firebase/firestore'
import { auth, db } from './firebase'
import type { Category, SavedChecklist } from '@/lib/types'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase'

const googleProvider = new GoogleAuthProvider()

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user
    
    // Make sure we have the email
    if (!user.email) {
      throw new Error('No email provided from Google sign-in')
    }
    
    // Create/update user document
    await setDoc(doc(db, 'users', user.uid), {
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
    }, { merge: true })
    
    return user
  } catch (error) {
    console.error('Error signing in with Google:', error)
    throw error
  }
}

export const signOut = () => firebaseSignOut(auth)

export const saveChecklist = async (userId: string, name: string, categories: Category[]) => {
  try {
    // Format the categories to ensure no undefined values
    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      items: category.items.map(item => ({
        id: item.id,
        text: item.text,
        checked: item.checked || false,
        ...(typeof item.capacity === 'number' ? { capacity: item.capacity } : {})
      }))
    }))

    const formattedName = name.trim()
    const docRef = doc(db, `users/${userId}/lists`, formattedName)
    
    await setDoc(docRef, {
      title: formattedName,
      name: formattedName,
      userId: userId,
      categories: formattedCategories,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      sharedWith: [],
      isPublic: false
    })
  } catch (error) {
    console.error('Error in saveChecklist:', error)
    throw error
  }
}

export const getUserChecklists = async (userId: string) => {
  try {
    const listsRef = collection(db, `users/${userId}/lists`)
    const querySnapshot = await getDocs(listsRef)
    return querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.title || data.name || doc.id,
        categories: data.categories,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date(),
        sharedWith: data.sharedWith || [],
        isPublic: data.isPublic || false
      }
    })
  } catch (error) {
    console.error('Error getting user checklists:', error)
    throw error
  }
}

export const updateChecklist = async (
  userId: string,
  listName: string,
  categories: Category[],
  sharedWith?: string[],
  isPublic?: boolean
) => {
  try {
    const listRef = doc(db, `users/${userId}/lists`, listName)
    const updateData: any = {
      categories,
      updatedAt: serverTimestamp()
    }

    // Only update sharing settings if provided
    if (sharedWith !== undefined) {
      updateData.sharedWith = sharedWith
    }
    if (isPublic !== undefined) {
      updateData.isPublic = isPublic
    }

    await updateDoc(listRef, updateData)
  } catch (error) {
    console.error('Error updating checklist:', error)
    throw error
  }
}

export const deleteChecklist = async (
  userId: string,
  listName: string
) => {
  try {
    if (!userId || !listName) {
      throw new Error('Both user ID and list name are required to delete a list')
    }
    
    // Format the list name to be used as a document ID
    const formattedName = listName.trim()
    if (!formattedName) {
      throw new Error('List name cannot be empty')
    }
    
    await deleteDoc(doc(db, `users/${userId}/lists`, formattedName))
  } catch (error) {
    console.error('Error deleting checklist:', error)
    throw error
  }
}

export const updateProfile = async (user: User, imageFile: File) => {
  // Upload image to Firebase Storage
  const storageRef = ref(storage, `profile-images/${user.uid}`)
  await uploadBytes(storageRef, imageFile)
  
  // Get the download URL
  const photoURL = await getDownloadURL(storageRef)
  
  // Update user profile
  await updateFirebaseProfile(user, { photoURL })
}

export const checkListExists = async (userId: string, listName: string) => {
  const listRef = doc(db, 'users', userId, 'lists', listName)
  const listDoc = await getDoc(listRef)
  return listDoc.exists()
}

export const addDocument = async (collectionName: string, data: Record<string, any>) => {
  try {
    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
}

const transformChecklist = (doc: QueryDocumentSnapshot<DocumentData>) => {
  const data = doc.data()
  return {
    id: doc.id,
    title: data.title,
    categories: data.categories.map((item: Category) => ({
      ...item,
      items: item.items || []
    })),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    sharedWith: data.sharedWith || [],
    isPublic: data.isPublic || false
  }
}

export const createSharedList = async (userId: string, listName: string, categories: Category[]) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId))
    const userData = userDoc.data()
    
    const sharedListRef = collection(db, 'shared_lists')
    const docRef = await addDoc(sharedListRef, {
      originalUserId: userId,
      originalUserName: userData?.name || 'Unknown User',
      originalListName: listName,
      categories,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    })
    
    return docRef.id // This will be the sharing ID
  } catch (error) {
    console.error('Error creating shared list:', error)
    throw error
  }
}

export const getSharedList = async (shareId: string) => {
  try {
    const docRef = doc(db, 'shared_lists', shareId)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      throw new Error('Shared list not found')
    }
    
    const data = docSnap.data()
    return {
      id: docSnap.id,
      originalUserId: data.originalUserId,
      originalUserName: data.originalUserName,
      originalListName: data.originalListName,
      categories: data.categories,
      createdAt: data.createdAt?.toDate?.() || new Date(),
      updatedAt: data.updatedAt?.toDate?.() || new Date()
    }
  } catch (error) {
    console.error('Error getting shared list:', error)
    throw error
  }
}

export const migrateChecklistsToNewStructure = async (userId: string) => {
  try {
    // Verify we have a valid user
    if (!auth.currentUser || auth.currentUser.uid !== userId) {
      throw new Error('Not authenticated or invalid user ID');
    }

    // Get all user's checklists
    const listsRef = collection(db, `users/${userId}/lists`);
    const querySnapshot = await getDocs(listsRef);
    
    if (querySnapshot.empty) {
      console.log('No documents to migrate');
      return { success: true, migratedCount: 0 };
    }

    const batch = writeBatch(db);
    let updateCount = 0;
    
    querySnapshot.docs.forEach(doc => {
      const data = doc.data();
      // Check if document needs migration
      if (!data.title || data.name) {  // If no title or has old 'name' field
        batch.update(doc.ref, {
          title: data.name || data.title || doc.id, // Use name if exists, fallback to title or doc.id
          name: data.name || data.title || doc.id,  // Keep both for backward compatibility
          userId: userId,                           // Ensure userId is set
          updatedAt: serverTimestamp(),
          createdAt: data.createdAt || serverTimestamp()
        });
        updateCount++;
      }
    });

    if (updateCount > 0) {
      await batch.commit();
      console.log(`Successfully migrated ${updateCount} checklists`);
    } else {
      console.log('No documents needed migration');
    }
    
    return { success: true, migratedCount: updateCount };
  } catch (error) {
    console.error('Error migrating checklists:', error);
    throw error;
  }
}

// Test function to create a list with old structure
export const createTestListOldStructure = async (userId: string) => {
  try {
    const oldList = {
      name: "Test List (Old Structure)",
      categories: [{
        id: "cat1",
        name: "Test Category",
        items: [{
          id: "item1",
          text: "Test Item",
          checked: false
        }]
      }],
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp()
      // Intentionally missing title field to test migration
    }

    const docRef = doc(db, `users/${userId}/lists`, oldList.name)
    await setDoc(docRef, oldList)
    console.log('Created test list with old structure')
    return oldList.name
  } catch (error) {
    console.error('Error creating test list:', error)
    throw error
  }
}

// Test function to verify list structure
export const verifyListStructure = async (userId: string, listName: string) => {
  try {
    const docRef = doc(db, `users/${userId}/lists`, listName)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      console.log('List not found')
      return null
    }
    
    const data = docSnap.data()
    console.log('List structure:', {
      hasTitle: !!data.title,
      hasName: !!data.name,
      hasUserId: !!data.userId,
      hasCategories: !!data.categories,
      hasTimestamps: !!data.createdAt && !!data.updatedAt
    })
    return data
  } catch (error) {
    console.error('Error verifying list:', error)
    throw error
  }
}
