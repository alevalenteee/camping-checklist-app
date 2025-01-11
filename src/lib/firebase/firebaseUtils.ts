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
  QueryDocumentSnapshot
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
    const docRef = doc(db, 'users', userId, 'lists', formattedName)
    
    await setDoc(docRef, {
      name: formattedName,
      categories: formattedCategories,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp()
    })
  } catch (error) {
    console.error('Error in saveChecklist:', error)
    throw error
  }
}

export const getUserChecklists = async (userId: string) => {
  try {
    const listsRef = collection(db, 'users', userId, 'lists')
    const querySnapshot = await getDocs(listsRef)
    return querySnapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        name: data.name,
        categories: data.categories,
        createdAt: data.createdAt?.toDate?.() || new Date(),
        updatedAt: data.updatedAt?.toDate?.() || new Date()
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
) => {
  try {
    const listRef = doc(db, 'users', userId, 'lists', listName)
    await updateDoc(listRef, {
      categories,
      updatedAt: serverTimestamp()
    })
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
    
    await deleteDoc(doc(db, 'users', userId, 'lists', formattedName))
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
    name: data.name,
    categories: data.categories.map((item: Category) => ({
      ...item,
      items: item.items || []
    })),
    updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString()
  }
}
