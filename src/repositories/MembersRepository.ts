import { memberFromFirestore, type Member } from '@/entities/Member'
import { db } from '@/services/firebase'
import { useUserStore } from '@/stores/useUserStore'
import { addDoc, collection, getDocs, query, where } from 'firebase/firestore'

export class MembersRepository {
  public static async getByAuthor(authorId: string): Promise<Member[]> {
    const q = query(collection(db, 'members'), where('authorId', '==', authorId))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(memberFromFirestore)
  }

  public static async createMember(memberName: string): Promise<Member> {
    const user = useUserStore().user
    if (!user) throw Error('No esta autenticado')
    const newMember: Member = {
      name: memberName,
      authorId: user.id,
    }
    await addDoc(collection(db, 'members'), newMember)
    return newMember
  }
}
