import { registryFromFirestore, type HistoryRegistry } from '@/entities/HistoryRegistry'
import { db } from '@/services/firebase'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  where,
} from 'firebase/firestore'

export class HistoryRegistriesRepository {
  public static async getByAuthor(authorId: string) {
    const q = query(
      collection(db, 'history'),
      where('authorId', '==', authorId),
      orderBy('createdAt', 'desc'),
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(registryFromFirestore)
  }

  public static async getByMember(memberId: string) {
    const q = query(collection(db, 'history'), where('memberId', '==', memberId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(registryFromFirestore)
  }

  public static async addRegistry(registry: HistoryRegistry) {
    return await addDoc(collection(db, 'history'), registry)
  }

  public static async deleteRegistry(registryId: string) {
    const document = doc(db, 'history', registryId)
    await deleteDoc(document)
  }
}
