import { registryFromFirestore } from '@/entities/HistoryRegistry'
import { db } from '@/services/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'

export class HistoryRegistriesRepository {
  public static async getByAuthor(authorId: string) {
    const q = query(collection(db, 'history'), where('authorId', '==', authorId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(registryFromFirestore)
  }

  public static async getByMember(memberId: string) {
    const q = query(collection(db, 'history'), where('memberId', '==', memberId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(registryFromFirestore)
  }
}
