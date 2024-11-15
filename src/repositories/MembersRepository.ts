import { memberFromFirestore, type Member } from '@/entities/Member'
import { db } from '@/services/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'

export class MembersRepository {
  public static async getByAuthor(authorId: string): Promise<Member[]> {
    const q = query(collection(db, 'members'), where('authorId', '==', authorId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(memberFromFirestore)
  }
}
