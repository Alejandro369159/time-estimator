import { memberFromFirestore, type Member } from '@/entities/Member'
import { db } from '@/services/firebase'
import { useUserStore } from '@/stores/useUserStore'
import {
  addDoc,
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  deleteDoc,
} from 'firebase/firestore'

export class MembersRepository {
  public static async getByAuthor(authorId: string): Promise<Member[]> {
    const q = query(collection(db, 'members'), where('authorId', '==', authorId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(memberFromFirestore)
  }

  public static async getById(memberId: string): Promise<Member | null> {
    const memberDoc = doc(db, 'members', memberId)
    const memberSnapshot = await getDoc(memberDoc)

    if (!memberSnapshot.exists()) {
      return null
    }

    return memberFromFirestore(memberSnapshot)
  }

  public static async createMember(memberName: string): Promise<Member> {
    const user = useUserStore().user
    if (!user) throw Error('No esta autenticado')
    const memberData: Member = {
      name: memberName,
      authorId: user.id,
    }
    const docRef = await addDoc(collection(db, 'members'), memberData)
    return {
      id: docRef.id,
      ...memberData,
    }
  }

  public static async deleteMember(memberId: string): Promise<void> {
    const memberDocRef = doc(db, 'members', memberId)
    await deleteDoc(memberDocRef)
  }
}
